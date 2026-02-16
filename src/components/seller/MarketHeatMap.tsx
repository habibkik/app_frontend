/**
 * Market Heat Map Component
 * Displays geographic market opportunity visualization with demand concentration
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Map, TrendingUp, TrendingDown, Users, DollarSign, Flame, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MarketHeatMapRegion } from "@/stores/analysisStore";

interface MarketHeatMapProps {
  regions: MarketHeatMapRegion[];
  onSelectRegion?: (region: MarketHeatMapRegion) => void;
}

const demandColors = {
  high: "bg-destructive/20 border-destructive/50 text-destructive",
  medium: "bg-amber-500/20 border-amber-500/50 text-amber-600",
  low: "bg-primary/20 border-primary/50 text-primary",
};

const opportunityBadge = {
  excellent: "bg-emerald-500/10 text-emerald-600",
  good: "bg-primary/10 text-primary",
  moderate: "bg-amber-500/10 text-amber-600",
  saturated: "bg-destructive/10 text-destructive",
};

export function MarketHeatMap({ regions, onSelectRegion }: MarketHeatMapProps) {
  const { t } = useTranslation();

  if (!regions || regions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Heat Map Data</h3>
          <p className="text-muted-foreground text-sm">Market heat map data is not yet available</p>
        </CardContent>
      </Card>
    );
  }

  const getGoogleMapsUrl = (region: MarketHeatMapRegion) => {
    if (region.geoLocation) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${region.geoLocation.city}, ${region.geoLocation.country}`)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(region.region)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            {t("heatMap.title")}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">{t("marketInsights.high")}</Badge>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">{t("marketInsights.medium")}</Badge>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">{t("marketInsights.low")}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region, index) => (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectRegion?.(region)}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02]",
                demandColors[region.demand]
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{region.region}</h4>
                  {region.geoLocation && (
                    <a href={getGoogleMapsUrl(region)} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MapPin className="h-3 w-3" />
                      {region.geoLocation.city}, {region.geoLocation.country}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <Badge className={cn("text-xs", opportunityBadge[region.opportunity])}>{region.opportunity}</Badge>
              </div>

              {region.demandConcentration !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" />Demand Concentration</span>
                    <span className="font-medium">{region.demandConcentration}%</span>
                  </div>
                  <Progress value={region.demandConcentration} className="h-1.5" />
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" />{t("marketInsights.competitors")}</span>
                  <span className="font-medium text-foreground">{region.competitorCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="h-3.5 w-3.5" />{t("competitorMonitor.marketAvg")}</span>
                  <span className="font-medium text-foreground">${region.avgPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {region.growth.startsWith("+") ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                    {t("marketInsights.growth")}
                  </span>
                  <span className={cn("font-medium", region.growth.startsWith("+") ? "text-emerald-600" : "text-destructive")}>{region.growth}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
