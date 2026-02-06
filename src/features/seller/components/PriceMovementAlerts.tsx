import { AlertCircle, TrendingDown, TrendingUp, UserPlus, Package, X, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatDistanceToNow } from "date-fns";
import type { PriceMovementAlert, AlertType } from "@/features/seller/types/competitorMonitor";

interface PriceMovementAlertsProps {
  onViewCompetitor?: (competitorId: string) => void;
}

const alertConfig: Record<AlertType, { 
  icon: React.ElementType; 
  bgColor: string; 
  iconColor: string;
  borderColor: string;
}> = {
  drop: {
    icon: TrendingDown,
    bgColor: "bg-red-50 dark:bg-red-950/50",
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
  },
  increase: {
    icon: TrendingUp,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  new_entry: {
    icon: UserPlus,
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  out_of_stock: {
    icon: Package,
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  availability_change: {
    icon: Package,
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  rating_change: {
    icon: AlertCircle,
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  market_shift: {
    icon: TrendingUp,
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
  },
};

const getAlertDescription = (alert: PriceMovementAlert, fc: (amount: number) => string): string => {
  switch (alert.type) {
    case "drop":
      return `${alert.competitorName} dropped to ${fc(alert.newPrice)}${alert.oldPrice ? ` (was ${fc(alert.oldPrice)})` : ""}`;
    case "increase":
      return `${alert.competitorName} rose ${alert.oldPrice ? `from ${fc(alert.oldPrice)} ` : ""}to ${fc(alert.newPrice)}`;
    case "new_entry":
      return `${alert.competitorName} entered at ${fc(alert.newPrice)}`;
    case "out_of_stock":
      return `${alert.competitorName} is out of stock`;
  }
};

export function PriceMovementAlerts({ onViewCompetitor }: PriceMovementAlertsProps) {
  const { alerts, dismissAlert } = useCompetitorMonitorStore();
  const fc = useFormatCurrency();
  
  const activeAlerts = alerts.filter(a => !a.dismissed);

  if (activeAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Price Movement Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No active alerts. We'll notify you when competitors change prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Price Movement Alerts
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {activeAlerts.length} active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              
              return (
                <div 
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {getAlertDescription(alert, fc)}
                    </p>
                    {alert.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {alert.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {alert.competitorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewCompetitor?.(alert.competitorId!)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
