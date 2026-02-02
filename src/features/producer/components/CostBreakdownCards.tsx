import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Factory, Truck, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  ComponentCostBreakdown,
  ProductionCostEstimate,
  LogisticsCostEstimate,
} from "../types/feasibility";

interface CostBreakdownCardsProps {
  componentCosts: ComponentCostBreakdown[];
  productionCost: ProductionCostEstimate;
  logisticsCost: LogisticsCostEstimate;
  totalCostPerUnit: number;
}

export function CostBreakdownCards({
  componentCosts,
  productionCost,
  logisticsCost,
  totalCostPerUnit,
}: CostBreakdownCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const totalComponentCost = componentCosts.reduce((sum, c) => sum + c.totalCost, 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  // Pie chart data
  const pieData = [
    { name: "Components", value: totalComponentCost, color: "hsl(var(--primary))" },
    { name: "Production", value: productionCost.totalProductionCostPerUnit, color: "hsl(217, 91%, 60%)" },
    { name: "Logistics", value: logisticsCost.totalLandedCostPerUnit, color: "hsl(142, 76%, 36%)" },
  ];

  const toggleExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Component Cost Card */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <span>Component Cost</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleExpand("component")}
              >
                {expandedCard === "component" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              ${totalComponentCost.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/unit</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {componentCosts.length} components
            </p>

            {expandedCard === "component" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-2 border-t pt-3"
              >
                {componentCosts.slice(0, 5).map((comp) => (
                  <div key={comp.componentId} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[120px]">
                      {comp.name}
                    </span>
                    <span className="font-medium">${comp.totalCost.toFixed(2)}</span>
                  </div>
                ))}
                {componentCosts.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{componentCosts.length - 5} more components
                  </p>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Production Cost Card */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-blue-500" />
                </div>
                <span>Production Cost</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleExpand("production")}
              >
                {expandedCard === "production" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              ${productionCost.totalProductionCostPerUnit.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/unit</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Labor, equipment & facility
            </p>

            {expandedCard === "production" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-2 border-t pt-3"
              >
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Labor</span>
                  <span className="font-medium">${productionCost.laborCostPerUnit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Equipment</span>
                  <span className="font-medium">${productionCost.equipmentCostPerUnit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Facility</span>
                  <span className="font-medium">${productionCost.facilityCostPerUnit.toFixed(2)}</span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Logistics Cost Card */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-emerald-500" />
                </div>
                <span>Logistics Cost</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleExpand("logistics")}
              >
                {expandedCard === "logistics" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              ${logisticsCost.totalLandedCostPerUnit.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/unit</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Shipping, duties & handling
            </p>

            {expandedCard === "logistics" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-2 border-t pt-3"
              >
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">${logisticsCost.shippingCostPerUnit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Import Duties</span>
                  <span className="font-medium">${logisticsCost.importDuties.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Handling & Storage</span>
                  <span className="font-medium">${logisticsCost.handlingStorage.toFixed(2)}</span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Cost Summary Card */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="h-full bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <span>Total Cost</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              ${totalCostPerUnit.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/unit</span>
            </p>

            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
