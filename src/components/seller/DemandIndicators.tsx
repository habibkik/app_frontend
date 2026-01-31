/**
 * Demand Indicators Component
 * Shows market demand trends and signals
 */
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Calendar,
  Search,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketAnalysisResult } from "@/stores/analysisStore";

interface DemandIndicatorsProps {
  demand: MarketAnalysisResult["demandIndicators"];
}

export function DemandIndicators({ demand }: DemandIndicatorsProps) {
  const getTrendIcon = () => {
    switch (demand.trend) {
      case "rising":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case "declining":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendColor = () => {
    switch (demand.trend) {
      case "rising":
        return "text-emerald-500 bg-emerald-500/10";
      case "declining":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Market Demand Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Trend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-muted/50 text-center"
          >
            <div className={cn(
              "inline-flex items-center justify-center h-12 w-12 rounded-xl mb-3",
              getTrendColor()
            )}>
              {getTrendIcon()}
            </div>
            <p className="text-sm text-muted-foreground mb-1">Trend</p>
            <p className="font-semibold text-foreground capitalize">
              {demand.trend}
            </p>
          </motion.div>

          {/* Seasonality */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-muted/50 text-center"
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500/10 mb-3">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Seasonality</p>
            <p className="font-semibold text-foreground text-sm">
              {demand.seasonality}
            </p>
          </motion.div>

          {/* Search Volume */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-muted/50 text-center"
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/10 mb-3">
              <Search className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Search Volume</p>
            <p className="font-semibold text-foreground text-sm">
              {demand.searchVolume}
            </p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
