import { useState, useMemo } from "react";
import { Shield, DollarSign, Cog, FileCheck, Globe, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Supplier } from "@/data/suppliers";
import { useTranslation } from "react-i18next";

export interface RiskCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  weight: number;
  factors: RiskFactor[];
}

export interface RiskFactor {
  id: string;
  name: string;
  score: number;
  description: string;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return "low";
  if (score <= 50) return "medium";
  if (score <= 75) return "high";
  return "critical";
}

function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "low": return "text-emerald-500";
    case "medium": return "text-amber-500";
    case "high": return "text-orange-500";
    case "critical": return "text-destructive";
  }
}

function getRiskBg(level: RiskLevel): string {
  switch (level) {
    case "low": return "bg-emerald-500/10";
    case "medium": return "bg-amber-500/10";
    case "high": return "bg-orange-500/10";
    case "critical": return "bg-destructive/10";
  }
}

function getRiskProgressColor(level: RiskLevel): string {
  switch (level) {
    case "low": return "[&>div]:bg-emerald-500";
    case "medium": return "[&>div]:bg-amber-500";
    case "high": return "[&>div]:bg-orange-500";
    case "critical": return "[&>div]:bg-destructive";
  }
}

function generateRiskFactors(supplier: Supplier): RiskCategory[] {
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  };
  const seed = hash(supplier.id);
  const s = (offset: number) => ((seed + offset * 37) % 80) + 10;

  return [
    {
      id: "financial", name: "Financial", icon: DollarSign, weight: 30,
      factors: [
        { id: "credit", name: "Credit Rating", score: s(1), description: "Financial stability and creditworthiness" },
        { id: "liquidity", name: "Liquidity Risk", score: s(2), description: "Ability to meet short-term obligations" },
        { id: "dependency", name: "Revenue Dependency", score: s(3), description: "Concentration of revenue sources" },
      ],
    },
    {
      id: "operational", name: "Operational", icon: Cog, weight: 25,
      factors: [
        { id: "capacity", name: "Capacity Utilization", score: s(4), description: "Current vs maximum production capacity" },
        { id: "quality", name: "Quality Control", score: Math.max(10, 100 - supplier.rating * 20 + s(5) % 10), description: "Defect rates and quality management" },
        { id: "leadtime", name: "Lead Time Reliability", score: s(6), description: "On-time delivery performance" },
      ],
    },
    {
      id: "compliance", name: "Compliance", icon: FileCheck, weight: 25,
      factors: [
        { id: "certs", name: "Certifications", score: Math.max(10, 90 - supplier.certifications.length * 15), description: "Industry certifications and standards" },
        { id: "regulatory", name: "Regulatory Standing", score: supplier.verified ? s(7) % 40 + 10 : s(7) % 40 + 40, description: "Compliance with trade regulations" },
        { id: "esg", name: "ESG Compliance", score: s(8), description: "Environmental, social, and governance metrics" },
      ],
    },
    {
      id: "geopolitical", name: "Geopolitical", icon: Globe, weight: 20,
      factors: [
        { id: "country", name: "Country Risk", score: s(9), description: "Political stability and trade environment" },
        { id: "sanctions", name: "Sanctions Exposure", score: s(10) % 50, description: "Risk of trade sanctions impact" },
        { id: "logistics", name: "Logistics Disruption", score: s(11), description: "Infrastructure and route vulnerability" },
      ],
    },
  ];
}

export function SupplierRiskBadge({ supplier }: { supplier: Supplier }) {
  const categories = useMemo(() => generateRiskFactors(supplier), [supplier]);
  const overallScore = useMemo(() => {
    const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
    return Math.round(
      categories.reduce((s, c) => {
        const catAvg = c.factors.reduce((fs, f) => fs + f.score, 0) / c.factors.length;
        return s + catAvg * (c.weight / totalWeight);
      }, 0)
    );
  }, [categories]);

  const level = getRiskLevel(overallScore);

  return (
    <Badge variant="outline" className={cn("text-xs gap-1 font-medium", getRiskColor(level))}>
      <Shield className="h-3 w-3" />
      {overallScore}
    </Badge>
  );
}

interface SupplierRiskScoringProps {
  supplier: Supplier;
  compact?: boolean;
}

export function SupplierRiskScoring({ supplier, compact = false }: SupplierRiskScoringProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<RiskCategory[]>(() => generateRiskFactors(supplier));
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const overallScore = useMemo(() => {
    const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
    return Math.round(
      categories.reduce((s, c) => {
        const catAvg = c.factors.reduce((fs, f) => fs + f.score, 0) / c.factors.length;
        return s + catAvg * (c.weight / totalWeight);
      }, 0)
    );
  }, [categories]);

  const overallLevel = getRiskLevel(overallScore);
  const riskLevelKey = `risk.${overallLevel}` as const;

  const updateFactorScore = (categoryId: string, factorId: string, newScore: number[]) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, factors: cat.factors.map((f) => f.id === factorId ? { ...f, score: newScore[0] } : f) }
          : cat
      )
    );
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={cn("h-4 w-4", getRiskColor(overallLevel))} />
            <span className="text-sm font-medium">{t("risk.riskScore")}</span>
          </div>
          <Badge variant="outline" className={cn("font-bold", getRiskColor(overallLevel))}>
            {overallScore}/100
          </Badge>
        </div>
        <Progress value={overallScore} className={cn("h-2", getRiskProgressColor(overallLevel))} />
        <div className="grid grid-cols-2 gap-1.5">
          {categories.map((cat) => {
            const catAvg = Math.round(cat.factors.reduce((s, f) => s + f.score, 0) / cat.factors.length);
            const catLevel = getRiskLevel(catAvg);
            return (
              <div key={cat.id} className={cn("flex items-center gap-1.5 rounded px-2 py-1 text-xs", getRiskBg(catLevel))}>
                <cat.icon className={cn("h-3 w-3", getRiskColor(catLevel))} />
                <span className="truncate">{cat.name}</span>
                <span className={cn("ml-auto font-semibold", getRiskColor(catLevel))}>{catAvg}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className={cn("h-5 w-5", getRiskColor(overallLevel))} />
            {t("risk.riskAssessment")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("font-bold text-sm", getRiskColor(overallLevel))}>
              {t(riskLevelKey)} {t("risk.riskScore")}
            </Badge>
            <Badge variant="secondary" className="font-bold">{overallScore}/100</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("risk.overallRiskScore")}</span>
            <span>{overallScore}%</span>
          </div>
          <Progress value={overallScore} className={cn("h-3", getRiskProgressColor(overallLevel))} />
        </div>

        <div className="space-y-2 pt-2">
          {categories.map((cat) => {
            const catAvg = Math.round(cat.factors.reduce((s, f) => s + f.score, 0) / cat.factors.length);
            const catLevel = getRiskLevel(catAvg);
            const isExpanded = expandedCategory === cat.id;

            return (
              <Collapsible key={cat.id} open={isExpanded} onOpenChange={() => setExpandedCategory(isExpanded ? null : cat.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-between h-auto py-2.5 px-3 hover:bg-muted/50", isExpanded && "bg-muted/50")}
                  >
                    <div className="flex items-center gap-2">
                      <cat.icon className={cn("h-4 w-4", getRiskColor(catLevel))} />
                      <span className="font-medium text-sm">{cat.name}</span>
                      <Badge variant="outline" className="text-xs ml-1">{cat.weight}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <Progress value={catAvg} className={cn("h-1.5", getRiskProgressColor(catLevel))} />
                      </div>
                      <span className={cn("text-sm font-semibold w-8 text-right", getRiskColor(catLevel))}>{catAvg}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-1 space-y-3 ml-6">
                    {cat.factors.map((factor) => {
                      const fLevel = getRiskLevel(factor.score);
                      return (
                        <div key={factor.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium">{factor.name}</span>
                              <p className="text-xs text-muted-foreground">{factor.description}</p>
                            </div>
                            <span className={cn("text-sm font-bold", getRiskColor(fLevel))}>{factor.score}</span>
                          </div>
                          <Slider
                            value={[factor.score]}
                            onValueChange={(v) => updateFactorScore(cat.id, factor.id, v)}
                            min={0}
                            max={100}
                            step={5}
                            className="cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {overallScore > 60 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-destructive">{t("risk.highRiskAlert")}</p>
              <p className="text-muted-foreground">{t("risk.highRiskDescription")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
