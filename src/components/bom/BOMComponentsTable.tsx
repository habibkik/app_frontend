import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Users, 
  ArrowUpDown,
  ExternalLink 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BOMComponent, mockAlternatives, AlternativeComponent } from "@/data/bom";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface BOMComponentsTableProps {
  components: BOMComponent[];
  onViewSuppliers: (component: BOMComponent) => void;
}

export function BOMComponentsTable({ components, onViewSuppliers }: BOMComponentsTableProps) {
  const { t } = useTranslation();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof BOMComponent>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const fc = useFormatCurrency();

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleSort = (field: keyof BOMComponent) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedComponents = [...components].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;
    if (typeof aVal === "string" && typeof bVal === "string") return aVal.localeCompare(bVal) * modifier;
    if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * modifier;
    return 0;
  });

  const SortHeader = ({ field, children }: { field: keyof BOMComponent; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="h-8 -ml-3 font-medium" onClick={() => handleSort(field)}>
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-8"></TableHead>
            <TableHead><SortHeader field="name">{t("bomComponents.component")}</SortHeader></TableHead>
            <TableHead><SortHeader field="category">{t("bomComponents.category")}</SortHeader></TableHead>
            <TableHead className="text-right"><SortHeader field="quantity">{t("bomComponents.qty")}</SortHeader></TableHead>
            <TableHead className="text-right"><SortHeader field="unitCost">{t("bomComponents.unitCost")}</SortHeader></TableHead>
            <TableHead className="text-right"><SortHeader field="totalCost">{t("bomComponents.total")}</SortHeader></TableHead>
            <TableHead className="text-center">{t("bomComponents.alternatives")}</TableHead>
            <TableHead className="text-center">{t("bomComponents.suppliers")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedComponents.map((component) => {
            const isExpanded = expandedRows.has(component.id);
            const alternatives = mockAlternatives[component.id] || [];
            return (
              <>
                <TableRow
                  key={component.id}
                  className={cn("cursor-pointer transition-colors", isExpanded && "bg-muted/30")}
                  onClick={() => alternatives.length > 0 && toggleRow(component.id)}
                >
                  <TableCell className="w-8">
                    {alternatives.length > 0 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{component.name}</p>
                      {component.specifications && (
                        <p className="text-xs text-muted-foreground mt-0.5">{component.specifications}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="font-normal">{component.category}</Badge></TableCell>
                  <TableCell className="text-right">{component.quantity} {component.unit}</TableCell>
                  <TableCell className="text-right font-medium">{fc(component.unitCost)}</TableCell>
                  <TableCell className="text-right font-medium">{fc(component.totalCost)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{component.alternatives}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7" onClick={(e) => { e.stopPropagation(); onViewSuppliers(component); }}>
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {component.matchedSuppliers}
                    </Button>
                  </TableCell>
                </TableRow>

                {isExpanded && alternatives.length > 0 && (
                  <TableRow key={`${component.id}-alternatives`}>
                    <TableCell colSpan={8} className="p-0">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/20 p-4"
                      >
                        <p className="text-sm font-medium text-foreground mb-3">
                          {t("bomComponents.alternativeComponents")}
                        </p>
                        <div className="grid gap-2">
                          {alternatives.map((alt) => (
                            <AlternativeRow key={alt.id} alternative={alt} />
                          ))}
                        </div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AlternativeRow({ alternative }: { alternative: AlternativeComponent }) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{alternative.name}</p>
          <p className="text-xs text-muted-foreground">{alternative.supplier}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm font-medium">{fc(alternative.unitCost)}</p>
          <p className={cn("text-xs", alternative.savings > 0 ? "text-primary" : "text-destructive")}>
            {alternative.savings > 0
              ? t("bomComponents.cheaper", { value: alternative.savings })
              : t("bomComponents.more", { value: Math.abs(alternative.savings) })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{t("bomComponents.leadTime")}</p>
          <p className="text-sm">{alternative.leadTime}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{t("bomComponents.moq")}</p>
          <p className="text-sm">{alternative.moq} {t("bomComponents.units")}</p>
        </div>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          {t("bomComponents.view")}
        </Button>
      </div>
    </div>
  );
}
