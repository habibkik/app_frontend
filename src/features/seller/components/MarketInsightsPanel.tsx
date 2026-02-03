import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Users, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";

export function MarketInsightsPanel() {
  const { marketInsight, metrics } = useCompetitorMonitorStore();

  if (!marketInsight) return null;

  const getTrendIcon = () => {
    switch (marketInsight.trend.direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDemandBadge = () => {
    switch (marketInsight.demandLevel) {
      case "high":
        return <Badge className="bg-emerald-500">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getSupplyBadge = () => {
    switch (marketInsight.supplyStatus) {
      case "high":
        return <Badge variant="outline" className="text-destructive border-destructive">High</Badge>;
      case "stable":
        return <Badge variant="secondary">Stable</Badge>;
      case "low":
        return <Badge className="bg-emerald-500">Low</Badge>;
    }
  };

  const shouldRaisePrice = marketInsight.priceAdjustment > 0;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing Recommendation */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="text-sm font-semibold mb-3">Pricing Recommendation</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Optimal Price</span>
              <span className="font-bold text-lg">${marketInsight.optimalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Margin</span>
              <span className="font-medium">{marketInsight.currentMargin}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Recommended Margin</span>
              <span className="font-medium text-primary">{marketInsight.recommendedMargin}%</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {shouldRaisePrice ? "Raise price by" : "Lower price by"}
              </span>
              <Badge 
                variant={shouldRaisePrice ? "default" : "destructive"}
                className={shouldRaisePrice ? "bg-emerald-500" : ""}
              >
                ${Math.abs(marketInsight.priceAdjustment).toFixed(2)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Market Conditions */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Market Conditions
          </h4>
          
          <div className="space-y-3">
            {/* Trend */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trending</span>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {marketInsight.trend.direction === "stable" 
                    ? "Stable" 
                    : `${marketInsight.trend.percentage}%/${marketInsight.trend.period}`
                  }
                </span>
              </div>
            </div>
            
            {/* Demand */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Demand
              </span>
              {getDemandBadge()}
            </div>
            
            {/* Supply */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Supply
              </span>
              {getSupplyBadge()}
            </div>
            
            {/* New Competitors */}
            {marketInsight.newCompetitorsThisWeek > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New this week</span>
                <Badge variant="secondary">
                  +{marketInsight.newCompetitorsThisWeek} competitors
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
