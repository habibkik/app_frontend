import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, Package, Truck, PieChart, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BOMComponent } from "@/data/bom";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/useToast";

interface BOMCostSummaryProps {
  components: BOMComponent[];
  confidence: number;
}

interface AIEstimate {
  laborPercent: number;
  overheadPercent: number;
  shippingPercent: number;
  toolingPercent: number;
  potentialSavingsPercent: number;
  laborJustification?: string;
  overheadJustification?: string;
  shippingJustification?: string;
  toolingJustification?: string;
  savingsJustification?: string;
}

export function BOMCostSummary({ components, confidence }: BOMCostSummaryProps) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<AIEstimate | null>(null);

  const totalMaterialCost = components.reduce((sum, c) => sum + c.totalCost, 0);

  // Use AI estimates if available, otherwise fallback to defaults
  const laborPct = aiEstimate?.laborPercent ?? 35;
  const overheadPct = aiEstimate?.overheadPercent ?? 15;
  const shippingPct = aiEstimate?.shippingPercent ?? 8;
  const toolingPct = aiEstimate?.toolingPercent ?? 0;
  const savingsPct = aiEstimate?.potentialSavingsPercent ?? 18;

  const estimatedLabor = totalMaterialCost * (laborPct / 100);
  const estimatedOverhead = totalMaterialCost * (overheadPct / 100);
  const estimatedShipping = totalMaterialCost * (shippingPct / 100);
  const estimatedTooling = totalMaterialCost * (toolingPct / 100);
  const totalUnitCost = totalMaterialCost + estimatedLabor + estimatedOverhead + estimatedShipping + estimatedTooling;
  const potentialSavings = totalMaterialCost * (savingsPct / 100);

  const categoryBreakdown = components.reduce((acc, comp) => {
    acc[comp.category] = (acc[comp.category] || 0) + comp.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const categoryColors = ["bg-primary", "bg-secondary", "bg-accent", "bg-muted-foreground", "bg-ring"];

  const handleRecalculateWithAI = async () => {
    setIsRecalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cost-estimate", {
        body: {
          components: components.map(c => ({
            name: c.name,
            category: c.category,
            quantity: c.quantity,
            unit: c.unit,
            unitCost: c.unitCost,
            totalCost: c.totalCost,
            material: c.material || c.category,
          })),
          productName: "BOM Product",
          productionVolume: 1000,
        },
      });

      if (error) throw error;
      if (!data?.success || !data?.estimate) throw new Error(data?.error || "Failed");

      setAiEstimate(data.estimate);
      toast({ title: "Costs recalculated", description: "AI-powered cost estimates applied." });
    } catch (err: any) {
      console.error("Cost recalculation error:", err);
      toast({ title: "Recalculation failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Recalculate Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {aiEstimate && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" /> AI-Estimated
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRecalculateWithAI}
          disabled={isRecalculating}
        >
          {isRecalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isRecalculating ? "Recalculating..." : "Recalculate with AI"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bomComponents.estUnitCost")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fc(totalUnitCost)}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">{t("bomComponents.confidence")}</span>
                <Progress value={confidence} className="h-1.5 flex-1" />
                <span className="text-xs font-medium">{confidence}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bomComponents.materialCost")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fc(totalMaterialCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("bomComponents.componentsIdentified", { count: components.length })}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bomComponents.potentialSavings")}</CardTitle>
              <TrendingDown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">-{fc(potentialSavings)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {aiEstimate?.savingsJustification || t("bomComponents.viaAlternatives")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bomComponents.estShipping")}</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fc(estimatedShipping)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {aiEstimate?.shippingJustification || t("bomComponents.perUnitFOB")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bomComponents.costBreakdown")}</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <CostBreakdownItem label={t("bomComponents.materials")} value={totalMaterialCost} total={totalUnitCost} color="bg-primary" fc={fc} tooltip={undefined} />
                <CostBreakdownItem label={`${t("bomComponents.laborEst")} (${laborPct}%)`} value={estimatedLabor} total={totalUnitCost} color="bg-secondary" fc={fc} tooltip={aiEstimate?.laborJustification} />
                <CostBreakdownItem label={`${t("bomComponents.overheadEst")} (${overheadPct}%)`} value={estimatedOverhead} total={totalUnitCost} color="bg-accent" fc={fc} tooltip={aiEstimate?.overheadJustification} />
                <CostBreakdownItem label={`${t("bomComponents.shippingEst")} (${shippingPct}%)`} value={estimatedShipping} total={totalUnitCost} color="bg-muted-foreground" fc={fc} tooltip={aiEstimate?.shippingJustification} />
                {estimatedTooling > 0 && (
                  <CostBreakdownItem label={`Tooling (${toolingPct}%)`} value={estimatedTooling} total={totalUnitCost} color="bg-ring" fc={fc} tooltip={aiEstimate?.toolingJustification} />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bomComponents.byCategory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedCategories.map(([category, cost], index) => (
                  <CostBreakdownItem key={category} label={category} value={cost} total={totalMaterialCost} color={categoryColors[index] || "bg-muted"} fc={fc} tooltip={undefined} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function CostBreakdownItem({ label, value, total, color, fc, tooltip }: { label: string; value: number; total: number; color: string; fc: (amount: number) => string; tooltip?: string }) {
  const percentage = (value / total) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{fc(value)} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
      {tooltip && <p className="text-[10px] text-muted-foreground italic">{tooltip}</p>}
    </div>
  );
}
