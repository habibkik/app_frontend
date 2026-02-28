import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BOMComponent } from "@/data/bom";
import { classifyComponent, KraljicQuadrant } from "./BOMRiskClassification";
import { GitBranch, AlertTriangle, CheckCircle2, Clock, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/useToast";

interface LeadTimePrediction {
  supplierName: string;
  bestCase: number;
  expected: number;
  worstCase: number;
  confidence: number;
  factors?: string[];
}

interface DualSourcePanelProps {
  components: BOMComponent[];
}

export function DualSourcePanel({ components }: DualSourcePanelProps) {
  const [leadTimes, setLeadTimes] = useState<Record<string, LeadTimePrediction[]>>({});
  const [loadingLeadTimes, setLoadingLeadTimes] = useState<string | null>(null);

  const totalCost = useMemo(() => components.reduce((s, c) => s + c.totalCost, 0), [components]);

  const atRisk = useMemo(() => {
    return components
      .map((c) => ({ ...c, ...classifyComponent(c, totalCost) }))
      .filter((c) => c.quadrant === "strategic" || c.quadrant === "bottleneck");
  }, [components, totalCost]);

  const handlePredictLeadTimes = async (component: BOMComponent) => {
    setLoadingLeadTimes(component.id);
    try {
      const { data, error } = await supabase.functions.invoke("component-sourcing", {
        body: {
          componentName: component.name,
          category: component.category,
          material: component.material || component.category,
          specifications: component.specifications,
          quantity: component.quantity,
          includeLeadTimes: true,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed");

      setLeadTimes(prev => ({
        ...prev,
        [component.id]: data.leadTimePredictions || [],
      }));
      toast({ title: "Lead times predicted", description: `${data.leadTimePredictions?.length || 0} supplier predictions generated.` });
    } catch (err: any) {
      console.error("Lead time prediction error:", err);
      toast({ title: "Prediction failed", description: err.message, variant: "destructive" });
    } finally {
      setLoadingLeadTimes(null);
    }
  };

  if (atRisk.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Dual-Source Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No strategic or bottleneck components detected. Current BOM has low single-source risk.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          Dual-Source Strategy
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {atRisk.length} component{atRisk.length > 1 ? "s" : ""} requiring sourcing risk mitigation
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {atRisk.map((c) => {
          const isDual = c.matchedSuppliers >= 2;
          const hasManyAlts = c.alternatives >= 3;
          const componentLeadTimes = leadTimes[c.id];
          const isLoading = loadingLeadTimes === c.id;

          return (
            <div key={c.id} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.category} · {c.specifications}</p>
                </div>
                {isDual ? (
                  <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    isDual
                      ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {isDual ? `${c.matchedSuppliers} suppliers (dual-sourced)` : "Single-source risk"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {c.alternatives} alternatives
                </Badge>
              </div>

              <div className="text-xs space-y-0.5">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Recommendation: </span>
                  {!isDual
                    ? "Dual-source recommended — identify backup supplier"
                    : hasManyAlts
                      ? "Well covered — maintain competitive bidding"
                      : "Design drop-in alternative to increase flexibility"}
                </p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Safety stock: {c.matchedSuppliers < 5 ? "4–6 weeks buffer" : "2–3 weeks buffer"}
                </p>
              </div>

              {/* Lead Time Predictions */}
              {!componentLeadTimes && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs h-7"
                  onClick={() => handlePredictLeadTimes(c)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {isLoading ? "Predicting..." : "Predict Lead Times"}
                </Button>
              )}

              {componentLeadTimes && componentLeadTimes.length > 0 && (
                <div className="mt-2 p-2 rounded bg-muted/50 space-y-1.5">
                  <p className="text-[10px] font-medium text-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Lead Time Predictions
                  </p>
                  {componentLeadTimes.map((lt, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground truncate max-w-[120px]">{lt.supplierName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">{lt.bestCase}d</span>
                        <span className="font-medium text-foreground">{lt.expected}d</span>
                        <span className="text-destructive">{lt.worstCase}d</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{lt.confidence}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
