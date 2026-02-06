import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Clock,
  Package,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  Plus,
  History,
  Brain,
  Settings2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

// --- Mock Data ---
const products = [
  { id: "1", name: "Industrial Servo Motor", currentPrice: 245, cost: 180, competitorAvg: 260, dailySales: 32 },
  { id: "2", name: "Hydraulic Pump Assembly", currentPrice: 890, cost: 650, competitorAvg: 920, dailySales: 12 },
  { id: "3", name: "CNC Controller Board", currentPrice: 1250, cost: 850, competitorAvg: 1180, dailySales: 8 },
  { id: "4", name: "Precision Ball Bearing", currentPrice: 45, cost: 28, competitorAvg: 48, dailySales: 150 },
];

const priceHistory = [
  { date: "2026-02-06T14:30:00", oldPrice: 240, newPrice: 245, reason: "Manual" },
  { date: "2026-02-05T09:15:00", oldPrice: 252, newPrice: 240, reason: "Rule Applied" },
  { date: "2026-02-03T16:45:00", oldPrice: 238, newPrice: 252, reason: "AI Suggested" },
  { date: "2026-01-28T11:00:00", oldPrice: 245, newPrice: 238, reason: "Rule Applied" },
  { date: "2026-01-20T08:30:00", oldPrice: 230, newPrice: 245, reason: "Manual" },
];

// --- Helpers ---
const calcMargin = (price: number, cost: number) => ((price - cost) / price) * 100;

const marginColor = (margin: number) => {
  if (margin > 30) return "text-emerald-600";
  if (margin >= 20) return "text-yellow-600";
  return "text-red-500";
};

const marginBg = (margin: number) => {
  if (margin > 30) return "bg-emerald-500/10";
  if (margin >= 20) return "bg-yellow-500/10";
  return "bg-red-500/10";
};

const reasonBadge = (reason: string) => {
  switch (reason) {
    case "Manual": return <Badge variant="outline" className="text-xs">Manual</Badge>;
    case "Rule Applied": return <Badge variant="secondary" className="text-xs">Rule Applied</Badge>;
    case "AI Suggested": return <Badge className="text-xs bg-primary/80">AI Suggested</Badge>;
    default: return <Badge variant="outline" className="text-xs">{reason}</Badge>;
  }
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// --- Component ---
export function PricingOptimizerComponent() {
  const fc = useFormatCurrency();
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>("recommended");
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [rules, setRules] = useState([
    { id: "1", text: "If competitor drops price > 10%, reduce mine by 5%", enabled: true, icon: TrendingDown },
    { id: "2", text: "If inventory > 1000 units, apply 15% discount", enabled: false, icon: Package },
    { id: "3", text: "Peak hours (6-9pm): raise price 10%", enabled: true, icon: Clock },
    { id: "4", text: "Low inventory (<50 units): raise price 20%", enabled: false, icon: Zap },
  ]);

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const currentPrice = customPrice ?? product.currentPrice;
  const currentMargin = calcMargin(currentPrice, product.cost);

  const strategies = useMemo(() => {
    const { cost, competitorAvg } = product;
    const premiumPrice = Math.round(competitorAvg * 1.15);
    const recommendedPrice = Math.round((competitorAvg + cost * 1.35) / 2);
    const aggressivePrice = Math.round(competitorAvg * 0.88);

    return [
      {
        key: "premium",
        title: "Premium",
        price: premiumPrice,
        margin: calcMargin(premiumPrice, cost),
        volumeImpact: "-15%",
        revenueImpact: `+${Math.round(((premiumPrice - currentPrice) / currentPrice) * 100)}%`,
        description: "Higher price targets quality-conscious buyers",
        reasoning: `Competitor average: ${fc(competitorAvg)}, position yourself premium`,
        risk: "May lose price-sensitive customers",
        riskLevel: "Medium",
        highlight: "border-emerald-500/40 bg-emerald-500/5",
        accentColor: "text-emerald-600",
        dotColor: "bg-emerald-500",
      },
      {
        key: "recommended",
        title: "Recommended",
        price: recommendedPrice,
        margin: calcMargin(recommendedPrice, cost),
        volumeImpact: "Baseline",
        revenueImpact: "Optimal ROI",
        description: "Balances margin and volume",
        reasoning: `Market sweet spot — matches competitor avg ${fc(competitorAvg)}`,
        risk: "Low — tested positioning",
        riskLevel: "Low",
        highlight: "border-primary/40 bg-primary/5",
        accentColor: "text-primary",
        dotColor: "bg-primary",
      },
      {
        key: "aggressive",
        title: "Aggressive",
        price: aggressivePrice,
        margin: calcMargin(aggressivePrice, cost),
        volumeImpact: "+40%",
        revenueImpact: "Varies",
        description: "Undercut competitors to gain market share",
        reasoning: `Lower price = 40% more customers (estimated)`,
        risk: "Margin pressure — needs volume to offset",
        riskLevel: "High",
        highlight: "border-orange-500/40 bg-orange-500/5",
        accentColor: "text-orange-600",
        dotColor: "bg-orange-500",
      },
    ];
  }, [product, currentPrice, fc]);

  const selectedStrat = strategies.find((s) => s.key === selectedStrategy);
  const newPrice = selectedStrat?.price ?? currentPrice;

  // Simulator state
  const simMin = Math.round(product.cost * 1.05);
  const simMax = Math.round(product.competitorAvg * 1.3);
  const [simPrice, setSimPrice] = useState([currentPrice]);

  const simMargin = calcMargin(simPrice[0], product.cost);
  const simSalesImpact = Math.round(((product.competitorAvg - simPrice[0]) / product.competitorAvg) * 60);
  const simDailyRevenue = simPrice[0] * product.dailySales * (1 + simSalesImpact / 100);
  const simDailyProfit = (simPrice[0] - product.cost) * product.dailySales * (1 + simSalesImpact / 100);

  const handlePriceEdit = () => {
    const parsed = parseFloat(priceInput);
    if (!isNaN(parsed) && parsed > 0) {
      setCustomPrice(parsed);
    }
    setEditingPrice(false);
  };

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleApply = () => {
    setCustomPrice(newPrice);
    toast.success("Price updated! Monitor competitor response.", {
      description: `${product.name} price changed to ${fc(newPrice)}`,
    });
  };

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    setCustomPrice(null);
    const p = products.find((pr) => pr.id === id) || products[0];
    setSimPrice([p.currentPrice]);
  };

  return (
    <div className="space-y-6">
      {/* ===== 1. HEADER ===== */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="min-w-[220px]">
              <p className="text-xs text-muted-foreground mb-1">Product</p>
              <Select value={selectedProductId} onValueChange={handleProductChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
              {editingPrice ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="text-2xl font-bold w-32 h-10"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    onBlur={handlePriceEdit}
                    onKeyDown={(e) => e.key === "Enter" && handlePriceEdit()}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => { setPriceInput(currentPrice.toFixed(2)); setEditingPrice(true); }}
                  className="text-2xl sm:text-3xl font-bold text-foreground hover:text-primary transition-colors cursor-text"
                >
                  {fc(currentPrice)}
                </button>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">COGS</p>
              <p className="text-xl font-semibold text-foreground">{fc(product.cost)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Margin</p>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${marginBg(currentMargin)}`}>
                <span className={`text-xl font-bold ${marginColor(currentMargin)}`}>
                  {currentMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== 2. STRATEGY CARDS ===== */}
      <div className="grid gap-4 md:grid-cols-3">
        {strategies.map((s) => (
          <motion.div
            key={s.key}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              className={`relative transition-all cursor-pointer border-2 ${
                selectedStrategy === s.key ? s.highlight + " shadow-md" : "border-border hover:border-muted-foreground/30"
              }`}
              onClick={() => setSelectedStrategy(s.key)}
            >
              {s.key === "recommended" && (
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    <Sparkles className="h-3 w-3 mr-1" /> Recommended
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{s.title} Strategy</CardTitle>
                  {selectedStrategy === s.key && (
                    <div className={`h-6 w-6 rounded-full ${s.dotColor} flex items-center justify-center`}>
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className={`text-2xl sm:text-3xl font-bold ${s.accentColor}`}>{fc(s.price)}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin</span>
                    <span className={`font-medium ${marginColor(s.margin)}`}>{s.margin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-medium text-foreground">{s.volumeImpact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium text-foreground">{s.revenueImpact}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 space-y-1.5">
                  <p className="text-xs text-foreground">{s.description}</p>
                  <p className="text-xs text-muted-foreground italic">"{s.reasoning}"</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Risk: {s.risk}</span>
                  </div>
                </div>

                <Button
                  variant={s.key === "recommended" ? "default" : "outline"}
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => { e.stopPropagation(); setSelectedStrategy(s.key); }}
                >
                  Select
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ===== 3 & 4: SIMULATOR + RULES ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Collapsible open={simulatorOpen} onOpenChange={setSimulatorOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    What-If Calculator
                  </CardTitle>
                  {simulatorOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-5 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-bold text-foreground text-lg">{fc(simPrice[0])}</span>
                  </div>
                  <Slider
                    value={simPrice}
                    onValueChange={setSimPrice}
                    min={simMin}
                    max={simMax}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{fc(simMin)}</span>
                    <span>{fc(simMax)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Margin", value: `${simMargin.toFixed(1)}%`, color: marginColor(simMargin) },
                    { label: "Sales Impact", value: `${simSalesImpact > 0 ? "+" : ""}${simSalesImpact}%`, color: simSalesImpact >= 0 ? "text-emerald-600" : "text-red-500" },
                    { label: "Daily Revenue", value: fc(simDailyRevenue), color: "text-foreground" },
                    { label: "Daily Profit", value: fc(simDailyProfit), color: simDailyProfit > 0 ? "text-emerald-600" : "text-red-500" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Pricing Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Automatic Pricing Rules
              </CardTitle>
              <Button variant="outline" size="sm" disabled className="gap-1">
                <Plus className="h-3 w-3" /> Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  rule.enabled ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30"
                }`}
              >
                <rule.icon className={`h-4 w-4 flex-shrink-0 ${rule.enabled ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm flex-1 ${rule.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {rule.text}
                </p>
                <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ===== 5 & 6: HISTORY + AI EXPLANATION ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Price Change History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {priceHistory.map((entry, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`h-5 w-5 rounded-full border-2 border-background z-10 flex-shrink-0 mt-0.5 ${
                      i === 0 ? "bg-primary" : "bg-muted-foreground/30"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {fc(entry.oldPrice)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {fc(entry.newPrice)}
                        </span>
                        {reasonBadge(entry.reason)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(entry.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-background/80 border border-border/50 space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm text-foreground">
                  <p>
                    <span className="font-medium">Market analysis:</span>{" "}
                    <span className="text-muted-foreground">Competitors average {fc(product.competitorAvg)}. You are positioned {currentPrice < product.competitorAvg ? "below" : "above"} market.</span>
                  </p>
                  <p>
                    <span className="font-medium">Your cost:</span>{" "}
                    <span className="text-muted-foreground">{fc(product.cost)}, recommended margin: 35-40%</span>
                  </p>
                  <p>
                    <span className="font-medium">Target customer:</span>{" "}
                    <span className="text-muted-foreground">Mid-range buyers seeking quality-to-price balance</span>
                  </p>
                  <p>
                    <span className="font-medium">Recommendation:</span>{" "}
                    <span className="text-muted-foreground">
                      Set at {selectedStrat ? fc(selectedStrat.price) : fc(currentPrice)} to {selectedStrategy === "premium" ? "capture premium value" : selectedStrategy === "aggressive" ? "gain market share" : "stay competitive with optimal ROI"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== 7. ACTIONS ===== */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {selectedStrat ? (
                <span>
                  Selected: <span className="font-medium text-foreground">{selectedStrat.title}</span> — {fc(currentPrice)} → <span className="font-medium text-foreground">{fc(selectedStrat.price)}</span>
                </span>
              ) : (
                "Select a strategy above to apply"
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" className="gap-2 min-w-[220px]" disabled={!selectedStrat || selectedStrat.price === currentPrice}>
                  <DollarSign className="h-4 w-4" />
                  Apply Selected Strategy
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Price Change</AlertDialogTitle>
                  <AlertDialogDescription>
                    Change <span className="font-medium text-foreground">{product.name}</span> price from{" "}
                    <span className="font-bold text-foreground">{fc(currentPrice)}</span> to{" "}
                    <span className="font-bold text-foreground">{fc(newPrice)}</span>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApply}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
