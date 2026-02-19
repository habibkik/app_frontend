/**
 * BuyerSupplierGrid
 * Grid view for Buyer mode on the Heat Map page.
 * Shows supplier cards (country, match score, price range) clickable to fly to that map marker.
 */
import { motion } from "framer-motion";
import { MapPin, Star, DollarSign, Map, ArrowRight, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MapEntity } from "@/stores/analysisStore";

interface BuyerSupplierGridProps {
  entities: MapEntity[];
  onSelectEntity?: (entity: MapEntity) => void;
}

function matchScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
  if (score >= 60) return "text-amber-600 bg-amber-500/10 border-amber-500/30";
  return "text-muted-foreground bg-muted border-border";
}

function matchScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Fair";
}

export function BuyerSupplierGrid({ entities, onSelectEntity }: BuyerSupplierGridProps) {
  if (!entities || entities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Suppliers Found</h3>
          <p className="text-muted-foreground text-sm">
            Run a buyer analysis to discover suppliers with geographic data.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by match score descending
  const sorted = [...entities].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Supplier Locations
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
              80%+ Excellent
            </Badge>
            <Badge variant="outline" className="text-xs text-amber-600 bg-amber-500/10 border-amber-500/30">
              60%+ Good
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((entity, index) => {
            const score = entity.matchScore ?? 0;
            const scoreClass = matchScoreColor(score);

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
                  {score > 0 && (
                    <Badge variant="outline" className={cn("text-xs ml-2 shrink-0", scoreClass)}>
                      {matchScoreLabel(score)}
                    </Badge>
                  )}
                </div>

                {/* Match Score bar */}
                {score > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Match Score
                      </span>
                      <span className="font-semibold">{score}%</span>
                    </div>
                    <Progress value={score} className="h-1.5" />
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
