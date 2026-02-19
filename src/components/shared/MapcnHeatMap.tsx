/**
 * MapcnHeatMap — Mode-aware interactive map using mapcn (MapLibre GL).
 * No API key required. Uses free CARTO tiles with auto light/dark theme.
 */
import { Package, Factory, Flame, TrendingUp, MapPin, Star } from "lucide-react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MapEntity, MarketHeatMapRegion } from "@/stores/analysisStore";
import type { DashboardMode } from "@/features/dashboard";

// ============================================================
// TYPES
// ============================================================
interface MapcnHeatMapProps {
  entities: MapEntity[];
  regions: MarketHeatMapRegion[];
  mode: DashboardMode;
  height?: number;
  className?: string;
}

// ============================================================
// COLOR HELPERS
// ============================================================
function getBuyerMarkerColor(score?: number): string {
  if (!score) return "#94a3b8"; // slate-400
  if (score >= 80) return "#10b981"; // emerald-500
  if (score >= 60) return "#3b82f6"; // blue-500
  return "#94a3b8"; // slate-400
}

function getDemandMarkerColor(demand?: string): string {
  if (demand === "high") return "#ef4444";   // red-500
  if (demand === "medium") return "#f59e0b"; // amber-500
  return "#3b82f6"; // blue-500
}

function getOpportunityVariant(opportunity?: string): "default" | "secondary" | "destructive" | "outline" {
  if (opportunity === "excellent") return "default";
  if (opportunity === "good") return "secondary";
  return "outline";
}

// ============================================================
// MARKER DOT COMPONENT
// ============================================================
function MarkerDot({ color, icon: Icon }: { color: string; icon: React.ElementType }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform hover:scale-110"
      style={{ backgroundColor: color }}
    >
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
}

// ============================================================
// BUYER MARKER POPUP
// ============================================================
function BuyerPopup({ entity }: { entity: MapEntity }) {
  const scoreColor = entity.matchScore && entity.matchScore >= 80
    ? "text-emerald-600"
    : entity.matchScore && entity.matchScore >= 60
    ? "text-blue-600"
    : "text-muted-foreground";

  return (
    <div className="p-3 min-w-[200px] max-w-[260px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm leading-tight">{entity.name}</h4>
        {entity.matchScore && (
          <span className={`text-sm font-bold whitespace-nowrap ${scoreColor}`}>
            {entity.matchScore}%
          </span>
        )}
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{entity.geoLocation.city}, {entity.geoLocation.country}</span>
        </div>
        {entity.priceRange && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 shrink-0" />
            <span>Price: ${entity.priceRange.min} – ${entity.priceRange.max}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="secondary" className="text-xs px-1.5 py-0">Supplier</Badge>
          {entity.matchScore && entity.matchScore >= 80 && (
            <Badge className="text-xs px-1.5 py-0 bg-emerald-500">Top Match</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRODUCER MARKER POPUP
// ============================================================
function ProducerPopup({ entity }: { entity: MapEntity }) {
  return (
    <div className="p-3 min-w-[200px] max-w-[260px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm leading-tight">{entity.name}</h4>
        {entity.marketShare && (
          <span className="text-sm font-bold text-violet-600 whitespace-nowrap">
            {entity.marketShare}
          </span>
        )}
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{entity.geoLocation.city}, {entity.geoLocation.country}</span>
        </div>
        {entity.priceRange && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 shrink-0" />
            <span>Price: ${entity.priceRange.min} – ${entity.priceRange.max}</span>
          </div>
        )}
        {entity.demandConcentration !== undefined && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 shrink-0" />
            <span>Demand: {entity.demandConcentration}%</span>
          </div>
        )}
        <div className="mt-1">
          <Badge variant="secondary" className="text-xs px-1.5 py-0">Competitor Factory</Badge>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SELLER REGION MARKER POPUP
// ============================================================
function SellerPopup({ region }: { region: MarketHeatMapRegion }) {
  return (
    <div className="p-3 min-w-[200px] max-w-[260px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm leading-tight">{region.region}</h4>
        <Badge variant={getOpportunityVariant(region.opportunity)} className="text-xs capitalize whitespace-nowrap">
          {region.opportunity}
        </Badge>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 shrink-0" />
          <span>Growth: <strong className="text-foreground">{region.growth}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 shrink-0" />
          <span>Avg Price: ${region.avgPrice}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{region.competitorCount} competitors</span>
        </div>
        <div className="mt-1">
          <Badge
            variant="outline"
            className={`text-xs capitalize px-1.5 py-0 ${
              region.demand === "high"
                ? "border-red-500 text-red-600"
                : region.demand === "medium"
                ? "border-amber-500 text-amber-600"
                : "border-blue-500 text-blue-600"
            }`}
          >
            {region.demand} demand
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export function MapcnHeatMap({ entities, regions, mode, height = 500, className }: MapcnHeatMapProps) {
  // Compute a sensible initial center based on first data point
  const firstEntityLng = entities[0]?.geoLocation.longitude ?? 20;
  const firstEntityLat = entities[0]?.geoLocation.latitude ?? 20;
  const firstRegionLng = regions[0]?.geoLocation?.longitude ?? 20;
  const firstRegionLat = regions[0]?.geoLocation?.latitude ?? 20;

  const centerLng = mode === "seller"
    ? firstRegionLng
    : firstEntityLng;
  const centerLat = mode === "seller"
    ? firstRegionLat
    : firstEntityLat;

  if (entities.length === 0 && regions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MapPin className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle className="text-base mb-1">No Map Data Available</CardTitle>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload a product image to analyse and populate the map with real data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden p-0 ${className ?? ""}`}>
      <div style={{ height }} className="w-full">
        <Map center={[centerLng, centerLat]} zoom={1.8} className="w-full h-full">
          <MapControls showZoom showFullscreen position="top-right" />

          {/* BUYER MODE — supplier markers */}
          {mode === "buyer" &&
            entities.map((entity) => (
              <MapMarker
                key={entity.id}
                longitude={entity.geoLocation.longitude}
                latitude={entity.geoLocation.latitude}
              >
                <MarkerContent>
                  <MarkerDot
                    color={getBuyerMarkerColor(entity.matchScore)}
                    icon={Package}
                  />
                </MarkerContent>
                <MarkerTooltip>
                  <span className="font-medium">{entity.name}</span>
                  {entity.matchScore && (
                    <span className="ml-1 opacity-75">({entity.matchScore}%)</span>
                  )}
                </MarkerTooltip>
                <MarkerPopup>
                  <BuyerPopup entity={entity} />
                </MarkerPopup>
              </MapMarker>
            ))}

          {/* PRODUCER MODE — competitor factory markers */}
          {mode === "producer" &&
            entities.map((entity) => (
              <MapMarker
                key={entity.id}
                longitude={entity.geoLocation.longitude}
                latitude={entity.geoLocation.latitude}
              >
                <MarkerContent>
                  <MarkerDot color="#7c3aed" icon={Factory} />
                </MarkerContent>
                <MarkerTooltip>
                  <span className="font-medium">{entity.name}</span>
                  {entity.marketShare && (
                    <span className="ml-1 opacity-75">({entity.marketShare})</span>
                  )}
                </MarkerTooltip>
                <MarkerPopup>
                  <ProducerPopup entity={entity} />
                </MarkerPopup>
              </MapMarker>
            ))}

          {/* SELLER MODE — region demand markers */}
          {mode === "seller" &&
            regions
              .filter((r) => r.geoLocation)
              .map((region, idx) => (
                <MapMarker
                  key={`region-${idx}`}
                  longitude={region.geoLocation!.longitude}
                  latitude={region.geoLocation!.latitude}
                >
                  <MarkerContent>
                    <MarkerDot
                      color={getDemandMarkerColor(region.demand)}
                      icon={Flame}
                    />
                  </MarkerContent>
                  <MarkerTooltip>
                    <span className="font-medium">{region.region}</span>
                    <span className="ml-1 opacity-75">· {region.growth}</span>
                  </MarkerTooltip>
                  <MarkerPopup>
                    <SellerPopup region={region} />
                  </MarkerPopup>
                </MapMarker>
              ))}
        </Map>
      </div>
    </Card>
  );
}
