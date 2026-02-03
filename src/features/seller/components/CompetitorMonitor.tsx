import { useEffect } from "react";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { useToast } from "@/hooks/use-toast";
import { CompetitorMonitorHeader } from "./CompetitorMonitorHeader";
import { CompetitorMetricsCards } from "./CompetitorMetricsCards";
import { CompetitorPriceTrendChart } from "./CompetitorPriceTrendChart";
import { CompetitorTable } from "./CompetitorTable";
import { PriceMovementAlerts } from "./PriceMovementAlerts";
import { MarketInsightsPanel } from "./MarketInsightsPanel";
import type { CompetitorTableRow } from "@/features/seller/types/competitorMonitor";

interface CompetitorMonitorProps {
  onViewCompetitor?: (competitor: CompetitorTableRow) => void;
}

export function CompetitorMonitor({ onViewCompetitor }: CompetitorMonitorProps) {
  const { toast } = useToast();
  const { autoRefresh, refreshInterval, refreshData, competitors } = useCompetitorMonitorStore();

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalMs = refreshInterval * 60 * 60 * 1000; // hours to ms
    
    const timer = setInterval(() => {
      refreshData();
      toast({
        title: "Data Refreshed",
        description: "Competitor prices have been updated",
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, refreshData, toast]);

  // Handle view competitor from alerts
  const handleViewCompetitorFromAlert = (competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    if (competitor && onViewCompetitor) {
      onViewCompetitor(competitor);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <CompetitorMonitorHeader />

      {/* Key Metrics Cards */}
      <CompetitorMetricsCards />

      {/* Price Trend Chart */}
      <CompetitorPriceTrendChart />

      {/* Table and Insights side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitor Table - 2 columns */}
        <div className="lg:col-span-2">
          <CompetitorTable onViewCompetitor={onViewCompetitor} />
        </div>

        {/* Market Insights - 1 column */}
        <div className="lg:col-span-1">
          <MarketInsightsPanel />
        </div>
      </div>

      {/* Price Movement Alerts */}
      <PriceMovementAlerts onViewCompetitor={handleViewCompetitorFromAlert} />
    </div>
  );
}
