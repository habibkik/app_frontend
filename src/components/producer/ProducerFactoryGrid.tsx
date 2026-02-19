/**
 * ProducerFactoryGrid
 * Grid view for Producer mode on the Heat Map page.
 * Shows competitor factory cards (name, market share badge, country, price range)
 * clickable to fly the map to that factory marker.
 */
import { motion } from "framer-motion";
import { MapPin, DollarSign, Map, ArrowRight, Factory, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MapEntity } from "@/stores/analysisStore";

interface ProducerFactoryGridProps {
  entities: MapEntity[];
  onSelectEntity?: (entity: MapEntity) => void;
}

/** Parse a market share string like "24%" into a number */
function parseSharePct(share?: string): number {
  if (!share) return 0;
  return parseFloat(share.replace("%", "")) || 0;
}

function shareColor(pct: number) {
  if (pct >= 20) return "text-violet-600 bg-violet-500/10 border-violet-500/30";
  if (pct >= 10) return "text-blue-600 bg-blue-500/10 border-blue-500/30";
  return "text-muted-foreground bg-muted border-border";
}

function shareLabel(pct: number) {
  if (pct >= 20) return "Dominant";
  if (pct >= 10) return "Significant";
  return "Niche";
}

export function ProducerFactoryGrid({ entities, onSelectEntity }: ProducerFactoryGridProps) {
  if (!entities || entities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Factory className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Competitor Factories Found</h3>
          <p className="text-muted-foreground text-sm">
            Run a producer analysis to discover competitor factories with geographic data.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by market share descending
  const sorted = [...entities].sort(
    (a, b) => parseSharePct(b.marketShare) - parseSharePct(a.marketShare)
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            Competitor Factory Locations
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs text-violet-600 bg-violet-500/10 border-violet-500/30">
              20%+ Dominant
            </Badge>
            <Badge variant="outline" className="text-xs text-blue-600 bg-blue-500/10 border-blue-500/30">
              10–20% Significant
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              &lt;10% Niche
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((entity, index) => {
            const sharePct = parseSharePct(entity.marketShare);
            const colorClass = shareColor(sharePct);

            return (
              <motion.div
                key={entity.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onSelectEntity?.(entity)}
                className={cn(
                  "group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  "hover:shadow-md hover:scale-[1.02]",
                  "border-border hover:border-primary/40 bg-card"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{entity.name}</h4>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {entity.geoLocation.city
                        ? `${entity.geoLocation.city}, ${entity.geoLocation.country}`
                        : entity.geoLocation.country}
                    </span>
                  </div>
                  {entity.marketShare && (
                    <Badge variant="outline" className={cn("text-xs ml-2 shrink-0 font-bold", colorClass)}>
                      {shareLabel(sharePct)}
                    </Badge>
                  )}
                </div>

                {/* Market Share bar */}
                {sharePct > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Market Share
                      </span>
                      <span className="font-semibold">{entity.marketShare}</span>
                    </div>
                    <Progress value={Math.min(sharePct, 100)} className="h-1.5" />
                  </div>
                )}

                {/* Price Range */}
                {entity.priceRange && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      Price Range
                    </span>
                    <span className="font-medium text-foreground">
                      ${entity.priceRange.min} – ${entity.priceRange.max}
                    </span>
                  </div>
                )}

                {/* Country */}
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Country
                  </span>
                  <span className="font-medium text-foreground">{entity.geoLocation.country}</span>
                </div>

                {/* Demand concentration if available */}
                {entity.demandConcentration !== undefined && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Demand Index
                    </span>
                    <span className="font-medium text-foreground">{entity.demandConcentration}%</span>
                  </div>
                )}

                {/* Fly-to hint */}
                {onSelectEntity && (
                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-end gap-1 text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                    <Map className="h-3 w-3" />
                    <span>View on map</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
