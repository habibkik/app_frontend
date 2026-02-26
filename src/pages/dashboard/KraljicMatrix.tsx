import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Plus, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatrixItem {
  id: string;
  name: string;
  supplyRisk: number;
  businessImpact: number;
}

const QUADRANTS = [
  {
    label: "Non-Critical", position: "bottom-left",
    color: "bg-muted text-muted-foreground",
    dotColor: "bg-slate-400",
    strategy: "Automate purchasing, reduce suppliers, focus on efficiency. Minimize transaction cost.",
    examples: ["Office supplies", "Standard spare parts", "Printer toner"],
  },
  {
    label: "Leverage", position: "top-left",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    strategy: "Competitive bidding, volume consolidation, strong price negotiation. Maximize buying power.",
    examples: ["Packaging materials", "Standard raw materials", "Laptops", "FMCG goods"],
  },
  {
    label: "Bottleneck", position: "bottom-right",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dotColor: "bg-amber-500",
    strategy: "Secure supply, increase safety stock, develop backup suppliers. Price is NOT priority — supply continuity is.",
    examples: ["Specialized spare parts", "Unique chemical components", "Special chips"],
  },
  {
    label: "Strategic", position: "top-right",
    color: "bg-primary/10 text-primary",
    dotColor: "bg-primary",
    strategy: "Long-term partnership, executive-level negotiation, joint cost reduction, supplier integration.",
    examples: ["Core raw materials", "Critical IT systems", "Engine components", "Pharmaceutical API"],
  },
];

function getQuadrant(supplyRisk: number, businessImpact: number) {
  if (supplyRisk < 50 && businessImpact < 50) return 0; // Non-Critical
  if (supplyRisk < 50 && businessImpact >= 50) return 1; // Leverage
  if (supplyRisk >= 50 && businessImpact < 50) return 2; // Bottleneck
  return 3; // Strategic
}

export default function KraljicMatrixPage() {
  const [items, setItems] = useState<MatrixItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newSupplyRisk, setNewSupplyRisk] = useState(50);
  const [newBusinessImpact, setNewBusinessImpact] = useState(50);

  const addItem = () => {
    if (!newName.trim()) return;
    setItems([...items, { id: crypto.randomUUID(), name: newName.trim(), supplyRisk: newSupplyRisk, businessImpact: newBusinessImpact }]);
    setNewName("");
    setNewSupplyRisk(50);
    setNewBusinessImpact(50);
  };

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Kraljic Matrix Classifier
          </h1>
          <p className="text-sm text-muted-foreground">Classify purchases by supply risk and business impact to determine strategy</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input */}
          <motion.div variants={item} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Purchase Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Item Name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Steel Coils" className="h-8 text-sm" onKeyDown={(e) => e.key === "Enter" && addItem()} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Supply Risk</Label>
                    <span className="text-xs text-muted-foreground">{newSupplyRisk}%</span>
                  </div>
                  <Slider value={[newSupplyRisk]} onValueChange={([v]) => setNewSupplyRisk(v)} max={100} step={1} />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Low Risk</span><span>High Risk</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Business Impact</Label>
                    <span className="text-xs text-muted-foreground">{newBusinessImpact}%</span>
                  </div>
                  <Slider value={[newBusinessImpact]} onValueChange={([v]) => setNewBusinessImpact(v)} max={100} step={1} />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Low Impact</span><span>High Impact</span>
                  </div>
                </div>
                <Button className="w-full" onClick={addItem} disabled={!newName.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add to Matrix
                </Button>
              </CardContent>
            </Card>

            {/* Items list */}
            {items.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Plotted Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((it) => {
                    const qi = getQuadrant(it.supplyRisk, it.businessImpact);
                    return (
                      <div key={it.id} className="flex items-center justify-between p-2 rounded border text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2.5 w-2.5 rounded-full", QUADRANTS[qi].dotColor)} />
                          <span className="font-medium">{it.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{QUADRANTS[qi].label}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(it.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Matrix visualization */}
          <motion.div variants={item} className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">2×2 Classification Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Y-axis label */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Business Impact →
                  </div>
                  {/* X-axis label */}
                  <div className="text-center text-xs font-medium text-muted-foreground mt-2">
                    Supply Risk →
                  </div>

                  <div className="ml-6 grid grid-cols-2 gap-1 aspect-square max-h-[450px]">
                    {/* Top-Left: Leverage */}
                    <div className="relative rounded-tl-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex flex-col">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">LEVERAGE</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">High Impact, Low Risk</span>
                      <div className="flex-1 relative mt-2">
                        {items.filter((i) => getQuadrant(i.supplyRisk, i.businessImpact) === 1).map((it) => (
                          <div key={it.id} className="absolute bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium shadow-sm" style={{
                            left: `${(it.supplyRisk / 50) * 80}%`,
                            top: `${100 - ((it.businessImpact - 50) / 50) * 80}%`,
                          }}>
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top-Right: Strategic */}
                    <div className="relative rounded-tr-lg bg-primary/10 border border-primary/20 p-3 flex flex-col">
                      <span className="text-xs font-bold text-primary">STRATEGIC</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">High Impact, High Risk</span>
                      <div className="flex-1 relative mt-2">
                        {items.filter((i) => getQuadrant(i.supplyRisk, i.businessImpact) === 3).map((it) => (
                          <div key={it.id} className="absolute bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-medium shadow-sm" style={{
                            left: `${((it.supplyRisk - 50) / 50) * 80}%`,
                            top: `${100 - ((it.businessImpact - 50) / 50) * 80}%`,
                          }}>
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom-Left: Non-Critical */}
                    <div className="relative rounded-bl-lg bg-muted/50 border border-border p-3 flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground">NON-CRITICAL</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Low Impact, Low Risk</span>
                      <div className="flex-1 relative mt-2">
                        {items.filter((i) => getQuadrant(i.supplyRisk, i.businessImpact) === 0).map((it) => (
                          <div key={it.id} className="absolute bg-slate-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium shadow-sm" style={{
                            left: `${(it.supplyRisk / 50) * 80}%`,
                            top: `${100 - (it.businessImpact / 50) * 80}%`,
                          }}>
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom-Right: Bottleneck */}
                    <div className="relative rounded-br-lg bg-amber-500/10 border border-amber-500/20 p-3 flex flex-col">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">BOTTLENECK</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Low Impact, High Risk</span>
                      <div className="flex-1 relative mt-2">
                        {items.filter((i) => getQuadrant(i.supplyRisk, i.businessImpact) === 2).map((it) => (
                          <div key={it.id} className="absolute bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium shadow-sm" style={{
                            left: `${((it.supplyRisk - 50) / 50) * 80}%`,
                            top: `${100 - (it.businessImpact / 50) * 80}%`,
                          }}>
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quadrant strategies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUADRANTS.map((q) => (
                <Card key={q.label}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", q.dotColor)} />
                      <span className="font-semibold text-sm">{q.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{q.strategy}</p>
                    <div className="flex flex-wrap gap-1">
                      {q.examples.map((ex) => (
                        <Badge key={ex} variant="outline" className="text-[10px]">{ex}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
