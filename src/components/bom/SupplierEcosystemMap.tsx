import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BOMComponent } from "@/data/bom";
import {
  Factory, Wrench, Paintbrush, ShieldCheck, Package, Truck, Monitor,
  CheckCircle2, AlertCircle, Circle,
} from "lucide-react";

interface EcoCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  subcategories: string[];
  mapFromBOMCategories: string[];
}

const ECOSYSTEM_CATEGORIES: EcoCategory[] = [
  {
    id: "direct",
    label: "A. Direct Materials",
    icon: <Factory className="h-4 w-4" />,
    subcategories: ["Injection molders", "PCB manufacturers", "PCBA assemblers", "Metal fabricators", "Die casting", "CNC machining", "Rubber/silicone molders", "Display manufacturers", "Battery suppliers", "Semiconductor distributors", "Wire harness"],
    mapFromBOMCategories: ["Structural", "Electronics", "Power", "Connectivity", "Input", "Output"],
  },
  {
    id: "tooling",
    label: "B. Tooling & Industrialization",
    icon: <Wrench className="h-4 w-4" />,
    subcategories: ["Mold makers", "Tool & die makers", "Jigs & fixtures", "Automation integrators", "Testing fixtures"],
    mapFromBOMCategories: [],
  },
  {
    id: "finishing",
    label: "C. Finishing",
    icon: <Paintbrush className="h-4 w-4" />,
    subcategories: ["Surface coating", "Anodizing", "Painting", "Powder coating", "Laser marking", "Printing"],
    mapFromBOMCategories: [],
  },
  {
    id: "certification",
    label: "D. Certification & Compliance",
    icon: <ShieldCheck className="h-4 w-4" />,
    subcategories: ["EMC testing labs", "Safety certification", "Environmental compliance", "Regulatory consultants"],
    mapFromBOMCategories: [],
  },
  {
    id: "packaging",
    label: "E. Packaging",
    icon: <Package className="h-4 w-4" />,
    subcategories: ["Carton manufacturers", "Insert foam suppliers", "Printing houses", "Label suppliers"],
    mapFromBOMCategories: [],
  },
  {
    id: "logistics",
    label: "F. Logistics",
    icon: <Truck className="h-4 w-4" />,
    subcategories: ["Freight forwarders", "Customs brokers", "3PL warehouse", "Fulfillment centers", "Last-mile partners"],
    mapFromBOMCategories: [],
  },
  {
    id: "digital",
    label: "G. Digital Ecosystem",
    icon: <Monitor className="h-4 w-4" />,
    subcategories: ["ERP provider", "PLM system", "Supplier portal", "Quality tracking software"],
    mapFromBOMCategories: [],
  },
];

type CatStatus = "covered" | "partial" | "gap";

interface SupplierEcosystemMapProps {
  components: BOMComponent[];
}

export function SupplierEcosystemMap({ components }: SupplierEcosystemMapProps) {
  const [statuses, setStatuses] = useState<Record<string, CatStatus>>({});

  const supplierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ECOSYSTEM_CATEGORIES.forEach((cat) => {
      const matched = components.filter((c) =>
        cat.mapFromBOMCategories.includes(c.category)
      );
      counts[cat.id] = matched.reduce((s, c) => s + c.matchedSuppliers, 0);
    });
    return counts;
  }, [components]);

  const toggleStatus = (id: string) => {
    setStatuses((prev) => {
      const current = prev[id] || "gap";
      const next: CatStatus = current === "gap" ? "partial" : current === "partial" ? "covered" : "gap";
      return { ...prev, [id]: next };
    });
  };

  const statusIcon = (status: CatStatus) => {
    switch (status) {
      case "covered": return <CheckCircle2 className="h-4 w-4 text-chart-3" />;
      case "partial": return <AlertCircle className="h-4 w-4 text-chart-4" />;
      default: return <Circle className="h-4 w-4 text-destructive" />;
    }
  };

  const coveredCount = Object.values(statuses).filter((s) => s === "covered").length;
  const totalCats = ECOSYSTEM_CATEGORIES.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Supplier Ecosystem Map</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {coveredCount}/{totalCats} covered
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Complete supplier network needed for production. Click status to toggle.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {ECOSYSTEM_CATEGORIES.map((cat) => {
          const status = statuses[cat.id] || "gap";
          const count = supplierCounts[cat.id] || 0;
          return (
            <div key={cat.id} className={`p-3 rounded-lg border transition-colors ${
              status === "covered" ? "border-chart-3/30 bg-chart-3/5" :
              status === "partial" ? "border-chart-4/30 bg-chart-4/5" :
              "border-destructive/20 bg-destructive/5"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{cat.icon}</span>
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {count} matched
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleStatus(cat.id)}
                  >
                    {statusIcon(status)}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {cat.subcategories.map((sub) => (
                  <Badge key={sub} variant="secondary" className="text-[9px] font-normal">
                    {sub}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
