/**
 * Heat Map Page
 * Regional market opportunity visualization with interactive Mapbox map
 */
import { useState } from "react";
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
    title: "Regional Supplier Heat Map",
    description: "View supplier locations and density by region",
    mapTitle: "Supplier Locations",
  },
  producer: {
    title: "Manufacturing Heat Map",
    description: "View competitor factories and production capacity by region",
    mapTitle: "Competitor Locations",
  },
  seller: {
    title: "Market Heat Map",
    description: "View demand concentration and opportunities by region",
    mapTitle: "Market Overview",
  },
};

function HeatMapContent() {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Map className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <p className="text-muted-foreground">{content.description}</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="gap-2"
          >
            <MapIcon className="h-4 w-4" />
            Map
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
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
                {mode === "buyer" ? "Suppliers Found" : "Regions Analyzed"}
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
                {mode === "buyer" ? "Avg Match Score" : "High Demand"}
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
                {mode === "buyer" ? "With Location Data" : "Top Region"}
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
                {mode === "buyer" ? "Countries" : "Avg Growth"}
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
            <h3 className="font-semibold text-lg mb-2">No Heat Map Data Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Upload a product image in Market Intelligence to generate regional market analysis data
              with geographic locations.
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
