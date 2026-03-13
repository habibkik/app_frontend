import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain, Plus, Trash2, Sparkles, Shield, AlertTriangle, Target,
  Copy, ChevronRight, Loader2, MessageSquare, TrendingDown, Lightbulb,
  CheckCircle2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteInput {
  id: string;
  supplierName: string;
  unitPrice: number;
  toolingCost: number;
  moq: number;
  leadTimeDays: number;
  paymentTerms: string;
  notes: string;
}

interface NegotiationResult {
  strategySummary: string;
  overallLeverage: "strong" | "moderate" | "weak";
  potentialSavings: string;
  tactics: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    lever: string;
    expectedImpact: string;
  }>;
  scripts: Array<{
    scenario: string;
    script: string;
    tone: "collaborative" | "firm" | "exploratory";
    useWhen: string;
  }>;
  costDrivers: Array<{
    driver: string;
    challenge: string;
    question: string;
  }>;
  supplierRisks: Array<{
    supplierName: string;
    riskLevel: "low" | "medium" | "high";
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  }>;
}

const emptyQuote = (): QuoteInput => ({
  id: crypto.randomUUID(),
  supplierName: "",
  unitPrice: 0,
  toolingCost: 0,
  moq: 100,
  leadTimeDays: 21,
  paymentTerms: "Net 30",
  notes: "",
});

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

const LEVERAGE_CONFIG = {
  strong: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  moderate: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
  weak: { color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
};

const TONE_BADGE: Record<string, string> = {
  collaborative: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  firm: "bg-destructive/10 text-destructive",
  exploratory: "bg-primary/10 text-primary",
};

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-destructive",
};

const DEMO_QUOTES: QuoteInput[] = [
  { id: crypto.randomUUID(), supplierName: "Precision Machining Co. (Germany)", unitPrice: 124.50, toolingCost: 8500, moq: 500, leadTimeDays: 28, paymentTerms: "Net 45", notes: "ISO 9001 certified, existing supplier" },
  { id: crypto.randomUUID(), supplierName: "TechParts Asia (China)", unitPrice: 87.20, toolingCost: 4200, moq: 1000, leadTimeDays: 42, paymentTerms: "30% advance, 70% on delivery", notes: "New vendor, IATF 16949 pending" },
  { id: crypto.randomUUID(), supplierName: "Midwest Manufacturing (USA)", unitPrice: 142.00, toolingCost: 12000, moq: 250, leadTimeDays: 18, paymentTerms: "Net 30", notes: "Domestic supplier, fast turnaround" },
  { id: crypto.randomUUID(), supplierName: "EuroCast Industries (Poland)", unitPrice: 98.75, toolingCost: 6800, moq: 750, leadTimeDays: 35, paymentTerms: "Net 60", notes: "ISO 14001 + 9001, competitive pricing" },
  { id: crypto.randomUUID(), supplierName: "Apex Components (India)", unitPrice: 79.90, toolingCost: 3500, moq: 2000, leadTimeDays: 50, paymentTerms: "LC at sight", notes: "Lowest price, high MOQ requirement" },
  { id: crypto.randomUUID(), supplierName: "Nova Precision (Turkey)", unitPrice: 105.30, toolingCost: 5600, moq: 500, leadTimeDays: 30, paymentTerms: "Net 45", notes: "Growing capacity, AS9100 certified" },
];

export default function NegotiationIntelligencePage() {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  const [productName, setProductName] = useState("");
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [marketBenchmark, setMarketBenchmark] = useState<number>(0);
  const [walkAwayPrice, setWalkAwayPrice] = useState<number>(0);
  const [bestAlternative, setBestAlternative] = useState("");
  const [shouldCostEstimate, setShouldCostEstimate] = useState<number>(0);
  const [quotes, setQuotes] = useState<QuoteInput[]>([emptyQuote(), emptyQuote()]);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDemoData = () => {
    setProductName("CNC Machined Aluminum Housing – Part #AH-2026-X");
    setTargetPrice(95.00);
    setMarketBenchmark(108.50);
    setWalkAwayPrice(130.00);
    setBestAlternative("Switch to EuroCast Industries at $98.75/unit with 3-year volume commitment");
    setShouldCostEstimate(88.00);
    setQuotes(DEMO_QUOTES.map(q => ({ ...q, id: crypto.randomUUID() })));
    setResult(null);
    toast.success("Demo data loaded – 6 supplier quotes ready for analysis");
  };

  const addQuote = () => setQuotes((q) => [...q, emptyQuote()]);
  const removeQuote = (id: string) => setQuotes((q) => q.filter((x) => x.id !== id));
  const updateQuote = (id: string, field: keyof QuoteInput, value: any) =>
    setQuotes((q) => q.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const analyze = async () => {
    const validQuotes = quotes.filter((q) => q.supplierName && q.unitPrice > 0);
    if (validQuotes.length < 1) {
      toast.error("Add at least one supplier quote with a name and price");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("negotiation-intelligence", {
        body: {
          supplierQuotes: validQuotes,
          productName,
          targetPrice: targetPrice || undefined,
          marketBenchmark: marketBenchmark || undefined,
          walkAwayPrice: walkAwayPrice || undefined,
          bestAlternative: bestAlternative || undefined,
          shouldCostEstimate: shouldCostEstimate || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Negotiation intelligence generated");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Script copied");
  };

  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {t("pages.negotiation.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("pages.negotiation.subtitle")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDemoData}>
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {t("pages.negotiation.loadDemoData")}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input form */}
          <motion.div variants={item} className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("pages.negotiation.context")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">{t("pages.negotiation.productCategory")}</Label>
                  <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. CNC Machined Housing" className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("pages.negotiation.targetPrice")}</Label>
                    <Input type="number" min={0} step={0.01} value={targetPrice || ""} onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)} placeholder="$0.00" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("pages.negotiation.marketBenchmark")}</Label>
                    <Input type="number" min={0} step={0.01} value={marketBenchmark || ""} onChange={(e) => setMarketBenchmark(parseFloat(e.target.value) || 0)} placeholder="$0.00" className="h-8 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BATNA Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {t("pages.negotiation.batnaTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Walk-Away Price</Label>
                    <Input type="number" min={0} step={0.01} value={walkAwayPrice || ""} onChange={(e) => setWalkAwayPrice(parseFloat(e.target.value) || 0)} placeholder="$0.00" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Should-Cost Estimate</Label>
                    <Input type="number" min={0} step={0.01} value={shouldCostEstimate || ""} onChange={(e) => setShouldCostEstimate(parseFloat(e.target.value) || 0)} placeholder="$0.00" className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Best Alternative (BATNA)</Label>
                  <Input value={bestAlternative} onChange={(e) => setBestAlternative(e.target.value)} placeholder="e.g. Switch to Supplier B at $90/unit" className="h-8 text-sm" />
                </div>

                {/* Gap analysis */}
                {shouldCostEstimate > 0 && quotes.some(q => q.unitPrice > 0) && (() => {
                  const avgQuoted = quotes.filter(q => q.unitPrice > 0).reduce((s, q) => s + q.unitPrice, 0) / quotes.filter(q => q.unitPrice > 0).length;
                  const gap = avgQuoted - shouldCostEstimate;
                  const gapPct = ((gap / avgQuoted) * 100).toFixed(1);
                  return (
                    <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Should-Cost: <strong>${shouldCostEstimate.toFixed(2)}</strong></span>
                        <span>Avg Quoted: <strong>${avgQuoted.toFixed(2)}</strong></span>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full" style={{ width: `${Math.min((shouldCostEstimate / avgQuoted) * 100, 100)}%` }} />
                        {gap > 0 && <div className="absolute inset-y-0 bg-destructive/30 rounded-r-full" style={{ left: `${(shouldCostEstimate / avgQuoted) * 100}%`, right: 0 }} />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {gap > 0 ? `Negotiation gap: $${gap.toFixed(2)} (${gapPct}% above should-cost)` : "Quoted price is at or below should-cost estimate ✓"}
                      </p>
                    </div>
                  );
                })()}

                {/* Industry margins */}
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs font-medium mb-1.5">Industry Margin Benchmarks</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="text-center p-1.5 rounded bg-background border">
                      <p className="font-bold">8–15%</p>
                      <p className="text-muted-foreground">Manufacturing</p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-background border">
                      <p className="font-bold">20–40%</p>
                      <p className="text-muted-foreground">IT / Software</p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-background border">
                      <p className="font-bold">5–10%</p>
                      <p className="text-muted-foreground">Distribution</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotes */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Supplier Quotes</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addQuote}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotes.map((q, idx) => (
                  <div key={q.id} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Quote #{idx + 1}</span>
                      {quotes.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeQuote(q.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input value={q.supplierName} onChange={(e) => updateQuote(q.id, "supplierName", e.target.value)} placeholder="Supplier name" className="h-8 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Unit Price ($)</Label>
                        <Input type="number" min={0} step={0.01} value={q.unitPrice || ""} onChange={(e) => updateQuote(q.id, "unitPrice", parseFloat(e.target.value) || 0)} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tooling ($)</Label>
                        <Input type="number" min={0} step={1} value={q.toolingCost || ""} onChange={(e) => updateQuote(q.id, "toolingCost", parseFloat(e.target.value) || 0)} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">MOQ</Label>
                        <Input type="number" min={1} value={q.moq} onChange={(e) => updateQuote(q.id, "moq", parseInt(e.target.value) || 1)} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Lead Time (days)</Label>
                        <Input type="number" min={1} value={q.leadTimeDays} onChange={(e) => updateQuote(q.id, "leadTimeDays", parseInt(e.target.value) || 1)} className="h-7 text-sm" />
                      </div>
                    </div>
                    <Input value={q.paymentTerms} onChange={(e) => updateQuote(q.id, "paymentTerms", e.target.value)} placeholder="Payment terms" className="h-7 text-sm" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full" onClick={analyze} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {loading ? "Analyzing…" : "Generate Intelligence"}
            </Button>
          </motion.div>

          {/* Right: Results */}
          <motion.div variants={item} className="lg:col-span-2">
            {!result && !loading && (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center space-y-3 py-12">
                  <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-muted-foreground text-sm">Enter supplier quotes and click "Generate Intelligence" to get AI-powered negotiation tactics and scripts</p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center space-y-3 py-12">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Analyzing quotes & generating negotiation strategy…</p>
                </CardContent>
              </Card>
            )}

            {result && !loading && (
              <div className="space-y-4">
                {/* Strategy Summary */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">Strategy Summary</h3>
                          {(() => {
                            const cfg = LEVERAGE_CONFIG[result.overallLeverage];
                            const Icon = cfg.icon;
                            return (
                              <Badge variant="outline" className={cn("text-xs", cfg.bg, cfg.color)}>
                                <Icon className="h-3 w-3 mr-1" />
                                {result.overallLeverage} leverage
                              </Badge>
                            );
                          })()}
                          <Badge variant="secondary" className="text-xs">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {result.potentialSavings} savings potential
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.strategySummary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="tactics" className="space-y-4">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="tactics" className="text-xs">Tactics</TabsTrigger>
                    <TabsTrigger value="scripts" className="text-xs">Scripts</TabsTrigger>
                    <TabsTrigger value="costs" className="text-xs">Cost Drivers</TabsTrigger>
                    <TabsTrigger value="risks" className="text-xs">Supplier Risks</TabsTrigger>
                  </TabsList>

                  {/* Tactics */}
                  <TabsContent value="tactics" className="space-y-3">
                    {result.tactics.map((t, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{t.title}</span>
                                <Badge variant="outline" className={cn("text-[10px]", PRIORITY_STYLES[t.priority])}>
                                  {t.priority}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">{t.lever}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{t.description}</p>
                              <p className="text-xs text-primary/80 flex items-center gap-1">
                                <ChevronRight className="h-3 w-3" /> Expected: {t.expectedImpact}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Scripts */}
                  <TabsContent value="scripts" className="space-y-3">
                    {result.scripts.map((s, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{s.scenario}</span>
                              <Badge variant="outline" className={cn("text-[10px]", TONE_BADGE[s.tone])}>{s.tone}</Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyScript(s.script)}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap font-mono text-xs leading-relaxed">
                            {s.script}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" /> Use when: {s.useWhen}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Cost Drivers */}
                  <TabsContent value="costs" className="space-y-3">
                    {result.costDrivers.map((c, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">{c.driver}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{c.challenge}</p>
                          <div className="bg-muted/50 rounded-md p-2.5 text-sm italic">
                            💬 "{c.question}"
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Supplier Risks */}
                  <TabsContent value="risks" className="space-y-3">
                    {result.supplierRisks.map((r, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{r.supplierName}</span>
                            </div>
                            <Badge variant="outline" className={cn("text-xs", RISK_COLORS[r.riskLevel])}>
                              {r.riskLevel} risk
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">Strengths</p>
                              <ul className="space-y-0.5">
                                {r.strengths.map((s, j) => (
                                  <li key={j} className="flex items-start gap-1 text-muted-foreground">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" /> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-destructive mb-1">Weaknesses</p>
                              <ul className="space-y-0.5">
                                {r.weaknesses.map((w, j) => (
                                  <li key={j} className="flex items-start gap-1 text-muted-foreground">
                                    <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" /> {w}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <Separator />
                          <p className="text-xs text-muted-foreground">
                            <strong>Recommendation:</strong> {r.recommendation}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
