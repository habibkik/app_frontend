import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Star, MapPin } from "lucide-react";
import type { Supplier } from "@/data/suppliers";

interface OutreachSupplierDiscoveryCardProps {
  supplier: Supplier;
  onGenerateCampaigns: (supplier: Supplier) => Promise<number>;
}

export function OutreachSupplierDiscoveryCard({
  supplier,
  onGenerateCampaigns,
}: OutreachSupplierDiscoveryCardProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await onGenerateCampaigns(supplier);
    setLoading(false);
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-muted-foreground">{supplier.logo}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{supplier.name}</h4>
                {supplier.isAIDiscovered && (
                  <Badge variant="outline" className="text-xs">AI</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {supplier.location.city}, {supplier.location.country}
                </span>
                <span>•</span>
                <span>{supplier.industry}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {supplier.rating}
                </span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 flex-shrink-0"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {loading ? "Generating..." : "Generate Campaigns"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
