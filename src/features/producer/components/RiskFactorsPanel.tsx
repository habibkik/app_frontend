import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Shield, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskFactor, RiskSeverity } from "../types/feasibility";

interface RiskFactorsPanelProps { risks: RiskFactor[]; }
interface RiskItemProps { risk: RiskFactor; index: number; }

function RiskItem({ risk, index }: RiskItemProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const severityConfig: Record<RiskSeverity, { Icon: typeof AlertTriangle; color: string; bg: string; border: string; label: string }> = {
    critical: { Icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: t("riskFactors.critical") },
    warning: { Icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: t("riskFactors.warning") },
    info: { Icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: t("riskFactors.info") },
  };

  const config = severityConfig[risk.type];
  const { Icon, color, bg, border, label } = config;

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`rounded-xl border ${border} ${bg} overflow-hidden`}>
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-start gap-3 text-left hover:bg-black/5 transition-colors">
        <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={`h-4 w-4 ${color}`} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${bg} ${color} border-none`}>{label}</Badge></div>
          <p className="text-sm font-medium text-foreground">{risk.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{risk.description}</p>
        </div>
        <div className="flex-shrink-0">{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
      </button>
      <AnimatePresence>
        {isExpanded && risk.mitigation && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0">
              <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div><p className="text-xs font-medium text-foreground mb-1">{t("riskFactors.mitigationStrategy")}</p><p className="text-xs text-muted-foreground">{risk.mitigation}</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RiskFactorsPanel({ risks }: RiskFactorsPanelProps) {
  const { t } = useTranslation();
  const criticalCount = risks.filter((r) => r.type === "critical").length;
  const warningCount = risks.filter((r) => r.type === "warning").length;
  const sortedRisks = [...risks].sort((a, b) => { const order: Record<RiskSeverity, number> = { critical: 0, warning: 1, info: 2 }; return order[a.type] - order[b.type]; });

  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-emerald-500" />{t("riskFactors.riskAssessment")}</CardTitle></CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <Shield className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-600">{t("riskFactors.noRisks")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("riskFactors.productionLooksSolid")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />{t("riskFactors.title")}</div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{criticalCount} {t("riskFactors.critical").toLowerCase()}</Badge>}
            {warningCount > 0 && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{warningCount} {t("riskFactors.warning").toLowerCase()}</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{sortedRisks.map((risk, index) => <RiskItem key={risk.id} risk={risk} index={index} />)}</CardContent>
    </Card>
  );
}
