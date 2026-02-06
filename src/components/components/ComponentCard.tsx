import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComponentPart, SupplierQuote } from "@/data/components";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface ComponentCardProps {
  component: ComponentPart;
  quotes: SupplierQuote[];
  selectedQuote: SupplierQuote | null;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export function ComponentCard({
  component,
  quotes,
  selectedQuote,
  isExpanded,
  onToggle,
  index,
}: ComponentCardProps) {
  const fc = useFormatCurrency();
  const lowestPrice = Math.min(...quotes.map((q) => q.unitPrice));
  const highestPrice = Math.max(...quotes.map((q) => q.unitPrice));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          isExpanded ? "ring-2 ring-primary" : "hover:border-primary/50"
        )}
        onClick={onToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{component.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {component.specifications}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                    isExpanded && "rotate-90"
                  )}
                />
              </div>

              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary">{component.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  Qty: {component.requiredQuantity.toLocaleString()} {component.unit}
                </span>
                <span className="text-sm">
                  {fc(lowestPrice)} - {fc(highestPrice)} / unit
                </span>
              </div>

              {selectedQuote && (
                <div className="mt-3 p-2 rounded-md bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      Selected: {selectedQuote.supplierName}
                    </span>
                    <span className="text-sm font-bold">
                      {fc(selectedQuote.unitPrice * component.requiredQuantity)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
