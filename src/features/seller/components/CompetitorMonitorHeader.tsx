import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { formatDistanceToNow } from "date-fns";
import type { DateRange } from "react-day-picker";

export function CompetitorMonitorHeader() {
  const {
    products,
    selectedProducts,
    setSelectedProducts,
    dateRange,
    setDateRange,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    lastUpdated,
    isRefreshing,
    refreshData,
  } = useCompetitorMonitorStore();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side - Product & Date filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Product Selector */}
        <Select
          value={selectedProducts[0] || ""}
          onValueChange={(value) => setSelectedProducts([value])}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <DateRangePicker
          dateRange={{ from: dateRange.from, to: dateRange.to }}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* Right side - Refresh controls */}
      <div className="flex items-center gap-3">
        {/* Refresh button with last updated */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <span className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>

        {/* Auto-refresh settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Auto-refresh
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto-refresh</Label>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              
              {autoRefresh && (
                <div className="space-y-2">
                  <Label>Refresh interval</Label>
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={(value) => setRefreshInterval(Number(value) as 1 | 2 | 4)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every 1 hour</SelectItem>
                      <SelectItem value="2">Every 2 hours</SelectItem>
                      <SelectItem value="4">Every 4 hours</SelectItem>
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
