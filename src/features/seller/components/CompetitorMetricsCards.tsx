import { TrendingDown, TrendingUp, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";

export function CompetitorMetricsCards() {
  const { metrics } = useCompetitorMonitorStore();

  const isAboveMarket = metrics.pricePosition > 0;
  const positionText = isAboveMarket 
    ? `${Math.abs(metrics.pricePosition).toFixed(1)}% Above Market`
    : `${Math.abs(metrics.pricePosition).toFixed(1)}% Below Market`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Market Average Price */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Market Average</p>
              <p className="text-2xl font-bold">${metrics.marketAverage.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Current Price */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Your Price</p>
              <p className="text-2xl font-bold">${metrics.yourPrice.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Position */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price Position</p>
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

      {/* Competitors Found */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Competitors Found</p>
              <p className="text-2xl font-bold">{metrics.competitorsFound} <span className="text-sm font-normal text-muted-foreground">active sellers</span></p>
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
