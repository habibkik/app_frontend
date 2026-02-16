import { TrendingDown, TrendingUp, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useTranslation } from "react-i18next";

export function CompetitorMetricsCards() {
  const { metrics } = useCompetitorMonitorStore();
  const fc = useFormatCurrency();
  const { t } = useTranslation();

  const isAboveMarket = metrics.pricePosition > 0;
  const positionText = isAboveMarket 
    ? t("competitorMonitor.aboveMarket", { value: Math.abs(metrics.pricePosition).toFixed(1) })
    : t("competitorMonitor.belowMarket", { value: Math.abs(metrics.pricePosition).toFixed(1) });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("competitorMonitor.marketAverage")}</p>
              <p className="text-2xl font-bold">{fc(metrics.marketAverage)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("competitorMonitor.yourPrice")}</p>
              <p className="text-2xl font-bold">{fc(metrics.yourPrice)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("competitorMonitor.pricePosition")}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={isAboveMarket ? "destructive" : "default"}
                  className={!isAboveMarket ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  {positionText}
                </Badge>
              </div>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              isAboveMarket ? "bg-destructive/10" : "bg-emerald-500/10"
            }`}>
              {isAboveMarket ? (
                <TrendingUp className="h-6 w-6 text-destructive" />
              ) : (
                <TrendingDown className="h-6 w-6 text-emerald-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("competitorMonitor.competitorsFound")}</p>
              <p className="text-2xl font-bold">{metrics.competitorsFound} <span className="text-sm font-normal text-muted-foreground">{t("competitorMonitor.activeSellers")}</span></p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
