/**
 * Heat Map Page
 * Regional market opportunity visualization with interactive Mapbox map
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Map, Globe, TrendingUp, DollarSign, LayoutGrid, MapIcon } from "lucide-react";

import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarketHeatMap } from "@/components/seller/MarketHeatMap";
import { MapboxMap } from "@/components/shared/MapboxMap";
import { useAnalysisStore, useMapEntities } from "@/stores/analysisStore";
import { useModeStore } from "@/stores/modeStore";

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
  const mapEntities = useMapEntities(mode);
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  
  // Get regions based on mode
  const regions = sellerResults?.marketHeatMap || [];
  const content = modeContent[mode];

  // Check if we have any data
  const hasMapData = mapEntities.length > 0;
  const hasGridData = regions.length > 0;
  const hasAnyData = hasMapData || hasGridData;

  // Calculate summary stats
  const totalRegions = regions.length;
  const highDemandCount = regions.filter((r) => r.demand === "high").length;
  const avgGrowth =
    regions.length > 0
      ? (
          regions.reduce((sum, r) => sum + parseFloat(r.growth.replace("%", "").replace("+", "")), 0) /
          regions.length
        ).toFixed(1)
      : "0";
  const topRegion = regions.reduce(
    (top, r) => {
      const growth = parseFloat(r.growth.replace("%", "").replace("+", ""));
      return growth > top.growth ? { name: r.region, growth } : top;
    },
    { name: "N/A", growth: -Infinity }
  );

  // Calculate entity stats
  const entityCount = mapEntities.length;
  const avgMatchScore = mapEntities.length > 0 && mapEntities[0].matchScore
    ? Math.round(mapEntities.reduce((sum, e) => sum + (e.matchScore || 0), 0) / mapEntities.length)
    : null;

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Map className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t(content.title)}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t(content.description)}</p>
          </div>
        </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1 self-start sm:self-auto">
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
      </div>

      {/* Summary Stats */}
      {hasAnyData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {mode === "buyer" ? t("pages.heatMap.suppliersFound") : t("pages.heatMap.regionsAnalyzed")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {mode === "buyer" ? entityCount : totalRegions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                {mode === "buyer" ? t("pages.heatMap.avgMatchScore") : t("pages.heatMap.highDemand")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {mode === "buyer" ? (avgMatchScore ? `${avgMatchScore}%` : "N/A") : highDemandCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Map className="h-4 w-4" />
                {mode === "buyer" ? t("pages.heatMap.withLocationData") : t("pages.heatMap.topRegion")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {mode === "buyer" ? entityCount : topRegion.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                {mode === "buyer" ? t("pages.heatMap.countries") : t("pages.heatMap.avgGrowth")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {mode === "buyer" 
                  ? new Set(mapEntities.map(e => e.geoLocation.country)).size
                  : `+${avgGrowth}%`}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <MapboxMap
          entities={mapEntities}
          mode={mode}
          height={500}
          className="shadow-lg"
        />
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <MarketHeatMap regions={regions} />
      )}

      {/* Empty state */}
      {!hasAnyData && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Map className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("pages.heatMap.noHeatMapData")}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t("pages.heatMap.uploadProductImage")}
            </p>
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
