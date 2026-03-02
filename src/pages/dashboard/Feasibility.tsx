import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Factory, Clock, DollarSign, AlertTriangle, CheckCircle2, XCircle,
  Download, Plus, FileText, ChevronRight, Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeasibilityAnalysisComponent } from "@/features/producer/components/FeasibilityAnalysisComponent";
import { mockBOMComponents, type BOMComponent } from "@/data/bom";
import { useAnalysisStore } from "@/stores/analysisStore";
import { BOMSelector } from "@/components/shared/BOMSelector";
import { toast } from "sonner";

function scoreToBucket(score: number): "feasible" | "risky" | "not-feasible" {
  if (score >= 70) return "feasible";
  if (score >= 45) return "risky";
  return "not-feasible";
}

function scoreToTimeline(score: number): string {
  if (score >= 70) return "6-8 weeks";
  if (score >= 45) return "12-16 weeks";
  return "20+ weeks";
}

/** Convert producerResults components → BOMComponent[] */
function toBOMComponents(
  components: { name: string; category: string; quantity: number; unit: string; estimatedUnitCost: number; specifications: string; material: string; confidence: number }[]
): BOMComponent[] {
  return components.map((c, i) => ({
    id: `bom-${i}`,
    name: c.name,
    category: c.category,
    quantity: c.quantity,
    unit: c.unit,
    unitCost: c.estimatedUnitCost,
    totalCost: c.estimatedUnitCost * c.quantity,
    alternatives: Math.floor(Math.random() * 6) + 2,
    matchedSuppliers: Math.floor(Math.random() * 12) + 3,
    specifications: c.specifications,
    material: c.material,
  }));
}

export default function FeasibilityPage() {
  const { t } = useTranslation();
  const producerResults = useAnalysisStore((s) => s.producerResults);
  const [activeTab, setActiveTab] = useState("analysis");

  // Derive project data from the shared store (set via BOMSelector)
  const project = useMemo(() => {
    if (!producerResults) {
      // Fallback to demo data
      const totalCost = mockBOMComponents.reduce((s, c) => s + c.totalCost, 0);
      return {
        name: "Smart Device Assembly (Demo)",
        status: "feasible" as const,
        score: 87,
        estimatedCost: Math.round(totalCost * 100) / 100,
        timeline: "6-8 weeks",
        componentCount: mockBOMComponents.length,
        components: mockBOMComponents,
        isDemo: true,
      };
    }
    const comps = toBOMComponents(producerResults.components);
    const totalCost = comps.reduce((s, c) => s + c.totalCost, 0);
    const score = Math.round(producerResults.overallConfidence * 100);
    return {
      name: producerResults.productName,
      status: scoreToBucket(score),
      score,
      estimatedCost: Math.round(totalCost * 100) / 100,
      timeline: scoreToTimeline(score),
      componentCount: comps.length,
      components: comps,
      isDemo: false,
    };
  }, [producerResults]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "feasible": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "risky": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "not-feasible": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "feasible": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Feasible</Badge>;
      case "risky": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Needs Review</Badge>;
      case "not-feasible": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Not Feasible</Badge>;
      default: return null;
    }
  };

  const handleProceedToProduction = () => {
    toast.success("Proceeding to production planning...", { description: `Starting production workflow for ${project.name}` });
  };
  const handleOptimizeBOM = () => {
    toast.info("Opening BOM Optimizer...", { description: "Analyzing alternatives for cost reduction" });
  };
  const handleRequestRFQ = () => {
    toast.success("RFQ Request Sent", { description: "Requesting quotes from all matched suppliers" });
  };
  const handleExportReport = () => {
    toast.success("Generating Report...", { description: "Your feasibility report will be ready shortly" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("pages.feasibility.pageTitle")}</h1>
            <p className="text-muted-foreground mt-1">{t("pages.feasibility.pageSubtitle")}</p>
            {!project.isDemo && (
              <Badge variant="outline" className="mt-1 gap-1"><Sparkles className="h-3 w-3" /> Live BOM Analysis</Badge>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <BOMSelector fallbackLabel="Demo Data" />
            <Button variant="outline" className="gap-2" onClick={handleExportReport}>
              <Download className="h-4 w-4" />{t("pages.feasibility.exportReport")}
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(project.status)}
                <div>
                  <p className="font-semibold text-foreground">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.componentCount} components</p>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{project.score}</p>
                  <p className="text-xs text-muted-foreground">{t("pages.feasibility.score")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">${project.estimatedCost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{t("pages.feasibility.unitCost")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{project.timeline}</p>
                  <p className="text-xs text-muted-foreground">{t("pages.feasibility.timeline")}</p>
                </div>
                <div className="flex items-center">{getStatusBadge(project.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis */}
        <FeasibilityAnalysisComponent
          productName={project.name}
          components={project.components}
          onProceedToProduction={handleProceedToProduction}
          onOptimizeBOM={handleOptimizeBOM}
          onRequestRFQ={handleRequestRFQ}
          onExportReport={handleExportReport}
        />
      </div>
    </DashboardLayout>
  );
}
