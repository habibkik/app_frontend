import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, RotateCcw, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ScenarioParams,
  ScenarioResult,
  DEFAULT_SCENARIO_PARAMS,
  FeasibilityAnalysis,
  VOLUME_DISCOUNTS,
} from "../types/feasibility";
import { simulateScenario } from "../utils/feasibilityCalculator";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface ScenarioSimulatorProps {
  analysis: FeasibilityAnalysis;
  onScenarioChange?: (result: ScenarioResult) => void;
}

export function ScenarioSimulator({ analysis, onScenarioChange }: ScenarioSimulatorProps) {
  const fc = useFormatCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState<ScenarioParams>(DEFAULT_SCENARIO_PARAMS);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  useEffect(() => {
    const newResult = simulateScenario(analysis, params);
    setResult(newResult);
    onScenarioChange?.(newResult);
  }, [params, analysis]);

  const handleReset = () => {
    setParams(DEFAULT_SCENARIO_PARAMS);
  };

  const updateParam = (key: keyof ScenarioParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const nextDiscount = VOLUME_DISCOUNTS.find((d) => d.threshold > params.productionVolume);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Scenario Simulation
              </div>
              <div className="flex items-center gap-2">
                {result && (
                  <Badge
                    variant="secondary"
                    className={`gap-1 ${
                      result.percentChange > 0
                        ? "bg-red-500/10 text-red-600"
                        : result.percentChange < 0
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {result.percentChange > 0 ? <TrendingUp className="h-3 w-3" /> : result.percentChange < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {result.percentChange > 0 ? "+" : ""}{result.percentChange}%
                  </Badge>
                )}
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Production Volume Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Production Volume</Label>
                <span className="text-sm font-medium text-primary">
                  {params.productionVolume.toLocaleString()} units
                </span>
              </div>
              <Slider value={[params.productionVolume]} onValueChange={([v]) => updateParam("productionVolume", v)} min={100} max={10000} step={100} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100 units</span>
                <span>10,000 units</span>
              </div>
            </div>

            {/* Cost Increase Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Component Cost Increase</Label>
                <span className={`text-sm font-medium ${params.costIncreasePercent > 0 ? "text-red-500" : "text-foreground"}`}>
                  {params.costIncreasePercent > 0 ? "+" : ""}{params.costIncreasePercent}%
                </span>
              </div>
              <Slider value={[params.costIncreasePercent]} onValueChange={([v]) => updateParam("costIncreasePercent", v)} min={0} max={30} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>+30%</span>
              </div>
            </div>

            {/* Labor Cost Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Labor Cost per Hour</Label>
                <span className="text-sm font-medium text-primary">
                  {fc(params.laborCostPerHour)}/hr
                </span>
              </div>
              <Slider value={[params.laborCostPerHour]} onValueChange={([v]) => updateParam("laborCostPerHour", v)} min={15} max={50} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{fc(15)}/hr</span>
                <span>{fc(50)}/hr</span>
              </div>
            </div>

            {/* Results Display */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={`${result.projectedUnitCost}-${result.percentChange}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Unit Cost</p>
                      <p className="text-2xl font-bold text-foreground">
                        {fc(result.projectedUnitCost)}
                      </p>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-center ${
                      result.percentChange > 0 ? "bg-red-500/10" : result.percentChange < 0 ? "bg-emerald-500/10" : "bg-muted"
                    }`}>
                      <p className={`text-lg font-bold ${
                        result.percentChange > 0 ? "text-red-500" : result.percentChange < 0 ? "text-emerald-500" : "text-muted-foreground"
                      }`}>
                        {result.percentChange > 0 ? "+" : ""}{result.percentChange}%
                      </p>
                      <p className="text-xs text-muted-foreground">vs baseline</p>
                    </div>
                  </div>

                  {result.volumeDiscountApplied && (
                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <Sparkles className="h-3 w-3" />
                      {result.discountPercent}% volume discount applied
                    </Badge>
                  )}

                  {nextDiscount && !result.volumeDiscountApplied && (
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Volume discount of {nextDiscount.discount}% kicks in at {nextDiscount.threshold.toLocaleString()} units
                    </p>
                  )}

                  {nextDiscount && result.volumeDiscountApplied && (
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Next discount tier ({nextDiscount.discount}%) at {nextDiscount.threshold.toLocaleString()} units
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button variant="outline" size="sm" onClick={handleReset} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
