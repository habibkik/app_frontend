/**
 * Market Heat Map Component
 * Displays geographic market opportunity visualization for sellers
 */
import { motion } from "framer-motion";
import { 
  Map, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Flame,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketHeatMapRegion } from "@/stores/analysisStore";

interface MarketHeatMapProps {
  regions: MarketHeatMapRegion[];
  onSelectRegion?: (region: MarketHeatMapRegion) => void;
}

const demandColors = {
  high: "bg-red-500/20 border-red-500/50 text-red-600",
  medium: "bg-amber-500/20 border-amber-500/50 text-amber-600",
  low: "bg-blue-500/20 border-blue-500/50 text-blue-600",
};

const opportunityBadge = {
  excellent: "bg-emerald-500/10 text-emerald-600",
  good: "bg-primary/10 text-primary",
  moderate: "bg-amber-500/10 text-amber-600",
  saturated: "bg-red-500/10 text-red-600",
};

export function MarketHeatMap({ 
  regions,
  onSelectRegion,
}: MarketHeatMapProps) {
  if (!regions || regions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Heat Map Data</h3>
          <p className="text-muted-foreground text-sm">
            Market heat map data is not yet available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Market Heat Map
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
              High Demand
            </Badge>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
              Medium
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
              Low
            </Badge>
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
                <h4 className="font-semibold text-foreground">{region.region}</h4>
                <Badge className={cn("text-xs", opportunityBadge[region.opportunity])}>
                  {region.opportunity}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Competitors
                  </span>
                  <span className="font-medium text-foreground">{region.competitorCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    Avg Price
                  </span>
                  <span className="font-medium text-foreground">${region.avgPrice}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {region.growth.startsWith("+") ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    )}
                    Growth
                  </span>
                  <span className={cn(
                    "font-medium",
                    region.growth.startsWith("+") ? "text-emerald-600" : "text-red-600"
                  )}>
                    {region.growth}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
