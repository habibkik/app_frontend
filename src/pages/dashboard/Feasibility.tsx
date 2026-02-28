import { useState, useEffect, useMemo } from "react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FeasibilityAnalysisComponent } from "@/features/producer/components/FeasibilityAnalysisComponent";
import { mockBOMComponents, type BOMComponent } from "@/data/bom";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ProjectEntry {
  id: string;
  name: string;
  status: "feasible" | "risky" | "not-feasible";
  score: number;
  estimatedCost: number;
  timeline: string;
  componentCount: number;
  components: BOMComponent[];
  createdAt?: string;
}

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
function toBOMComponents(components: { name: string; category: string; quantity: number; unit: string; estimatedUnitCost: number; specifications: string; material: string; confidence: number }[]): BOMComponent[] {
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

// Hardcoded fallback projects
const fallbackProjects: ProjectEntry[] = [
  { id: "mock-1", name: "Smart Device Assembly", status: "feasible", score: 87, estimatedCost: 45.20, timeline: "6-8 weeks", componentCount: 10, components: mockBOMComponents },
  { id: "mock-2", name: "Industrial Servo Motor", status: "risky", score: 62, estimatedCost: 125.00, timeline: "12-16 weeks", componentCount: 24, components: mockBOMComponents },
  { id: "mock-3", name: "Precision CNC Controller", status: "not-feasible", score: 34, estimatedCost: 250.00, timeline: "20+ weeks", componentCount: 45, components: mockBOMComponents },
];

export default function FeasibilityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const producerResults = useAnalysisStore((s) => s.producerResults);
  const [projects, setProjects] = useState<ProjectEntry[]>(fallbackProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectEntry>(fallbackProjects[0]);
  const [activeTab, setActiveTab] = useState("analysis");

  // Build project list from DB + current store result
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const entries: ProjectEntry[] = [];

      // 1. Current in-memory analysis (highest priority)
      if (producerResults) {
        const comps = toBOMComponents(producerResults.components);
        const totalCost = comps.reduce((s, c) => s + c.totalCost, 0);
        const score = Math.round(producerResults.overallConfidence * 100);
        entries.push({
          id: "current",
          name: producerResults.productName,
          status: scoreToBucket(score),
          score,
          estimatedCost: Math.round(totalCost * 100) / 100,
          timeline: scoreToTimeline(score),
          componentCount: comps.length,
          components: comps,
        });
      }

      // 2. DB analyses
      if (user?.id) {
        const { data } = await supabase
          .from("bom_analyses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (data && !cancelled) {
          data.forEach((row: any) => {
            // Skip if it matches current in-memory result
            if (producerResults && row.product_name === producerResults.productName) return;
            const rawComps = Array.isArray(row.components_json) ? (row.components_json as any[]) : [];
            const comps: BOMComponent[] = rawComps.map((c: any, i: number) => ({
              id: `db-${row.id}-${i}`,
              name: c.name || "Unknown",
              category: c.category || "General",
              quantity: c.quantity || 1,
              unit: c.unit || "piece",
              unitCost: c.estimatedUnitCost || c.unitCost || 0,
              totalCost: (c.estimatedUnitCost || c.unitCost || 0) * (c.quantity || 1),
              alternatives: c.alternatives || 3,
              matchedSuppliers: c.matchedSuppliers || 5,
              specifications: c.specifications || "",
              material: c.material || "",
            }));
            const totalCost = comps.reduce((s, c) => s + c.totalCost, 0);
            const score = Math.round(Number(row.confidence) * 100) || 50;
            entries.push({
              id: row.id,
              name: row.product_name,
              status: scoreToBucket(score),
              score,
              estimatedCost: Math.round(totalCost * 100) / 100,
              timeline: scoreToTimeline(score),
              componentCount: comps.length,
              components: comps,
              createdAt: row.created_at,
            });
          });
        }
      }

      // 3. Fallback to mock if nothing real
      const finalProjects = entries.length > 0 ? entries : fallbackProjects;
      if (!cancelled) {
        setProjects(finalProjects);
        setSelectedProject(finalProjects[0]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id, producerResults]);

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
    toast.success("Proceeding to production planning...", { description: `Starting production workflow for ${selectedProject.name}` });
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
            {selectedProject.id === "current" && (
              <Badge variant="outline" className="mt-1 gap-1"><Sparkles className="h-3 w-3" /> Live BOM Analysis</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportReport}>
              <Download className="h-4 w-4" />{t("pages.feasibility.exportReport")}
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />{t("pages.feasibility.newAnalysis")}
            </Button>
          </div>
        </div>

        {/* Project Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">{t("pages.feasibility.selectProductBOM")}</label>
                <Select
                  value={selectedProject.id}
                  onValueChange={(v) => setSelectedProject(projects.find(p => p.id === v) || projects[0])}
                >
                  <SelectTrigger className="w-full sm:max-w-md">
                    <SelectValue placeholder={t("pages.feasibility.selectProject")} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          <span>{project.name}</span>
                          <span className="text-muted-foreground">({project.componentCount} components)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedProject.score}</p>
                  <p className="text-xs text-muted-foreground">{t("pages.feasibility.score")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">${selectedProject.estimatedCost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{t("pages.feasibility.unitCost")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedProject.timeline}</p>
                  <p className="text-xs text-muted-foreground">{t("pages.feasibility.timeline")}</p>
                </div>
                <div className="flex items-center">{getStatusBadge(selectedProject.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="analysis">{t("pages.feasibility.fullAnalysis")}</TabsTrigger>
            <TabsTrigger value="history">{t("pages.feasibility.analysisHistory")}</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <FeasibilityAnalysisComponent
              productName={selectedProject.name}
              components={selectedProject.components}
              onProceedToProduction={handleProceedToProduction}
              onOptimizeBOM={handleOptimizeBOM}
              onRequestRFQ={handleRequestRFQ}
              onExportReport={handleExportReport}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("pages.feasibility.recentAnalyses")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.map((project) => (
                    <motion.button
                      key={project.id}
                      onClick={() => { setSelectedProject(project); setActiveTab("analysis"); }}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(project.status)}
                        <div>
                          <p className="font-medium text-foreground">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.componentCount} components • ${project.estimatedCost.toFixed(2)}/unit
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-foreground">{project.score}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
