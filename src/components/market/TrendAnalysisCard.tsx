import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendData } from "@/lib/market-intel-service";
import { cn } from "@/lib/utils";

interface TrendAnalysisCardProps {
  trends: TrendData[];
}

export function TrendAnalysisCard({ trends }: TrendAnalysisCardProps) {
  const getTrendIcon = (direction: TrendData["direction"]) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (direction: TrendData["direction"]) => {
    switch (direction) {
      case "up":
        return "text-primary";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Market Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg border bg-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getTrendIcon(trend.direction)}
                  <span className="font-medium">{trend.name}</span>
                  <Badge
                    variant={trend.direction === "up" ? "default" : trend.direction === "down" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {trend.changePercent > 0 ? "+" : ""}
                    {trend.changePercent}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {trend.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Timeframe: {trend.timeframe}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{trend.confidence}%</div>
                <div className="text-xs text-muted-foreground">confidence</div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
