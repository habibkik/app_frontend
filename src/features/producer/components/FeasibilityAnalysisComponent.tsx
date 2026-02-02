import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Download,
  Send,
  Settings2,
  Package,
  ArrowRight,
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FeasibilityAnalysis | null>(null);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);

  // Perform initial analysis
  const initialAnalysis = useMemo(() => {
    return performFeasibilityAnalysis(productName, components);
  }, [productName, components]);

  // Use analysis state or initial analysis
  const currentAnalysis = analysis || initialAnalysis;

  const handleCalculateFeasibility = async () => {
    setIsAnalyzing(true);
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const result = performFeasibilityAnalysis(productName, components);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Recommendation Banner */}
      <RecommendationBanner
        status={currentAnalysis.status}
        score={currentAnalysis.score}
        totalCostPerUnit={scenarioResult?.projectedUnitCost || currentAnalysis.totalCostPerUnit}
        breakEvenUnits={currentAnalysis.breakEvenUnits}
        recommendedMinOrder={currentAnalysis.recommendedMinOrder}
        risks={currentAnalysis.risks.length}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Info Card */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              Product Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{productName}</h3>
                <p className="text-sm text-muted-foreground">
                  BOM: {components.length} components
                </p>
              </div>
              <Button
                onClick={handleCalculateFeasibility}
                disabled={isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Calculate Feasibility
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feasibility Score */}
        <Card className="sm:w-auto">
          <CardContent className="pt-6 flex justify-center">
            <FeasibilityScoreCircle
              score={currentAnalysis.score}
              status={currentAnalysis.status}
              size="md"
            />
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Cards */}
      <CostBreakdownCards
        componentCosts={currentAnalysis.componentCosts}
        productionCost={currentAnalysis.productionCost}
        logisticsCost={currentAnalysis.logisticsCost}
        totalCostPerUnit={currentAnalysis.totalCostPerUnit}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <FeasibilityFactorsPanel factors={currentAnalysis.factors} />
          <RiskFactorsPanel risks={currentAnalysis.risks} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <MakeVsBuyCard analysis={currentAnalysis.makeVsBuy} />
          <ScenarioSimulator
            analysis={currentAnalysis}
            onScenarioChange={setScenarioResult}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            {currentAnalysis.status === "feasible" && (
              <Button onClick={onProceedToProduction} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Proceed to Production
              </Button>
            )}
            <Button variant="outline" onClick={onOptimizeBOM} className="gap-2">
              <Settings2 className="h-4 w-4" />
              Optimize BOM
            </Button>
            <Button variant="outline" onClick={onRequestRFQ} className="gap-2">
              <Send className="h-4 w-4" />
              Request RFQ from All Suppliers
            </Button>
            <Button variant="outline" onClick={onExportReport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
