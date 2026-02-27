import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Factory, DollarSign, LifeBuoy } from "lucide-react";

export type BOMType = "ebom" | "mbom" | "cbom" | "service";

interface BOMTypeSelectorProps {
  value: BOMType;
  onChange: (type: BOMType) => void;
}

const BOM_TYPES: { type: BOMType; label: string; icon: React.ReactNode }[] = [
  { type: "ebom", label: "Engineering", icon: <Wrench className="h-3.5 w-3.5" /> },
  { type: "mbom", label: "Manufacturing", icon: <Factory className="h-3.5 w-3.5" /> },
  { type: "cbom", label: "Costed", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { type: "service", label: "Service", icon: <LifeBuoy className="h-3.5 w-3.5" /> },
];

export function BOMTypeSelector({ value, onChange }: BOMTypeSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as BOMType)}>
      <TabsList className="h-9">
        {BOM_TYPES.map((bt) => (
          <TabsTrigger key={bt.type} value={bt.type} className="gap-1.5 text-xs px-3">
            {bt.icon}
            {bt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

// Supplementary items for MBOM and Service BOM
export interface SupplementaryItem {
  id: string;
  name: string;
  category: string;
  bomType: "mbom" | "service";
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export const SUPPLEMENTARY_ITEMS: SupplementaryItem[] = [
  // MBOM items
  { id: "sup-001", name: "Primary Packaging Box", category: "Packaging", bomType: "mbom", quantity: 1, unit: "piece", unitCost: 0.85, totalCost: 0.85 },
  { id: "sup-002", name: "Foam Insert", category: "Packaging", bomType: "mbom", quantity: 1, unit: "piece", unitCost: 0.35, totalCost: 0.35 },
  { id: "sup-003", name: "Product Label", category: "Labels", bomType: "mbom", quantity: 2, unit: "pieces", unitCost: 0.05, totalCost: 0.10 },
  { id: "sup-004", name: "Assembly Fixture", category: "Fixtures", bomType: "mbom", quantity: 1, unit: "set", unitCost: 0, totalCost: 0, notes: "Amortized" },
  { id: "sup-005", name: "User Manual", category: "Documentation", bomType: "mbom", quantity: 1, unit: "piece", unitCost: 0.12, totalCost: 0.12 },
  { id: "sup-006", name: "Master Carton", category: "Packaging", bomType: "mbom", quantity: 0.1, unit: "piece", unitCost: 2.50, totalCost: 0.25 },
  // Service BOM items
  { id: "srv-001", name: "Battery Replacement Kit", category: "Service Kit", bomType: "service", quantity: 1, unit: "kit", unitCost: 6.50, totalCost: 6.50 },
  { id: "srv-002", name: "Display Repair Kit", category: "Service Kit", bomType: "service", quantity: 1, unit: "kit", unitCost: 18.00, totalCost: 18.00 },
  { id: "srv-003", name: "Gasket & Seal Kit", category: "Service Kit", bomType: "service", quantity: 1, unit: "kit", unitCost: 2.50, totalCost: 2.50 },
  { id: "srv-004", name: "Screw Replacement Set", category: "Spare Parts", bomType: "service", quantity: 1, unit: "set", unitCost: 0.80, totalCost: 0.80 },
];
