import { motion } from "framer-motion";
import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingInsight } from "@/lib/market-intel-service";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface PricingAnalysisCardProps {
  pricing: PricingInsight;
}

export function PricingAnalysisCard({ pricing }: PricingAnalysisCardProps) {
  const { t } = useTranslation();

  const getDemandColor = (level: PricingInsight["demandLevel"]) => {
    switch (level) {
      case "high":
        return "text-primary";
      case "medium":
        return "text-muted-foreground";
      case "low":
        return "text-destructive";
    }
  };

  const sortedCompetitors = [...pricing.competitorPrices].sort((a, b) => a.price - b.price);
  const maxPrice = Math.max(...sortedCompetitors.map((c) => c.price));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {t("market.pricingAnalysis")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-primary/10 text-center"
          >
            <p className="text-xs text-muted-foreground mb-1">{t("market.recommendedPrice")}</p>
            <p className="text-2xl font-bold text-primary">${pricing.recommendedPrice}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-muted/50 text-center"
          >
            <p className="text-xs text-muted-foreground mb-1">{t("market.marketAverage")}</p>
            <p className="text-2xl font-bold">${pricing.averagePrice}</p>
          </motion.div>
        </div>

        <div className="p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("market.marketPriceRange")}</span>
            <Badge variant={pricing.demandLevel === "high" ? "default" : "secondary"}>
              {pricing.demandLevel} {t("market.demand")}
            </Badge>
          </div>
          <div className="relative h-8 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            <motion.div
              initial={{ left: "0%" }}
              animate={{ 
                left: `${((pricing.recommendedPrice - pricing.priceRange.min) / (pricing.priceRange.max - pricing.priceRange.min)) * 100}%` 
              }}
              className="absolute top-0 bottom-0 w-1 bg-primary"
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>${pricing.priceRange.min}</span>
            <span>${pricing.priceRange.max}</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("market.competitorPricing")}
          </p>
          <div className="space-y-2">
            {sortedCompetitors.map((comp, index) => {
              const widthPercent = (comp.price / maxPrice) * 100;
              const isRecommendedZone = Math.abs(comp.price - pricing.recommendedPrice) < 30;

              return (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm w-32 truncate">{comp.name}</span>
                  <div className="flex-1 h-6 bg-muted rounded relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                      className={cn(
                        "h-full rounded",
                        isRecommendedZone ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">${comp.price}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
