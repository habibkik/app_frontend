import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin, Send, Eye, Loader2 } from "lucide-react";
import { PlatformCard } from "./PlatformCard";
import { CopyPasteMode } from "./CopyPasteMode";
import { ListingPreviewModal } from "./ListingPreviewModal";
import { localPlatformsByCountry, getLocalPlatformsForCurrency } from "./LocalPlatformData";
import { useMarketplaceStore } from "../store/marketplaceStore";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

const GLOBAL_PLATFORMS = [
  { name: "Facebook Marketplace", color: "#1877F2", type: "global" },
  { name: "Instagram Shopping", color: "#E4405F", type: "global" },
  { name: "TikTok Shop", color: "#000000", type: "global" },
  { name: "WooCommerce", color: "#96588A", type: "global" },
  { name: "Shopify", color: "#7AB55C", type: "global" },
];

export function TabConnections() {
  const queryClient = useQueryClient();
  const { selectedListingId } = useMarketplaceStore();
  const { currency } = useCurrency();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const detectedCountry = getLocalPlatformsForCurrency(currency);

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ["marketplace-connections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_connections").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: listings } = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_listings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const selectedListing = listings?.find((l: any) => l.id === selectedListingId) || null;

  const connectMutation = useMutation({
    mutationFn: async (platform: { name: string; type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("marketplace_connections").insert({
        user_id: user.id,
        platform_name: platform.name,
        platform_type: platform.type,
        connection_status: "connected",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-connections"] });
      toast.success("Platform connected");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platformName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("marketplace_connections").delete().eq("platform_name", platformName).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-connections"] });
      toast.success("Platform disconnected");
    },
  });

  const getConnectionStatus = (name: string) => {
    const conn = connections?.find((c: any) => c.platform_name === name);
    return conn?.connection_status || "disconnected";
  };

  const connectedPlatforms = connections?.filter((c: any) => c.connection_status === "connected") || [];

  const handlePublish = async () => {
    if (!selectedListing || selectedPlatforms.length === 0) return;
    setPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const platform of selectedPlatforms) {
        await supabase.from("marketplace_published").insert({
          user_id: user.id,
          listing_id: selectedListing.id,
          platform_name: platform,
          status: "published",
          published_at: new Date().toISOString(),
        });
      }
      toast.success(`Published to ${selectedPlatforms.length} platform(s)`);
      setSelectedPlatforms([]);
      queryClient.invalidateQueries({ queryKey: ["marketplace-published"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const localCountryData = selectedCountry
    ? localPlatformsByCountry.find((c) => c.country === selectedCountry)
    : detectedCountry;

  return (
    <div className="space-y-8">
      {/* Global Platforms */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Globe className="w-5 h-5" /> Global Platforms</h3>
        {connectionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {GLOBAL_PLATFORMS.map((p) => (
              <PlatformCard
                key={p.name}
                name={p.name}
                color={p.color}
                status={getConnectionStatus(p.name) as any}
                onConnect={() => connectMutation.mutate(p)}
                onDisconnect={() => disconnectMutation.mutate(p.name)}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Local Platforms */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><MapPin className="w-5 h-5" /> Local Marketplaces</h3>
        <div className="mb-4">
          <Label className="text-sm text-muted-foreground mb-2 block">
            {detectedCountry ? `Auto-detected: ${detectedCountry.flag} ${detectedCountry.country}` : "Select your country"}
          </Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Override country..." /></SelectTrigger>
            <SelectContent>
              {localPlatformsByCountry.map((c) => (
                <SelectItem key={c.country} value={c.country}>{c.flag} {c.country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {localCountryData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localCountryData.platforms.map((p) =>
              p.hasApi ? (
                <PlatformCard
                  key={p.name}
                  name={p.name}
                  color={p.color}
                  status={getConnectionStatus(p.name) as any}
                  onConnect={() => connectMutation.mutate({ name: p.name, type: "local" })}
                  onDisconnect={() => disconnectMutation.mutate(p.name)}
                />
              ) : (
                <CopyPasteMode
                  key={p.name}
                  platformName={p.name}
                  platformUrl={p.url}
                  postUrl={p.postUrl}
                  title={selectedListing?.title || ""}
                  description={selectedListing?.description || ""}
                  price={selectedListing ? `${selectedListing.currency} ${selectedListing.price}` : ""}
                  tags={(selectedListing?.tags as string[]) || []}
                />
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a country to see local marketplace options.</p>
        )}
      </div>

      <Separator />

      {/* Publish Section */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Send className="w-5 h-5" /> Publish Product</h3>

        {/* Listing Selector */}
        <div className="mb-4">
          <Label className="mb-2 block">Select Product</Label>
          <Select
            value={selectedListingId || ""}
            onValueChange={(v) => useMarketplaceStore.getState().setSelectedListingId(v)}
          >
            <SelectTrigger className="w-full max-w-md"><SelectValue placeholder="Choose a listing..." /></SelectTrigger>
            <SelectContent>
              {(listings || []).map((l: any) => (
                <SelectItem key={l.id} value={l.id}>{l.title} — {l.currency} {l.price}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedListing && (
          <Card className="mb-4">
            <CardContent className="py-3 flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-lg">📦</div>
              <div className="flex-1">
                <p className="font-medium">{selectedListing.title}</p>
                <p className="text-sm text-muted-foreground">{selectedListing.currency} {selectedListing.price} · Stock: {selectedListing.stock_quantity}</p>
              </div>
              <Badge variant={selectedListing.status === "active" ? "default" : "secondary"}>{selectedListing.status}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Platform checkboxes */}
        {connectedPlatforms.length > 0 ? (
          <div className="space-y-3">
            <Label>Publish to:</Label>
            <div className="space-y-2">
              {connectedPlatforms.map((c: any) => (
                <div key={c.platform_name} className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedPlatforms.includes(c.platform_name)}
                    onCheckedChange={(checked) => {
                      setSelectedPlatforms(checked
                        ? [...selectedPlatforms, c.platform_name]
                        : selectedPlatforms.filter((p) => p !== c.platform_name));
                    }}
                  />
                  <span className="text-sm">{c.platform_name}</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setPreviewPlatform(c.platform_name)}>
                    <Eye className="w-3 h-3 mr-1" /> Preview
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handlePublish} disabled={publishing || selectedPlatforms.length === 0 || !selectedListing} className="mt-4">
              {publishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Publish to {selectedPlatforms.length} Platform(s)
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Connect at least one platform above to publish.</p>
        )}
      </div>

      <ListingPreviewModal
        open={!!previewPlatform}
        onClose={() => setPreviewPlatform(null)}
        platform={previewPlatform || ""}
        listing={selectedListing ? {
          title: selectedListing.title,
          description: selectedListing.description || "",
          price: selectedListing.price,
          currency: selectedListing.currency,
          images: [],
        } : null}
      />
    </div>
  );
}
