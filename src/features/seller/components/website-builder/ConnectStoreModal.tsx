import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Store, Globe, ShoppingBag, Check, Loader2, Link, Unlink } from "lucide-react";
import { toast } from "sonner";
import { useWebsiteBuilderStore } from "@/stores/websiteBuilderStore";

type StoreEngine = "standalone" | "woocommerce" | "shopify";

interface ConnectStoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ENGINE_OPTIONS: { id: StoreEngine; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "standalone", label: "Standalone", description: "Use our built-in engine — no external service required.", icon: <Store className="h-5 w-5" /> },
  { id: "woocommerce", label: "WooCommerce", description: "Sync products from your WordPress + WooCommerce store.", icon: <ShoppingBag className="h-5 w-5" /> },
  { id: "shopify", label: "Shopify", description: "Connect your Shopify store to import products & orders.", icon: <Globe className="h-5 w-5" /> },
];

export const ConnectStoreModal: React.FC<ConnectStoreModalProps> = ({ open, onOpenChange }) => {
  const storeConnection = useWebsiteBuilderStore((s) => s.storeConnection);
  const setStoreConnection = useWebsiteBuilderStore((s) => s.setStoreConnection);

  const [selected, setSelected] = useState<StoreEngine>(storeConnection?.engine || "standalone");
  const [wooUrl, setWooUrl] = useState(storeConnection?.engine === "woocommerce" ? storeConnection.storeUrl || "" : "");
  const [wooKey, setWooKey] = useState(storeConnection?.engine === "woocommerce" ? storeConnection.apiKey || "" : "");
  const [shopifyUrl, setShopifyUrl] = useState(storeConnection?.engine === "shopify" ? storeConnection.storeUrl || "" : "");
  const [shopifyKey, setShopifyKey] = useState(storeConnection?.engine === "shopify" ? storeConnection.apiKey || "" : "");
  const [syncing, setSyncing] = useState(false);

  const handleConnect = () => {
    if (selected === "standalone") {
      setStoreConnection({ engine: "standalone", connected: true });
      toast.success("Standalone engine activated");
      onOpenChange(false);
      return;
    }

    const url = selected === "woocommerce" ? wooUrl : shopifyUrl;
    const key = selected === "woocommerce" ? wooKey : shopifyKey;

    if (!url.trim() || !key.trim()) {
      toast.error("Please fill in both Store URL and API Key.");
      return;
    }

    setStoreConnection({ engine: selected, connected: true, storeUrl: url.trim(), apiKey: key.trim() });
    toast.success(`${selected === "woocommerce" ? "WooCommerce" : "Shopify"} connected`);
    onOpenChange(false);
  };

  const handleDisconnect = () => {
    setStoreConnection(null);
    toast.success("Store disconnected");
  };

  const handleSync = async () => {
    setSyncing(true);
    // Simulated sync
    await new Promise((r) => setTimeout(r, 2000));
    toast.success("Products synced successfully (simulated)");
    setSyncing(false);
  };

  const isConnected = storeConnection?.connected && storeConnection.engine === selected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-4 w-4" /> Connect Store
          </DialogTitle>
          <DialogDescription>Choose how your e-commerce store is powered.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {ENGINE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                selected === opt.id
                  ? "border-neon-green/50 bg-neon-green/5 ring-1 ring-neon-green/20 shadow-[0_0_12px_rgba(57,217,138,0.15)]"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                selected === opt.id ? "bg-neon-green/10 text-neon-green" : "bg-muted text-muted-foreground"
              }`}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {storeConnection?.engine === opt.id && storeConnection.connected && (
                    <Badge variant="default" className="text-[10px] h-4 px-1.5">Connected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              {selected === opt.id && (
                <Check className="h-4 w-4 text-neon-green shrink-0" />
              )}
            </button>
          ))}

          {/* WooCommerce fields */}
          {selected === "woocommerce" && (
            <div className="space-y-3 pt-2 border-t">
              <div className="space-y-1.5">
                <Label className="text-sm">Store URL</Label>
                <Input value={wooUrl} onChange={(e) => setWooUrl(e.target.value)} placeholder="https://mystore.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">API Key (Consumer Key)</Label>
                <Input value={wooKey} onChange={(e) => setWooKey(e.target.value)} placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx" type="password" />
              </div>
              {isConnected && (
                <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing} className="w-full">
                  {syncing ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Syncing...</> : "Sync Products"}
                </Button>
              )}
            </div>
          )}

          {/* Shopify fields */}
          {selected === "shopify" && (
            <div className="space-y-3 pt-2 border-t">
              <div className="space-y-1.5">
                <Label className="text-sm">Store URL</Label>
                <Input value={shopifyUrl} onChange={(e) => setShopifyUrl(e.target.value)} placeholder="mystore.myshopify.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Admin API Access Token</Label>
                <Input value={shopifyKey} onChange={(e) => setShopifyKey(e.target.value)} placeholder="shpat_xxxxxxxxxxxxxxxx" type="password" />
              </div>
              {isConnected && (
                <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing} className="w-full">
                  {syncing ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Syncing...</> : "Sync Products"}
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2">
          {storeConnection?.connected && (
            <Button variant="destructive" size="sm" onClick={handleDisconnect} className="mr-auto">
              <Unlink className="h-3 w-3 mr-1.5" /> Disconnect
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConnect}>
            {isConnected ? "Update Connection" : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
