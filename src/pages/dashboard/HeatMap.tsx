/**
 * Heat Map Page
 * Regional market opportunity visualization with interactive mapcn map (MapLibre GL, no API key)
 */
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Map, Globe, TrendingUp, DollarSign, LayoutGrid, MapIcon, FlaskConical, Layers } from "lucide-react";

import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketHeatMap } from "@/components/seller/MarketHeatMap";
import { MapcnHeatMap } from "@/components/shared/MapcnHeatMap";
import { useAnalysisStore, useMapEntities } from "@/stores/analysisStore";
import { useModeStore } from "@/stores/modeStore";
import { DEMO_HEAT_MAP_REGIONS } from "@/data/demoMarketData";
import { DEMO_BUYER_MAP_ENTITIES, DEMO_PRODUCER_MAP_ENTITIES } from "@/data/demoMapData";
import type { MarketHeatMapRegion } from "@/stores/analysisStore";

const modeContent = {
  buyer: {
    title: "pages.heatMap.regionalSupplierHeatMap",
    description: "pages.heatMap.viewSupplierLocations",
    mapTitle: "pages.heatMap.supplierLocationsMap",
  },
  producer: {
    title: "pages.heatMap.manufacturingHeatMap",
    description: "pages.heatMap.viewCompetitorFactories",
    mapTitle: "pages.heatMap.competitorLocationsMap",
  },
  seller: {
    title: "pages.heatMap.marketHeatMap",
    description: "pages.heatMap.viewDemandConcentration",
    mapTitle: "pages.heatMap.marketOverviewMap",
  },
};

function HeatMapContent() {
  const { t } = useTranslation();
  const mode = useModeStore((state) => state.mode);
  const { sellerResults, buyerResults, producerResults } = useAnalysisStore();
  const realMapEntities = useMapEntities(mode);
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  /** Region selected from the grid — triggers flyTo + popup on the map */
  const [activeRegion, setActiveRegion] = useState<MarketHeatMapRegion | null>(null);
  /** Map projection toggle */
  const [projection, setProjection] = useState<"mercator" | "globe">("mercator");

  // Determine if we have real analysis data
  const hasRealEntities = realMapEntities.length > 0;
  const hasRealRegions = (sellerResults?.marketHeatMap?.length ?? 0) > 0;

  // Pick data: prefer real, fall back to demo
  const mapEntities =
    mode === "buyer"
      ? hasRealEntities ? realMapEntities : DEMO_BUYER_MAP_ENTITIES
      : mode === "producer"
      ? hasRealEntities ? realMapEntities : DEMO_PRODUCER_MAP_ENTITIES
      : []; // seller uses regions, not entities

  const regions =
    mode === "seller"
      ? sellerResults?.marketHeatMap ?? DEMO_HEAT_MAP_REGIONS
      : [];

  const isShowingDemo =
    mode === "seller"
      ? !hasRealRegions
      : !hasRealEntities;

  const content = modeContent[mode];

  // Summary stats
  const totalRegions = regions.length;
  const highDemandCount = regions.filter((r) => r.demand === "high").length;
  const avgGrowth =
    regions.length > 0
      ? (
          regions.reduce(
            (sum, r) => sum + parseFloat(r.growth.replace("%", "").replace("+", "")),
            0
          ) / regions.length
        ).toFixed(1)
      : "0";
  const topRegion = regions.reduce(
    (top, r) => {
      const growth = parseFloat(r.growth.replace("%", "").replace("+", ""));
      return growth > top.growth ? { name: r.region, growth } : top;
    },
    { name: "N/A", growth: -Infinity }
  );

  const entityCount = mapEntities.length;
  const avgMatchScore =
    mode === "buyer" && mapEntities.length > 0 && mapEntities[0].matchScore
      ? Math.round(
          mapEntities.reduce((sum, e) => sum + (e.matchScore || 0), 0) /
            mapEntities.length
        )
      : null;

  const hasAnyData = mapEntities.length > 0 || regions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Map className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{t(content.title)}</h1>
              {isShowingDemo && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <FlaskConical className="h-3 w-3" />
                  Demo data
                </Badge>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t(content.description)}
            </p>
          </div>
        </div>

        {/* Controls row: View Toggle + Globe Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Map / Grid toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="gap-2"
            >
              <MapIcon className="h-4 w-4" />
              {t("pages.heatMap.mapView")}
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              {t("pages.heatMap.gridView")}
            </Button>
          </div>

          {/* Globe / Flat projection toggle — only visible in map view */}
          {viewMode === "map" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProjection((p) => (p === "mercator" ? "globe" : "mercator"))}
              className="gap-2"
              title={projection === "mercator" ? "Switch to 3D Globe" : "Switch to Flat Map"}
            >
              {projection === "globe" ? (
                <>
                  <Layers className="h-4 w-4" />
                  Flat
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Globe
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {hasAnyData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {mode === "buyer"
                  ? t("pages.heatMap.suppliersFound")
                  : mode === "producer"
                  ? "Competitor Factories"
                  : t("pages.heatMap.regionsAnalyzed")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {mode === "seller" ? totalRegions : entityCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                {mode === "buyer"
                  ? t("pages.heatMap.avgMatchScore")
                  : mode === "producer"
                  ? "Countries Covered"
                  : t("pages.heatMap.highDemand")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {mode === "buyer"
                  ? avgMatchScore
                    ? `${avgMatchScore}%`
                    : "N/A"
                  : mode === "producer"
                  ? new Set(mapEntities.map((e) => e.geoLocation.country)).size
                  : highDemandCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Map className="h-4 w-4" />
                {mode === "buyer"
                  ? "Countries"
                  : mode === "producer"
                  ? "Top Market Share"
                  : t("pages.heatMap.topRegion")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {mode === "buyer"
                  ? new Set(mapEntities.map((e) => e.geoLocation.country)).size
                  : mode === "producer"
                  ? mapEntities[0]?.marketShare ?? "N/A"
                  : topRegion.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                {mode === "buyer"
                  ? "Price Range"
                  : mode === "producer"
                  ? "Price Range"
                  : t("pages.heatMap.avgGrowth")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {mode === "seller"
                  ? `+${avgGrowth}%`
                  : mapEntities[0]?.priceRange
                  ? `$${mapEntities[0].priceRange.min}–$${mapEntities[0].priceRange.max}`
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map View — mapcn (no API key needed) */}
      {viewMode === "map" && (
        <MapcnHeatMap
          entities={mapEntities}
          regions={regions}
          mode={mode}
          height={520}
          className="shadow-lg"
          activeRegion={activeRegion}
          projection={projection}
        />
      )}

      {/* Grid View */}
      {viewMode === "grid" && mode === "seller" && (
        <MarketHeatMap
          regions={regions}
          onSelectRegion={(region) => {
            setActiveRegion(region);
            setViewMode("map");
          }}
        />
      )}

      {viewMode === "grid" && mode !== "seller" && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            Grid view is available for Seller mode only. Switch to Seller mode or use Map view.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function HeatMap() {
  return (
    <DashboardLayout>
      <HeatMapContent />
    </DashboardLayout>
  );
}
