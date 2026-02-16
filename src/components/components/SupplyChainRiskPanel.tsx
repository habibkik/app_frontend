import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, Clock, Users, MapPin, ChevronDown,
  ShieldCheck, ShieldAlert, ShieldX, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  type SupplyChainRiskScore, type RiskLevel,
  getRiskColor, getRiskBgColor, getRiskGradient,
} from "@/lib/supply-chain-risk";
import { useTranslation } from "react-i18next";

interface SupplyChainRiskPanelProps {
  riskScore: SupplyChainRiskScore;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  switch (level) {
    case "low": return <ShieldCheck className="h-5 w-5 text-green-500" />;
    case "medium": return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
    case "high": return <ShieldX className="h-5 w-5 text-orange-500" />;
    case "critical": return <AlertTriangle className="h-5 w-5 text-red-500" />;
  }
}

function RiskLevelBadge({ level }: { level: RiskLevel }) {
  const colors = {
    low: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <Badge variant="outline" className={colors[level]}>
      {level.toUpperCase()}
    </Badge>
  );
}

export function SupplyChainRiskPanel({ riskScore }: SupplyChainRiskPanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { overall, overallLevel, leadTimeRisk, singleSupplierRisk, geographicRisk } = riskScore;

  const riskCards = [
    {
      title: t("componentSupply.leadTimeRisk"),
      icon: Clock,
      risk: leadTimeRisk,
      metric: t("componentSupply.avgDaysMetric", { days: leadTimeRisk.averageDays }),
    },
    {
      title: t("componentSupply.dependencyRisk"),
      icon: Users,
      risk: singleSupplierRisk,
      metric: t("componentSupply.singleSource", { count: singleSupplierRisk.componentsWithSingleSource }),
    },
    {
      title: t("componentSupply.geographicRisk"),
      icon: MapPin,
      risk: geographicRisk,
      metric: t("componentSupply.regions", { count: geographicRisk.totalRegions }),
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiskIcon level={overallLevel} />
            {t("componentSupply.supplyChainRisk")}
          </div>
          <RiskLevelBadge level={overallLevel} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("componentSupply.overallRiskScore")}</span>
            <span className={`font-bold ${getRiskColor(overallLevel)}`}>{overall}/100</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overall}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${getRiskGradient(overallLevel)}`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {overallLevel === "low" && t("componentSupply.riskLow")}
            {overallLevel === "medium" && t("componentSupply.riskMedium")}
            {overallLevel === "high" && t("componentSupply.riskHigh")}
            {overallLevel === "critical" && t("componentSupply.riskCritical")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {riskCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${getRiskBgColor(card.risk.level)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`h-4 w-4 ${getRiskColor(card.risk.level)}`} />
                <span className="text-xs font-medium text-foreground">{card.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <RiskLevelBadge level={card.risk.level} />
                <span className="text-xs text-muted-foreground">{card.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t("componentSupply.viewDetailedAnalysis")}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 space-y-4"
                >
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t("componentSupply.leadTimeAnalysis")}
                    </h4>
                    <p className="text-xs text-muted-foreground">{leadTimeRisk.details}</p>
                    <div className="flex gap-4 text-xs">
                      <span>{t("componentSupply.min")}: <strong>{leadTimeRisk.minDays} {t("componentSupply.days")}</strong></span>
                      <span>{t("componentSupply.avg")}: <strong>{leadTimeRisk.averageDays} {t("componentSupply.days")}</strong></span>
                      <span>{t("componentSupply.max")}: <strong>{leadTimeRisk.maxDays} {t("componentSupply.days")}</strong></span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t("componentSupply.supplierDependency")}
                    </h4>
                    <p className="text-xs text-muted-foreground">{singleSupplierRisk.details}</p>
                    {singleSupplierRisk.affectedComponents.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {singleSupplierRisk.affectedComponents.map((comp) => (
                          <Badge key={comp} variant="outline" className="text-xs">{comp}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("componentSupply.geographicDistribution")}
                    </h4>
                    <p className="text-xs text-muted-foreground">{geographicRisk.details}</p>
                    {geographicRisk.concentrationDetails.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {geographicRisk.concentrationDetails.slice(0, 5).map((region) => (
                          <div key={region.region} className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${region.percentage}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-24">
                              {region.region} ({region.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
