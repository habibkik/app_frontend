import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Download, Send, Settings2, Package, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockBOMComponents, BOMComponent } from "@/data/bom";
import { performFeasibilityAnalysis } from "../utils/feasibilityCalculator";
import { FeasibilityAnalysis, ScenarioResult } from "../types/feasibility";
import { FeasibilityScoreCircle } from "./FeasibilityScoreCircle";
import { CostBreakdownCards } from "./CostBreakdownCards";
import { FeasibilityFactorsPanel } from "./FeasibilityFactorsPanel";
import { MakeVsBuyCard } from "./MakeVsBuyCard";
import { ScenarioSimulator } from "./ScenarioSimulator";
import { RiskFactorsPanel } from "./RiskFactorsPanel";
import { RecommendationBanner } from "./RecommendationBanner";
import { useTranslation } from "react-i18next";

interface FeasibilityAnalysisComponentProps {
  productName?: string;
  components?: BOMComponent[];
  onProceedToProduction?: () => void;
  onOptimizeBOM?: () => void;
  onRequestRFQ?: () => void;
  onExportReport?: () => void;
}

export function FeasibilityAnalysisComponent({
  productName = "Smart Device Assembly",
  components = mockBOMComponents,
  onProceedToProduction,
  onOptimizeBOM,
  onRequestRFQ,
  onExportReport,
}: FeasibilityAnalysisComponentProps) {
  const { t } = useTranslation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FeasibilityAnalysis | null>(null);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);

  const initialAnalysis = useMemo(() => {
    return performFeasibilityAnalysis(productName, components);
  }, [productName, components]);

  const currentAnalysis = analysis || initialAnalysis;

  const handleCalculateFeasibility = async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const result = performFeasibilityAnalysis(productName, components);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <RecommendationBanner
        status={currentAnalysis.status}
        score={currentAnalysis.score}
        totalCostPerUnit={scenarioResult?.projectedUnitCost || currentAnalysis.totalCostPerUnit}
        breakEvenUnits={currentAnalysis.breakEvenUnits}
        recommendedMinOrder={currentAnalysis.recommendedMinOrder}
        risks={currentAnalysis.risks.length}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              {t("feasibility.productAnalysis")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{productName}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("feasibility.bomComponents", { count: components.length })}
                </p>
              </div>
              <Button onClick={handleCalculateFeasibility} disabled={isAnalyzing} className="gap-2">
                {isAnalyzing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                    {t("feasibility.analyzing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t("feasibility.calculateFeasibility")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:w-auto">
          <CardContent className="pt-6 flex justify-center">
            <FeasibilityScoreCircle score={currentAnalysis.score} status={currentAnalysis.status} size="md" />
          </CardContent>
        </Card>
      </div>

      <CostBreakdownCards
        componentCosts={currentAnalysis.componentCosts}
        productionCost={currentAnalysis.productionCost}
        logisticsCost={currentAnalysis.logisticsCost}
        totalCostPerUnit={currentAnalysis.totalCostPerUnit}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <FeasibilityFactorsPanel factors={currentAnalysis.factors} />
          <RiskFactorsPanel risks={currentAnalysis.risks} />
        </div>
        <div className="space-y-6">
          <MakeVsBuyCard analysis={currentAnalysis.makeVsBuy} />
          <ScenarioSimulator analysis={currentAnalysis} onScenarioChange={setScenarioResult} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            {currentAnalysis.status === "feasible" && (
              <Button onClick={onProceedToProduction} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                {t("feasibility.proceedToProduction")}
              </Button>
            )}
            <Button variant="outline" onClick={onOptimizeBOM} className="gap-2">
              <Settings2 className="h-4 w-4" />
              {t("feasibility.optimizeBOM")}
            </Button>
            <Button variant="outline" onClick={onRequestRFQ} className="gap-2">
              <Send className="h-4 w-4" />
              {t("feasibility.requestRFQ")}
            </Button>
            <Button variant="outline" onClick={onExportReport} className="gap-2">
              <Download className="h-4 w-4" />
              {t("feasibility.exportReport")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
