import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, Package, Truck, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BOMComponent } from "@/data/bom";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface BOMCostSummaryProps {
  components: BOMComponent[];
  confidence: number;
}

export function BOMCostSummary({ components, confidence }: BOMCostSummaryProps) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();

  const totalMaterialCost = components.reduce((sum, c) => sum + c.totalCost, 0);
  const estimatedLabor = totalMaterialCost * 0.35;
  const estimatedOverhead = totalMaterialCost * 0.15;
  const estimatedShipping = totalMaterialCost * 0.08;
  const totalUnitCost = totalMaterialCost + estimatedLabor + estimatedOverhead + estimatedShipping;
  const potentialSavings = totalMaterialCost * 0.18;
  
  const categoryBreakdown = components.reduce((acc, comp) => {
    acc[comp.category] = (acc[comp.category] || 0) + comp.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const categoryColors = ["bg-primary", "bg-secondary", "bg-accent", "bg-muted-foreground", "bg-ring"];

  return (
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
            <p className="text-xs text-muted-foreground mt-1">{t("bomComponents.viaAlternatives")}</p>
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
            <p className="text-xs text-muted-foreground mt-1">{t("bomComponents.perUnitFOB")}</p>
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
              <CostBreakdownItem label={t("bomComponents.materials")} value={totalMaterialCost} total={totalUnitCost} color="bg-primary" fc={fc} />
              <CostBreakdownItem label={t("bomComponents.laborEst")} value={estimatedLabor} total={totalUnitCost} color="bg-secondary" fc={fc} />
              <CostBreakdownItem label={t("bomComponents.overheadEst")} value={estimatedOverhead} total={totalUnitCost} color="bg-accent" fc={fc} />
              <CostBreakdownItem label={t("bomComponents.shippingEst")} value={estimatedShipping} total={totalUnitCost} color="bg-muted-foreground" fc={fc} />
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
                <CostBreakdownItem key={category} label={category} value={cost} total={totalMaterialCost} color={categoryColors[index] || "bg-muted"} fc={fc} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function CostBreakdownItem({ label, value, total, color, fc }: { label: string; value: number; total: number; color: string; fc: (amount: number) => string }) {
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
    </div>
  );
}
