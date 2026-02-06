import { motion } from "framer-motion";
import { DollarSign, TrendingDown, Package, Truck, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BOMComponent } from "@/data/bom";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface BOMCostSummaryProps {
  components: BOMComponent[];
  confidence: number;
}

export function BOMCostSummary({ components, confidence }: BOMCostSummaryProps) {
  const fc = useFormatCurrency();

  const totalMaterialCost = components.reduce((sum, c) => sum + c.totalCost, 0);
  const estimatedLabor = totalMaterialCost * 0.35;
  const estimatedOverhead = totalMaterialCost * 0.15;
  const estimatedShipping = totalMaterialCost * 0.08;
  const totalUnitCost = totalMaterialCost + estimatedLabor + estimatedOverhead + estimatedShipping;
  const potentialSavings = totalMaterialCost * 0.18;
  
  const categoryBreakdown = components.reduce((acc, comp) => {
    acc[comp.category] = (acc[comp.category] || 0) + comp.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const categoryColors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-muted-foreground",
    "bg-ring",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Unit Cost */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Unit Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fc(totalUnitCost)}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Confidence</span>
              <Progress value={confidence} className="h-1.5 flex-1" />
              <span className="text-xs font-medium">{confidence}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Material Cost */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Material Cost</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fc(totalMaterialCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {components.length} components identified
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Potential Savings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              -{fc(potentialSavings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Via alternative components
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shipping Estimate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Shipping</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fc(estimatedShipping)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per unit (FOB estimate)
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cost Breakdown Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Breakdown</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <CostBreakdownItem label="Materials" value={totalMaterialCost} total={totalUnitCost} color="bg-primary" fc={fc} />
              <CostBreakdownItem label="Labor (est.)" value={estimatedLabor} total={totalUnitCost} color="bg-secondary" fc={fc} />
              <CostBreakdownItem label="Overhead (est.)" value={estimatedOverhead} total={totalUnitCost} color="bg-accent" fc={fc} />
              <CostBreakdownItem label="Shipping (est.)" value={estimatedShipping} total={totalUnitCost} color="bg-muted-foreground" fc={fc} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="md:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedCategories.map(([category, cost], index) => (
                <CostBreakdownItem
                  key={category}
                  label={category}
                  value={cost}
                  total={totalMaterialCost}
                  color={categoryColors[index] || "bg-muted"}
                  fc={fc}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function CostBreakdownItem({
  label,
  value,
  total,
  color,
  fc,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  fc: (amount: number) => string;
}) {
  const percentage = (value / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{fc(value)} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
