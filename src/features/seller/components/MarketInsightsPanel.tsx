import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Users, Package, Shield, Lightbulb, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

export function MarketInsightsPanel() {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  const { marketInsight, metrics } = useCompetitorMonitorStore();

  if (!marketInsight) return null;

  const getTrendIcon = () => {
    switch (marketInsight.trend.direction) {
      case "up": return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "down": return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDemandBadge = () => {
    switch (marketInsight.demandLevel) {
      case "high": return <Badge className="bg-emerald-500">{t("marketInsights.high")}</Badge>;
      case "medium": return <Badge variant="secondary">{t("marketInsights.medium")}</Badge>;
      case "low": return <Badge variant="outline">{t("marketInsights.low")}</Badge>;
    }
  };

  const getSupplyBadge = () => {
    switch (marketInsight.supplyStatus) {
      case "high": return <Badge variant="outline" className="text-destructive border-destructive">{t("marketInsights.high")}</Badge>;
      case "stable": return <Badge variant="secondary">{t("marketInsights.stable")}</Badge>;
      case "low": return <Badge className="bg-emerald-500">{t("marketInsights.low")}</Badge>;
    }
  };

  const getCompetitivenessBadge = () => {
    const competitiveness = marketInsight.marketStats?.yourCompetitiveness;
    if (!competitiveness) return null;
    const map: Record<string, { cls: string; key: string }> = {
      significantly_underpriced: { cls: "bg-red-500", key: "significantlyUnderpriced" },
      underpriced: { cls: "bg-yellow-500 text-yellow-950", key: "underpriced" },
      competitive: { cls: "bg-emerald-500", key: "competitive" },
      overpriced: { cls: "bg-orange-500 text-orange-950", key: "overpriced" },
      significantly_overpriced: { cls: "bg-red-600", key: "significantlyOverpriced" },
    };
    const m = map[competitiveness];
    return m ? <Badge className={m.cls}>{t(`marketInsights.${m.key}`)}</Badge> : null;
  };

  const getMarketMaturityBadge = () => {
    const maturity = marketInsight.insights?.marketMaturity;
    if (!maturity) return null;
    const map: Record<string, string> = { emerging: "text-blue-600 border-blue-600", growth: "text-emerald-600 border-emerald-600", mature: "text-yellow-600 border-yellow-600", declining: "text-red-600 border-red-600" };
    return <Badge variant="outline" className={map[maturity]}>{t(`marketInsights.${maturity}`)}</Badge>;
  };

  const shouldRaisePrice = marketInsight.priceAdjustment > 0;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" />{t("marketInsights.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="text-sm font-semibold mb-3">{t("marketInsights.pricingRecommendation")}</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">{t("marketInsights.optimalPrice")}</span><span className="font-bold text-lg">{fc(marketInsight.optimalPrice)}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">{t("marketInsights.currentMargin")}</span><span className="font-medium">{marketInsight.currentMargin}%</span></div>
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">{t("marketInsights.recommendedMargin")}</span><span className="font-medium text-primary">{marketInsight.recommendedMargin}%</span></div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{shouldRaisePrice ? t("marketInsights.raisePriceBy") : t("marketInsights.lowerPriceBy")}</span>
              <Badge variant={shouldRaisePrice ? "default" : "destructive"} className={shouldRaisePrice ? "bg-emerald-500" : ""}>{fc(Math.abs(marketInsight.priceAdjustment))}</Badge>
            </div>
            {marketInsight.marketStats?.yourCompetitiveness && (
              <div className="flex justify-between items-center mt-2"><span className="text-sm text-muted-foreground">{t("marketInsights.yourPosition")}</span>{getCompetitivenessBadge()}</div>
            )}
          </div>
        </div>

        {marketInsight.marketStats && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" />{t("marketInsights.marketStatistics")}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t("marketInsights.medianPrice")}</span><span className="font-medium">{fc(marketInsight.marketStats.medianPrice)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("marketInsights.priceRange")}</span><span className="font-medium">{fc(marketInsight.marketStats.minPrice)} - {fc(marketInsight.marketStats.maxPrice)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("marketInsights.stdDeviation")}</span><span className="font-medium">{fc(marketInsight.marketStats.standardDeviation)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("marketInsights.suggestedRange")}</span><span className="font-medium text-primary">{fc(marketInsight.marketStats.suggestedPriceRange.min)} - {fc(marketInsight.marketStats.suggestedPriceRange.max)}</span></div>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" />{t("marketInsights.marketConditions")}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("marketInsights.trending")}</span>
              <div className="flex items-center gap-2">{getTrendIcon()}<span className="text-sm font-medium">{marketInsight.trend.direction === "stable" ? t("marketInsights.stable") : `${marketInsight.trend.percentage}%/${marketInsight.trend.period}`}</span></div>
            </div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />{t("marketInsights.demand")}</span>{getDemandBadge()}</div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-2"><Package className="h-4 w-4" />{t("marketInsights.supply")}</span>{getSupplyBadge()}</div>
            {marketInsight.newCompetitorsThisWeek > 0 && (
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("marketInsights.newThisWeek")}</span><Badge variant="secondary">+{marketInsight.newCompetitorsThisWeek} {t("marketInsights.competitors")}</Badge></div>
            )}
            {marketInsight.insights?.marketMaturity && (
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("marketInsights.marketStage")}</span>{getMarketMaturityBadge()}</div>
            )}
          </div>
        </div>

        {marketInsight.availability && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Package className="h-4 w-4" />{t("marketInsights.availability")}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("competitorMonitor.inStock")}</span><span className="font-medium text-emerald-600">{marketInsight.availability.percentInStock}%</span></div>
              <Progress value={marketInsight.availability.percentInStock} className="h-2" />
              <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">{t("competitorMonitor.limited")}</span><span className="font-medium text-yellow-600">{marketInsight.availability.percentLimited}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("competitorMonitor.outOfStock")}</span><span className="font-medium text-red-600">{marketInsight.availability.percentOutOfStock}%</span></div>
              <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">{t("marketInsights.avgLeadTime")}</span><span className="font-medium">{marketInsight.availability.averageLeadTime} {t("marketInsights.days")}</span></div>
            </div>
          </div>
        )}

        {marketInsight.dataQuality && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4" />{t("marketInsights.dataQuality")}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("marketInsights.completeness")}</span><span className="font-medium">{marketInsight.dataQuality.completeness}%</span></div>
              <Progress value={marketInsight.dataQuality.completeness} className="h-2" />
              <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">{t("marketInsights.reliability")}</span><span className="font-medium">{marketInsight.dataQuality.reliability}%</span></div>
              <Progress value={marketInsight.dataQuality.reliability} className="h-2" />
              <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">{t("marketInsights.competitorsTracked")}</span><span className="font-medium">{marketInsight.dataQuality.competitorsTracked}</span></div>
            </div>
          </div>
        )}

        {marketInsight.insights && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4" />{t("marketInsights.insights")}</h4>
            <ScrollArea className="h-[150px]">
              <div className="space-y-3">
                {marketInsight.insights.opportunities.length > 0 && (
                  <div><p className="text-xs font-medium text-emerald-600 mb-1">{t("marketInsights.opportunities")}</p>
                    <ul className="text-sm space-y-1">{marketInsight.insights.opportunities.map((opp, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-emerald-500">•</span><span className="text-muted-foreground">{opp}</span></li>))}</ul>
                  </div>
                )}
                {marketInsight.insights.threats.length > 0 && (
                  <div><p className="text-xs font-medium text-destructive mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{t("marketInsights.threats")}</p>
                    <ul className="text-sm space-y-1">{marketInsight.insights.threats.map((threat, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-destructive">•</span><span className="text-muted-foreground">{threat}</span></li>))}</ul>
                  </div>
                )}
                {marketInsight.insights.recommendedActions.length > 0 && (
                  <div><p className="text-xs font-medium text-primary mb-1">{t("marketInsights.recommendedActions")}</p>
                    <ul className="text-sm space-y-1">{marketInsight.insights.recommendedActions.map((action, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-primary">→</span><span className="text-muted-foreground">{action}</span></li>))}</ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
