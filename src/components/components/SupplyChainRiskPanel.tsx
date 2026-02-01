import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  MapPin, 
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  type SupplyChainRiskScore,
  type RiskLevel,
  getRiskColor,
  getRiskBgColor,
  getRiskGradient,
} from "@/lib/supply-chain-risk";

interface SupplyChainRiskPanelProps {
  riskScore: SupplyChainRiskScore;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  switch (level) {
    case "low":
      return <ShieldCheck className="h-5 w-5 text-green-500" />;
    case "medium":
      return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
    case "high":
      return <ShieldX className="h-5 w-5 text-orange-500" />;
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { overall, overallLevel, leadTimeRisk, singleSupplierRisk, geographicRisk } = riskScore;

  const riskCards = [
    {
      title: "Lead Time Risk",
      icon: Clock,
      risk: leadTimeRisk,
      metric: `${leadTimeRisk.averageDays} avg days`,
    },
    {
      title: "Dependency Risk",
      icon: Users,
      risk: singleSupplierRisk,
      metric: `${singleSupplierRisk.componentsWithSingleSource} single-source`,
    },
    {
      title: "Geographic Risk",
      icon: MapPin,
      risk: geographicRisk,
      metric: `${geographicRisk.totalRegions} regions`,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiskIcon level={overallLevel} />
            Supply Chain Risk Assessment
          </div>
          <RiskLevelBadge level={overallLevel} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Risk Score</span>
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
            {overallLevel === "low" && "Supply chain is healthy with minimal risks identified."}
            {overallLevel === "medium" && "Some risks identified. Consider diversifying suppliers."}
            {overallLevel === "high" && "Significant risks detected. Action recommended."}
            {overallLevel === "critical" && "Critical risks require immediate attention."}
          </p>
        </div>

        {/* Risk Category Cards */}
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

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                View Detailed Analysis
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
                  {/* Lead Time Details */}
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Lead Time Analysis
                    </h4>
                    <p className="text-xs text-muted-foreground">{leadTimeRisk.details}</p>
                    <div className="flex gap-4 text-xs">
                      <span>Min: <strong>{leadTimeRisk.minDays} days</strong></span>
                      <span>Avg: <strong>{leadTimeRisk.averageDays} days</strong></span>
                      <span>Max: <strong>{leadTimeRisk.maxDays} days</strong></span>
                    </div>
                  </div>

                  {/* Single Supplier Details */}
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Supplier Dependency
                    </h4>
                    <p className="text-xs text-muted-foreground">{singleSupplierRisk.details}</p>
                    {singleSupplierRisk.affectedComponents.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {singleSupplierRisk.affectedComponents.map((comp) => (
                          <Badge key={comp} variant="outline" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Geographic Details */}
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Geographic Distribution
                    </h4>
                    <p className="text-xs text-muted-foreground">{geographicRisk.details}</p>
                    {geographicRisk.concentrationDetails.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {geographicRisk.concentrationDetails.slice(0, 5).map((region) => (
                          <div key={region.region} className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${region.percentage}%` }}
                              />
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
