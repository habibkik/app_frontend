import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BOMComponent } from "@/data/bom";
import { Shield, Target, AlertTriangle, Package } from "lucide-react";

export type KraljicQuadrant = "strategic" | "leverage" | "bottleneck" | "commodity";

interface ClassifiedComponent extends BOMComponent {
  quadrant: KraljicQuadrant;
  supplyRisk: number;
  businessImpact: number;
}

const QUADRANT_CONFIG: Record<KraljicQuadrant, { label: string; color: string; icon: React.ReactNode; strategy: string }> = {
  strategic: {
    label: "Strategic",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <Shield className="h-3 w-3" />,
    strategy: "Long-term agreement, dual-source, joint development",
  },
  leverage: {
    label: "Leverage",
    color: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    icon: <Target className="h-3 w-3" />,
    strategy: "Competitive bidding, volume bundling, annual cost-down",
  },
  bottleneck: {
    label: "Bottleneck",
    color: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    icon: <AlertTriangle className="h-3 w-3" />,
    strategy: "Redesign to eliminate, increase buffer stock, develop backup",
  },
  commodity: {
    label: "Commodity",
    color: "bg-muted text-muted-foreground border-border",
    icon: <Package className="h-3 w-3" />,
    strategy: "Consolidate suppliers, automate ordering, framework agreements",
  },
};

export function classifyComponent(component: BOMComponent, totalBOMCost: number): { quadrant: KraljicQuadrant; supplyRisk: number; businessImpact: number } {
  // Supply risk: fewer suppliers & alternatives = higher risk (0-1 scale)
  const supplierScore = Math.max(0, 1 - (component.matchedSuppliers / 25));
  const altScore = Math.max(0, 1 - (component.alternatives / 12));
  const supplyRisk = supplierScore * 0.6 + altScore * 0.4;

  // Business impact: higher cost share = higher impact (0-1 scale)
  const costShare = totalBOMCost > 0 ? component.totalCost / totalBOMCost : 0;
  const businessImpact = Math.min(1, costShare * 5); // normalize so ~20% share = 1.0

  const highRisk = supplyRisk > 0.5;
  const highImpact = businessImpact > 0.4;

  let quadrant: KraljicQuadrant;
  if (highImpact && highRisk) quadrant = "strategic";
  else if (highImpact && !highRisk) quadrant = "leverage";
  else if (!highImpact && highRisk) quadrant = "bottleneck";
  else quadrant = "commodity";

  return { quadrant, supplyRisk, businessImpact };
}

export function KraljicBadge({ quadrant }: { quadrant: KraljicQuadrant }) {
  const cfg = QUADRANT_CONFIG[quadrant];
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

interface BOMRiskClassificationProps {
  components: BOMComponent[];
}

export function BOMRiskClassification({ components }: BOMRiskClassificationProps) {
  const totalCost = useMemo(() => components.reduce((s, c) => s + c.totalCost, 0), [components]);

  const classified = useMemo<ClassifiedComponent[]>(
    () => components.map((c) => ({ ...c, ...classifyComponent(c, totalCost) })),
    [components, totalCost]
  );

  const counts = useMemo(() => {
    const m: Record<KraljicQuadrant, number> = { strategic: 0, leverage: 0, bottleneck: 0, commodity: 0 };
    classified.forEach((c) => m[c.quadrant]++);
    return m;
  }, [classified]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Kraljic Risk Classification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini matrix */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
          <div className="p-3 rounded-md bg-chart-1/5 border border-chart-1/20">
            <p className="font-semibold text-chart-1">{counts.leverage}</p>
            <p className="text-muted-foreground">Leverage</p>
          </div>
          <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
            <p className="font-semibold text-destructive">{counts.strategic}</p>
            <p className="text-muted-foreground">Strategic</p>
          </div>
          <div className="p-3 rounded-md bg-muted/50 border border-border">
            <p className="font-semibold text-muted-foreground">{counts.commodity}</p>
            <p className="text-muted-foreground">Commodity</p>
          </div>
          <div className="p-3 rounded-md bg-chart-4/5 border border-chart-4/20">
            <p className="font-semibold text-chart-4">{counts.bottleneck}</p>
            <p className="text-muted-foreground">Bottleneck</p>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>← Low Supply Risk</span>
          <span>High Supply Risk →</span>
        </div>

        {/* Strategy recommendations */}
        <div className="space-y-2">
          {(Object.keys(QUADRANT_CONFIG) as KraljicQuadrant[])
            .filter((q) => counts[q] > 0)
            .map((q) => (
              <div key={q} className="text-xs">
                <span className="font-medium text-foreground">{QUADRANT_CONFIG[q].label}: </span>
                <span className="text-muted-foreground">{QUADRANT_CONFIG[q].strategy}</span>
              </div>
            ))}
        </div>

        {/* Scatter plot approximation */}
        <div className="relative w-full h-32 border border-border rounded-md bg-muted/20 mt-2">
          <span className="absolute top-1 left-1 text-[9px] text-muted-foreground">High Impact</span>
          <span className="absolute bottom-1 left-1 text-[9px] text-muted-foreground">Low Impact</span>
          <span className="absolute bottom-1 right-1 text-[9px] text-muted-foreground">High Risk →</span>
          {classified.map((c) => {
            const cfg = QUADRANT_CONFIG[c.quadrant];
            return (
              <div
                key={c.id}
                className={`absolute w-2.5 h-2.5 rounded-full border ${cfg.color}`}
                style={{
                  left: `${Math.max(8, Math.min(90, c.supplyRisk * 90))}%`,
                  bottom: `${Math.max(8, Math.min(90, c.businessImpact * 90))}%`,
                }}
                title={`${c.name} — ${cfg.label}`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
