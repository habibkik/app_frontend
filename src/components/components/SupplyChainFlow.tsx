import { motion } from "framer-motion";
import { Package, Building2, Truck, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComponentPart, SupplierQuote } from "@/data/components";
import { useTranslation } from "react-i18next";

interface SupplyChainFlowProps {
  parts: ComponentPart[];
  quotes: SupplierQuote[];
}

export function SupplyChainFlow({ parts, quotes }: SupplyChainFlowProps) {
  const { t } = useTranslation();
  const totalParts = parts.length;
  const uniqueSuppliers = new Set(quotes.map((q) => q.supplierId)).size;
  const avgLeadTime = quotes.length > 0
    ? Math.round(quotes.reduce((sum, q) => sum + q.leadTimeDays, 0) / quotes.length)
    : 0;

  const flowSteps = [
    {
      icon: Package,
      label: t("componentSupply.components"),
      value: totalParts,
      sublabel: t("componentSupply.partsRequired"),
      color: "from-primary to-primary/70",
      bgColor: "bg-primary/10",
    },
    {
      icon: Building2,
      label: t("componentSupply.suppliers"),
      value: uniqueSuppliers,
      sublabel: t("componentSupply.activeSources"),
      color: "from-blue-500 to-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Truck,
      label: t("componentSupply.delivery"),
      value: avgLeadTime,
      sublabel: t("componentSupply.avgDays"),
      color: "from-green-500 to-emerald-400",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {t("componentSupply.supplyChainFlow")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center flex-1"
            >
              <div className={`flex-1 p-4 rounded-xl border ${step.bgColor}`}>
                <div className="flex flex-col items-center text-center">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-2`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{step.value}</span>
                  <span className="text-xs text-muted-foreground">{step.sublabel}</span>
                  <span className="text-sm font-medium text-foreground mt-1">{step.label}</span>
                </div>
              </div>
              
              {index < flowSteps.length - 1 && (
                <div className="px-2 flex-shrink-0">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-blue-500 to-green-500 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{t("componentSupply.procurement")}</span>
          <span>{t("componentSupply.sourcing")}</span>
          <span>{t("componentSupply.logistics")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
