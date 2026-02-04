import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Users, Package, Shield, Lightbulb, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const getCompetitivenessBadge = () => {
    const competitiveness = marketInsight.marketStats?.yourCompetitiveness;
    if (!competitiveness) return null;

    switch (competitiveness) {
      case "significantly_underpriced":
        return <Badge className="bg-red-500">Significantly Underpriced</Badge>;
      case "underpriced":
        return <Badge className="bg-yellow-500 text-yellow-950">Underpriced</Badge>;
      case "competitive":
        return <Badge className="bg-emerald-500">Competitive</Badge>;
      case "overpriced":
        return <Badge className="bg-orange-500 text-orange-950">Overpriced</Badge>;
      case "significantly_overpriced":
        return <Badge className="bg-red-600">Significantly Overpriced</Badge>;
      default:
        return null;
    }
  };

  const getMarketMaturityBadge = () => {
    const maturity = marketInsight.insights?.marketMaturity;
    if (!maturity) return null;

    switch (maturity) {
      case "emerging":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Emerging</Badge>;
      case "growth":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-600">Growth</Badge>;
      case "mature":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Mature</Badge>;
      case "declining":
        return <Badge variant="outline" className="text-red-600 border-red-600">Declining</Badge>;
      default:
        return null;
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

            {/* Competitiveness Badge */}
            {marketInsight.marketStats?.yourCompetitiveness && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Your Position</span>
                {getCompetitivenessBadge()}
              </div>
            )}
          </div>
        </div>

        {/* Extended Market Statistics */}
        {marketInsight.marketStats && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Market Statistics
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Median Price</span>
                <span className="font-medium">${marketInsight.marketStats.medianPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Range</span>
                <span className="font-medium">
                  ${marketInsight.marketStats.minPrice.toFixed(2)} - ${marketInsight.marketStats.maxPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Std. Deviation</span>
                <span className="font-medium">${marketInsight.marketStats.standardDeviation.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Suggested Range</span>
                <span className="font-medium text-primary">
                  ${marketInsight.marketStats.suggestedPriceRange.min.toFixed(2)} - ${marketInsight.marketStats.suggestedPriceRange.max.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

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

            {/* Market Maturity */}
            {marketInsight.insights?.marketMaturity && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Market Stage</span>
                {getMarketMaturityBadge()}
              </div>
            )}
          </div>
        </div>

        {/* Availability Metrics */}
        {marketInsight.availability && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Availability
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">In Stock</span>
                <span className="font-medium text-emerald-600">{marketInsight.availability.percentInStock}%</span>
              </div>
              <Progress value={marketInsight.availability.percentInStock} className="h-2" />
              
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Limited</span>
                <span className="font-medium text-yellow-600">{marketInsight.availability.percentLimited}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Out of Stock</span>
                <span className="font-medium text-red-600">{marketInsight.availability.percentOutOfStock}%</span>
              </div>
              
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Avg Lead Time</span>
                <span className="font-medium">{marketInsight.availability.averageLeadTime} days</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality */}
        {marketInsight.dataQuality && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Data Quality
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completeness</span>
                <span className="font-medium">{marketInsight.dataQuality.completeness}%</span>
              </div>
              <Progress value={marketInsight.dataQuality.completeness} className="h-2" />
              
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Reliability</span>
                <span className="font-medium">{marketInsight.dataQuality.reliability}%</span>
              </div>
              <Progress value={marketInsight.dataQuality.reliability} className="h-2" />
              
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Competitors Tracked</span>
                <span className="font-medium">{marketInsight.dataQuality.competitorsTracked}</span>
              </div>
            </div>
          </div>
        )}

        {/* Market Insights */}
        {marketInsight.insights && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </h4>
            
            <ScrollArea className="h-[150px]">
              <div className="space-y-3">
                {/* Opportunities */}
                {marketInsight.insights.opportunities.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-emerald-600 mb-1">Opportunities</p>
                    <ul className="text-sm space-y-1">
                      {marketInsight.insights.opportunities.map((opp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500">•</span>
                          <span className="text-muted-foreground">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Threats */}
                {marketInsight.insights.threats.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-destructive mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Threats
                    </p>
                    <ul className="text-sm space-y-1">
                      {marketInsight.insights.threats.map((threat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-destructive">•</span>
                          <span className="text-muted-foreground">{threat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Actions */}
                {marketInsight.insights.recommendedActions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Recommended Actions</p>
                    <ul className="text-sm space-y-1">
                      {marketInsight.insights.recommendedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">→</span>
                          <span className="text-muted-foreground">{action}</span>
                        </li>
                      ))}
                    </ul>
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
