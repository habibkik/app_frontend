/**
 * MapcnHeatMap — Mode-aware interactive map using mapcn (MapLibre GL).
 * No API key required. Uses free CARTO tiles with auto light/dark theme.
 * Buyer mode uses MapClusterLayer for automatic clustering with count badges.
 */
import { useState, useMemo, useEffect } from "react";
import { Package, Factory, Flame, TrendingUp, MapPin, Star, X } from "lucide-react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip, MapClusterLayer, MapPopup, useMap } from "@/components/ui/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  /** When set, the map flies to this region and opens its popup */
  activeRegion?: MarketHeatMapRegion | null;
}

interface SupplierFeatureProps {
  id: string;
  name: string;
  matchScore?: number;
  priceMin?: number;
  priceMax?: number;
  city: string;
  country: string;
}

// ============================================================
// COLOR HELPERS
// ============================================================
function getBuyerMarkerColor(score?: number): string {
  if (!score) return "#94a3b8";
  if (score >= 80) return "#10b981"; // emerald-500
  if (score >= 60) return "#3b82f6"; // blue-500
  return "#94a3b8"; // slate-400
}

function getDemandMarkerColor(demand?: string): string {
  if (demand === "high") return "#ef4444";
  if (demand === "medium") return "#f59e0b";
  return "#3b82f6";
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
// BUYER POPUP CARD (used both inline and as standalone MapPopup)
// ============================================================
function BuyerPopupCard({
  name, matchScore, city, country, priceMin, priceMax, onClose
}: {
  name: string;
  matchScore?: number;
  city: string;
  country: string;
  priceMin?: number;
  priceMax?: number;
  onClose?: () => void;
}) {
  const scoreColor =
    matchScore && matchScore >= 80
      ? "text-emerald-600"
      : matchScore && matchScore >= 60
      ? "text-blue-600"
      : "text-muted-foreground";

  return (
    <div className="p-3 min-w-[200px] max-w-[260px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm leading-tight">{name}</h4>
        <div className="flex items-center gap-1 shrink-0">
          {matchScore && (
            <span className={`text-sm font-bold ${scoreColor}`}>{matchScore}%</span>
          )}
          {onClose && (
            <button onClick={onClose} className="ml-1 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{city}, {country}</span>
        </div>
        {priceMin !== undefined && priceMax !== undefined && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 shrink-0" />
            <span>Price: ${priceMin} – ${priceMax}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="secondary" className="text-xs px-1.5 py-0">Supplier</Badge>
          {matchScore && matchScore >= 80 && (
            <Badge className="text-xs px-1.5 py-0 bg-emerald-500 text-white border-0">Top Match</Badge>
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
// BUYER CLUSTER MAP (inner component, rendered inside <Map>)
// ============================================================
interface SelectedPoint {
  longitude: number;
  latitude: number;
  props: SupplierFeatureProps;
}

function BuyerClusterLayer({ entities }: { entities: MapEntity[] }) {
  const [selected, setSelected] = useState<SelectedPoint | null>(null);

  // Convert entities → GeoJSON FeatureCollection
  const geojson = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point, SupplierFeatureProps>>(() => ({
    type: "FeatureCollection",
    features: entities.map((e) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [e.geoLocation.longitude, e.geoLocation.latitude],
      },
      properties: {
        id: e.id,
        name: e.name,
        matchScore: e.matchScore,
        priceMin: e.priceRange?.min,
        priceMax: e.priceRange?.max,
        city: e.geoLocation.city,
        country: e.geoLocation.country,
      },
    })),
  }), [entities]);

  return (
    <>
      <MapClusterLayer<SupplierFeatureProps>
        data={geojson}
        clusterMaxZoom={12}
        clusterRadius={60}
        clusterColors={["#10b981", "#3b82f6", "#6366f1"]}
        clusterThresholds={[5, 20]}
        pointColor="#10b981"
        onPointClick={(feature, coordinates) => {
          const props = feature.properties as SupplierFeatureProps;
          setSelected({
            longitude: coordinates[0],
            latitude: coordinates[1],
            props,
          });
        }}
      />

      {/* Popup for clicked individual supplier point */}
      {selected && (
        <MapPopup
          longitude={selected.longitude}
          latitude={selected.latitude}
          onClose={() => setSelected(null)}
          closeButton
        >
          <BuyerPopupCard
            name={selected.props.name}
            matchScore={selected.props.matchScore}
            city={selected.props.city}
            country={selected.props.country}
            priceMin={selected.props.priceMin}
            priceMax={selected.props.priceMax}
            onClose={() => setSelected(null)}
          />
        </MapPopup>
      )}
    </>
  );
}

// ============================================================
// COLOR LEGEND PANEL
// ============================================================
function LegendDot({ color }: { color: string }) {
  return (
    <span
      className="w-3 h-3 rounded-full inline-block shrink-0 border border-white/20"
      style={{ backgroundColor: color }}
    />
  );
}

function MapLegend({ mode }: { mode: DashboardMode }) {
  if (mode === "buyer") {
    return (
      <div className="px-4 py-3 border-t bg-muted/30">
        <p className="text-xs font-semibold text-foreground mb-2">Match Score</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <LegendDot color="#10b981" /> 80 – 100% — Top match
          </span>
          <span className="flex items-center gap-1.5">
            <LegendDot color="#3b82f6" /> 60 – 79% — Good match
          </span>
          <span className="flex items-center gap-1.5">
            <LegendDot color="#94a3b8" /> Below 60% — Fair match
          </span>
          <span className="flex items-center gap-x-3 ml-auto opacity-60">
            Cluster size: <span className="flex items-center gap-1"><LegendDot color="#10b981" />&lt;5</span>
            <span className="flex items-center gap-1"><LegendDot color="#3b82f6" />5–20</span>
            <span className="flex items-center gap-1"><LegendDot color="#6366f1" />20+</span>
          </span>
        </div>
      </div>
    );
  }

  if (mode === "producer") {
    return (
      <div className="px-4 py-3 border-t bg-muted/30">
        <p className="text-xs font-semibold text-foreground mb-2">Competitor Factories</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <LegendDot color="#7c3aed" /> Factory location
          </span>
          <span className="flex items-center gap-1.5 opacity-75 ml-1">
            Marker size reflects market share · Click a pin for details
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">Market Share Guide:</span>
          <span>Large share (&gt;20%) — dominant regional player</span>
          <span>Medium (10–20%) — significant presence</span>
          <span>Small (&lt;10%) — niche / emerging competitor</span>
        </div>
      </div>
    );
  }

  // seller
  return (
    <div className="px-4 py-3 border-t bg-muted/30">
      <p className="text-xs font-semibold text-foreground mb-2">Demand Level</p>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <LegendDot color="#ef4444" /> High demand — strong opportunity
        </span>
        <span className="flex items-center gap-1.5">
          <LegendDot color="#f59e0b" /> Medium demand — moderate opportunity
        </span>
        <span className="flex items-center gap-1.5">
          <LegendDot color="#3b82f6" /> Low demand — emerging market
        </span>
      </div>
    </div>
  );
}

// ============================================================
// FLY-TO HELPER — runs inside <Map> so it can access useMap()
// ============================================================
function FlyToRegion({
  region,
  onArrived,
}: {
  region: MarketHeatMapRegion | null | undefined;
  onArrived: () => void;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !region?.geoLocation) return;
    map.flyTo({
      center: [region.geoLocation.longitude, region.geoLocation.latitude],
      zoom: 5,
      duration: 1200,
    });
    // Fire onArrived after the animation completes so the popup opens
    const handle = setTimeout(onArrived, 1300);
    return () => clearTimeout(handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  return null;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export function MapcnHeatMap({ entities, regions, mode, height = 500, className, activeRegion }: MapcnHeatMapProps) {
  // Track which seller region should have its popup auto-opened after flyTo completes
  const [openPopupRegion, setOpenPopupRegion] = useState<string | null>(null);

  // When activeRegion changes, clear any existing open popup (flyTo will set it after arriving)
  useEffect(() => {
    setOpenPopupRegion(null);
  }, [activeRegion]);

  const firstEntityLng = entities[0]?.geoLocation.longitude ?? 20;
  const firstEntityLat = entities[0]?.geoLocation.latitude ?? 20;
  const firstRegionLng = regions[0]?.geoLocation?.longitude ?? 20;
  const firstRegionLat = regions[0]?.geoLocation?.latitude ?? 20;

  const centerLng = mode === "seller" ? firstRegionLng : firstEntityLng;
  const centerLat = mode === "seller" ? firstRegionLat : firstEntityLat;

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

          {/* FlyTo handler — fires when a grid card is clicked */}
          <FlyToRegion
            region={activeRegion}
            onArrived={() => activeRegion && setOpenPopupRegion(activeRegion.region)}
          />

          {/* BUYER MODE — clustered supplier layer */}
          {mode === "buyer" && <BuyerClusterLayer entities={entities} />}

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

          {/* Standalone popup that auto-opens after flyTo for the active region */}
          {mode === "seller" && openPopupRegion && (() => {
            const target = regions.find(
              (r) => r.region === openPopupRegion && r.geoLocation
            );
            if (!target) return null;
            return (
              <MapPopup
                longitude={target.geoLocation!.longitude}
                latitude={target.geoLocation!.latitude}
                onClose={() => setOpenPopupRegion(null)}
                closeButton
              >
                <SellerPopup region={target} />
              </MapPopup>
            );
          })()}
        </Map>
      </div>

      {/* Color legend panel — always shown below the map */}
      <MapLegend mode={mode} />
    </Card>
  );
}
