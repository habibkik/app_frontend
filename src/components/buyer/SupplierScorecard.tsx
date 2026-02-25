import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ScorecardDimension {
  name: string;
  weight: number;
  score: number;
}

const defaultDimensions: ScorecardDimension[] = [
  { name: "Quality", weight: 30, score: 4 },
  { name: "Delivery", weight: 25, score: 3.5 },
  { name: "Cost", weight: 20, score: 3 },
  { name: "Innovation", weight: 10, score: 4 },
  { name: "Responsiveness", weight: 5, score: 4.5 },
  { name: "Risk", weight: 5, score: 3 },
  { name: "Sustainability", weight: 5, score: 3.5 },
];

interface SupplierScorecardProps {
  supplierName?: string;
  initialDimensions?: ScorecardDimension[];
}

export function SupplierScorecard({ supplierName = "Supplier", initialDimensions }: SupplierScorecardProps) {
  const [dimensions, setDimensions] = useState<ScorecardDimension[]>(initialDimensions || defaultDimensions);

  const weightedTotal = dimensions.reduce((sum, d) => sum + d.score * (d.weight / 100), 0);
  const riskLevel = weightedTotal >= 4 ? "Low" : weightedTotal >= 3 ? "Medium" : "High";
  const riskColor = weightedTotal >= 4 ? "text-success" : weightedTotal >= 3 ? "text-warning" : "text-destructive";

  const chartData = dimensions.map((d) => ({
    subject: d.name,
    score: d.score,
    fullMark: 5,
  }));

  const updateScore = (idx: number, value: number[]) => {
    const updated = [...dimensions];
    updated[idx] = { ...updated[idx], score: value[0] };
    setDimensions(updated);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{supplierName} Scorecard</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("font-semibold", riskColor)}>
              {riskLevel} Risk
            </Badge>
            <Badge variant="secondary" className="font-bold">
              {weightedTotal.toFixed(2)} / 5.00
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Radar Chart */}
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="75%">
                <PolarGrid className="stroke-border" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} className="text-muted-foreground" />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score sliders */}
          <div className="space-y-3">
            {dimensions.map((d, idx) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{d.name} <span className="text-muted-foreground text-xs">({d.weight}%)</span></span>
                  <span className="text-sm font-bold">{d.score.toFixed(1)}</span>
                </div>
                <Slider
                  value={[d.score]}
                  onValueChange={(v) => updateScore(idx, v)}
                  min={1}
                  max={5}
                  step={0.5}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
