import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, Cpu, Layers, SlidersHorizontal } from "lucide-react";

export type ArchitectureType = "modular" | "integrated" | "platform" | "configurable";

interface ArchOption {
  type: ArchitectureType;
  label: string;
  description: string;
  icon: React.ReactNode;
  impacts: { complexity: string; suppliers: string; risk: string; inventory: string };
}

const OPTIONS: ArchOption[] = [
  {
    type: "modular",
    label: "Modular",
    description: "Replaceable modules, easier supplier swaps",
    icon: <Boxes className="h-5 w-5" />,
    impacts: { complexity: "Medium", suppliers: "Many", risk: "Low", inventory: "Standard" },
  },
  {
    type: "integrated",
    label: "Integrated",
    description: "Tight mechanical/electrical integration",
    icon: <Cpu className="h-5 w-5" />,
    impacts: { complexity: "High", suppliers: "Few", risk: "High", inventory: "Complex" },
  },
  {
    type: "platform",
    label: "Platform-based",
    description: "Shared sub-assemblies across SKUs",
    icon: <Layers className="h-5 w-5" />,
    impacts: { complexity: "Medium", suppliers: "Moderate", risk: "Medium", inventory: "Shared" },
  },
  {
    type: "configurable",
    label: "Configurable",
    description: "Variants driven by options",
    icon: <SlidersHorizontal className="h-5 w-5" />,
    impacts: { complexity: "High", suppliers: "Many", risk: "Medium", inventory: "Variable" },
  },
];

interface ProductArchitectureSelectorProps {
  value: ArchitectureType | null;
  onChange: (type: ArchitectureType) => void;
}

export function ProductArchitectureSelector({ value, onChange }: ProductArchitectureSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Product Architecture</CardTitle>
        <p className="text-xs text-muted-foreground">
          Classify your product to optimize sourcing strategy
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onChange(opt.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all ${
                value === opt.type
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <div className={`p-2 rounded-md ${value === opt.type ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {opt.icon}
              </div>
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
              <span className="text-[11px] text-muted-foreground leading-tight">{opt.description}</span>
            </button>
          ))}
        </div>
        {value && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(OPTIONS.find((o) => o.type === value)!.impacts).map(([k, v]) => (
              <Badge key={k} variant="secondary" className="text-[10px]">
                {k}: {v}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
