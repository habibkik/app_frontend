/**
 * Pricing Recommendation Component
 * Shows AI-generated pricing strategy and margin scenarios
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketAnalysisResult } from "@/stores/analysisStore";

interface PricingRecommendationProps {
  pricing: MarketAnalysisResult["pricingRecommendation"];
  marketRange: MarketAnalysisResult["marketPriceRange"];
}

export function PricingRecommendation({ 
  pricing,
  marketRange,
}: PricingRecommendationProps) {
  const [selectedScenario, setSelectedScenario] = useState<number>(1); // Default to medium

  const getCompetitivenessColor = (competitiveness: string) => {
    const lower = competitiveness.toLowerCase();
    if (lower.includes("very") || lower.includes("competitive")) {
      return "text-emerald-500 bg-emerald-500/10";
    }
    if (lower.includes("balanced") || lower.includes("medium")) {
      return "text-blue-500 bg-blue-500/10";
    }
    return "text-amber-500 bg-amber-500/10";
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Pricing Strategy
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            AI Recommended
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Price Range */}
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Market Price Range</span>
            <span className="text-sm font-medium text-foreground">
              Avg: ${marketRange.average}
            </span>
          </div>
          
          {/* Price Range Visualization */}
          <div className="relative h-8 rounded-full bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-amber-500/20 overflow-hidden">
            {/* Min/Max Labels */}
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="text-xs font-medium text-foreground">
                ${marketRange.min}
              </span>
              <span className="text-xs font-medium text-foreground">
                ${marketRange.max}
              </span>
            </div>
            
            {/* Suggested Price Marker */}
            <motion.div
              initial={{ left: "0%" }}
              animate={{ 
                left: `${((pricing.suggested - marketRange.min) / (marketRange.max - marketRange.min)) * 100}%` 
              }}
              className="absolute top-0 bottom-0 w-1 bg-primary"
              style={{ transform: "translateX(-50%)" }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge className="text-xs">
                  ${pricing.suggested}
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recommended Price */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">AI Suggested Price</p>
          <div className="flex items-center justify-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-4xl font-bold text-foreground">
              ${pricing.suggested}
            </span>
          </div>
        </div>

        {/* Margin Scenarios */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">
            Margin Scenarios
          </h4>
          <div className="space-y-2">
            {pricing.marginScenarios.map((scenario, index) => (
              <motion.button
                key={scenario.margin}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedScenario(index)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all duration-200",
                  selectedScenario === index
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedScenario === index && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {scenario.margin}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scenario.competitiveness}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      ${scenario.price}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getCompetitivenessColor(scenario.competitiveness))}
                    >
                      {index === 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : index === 2 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <Target className="h-3 w-3 mr-1" />
                      )}
                      {index === 0 ? "Volume" : index === 2 ? "Premium" : "Balanced"}
                    </Badge>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs">
            Pricing recommendations are based on market analysis and competitor data. 
            Adjust based on your cost structure and business goals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
