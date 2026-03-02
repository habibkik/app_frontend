/**
 * MapComparePanel — Side panel showing a comparison table of selected map entities.
 */
import { X, Truck, Ship, Plane, MapPin, Star, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { MapEntity } from "@/stores/analysisStore";
import type { UserCoords } from "@/hooks/useUserLocation";
import { haversineKm, formatDistance, getTransportInfo, getRoadCost, getSeaCost, getAirCost } from "@/utils/transportEstimate";

interface MapComparePanelProps {
  entities: MapEntity[];
  userCoords: UserCoords | null;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function MapComparePanel({ entities, userCoords, onRemove, onClear, onClose }: MapComparePanelProps) {
  if (entities.length === 0) return null;

  return (
    <Card className="w-[340px] shrink-0 flex flex-col max-h-full overflow-hidden border-l">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Compare ({entities.length})</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClear}>
            Clear
          </Button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <Separator />
      <ScrollArea className="flex-1">
        <CardContent className="p-3 space-y-3">
          {entities.map((entity) => {
            const dist = userCoords
              ? haversineKm(userCoords.lat, userCoords.lng, entity.geoLocation.latitude, entity.geoLocation.longitude)
              : null;
            const recommended = dist ? getTransportInfo(dist) : null;

            return (
              <Card key={entity.id} className="p-3 space-y-2 relative">
                <button
                  onClick={() => onRemove(entity.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Name & location */}
                <div>
                  <p className="font-semibold text-sm pr-5 leading-tight">{entity.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {entity.geoLocation.city}, {entity.geoLocation.country}
                  </p>
                </div>

                {/* Key metrics row */}
                <div className="flex flex-wrap gap-1.5">
                  {entity.matchScore !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      Match: {entity.matchScore}%
                    </Badge>
                  )}
                  {entity.marketShare && (
                    <Badge variant="secondary" className="text-xs">
                      Share: {entity.marketShare}
                    </Badge>
                  )}
                  {entity.priceRange && (
                    <Badge variant="outline" className="text-xs">
                      ${entity.priceRange.min}–${entity.priceRange.max}
                    </Badge>
                  )}
                </div>

                {/* Distance & transport */}
                {dist !== null && (
                  <div className="space-y-1 pt-1 border-t border-border">
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {formatDistance(dist)} away
                    </p>
                    {[
                      { mode: "road", icon: Truck, label: "Road", cost: getRoadCost(dist), color: "#10b981" },
                      { mode: "sea", icon: Ship, label: "Sea", cost: getSeaCost(dist), color: "#3b82f6" },
                      { mode: "air", icon: Plane, label: "Air", cost: getAirCost(dist), color: "#f59e0b" },
                    ].map(({ mode, icon: Icon, label, cost, color }) => {
                      const isBest = mode === recommended?.mode;
                      return (
                        <div
                          key={mode}
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                            isBest ? "font-semibold" : "opacity-50"
                          }`}
                          style={{ color }}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span>{label}</span>
                          {isBest && <span className="text-[8px] opacity-70">★</span>}
                          <span className="ml-auto font-normal">{cost}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
