import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { formatDistanceToNow } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

export function CompetitorMonitorHeader() {
  const { t } = useTranslation();
  const {
    products, selectedProducts, setSelectedProducts,
    dateRange, setDateRange,
    autoRefresh, setAutoRefresh,
    refreshInterval, setRefreshInterval,
    lastUpdated, isRefreshing, refreshData,
  } = useCompetitorMonitorStore();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={selectedProducts[0] || ""}
          onValueChange={(value) => setSelectedProducts([value])}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("competitorMonitor.selectProduct")} />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          dateRange={{ from: dateRange.from, to: dateRange.to }}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {t("competitorMonitor.refresh")}
          </Button>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t("competitorMonitor.autoRefresh")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">{t("competitorMonitor.autoRefresh")}</Label>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              {autoRefresh && (
                <div className="space-y-2">
                  <Label>{t("competitorMonitor.refreshInterval")}</Label>
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={(value) => setRefreshInterval(Number(value) as 1 | 2 | 4)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t("competitorMonitor.every1Hour")}</SelectItem>
                      <SelectItem value="2">{t("competitorMonitor.every2Hours")}</SelectItem>
                      <SelectItem value="4">{t("competitorMonitor.every4Hours")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
