import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FeasibilityFactors, FactorStatus } from "../types/feasibility";

interface FeasibilityFactorsPanelProps { factors: FeasibilityFactors; }
interface FactorItemProps { label: string; status: FactorStatus; message: string; detail?: string; delay?: number; }

function FactorItem({ label, status, message, detail, delay = 0 }: FactorItemProps) {
  const statusConfig = {
    pass: { Icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    warn: { Icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    fail: { Icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  };
  const { Icon, color, bg, border } = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.3 }} className={`flex items-center gap-3 p-3 rounded-lg ${bg} border ${border} cursor-help transition-all hover:scale-[1.02]`}>
            <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{label}</p>
              <p className="text-xs text-muted-foreground truncate">{message}</p>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
          {detail && <p className="text-xs mt-1">{detail}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function FeasibilityFactorsPanel({ factors }: FeasibilityFactorsPanelProps) {
  const { t } = useTranslation();

  const factorItems = [
    { label: t("feasibilityFactors.componentAvailability"), status: factors.componentAvailability.status, message: factors.componentAvailability.message, detail: t("feasibilityFactors.basedOnSupplierDb") },
    { label: t("feasibilityFactors.leadTime"), status: factors.leadTime.status, message: factors.leadTime.message, detail: t("feasibilityFactors.avgLeadTime", { days: factors.leadTime.days }) },
    { label: t("feasibilityFactors.singleSupplierRisk"), status: factors.singleSupplierRisk.status, message: factors.singleSupplierRisk.message, detail: factors.singleSupplierRisk.count > 0 ? t("feasibilityFactors.affected", { components: factors.singleSupplierRisk.components.slice(0, 3).join(", ") }) : undefined },
    { label: t("feasibilityFactors.costCompetitiveness"), status: factors.costCompetitiveness.status, message: factors.costCompetitiveness.message, detail: t("feasibilityFactors.comparedToMarket") },
    { label: t("feasibilityFactors.localSourcing"), status: factors.localSourcing.status, message: factors.localSourcing.message, detail: t("feasibilityFactors.localImported", { local: factors.localSourcing.localPercent, imported: factors.localSourcing.importedPercent }) },
  ];

  const statusCounts = {
    pass: factorItems.filter((f) => f.status === "pass").length,
    warn: factorItems.filter((f) => f.status === "warn").length,
    fail: factorItems.filter((f) => f.status === "fail").length,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2"><Info className="h-4 w-4 text-primary" />{t("feasibilityFactors.keyFactors")}</div>
          <div className="flex items-center gap-2 text-xs">
            {statusCounts.pass > 0 && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-3 w-3" />{statusCounts.pass}</span>}
            {statusCounts.warn > 0 && <span className="flex items-center gap-1 text-amber-500"><AlertTriangle className="h-3 w-3" />{statusCounts.warn}</span>}
            {statusCounts.fail > 0 && <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3 w-3" />{statusCounts.fail}</span>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {factorItems.map((item, index) => <FactorItem key={item.label} {...item} delay={index * 0.1} />)}
      </CardContent>
    </Card>
  );
}
