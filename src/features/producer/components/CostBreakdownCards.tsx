import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Factory, Truck, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ComponentCostBreakdown, ProductionCostEstimate, LogisticsCostEstimate } from "../types/feasibility";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface CostBreakdownCardsProps { componentCosts: ComponentCostBreakdown[]; productionCost: ProductionCostEstimate; logisticsCost: LogisticsCostEstimate; totalCostPerUnit: number; }

export function CostBreakdownCards({ componentCosts, productionCost, logisticsCost, totalCostPerUnit }: CostBreakdownCardsProps) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const totalComponentCost = componentCosts.reduce((sum, c) => sum + c.totalCost, 0);

  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }) };

  const pieData = [
    { name: t("costBreakdown.componentCost"), value: totalComponentCost, color: "hsl(var(--primary))" },
    { name: t("costBreakdown.productionCost"), value: productionCost.totalProductionCostPerUnit, color: "hsl(217, 91%, 60%)" },
    { name: t("costBreakdown.logisticsCost"), value: logisticsCost.totalLandedCostPerUnit, color: "hsl(142, 76%, 36%)" },
  ];

  const toggleExpand = (cardId: string) => setExpandedCard(expandedCard === cardId ? null : cardId);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-4 w-4 text-primary" /></div><span>{t("costBreakdown.componentCost")}</span></div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpand("component")}>{expandedCard === "component" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{fc(totalComponentCost)}<span className="text-sm font-normal text-muted-foreground">{t("costBreakdown.perUnit")}</span></p>
            <p className="text-xs text-muted-foreground mt-1">{t("costBreakdown.components", { count: componentCosts.length })}</p>
            {expandedCard === "component" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 space-y-2 border-t pt-3">
                {componentCosts.slice(0, 5).map((comp) => <div key={comp.componentId} className="flex justify-between text-xs"><span className="text-muted-foreground truncate max-w-[120px]">{comp.name}</span><span className="font-medium">{fc(comp.totalCost)}</span></div>)}
                {componentCosts.length > 5 && <p className="text-xs text-muted-foreground">{t("costBreakdown.moreComponents", { count: componentCosts.length - 5 })}</p>}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Factory className="h-4 w-4 text-blue-500" /></div><span>{t("costBreakdown.productionCost")}</span></div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpand("production")}>{expandedCard === "production" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{fc(productionCost.totalProductionCostPerUnit)}<span className="text-sm font-normal text-muted-foreground">{t("costBreakdown.perUnit")}</span></p>
            <p className="text-xs text-muted-foreground mt-1">{t("costBreakdown.laborEquipmentFacility")}</p>
            {expandedCard === "production" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 space-y-2 border-t pt-3">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("costBreakdown.labor")}</span><span className="font-medium">{fc(productionCost.laborCostPerUnit)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("costBreakdown.equipment")}</span><span className="font-medium">{fc(productionCost.equipmentCostPerUnit)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("costBreakdown.facility")}</span><span className="font-medium">{fc(productionCost.facilityCostPerUnit)}</span></div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Truck className="h-4 w-4 text-emerald-500" /></div><span>{t("costBreakdown.logisticsCost")}</span></div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpand("logistics")}>{expandedCard === "logistics" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{fc(logisticsCost.totalLandedCostPerUnit)}<span className="text-sm font-normal text-muted-foreground">{t("costBreakdown.perUnit")}</span></p>
            <p className="text-xs text-muted-foreground mt-1">{t("costBreakdown.shippingDutiesHandling")}</p>
            {expandedCard === "logistics" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 space-y-2 border-t pt-3">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("costBreakdown.shipping")}</span><span className="font-medium">{fc(logisticsCost.shippingCostPerUnit)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("costBreakdown.importDuties")}</span><span className="font-medium">{fc(logisticsCost.importDuties)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t("costBreakdown.handlingStorage")}</span><span className="font-medium">{fc(logisticsCost.handlingStorage)}</span></div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Calculator className="h-4 w-4 text-primary" /></div><span>{t("costBreakdown.totalCost")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{fc(totalCostPerUnit)}<span className="text-sm font-normal text-muted-foreground">{t("costBreakdown.perUnit")}</span></p>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value">{pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie>
                  <Tooltip formatter={(value: number) => fc(value)} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">{pieData.map((item) => <div key={item.name} className="flex items-center gap-2 text-xs"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-muted-foreground">{item.name}</span></div>)}</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
