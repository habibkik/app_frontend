import { useState, useEffect, useCallback } from "react";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { useToast } from "@/hooks/use-toast";
import { CompetitorMonitorHeader } from "./CompetitorMonitorHeader";
import { CompetitorMetricsCards } from "./CompetitorMetricsCards";
import { CompetitorPriceTrendChart } from "./CompetitorPriceTrendChart";
import { CompetitorTable } from "./CompetitorTable";
import { PriceMovementAlerts } from "./PriceMovementAlerts";
import { MarketInsightsPanel } from "./MarketInsightsPanel";
import { CompetitorMonitorDetailModal } from "./CompetitorMonitorDetailModal";
import type { CompetitorTableRow } from "@/features/seller/types/competitorMonitor";

interface CompetitorMonitorProps {
  onViewCompetitor?: (competitor: CompetitorTableRow) => void;
}

export function CompetitorMonitor({ onViewCompetitor }: CompetitorMonitorProps) {
  const { toast } = useToast();
  const { autoRefresh, refreshInterval, refreshData, competitors, loadFromBackend, subscribeToRealtime } = useCompetitorMonitorStore();

  // Detail modal state
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorTableRow | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewCompetitor = useCallback((competitor: CompetitorTableRow) => {
    setSelectedCompetitor(competitor);
    setDetailModalOpen(true);
    onViewCompetitor?.(competitor);
  }, [onViewCompetitor]);

  // Load data from backend on mount
  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  // Subscribe to realtime alerts
  useEffect(() => {
    const unsubscribe = subscribeToRealtime();
    return unsubscribe;
  }, [subscribeToRealtime]);

  // Auto-refresh with specific price change detection
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalMs = refreshInterval * 60 * 60 * 1000;
    
    const timer = setInterval(async () => {
      const oldPrices = new Map(competitors.map(c => [c.id, { name: c.name, price: c.currentPrice }]));
      await refreshData();
      
      const currentCompetitors = useCompetitorMonitorStore.getState().competitors;
      const changes: string[] = [];
      currentCompetitors.forEach(c => {
        const old = oldPrices.get(c.id);
        if (old && Math.abs(old.price - c.currentPrice) > 0.01) {
          const dir = c.currentPrice > old.price ? "↑" : "↓";
          changes.push(`${c.name} ${dir} $${c.currentPrice.toFixed(2)}`);
        }
      });

      toast({
        title: changes.length > 0 ? "Price Changes Detected" : "Data Refreshed",
        description: changes.length > 0 
          ? changes.slice(0, 3).join(", ") + (changes.length > 3 ? ` +${changes.length - 3} more` : "")
          : "Competitor prices have been updated",
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, refreshData, competitors, toast]);

  // Handle view competitor from alerts
  const handleViewCompetitorFromAlert = (competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    if (competitor) {
      handleViewCompetitor(competitor);
    }
  };

  return (
    <div className="space-y-6">
      <CompetitorMonitorHeader />
      <CompetitorMetricsCards />
      <CompetitorPriceTrendChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CompetitorTable onViewCompetitor={handleViewCompetitor} />
        </div>
        <div className="lg:col-span-1">
          <MarketInsightsPanel />
        </div>
      </div>

      <PriceMovementAlerts onViewCompetitor={handleViewCompetitorFromAlert} />

      {/* Competitor Detail Modal */}
      <CompetitorMonitorDetailModal
        competitor={selectedCompetitor}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
