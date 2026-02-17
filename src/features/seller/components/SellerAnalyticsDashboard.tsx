import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Send, Eye,
  Heart, MessageSquare, Share2, Brain, Loader2, Lightbulb, Target,
  ShieldAlert, Sparkles, ArrowRight, RefreshCw, MousePointerClick,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { format, subDays } from "date-fns";

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

interface AIInsight {
  category: "revenue" | "pricing" | "marketing" | "growth" | "risk";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable: boolean;
}

interface AIInsightsResponse {
  overallScore: number;
  overallLabel: "excellent" | "good" | "fair" | "needs_attention";
  insights: AIInsight[];
  recommendations: string[];
  pricingLearning: string;
  contentLearning: string;
  weeklyFocus: string;
}

interface SalesDataPoint {
  date: string;
  revenue: number;
  units: number;
}

interface PriceChangeEntry {
  date: string;
  oldPrice: number;
  newPrice: number;
  strategy: string;
  product: string;
}

interface EngagementSummary {
  totalImpressions: number;
  totalClicks: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  postsCount: number;
}

// ── Category config ──────────────────────────────────────────────────────────

const categoryIcons: Record<string, React.ReactNode> = {
  revenue: <DollarSign className="h-4 w-4" />,
  pricing: <TrendingUp className="h-4 w-4" />,
  marketing: <Send className="h-4 w-4" />,
  growth: <Target className="h-4 w-4" />,
  risk: <ShieldAlert className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  revenue: "text-emerald-600",
  pricing: "text-blue-600",
  marketing: "text-purple-600",
  growth: "text-amber-600",
  risk: "text-destructive",
};

const impactBadge: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-muted text-muted-foreground",
};

const scoreColors: Record<string, string> = {
  excellent: "text-emerald-600",
  good: "text-blue-600",
  fair: "text-amber-600",
  needs_attention: "text-destructive",
};

const PIE_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))",
];

// ── Component ────────────────────────────────────────────────────────────────

export function SellerAnalyticsDashboard() {
  const fc = useFormatCurrency();

  // Data state
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [priceChanges, setPriceChanges] = useState<PriceChangeEntry[]>([]);
  const [engagement, setEngagement] = useState<EngagementSummary>({
    totalImpressions: 0, totalClicks: 0, totalLikes: 0, totalComments: 0,
    totalShares: 0, avgEngagementRate: 0, postsCount: 0,
  });
  const [productCount, setProductCount] = useState(0);
  const [topProduct, setTopProduct] = useState("");
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; value: number }[]>([]);

  // AI state
  const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // ── Load real data from DB ──────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parallel fetch all data
      const [productsRes, salesRes, priceRes, postsRes] = await Promise.all([
        supabase.from("products").select("*").eq("user_id", user.id),
        supabase.from("sales_performance").select("*").eq("user_id", user.id)
          .order("date", { ascending: true }).limit(30),
        supabase.from("price_changes" as any).select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(20),
        supabase.from("scheduled_posts").select("*").eq("user_id", user.id)
          .eq("status", "posted"),
      ]);

      // Products
      const products = productsRes.data || [];
      setProductCount(products.length);

      // Category breakdown
      const cats: Record<string, number> = {};
      products.forEach((p: any) => {
        const cat = p.category || "Uncategorized";
        cats[cat] = (cats[cat] || 0) + 1;
      });
      setCategoryBreakdown(Object.entries(cats).map(([name, value]) => ({ name, value })));

      // Sales data
      if (salesRes.data && salesRes.data.length > 0) {
        setSalesData(salesRes.data.map((s: any) => ({
          date: format(new Date(s.date), "MMM d"),
          revenue: Number(s.revenue),
          units: Number(s.units_sold),
        })));
      } else {
        // Fallback mock for demo
        const mockSales = Array.from({ length: 14 }, (_, i) => ({
          date: format(subDays(new Date(), 13 - i), "MMM d"),
          revenue: 800 + Math.round(Math.random() * 600),
          units: 10 + Math.round(Math.random() * 30),
        }));
        setSalesData(mockSales);
      }

      // Price changes
      const changes = (priceRes.data || []) as any[];
      setPriceChanges(changes.map((c: any) => ({
        date: format(new Date(c.created_at), "MMM d"),
        oldPrice: Number(c.old_price),
        newPrice: Number(c.new_price),
        strategy: c.strategy_used,
        product: c.product_id || "Unknown",
      })));

      // Top product
      if (products.length > 0) {
        const sorted = [...products].sort((a: any, b: any) => b.current_price - a.current_price);
        setTopProduct(sorted[0]?.name || "");
      }

      // Engagement from posts
      const posts = postsRes.data || [];
      const eng: EngagementSummary = {
        totalImpressions: 0, totalClicks: 0, totalLikes: 0,
        totalComments: 0, totalShares: 0, avgEngagementRate: 0,
        postsCount: posts.length,
      };
      posts.forEach((p: any) => {
        eng.totalImpressions += p.total_impressions || 0;
        eng.totalClicks += p.total_clicks || 0;
        eng.totalLikes += p.total_likes || 0;
        eng.totalComments += p.total_comments || 0;
        eng.totalShares += p.total_shares || 0;
      });
      if (posts.length > 0) {
        const totalEng = eng.totalLikes + eng.totalComments + eng.totalShares;
        eng.avgEngagementRate = eng.totalImpressions > 0
          ? (totalEng / eng.totalImpressions) * 100 : 0;
      }
      setEngagement(eng);

    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Generate AI Insights ────────────────────────────────────────────────

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
      const totalUnits = salesData.reduce((s, d) => s + d.units, 0);
      const avgPrice = productCount > 0 && totalUnits > 0 ? totalRevenue / totalUnits : 0;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seller-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            totalProducts: productCount,
            totalRevenue,
            totalUnitsSold: totalUnits,
            avgPrice,
            priceChanges: priceChanges.length,
            postsPublished: engagement.postsCount,
            totalImpressions: engagement.totalImpressions,
            totalEngagement: engagement.totalLikes + engagement.totalComments + engagement.totalShares,
            topProduct,
            recentStrategies: [...new Set(priceChanges.map((p) => p.strategy))],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limit exceeded. Try again shortly.");
        if (response.status === 402) throw new Error("AI credits exhausted.");
        throw new Error("Failed to generate insights");
      }

      const result: AIInsightsResponse = await response.json();
      setAiInsights(result);
      toast.success("AI insights generated!");
    } catch (err) {
      console.error("Insights error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  // ── Derived metrics ─────────────────────────────────────────────────────

  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalUnits = salesData.reduce((s, d) => s + d.units, 0);
  const totalEngagementCount = engagement.totalLikes + engagement.totalComments + engagement.totalShares;

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Seller Analytics</h1>
            </div>
            <p className="text-muted-foreground">Performance metrics, AI insights, and MiroRL learnings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loadingData}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${loadingData ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" className="gap-1.5" onClick={generateInsights} disabled={loadingInsights}>
              {loadingInsights ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {loadingInsights ? "Analyzing..." : "Generate AI Insights"}
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue", value: fc(totalRevenue), icon: DollarSign, sub: `${salesData.length} days tracked` },
            { label: "Units Sold", value: totalUnits.toLocaleString(), icon: Package, sub: `${productCount} products` },
            { label: "Price Changes", value: priceChanges.length.toString(), icon: TrendingUp, sub: "strategies applied" },
            { label: "Engagement", value: totalEngagementCount.toLocaleString(), icon: Heart, sub: `${engagement.postsCount} posts` },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-lg font-bold truncate">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* AI Insights Panel */}
        {aiInsights && (
          <motion.div variants={item}>
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    MiroRL AI Insights
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${scoreColors[aiInsights.overallLabel]}`}>
                      {aiInsights.overallScore}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {aiInsights.overallLabel.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{aiInsights.weeklyFocus}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Learning summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3 bg-background">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Pricing Learning
                    </p>
                    <p className="text-sm">{aiInsights.pricingLearning}</p>
                  </div>
                  <div className="rounded-lg border p-3 bg-background">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Send className="h-3 w-3" /> Content Learning
                    </p>
                    <p className="text-sm">{aiInsights.contentLearning}</p>
                  </div>
                </div>

                {/* Insights list */}
                <div className="space-y-2">
                  {aiInsights.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3 bg-background">
                      <div className={`mt-0.5 ${categoryColors[insight.category]}`}>
                        {categoryIcons[insight.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{insight.title}</span>
                          <Badge variant="outline" className={`text-xs ${impactBadge[insight.impact]}`}>
                            {insight.impact}
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="secondary" className="text-xs">actionable</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="rounded-lg border p-3 bg-background">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Recommended Actions
                  </p>
                  <ol className="space-y-1 text-sm text-muted-foreground">
                    {aiInsights.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-medium text-foreground shrink-0">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Charts */}
        <motion.div variants={item}>
          <Tabs defaultValue="revenue" className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="pricing">Price History</TabsTrigger>
              </TabsList>
            </div>

            {/* Revenue Chart */}
            <TabsContent value="revenue">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue from tracked sales</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No sales data yet. Add sales performance records to see trends.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Engagement Chart */}
            <TabsContent value="engagement">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Social Engagement</CardTitle>
                  <CardDescription>Engagement metrics from published posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                      { label: "Impressions", value: engagement.totalImpressions, icon: Eye },
                      { label: "Clicks", value: engagement.totalClicks, icon: MousePointerClick },
                      { label: "Likes", value: engagement.totalLikes, icon: Heart },
                      { label: "Comments", value: engagement.totalComments, icon: MessageSquare },
                      { label: "Shares", value: engagement.totalShares, icon: Share2 },
                    ].map((m) => (
                      <div key={m.label} className="text-center p-3 rounded-lg border">
                        <m.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{m.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  {engagement.avgEngagementRate > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Avg Engagement Rate</span>
                        <span className="font-medium">{engagement.avgEngagementRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(engagement.avgEngagementRate * 10, 100)} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing History */}
            <TabsContent value="pricing">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Price Change Log</CardTitle>
                  <CardDescription>{priceChanges.length} changes recorded</CardDescription>
                </CardHeader>
                <CardContent>
                  {priceChanges.length > 0 ? (
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-2">
                        {priceChanges.map((change, i) => {
                          const diff = change.newPrice - change.oldPrice;
                          const isUp = diff > 0;
                          return (
                            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                              <div className={`shrink-0 ${isUp ? "text-emerald-600" : "text-destructive"}`}>
                                {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {fc(change.oldPrice)} <ArrowRight className="inline h-3 w-3 mx-1" /> {fc(change.newPrice)}
                                  </span>
                                  <Badge variant="outline" className="text-xs capitalize">{change.strategy}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{change.date}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No price changes recorded yet. Use the Pricing Strategy page to make changes.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Product Categories */}
        {categoryBreakdown.length > 0 && (
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Product Categories</CardTitle>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
