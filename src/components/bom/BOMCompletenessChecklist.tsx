import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ClipboardCheck, AlertTriangle } from "lucide-react";
import { BOMComponent } from "@/data/bom";

interface ChecklistItem {
  id: string;
  label: string;
  matchCategories: string[];
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "mechanical", label: "Mechanical parts", matchCategories: ["Structural", "Sealing"] },
  { id: "electronic", label: "Electronic components", matchCategories: ["Electronics"] },
  { id: "fasteners", label: "Fasteners", matchCategories: ["Fasteners"] },
  { id: "adhesives", label: "Adhesives & tapes", matchCategories: [] },
  { id: "surface", label: "Surface treatments", matchCategories: [] },
  { id: "coatings", label: "Coatings", matchCategories: [] },
  { id: "labels", label: "Labels & regulatory marks", matchCategories: [] },
  { id: "firmware", label: "Firmware programming", matchCategories: [] },
  { id: "packaging", label: "Packaging (primary/secondary/master)", matchCategories: [] },
  { id: "manuals", label: "Manuals", matchCategories: [] },
  { id: "inserts", label: "Inserts", matchCategories: [] },
  { id: "testing", label: "Testing consumables", matchCategories: [] },
  { id: "shipping", label: "Shipping protection materials", matchCategories: [] },
  { id: "power", label: "Power components", matchCategories: ["Power"] },
];

interface BOMCompletenessChecklistProps {
  components: BOMComponent[];
}

export function BOMCompletenessChecklist({ components }: BOMCompletenessChecklistProps) {
  const [open, setOpen] = useState(false);

  const detectedCategories = useMemo(
    () => new Set(components.map((c) => c.category)),
    [components]
  );

  const autoChecked = useMemo(() => {
    const set = new Set<string>();
    CHECKLIST_ITEMS.forEach((item) => {
      if (item.matchCategories.some((cat) => detectedCategories.has(cat))) {
        set.add(item.id);
      }
    });
    return set;
  }, [detectedCategories]);

  const [manualChecked, setManualChecked] = useState<Set<string>>(new Set());

  const allChecked = useMemo(() => new Set([...autoChecked, ...manualChecked]), [autoChecked, manualChecked]);
  const pct = Math.round((allChecked.size / CHECKLIST_ITEMS.length) * 100);
  const missing = CHECKLIST_ITEMS.filter((item) => !allChecked.has(item.id));

  const toggle = (id: string) => {
    setManualChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">BOM Completeness</CardTitle>
                <Badge variant={pct === 100 ? "default" : "secondary"} className="text-[10px]">
                  {pct}%
                </Badge>
              </div>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <Progress value={pct} className="h-1.5 mt-2" />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-2">
            {CHECKLIST_ITEMS.map((item) => {
              const checked = allChecked.has(item.id);
              const isAuto = autoChecked.has(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2 py-1 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    disabled={isAuto}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <span className={checked ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                  {isAuto && (
                    <Badge variant="outline" className="text-[9px] ml-auto">
                      detected
                    </Badge>
                  )}
                </label>
              );
            })}
            {missing.length > 0 && (
              <div className="mt-3 p-2 rounded-md bg-destructive/5 border border-destructive/20">
                <p className="text-xs font-medium text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {missing.length} potentially missing categories
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
