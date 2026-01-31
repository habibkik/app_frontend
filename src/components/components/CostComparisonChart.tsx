import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentPart, SupplierQuote, ComparisonSelection, mockSupplierQuotes } from "@/data/components";
import { cn } from "@/lib/utils";

interface CostComparisonChartProps {
  parts: ComponentPart[];
  selections: ComparisonSelection[];
}

export function CostComparisonChart({ parts, selections }: CostComparisonChartProps) {
  // Calculate bar data for each component
  const chartData = parts.map((part) => {
    const quotes = mockSupplierQuotes.filter((q) => q.componentId === part.id);
    const minCost = Math.min(...quotes.map((q) => q.unitPrice * part.requiredQuantity));
    const maxCost = Math.max(...quotes.map((q) => q.unitPrice * part.requiredQuantity));
    
    const selection = selections.find((s) => s.componentId === part.id);
    const selectedQuote = mockSupplierQuotes.find((q) => q.id === selection?.selectedQuoteId);
    const selectedCost = selectedQuote ? selectedQuote.unitPrice * part.requiredQuantity : null;

    return {
      name: part.name,
      shortName: part.name.split(" ").slice(0, 2).join(" "),
      minCost,
      maxCost,
      selectedCost,
      hasSelection: !!selectedCost,
    };
  });

  const globalMax = Math.max(...chartData.map((d) => d.maxCost));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Cost Comparison by Component
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((item, index) => {
              const minPercent = (item.minCost / globalMax) * 100;
              const maxPercent = (item.maxCost / globalMax) * 100;
              const selectedPercent = item.selectedCost
                ? (item.selectedCost / globalMax) * 100
                : 0;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]">{item.shortName}</span>
                    <span className="text-muted-foreground">
                      ${item.minCost.toLocaleString()} - ${item.maxCost.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Bar Container */}
                  <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                    {/* Range Bar (min to max) */}
                    <div
                      className="absolute h-full bg-muted-foreground/20 rounded-md"
                      style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                      }}
                    />
                    
                    {/* Min Marker */}
                    <div
                      className="absolute h-full w-1 bg-primary/50"
                      style={{ left: `${minPercent}%` }}
                    />
                    
                    {/* Max Marker */}
                    <div
                      className="absolute h-full w-1 bg-destructive/50"
                      style={{ left: `${maxPercent}%` }}
                    />
                    
                    {/* Selected Value Bar */}
                    {item.hasSelection && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedPercent}%` }}
                        className="absolute h-full bg-primary rounded-md"
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      />
                    )}
                    
                    {/* Selected Value Label */}
                    {item.hasSelection && item.selectedCost && (
                      <div
                        className="absolute inset-y-0 flex items-center px-2"
                        style={{ left: Math.min(selectedPercent, 70) + "%" }}
                      >
                        <span className="text-xs font-semibold text-primary-foreground bg-primary/80 px-1.5 py-0.5 rounded">
                          ${item.selectedCost.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-primary" />
              <span>Your Selection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-1 bg-primary/50" />
              <span>Lowest Price</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-1 bg-destructive/50" />
              <span>Highest Price</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
