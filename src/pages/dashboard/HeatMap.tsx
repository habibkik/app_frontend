/**
 * Heat Map Page
 * Regional market opportunity visualization accessible across all dashboard modes
 */
import { Map, Globe, TrendingUp, DollarSign } from "lucide-react";

import { DashboardLayout, useDashboardMode } from "@/features/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketHeatMap } from "@/components/seller/MarketHeatMap";
import { useAnalysisStore } from "@/stores/analysisStore";

const modeContent = {
  buyer: {
    title: "Regional Supplier Heat Map",
    description: "View supplier density and pricing by region",
  },
  producer: {
    title: "Manufacturing Heat Map",
    description: "View production capacity and competition by region",
  },
  seller: {
    title: "Market Heat Map",
    description: "View demand and opportunities by region",
  },
};

export default function HeatMap() {
  const { mode } = useDashboardMode();
  const { sellerResults } = useAnalysisStore();
  const regions = sellerResults?.marketHeatMap || [];
  const content = modeContent[mode];

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Map className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <p className="text-muted-foreground">{content.description}</p>
          </div>
        </div>

        {/* Summary Stats */}
        {regions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  Total Regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalRegions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  High Demand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{highDemandCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Map className="h-4 w-4" />
                  Top Region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{topRegion.name}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Avg Growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">+{avgGrowth}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Heat Map Grid */}
        <MarketHeatMap regions={regions} />

        {/* Empty state message */}
        {regions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Map className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Heat Map Data Yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Upload a product image in Market Intelligence to generate regional market analysis data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
