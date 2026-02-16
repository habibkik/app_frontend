import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, RotateCcw, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScenarioParams, ScenarioResult, DEFAULT_SCENARIO_PARAMS, FeasibilityAnalysis, VOLUME_DISCOUNTS } from "../types/feasibility";
import { simulateScenario } from "../utils/feasibilityCalculator";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface ScenarioSimulatorProps { analysis: FeasibilityAnalysis; onScenarioChange?: (result: ScenarioResult) => void; }

export function ScenarioSimulator({ analysis, onScenarioChange }: ScenarioSimulatorProps) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState<ScenarioParams>(DEFAULT_SCENARIO_PARAMS);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  useEffect(() => {
    const newResult = simulateScenario(analysis, params);
    setResult(newResult);
    onScenarioChange?.(newResult);
  }, [params, analysis]);

  const handleReset = () => setParams(DEFAULT_SCENARIO_PARAMS);
  const updateParam = (key: keyof ScenarioParams, value: number) => setParams((prev) => ({ ...prev, [key]: value }));
  const nextDiscount = VOLUME_DISCOUNTS.find((d) => d.threshold > params.productionVolume);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" />{t("scenarioSimulator.title")}</div>
              <div className="flex items-center gap-2">
                {result && (
                  <Badge variant="secondary" className={`gap-1 ${result.percentChange > 0 ? "bg-red-500/10 text-red-600" : result.percentChange < 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {result.percentChange > 0 ? <TrendingUp className="h-3 w-3" /> : result.percentChange < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {result.percentChange > 0 ? "+" : ""}{result.percentChange}%
                  </Badge>
                )}
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><SlidersHorizontal className="h-4 w-4 text-muted-foreground" /></motion.div>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label className="text-sm">{t("scenarioSimulator.productionVolume")}</Label><span className="text-sm font-medium text-primary">{params.productionVolume.toLocaleString()} {t("scenarioSimulator.units")}</span></div>
              <Slider value={[params.productionVolume]} onValueChange={([v]) => updateParam("productionVolume", v)} min={100} max={10000} step={100} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>100 {t("scenarioSimulator.units")}</span><span>10,000 {t("scenarioSimulator.units")}</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label className="text-sm">{t("scenarioSimulator.componentCostIncrease")}</Label><span className={`text-sm font-medium ${params.costIncreasePercent > 0 ? "text-red-500" : "text-foreground"}`}>{params.costIncreasePercent > 0 ? "+" : ""}{params.costIncreasePercent}%</span></div>
              <Slider value={[params.costIncreasePercent]} onValueChange={([v]) => updateParam("costIncreasePercent", v)} min={0} max={30} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>0%</span><span>+30%</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label className="text-sm">{t("scenarioSimulator.laborCostPerHour")}</Label><span className="text-sm font-medium text-primary">{fc(params.laborCostPerHour)}/hr</span></div>
              <Slider value={[params.laborCostPerHour]} onValueChange={([v]) => updateParam("laborCostPerHour", v)} min={15} max={50} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>{fc(15)}/hr</span><span>{fc(50)}/hr</span></div>
            </div>
            <AnimatePresence mode="wait">
              {result && (
                <motion.div key={`${result.projectedUnitCost}-${result.percentChange}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div><p className="text-sm text-muted-foreground">{t("scenarioSimulator.projectedUnitCost")}</p><p className="text-2xl font-bold text-foreground">{fc(result.projectedUnitCost)}</p></div>
                    <div className={`px-3 py-2 rounded-lg text-center ${result.percentChange > 0 ? "bg-red-500/10" : result.percentChange < 0 ? "bg-emerald-500/10" : "bg-muted"}`}>
                      <p className={`text-lg font-bold ${result.percentChange > 0 ? "text-red-500" : result.percentChange < 0 ? "text-emerald-500" : "text-muted-foreground"}`}>{result.percentChange > 0 ? "+" : ""}{result.percentChange}%</p>
                      <p className="text-xs text-muted-foreground">{t("scenarioSimulator.vsBaseline")}</p>
                    </div>
                  </div>
                  {result.volumeDiscountApplied && <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><Sparkles className="h-3 w-3" />{t("scenarioSimulator.volumeDiscountApplied", { percent: result.discountPercent })}</Badge>}
                  {nextDiscount && !result.volumeDiscountApplied && <p className="text-xs text-muted-foreground mt-2">💡 {t("scenarioSimulator.volumeDiscountTip", { discount: nextDiscount.discount, threshold: nextDiscount.threshold.toLocaleString() })}</p>}
                  {nextDiscount && result.volumeDiscountApplied && <p className="text-xs text-muted-foreground mt-2">💡 {t("scenarioSimulator.nextDiscountTier", { discount: nextDiscount.discount, threshold: nextDiscount.threshold.toLocaleString() })}</p>}
                </motion.div>
              )}
            </AnimatePresence>
            <Button variant="outline" size="sm" onClick={handleReset} className="w-full gap-2"><RotateCcw className="h-4 w-4" />{t("scenarioSimulator.resetToDefaults")}</Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
