import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BOMComponent } from "@/data/bom";
import { classifyComponent, KraljicQuadrant } from "./BOMRiskClassification";
import { GitBranch, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface DualSourcePanelProps {
  components: BOMComponent[];
}

export function DualSourcePanel({ components }: DualSourcePanelProps) {
  const totalCost = useMemo(() => components.reduce((s, c) => s + c.totalCost, 0), [components]);

  const atRisk = useMemo(() => {
    return components
      .map((c) => ({ ...c, ...classifyComponent(c, totalCost) }))
      .filter((c) => c.quadrant === "strategic" || c.quadrant === "bottleneck");
  }, [components, totalCost]);

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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
