import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useAnalysisStore, type BOMAnalysisResult } from "@/stores/analysisStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Factory, Package, Wrench, Rocket, ArrowRight, AlertTriangle, CheckCircle2, Clock, DollarSign, Layers, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ── Mock data (unchanged) ──────────────────────────────────

const costBreakdownData = [
  { name: "Components", value: 45 },
  { name: "Labor", value: 25 },
  { name: "Logistics", value: 15 },
  { name: "Overhead", value: 15 },
];

const COST_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const defaultRecentBOMs = [
  { name: "Servo Motor XR-500", components: 24, cost: 2840, feasibility: 82, updated: new Date(Date.now() - 3600000).toISOString() },
  { name: "Hydraulic Pump HP-200", components: 18, cost: 1560, feasibility: 71, updated: new Date(Date.now() - 86400000).toISOString() },
  { name: "CNC Controller Board", components: 42, cost: 4200, feasibility: 88, updated: new Date(Date.now() - 172800000).toISOString() },
  { name: "Linear Actuator LA-100", components: 15, cost: 980, feasibility: 65, updated: new Date(Date.now() - 259200000).toISOString() },
  { name: "Stepper Driver SD-300", components: 31, cost: 1750, feasibility: 79, updated: new Date(Date.now() - 345600000).toISOString() },
];

const componentCostBarData = [
  { name: "Bearings", cost: 12400 },
  { name: "PCBs", cost: 9800 },
  { name: "Motors", cost: 8200 },
  { name: "Housings", cost: 6500 },
  { name: "Connectors", cost: 3100 },
];

const mockAlerts = [
  { id: "1", type: "risk" as const, message: "Single-supplier risk for high-torque bearings — only 1 verified source", timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: "2", type: "cost" as const, message: "PCB costs increased 12% across 3 suppliers this quarter", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "3", type: "lead" as const, message: "Motor lead times extended to 8 weeks from primary supplier", timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: "4", type: "feasibility" as const, message: "Feasibility score for CNC Controller improved to 88 after adding alternate supplier", timestamp: new Date(Date.now() - 43200000).toISOString() },
];

const alertIconMap: Record<string, React.ReactNode> = {
  risk: <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />,
  cost: <TrendingDown className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />,
  lead: <Clock className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />,
  feasibility: <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />,
};

function getFeasibilityBadge(score: number) {
  if (score >= 80) return <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 border-emerald-200">{score}</Badge>;
  if (score >= 60) return <Badge variant="default" className="bg-amber-500/15 text-amber-600 border-amber-200">{score}</Badge>;
  return <Badge variant="destructive">{score}</Badge>;
}

export default function ProducerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const producerResults = useAnalysisStore((s) => s.producerResults);
  const { symbol } = useCurrency();
  const fc = useFormatCurrency();
  const [recentBOMs, setRecentBOMs] = useState(defaultRecentBOMs);

  // Load real BOM analyses from database
  useEffect(() => {
    if (!user?.id) return;
    const loadBOMs = async () => {
      const { data } = await supabase
        .from("bom_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data && data.length > 0) {
        const realBOMs = data.map((b: any) => ({
          name: b.product_name,
          components: Array.isArray(b.components_json) ? (b.components_json as any[]).length : 0,
          cost: Array.isArray(b.components_json) ? (b.components_json as any[]).reduce((s: number, c: any) => s + (c.totalCost || 0), 0) : 0,
          feasibility: Math.round(Number(b.confidence) || 0),
          updated: b.created_at,
        }));
        setRecentBOMs(realBOMs);
      }
    };
    loadBOMs();
  }, [user?.id]);

  const productionStats = [
    { label: t("producerDashboard.stats.activeBoms"), value: "18", icon: Layers, color: "text-primary" },
    { label: t("producerDashboard.stats.componentsTracked"), value: "342", icon: Package, color: "text-amber-500" },
    { label: t("producerDashboard.stats.avgFeasibility"), value: "76/100", icon: Factory, color: "text-emerald-500" },
  ];

  const keyActions = [
    { title: t("producerDashboard.actions.reverseEngineering"), desc: t("producerDashboard.actions.reverseEngineeringDesc"), icon: Wrench, href: "/dashboard/bom" },
    { title: t("producerDashboard.actions.componentSupply"), desc: t("producerDashboard.actions.componentSupplyDesc"), icon: Package, href: "/dashboard/components" },
    { title: t("producerDashboard.actions.feasibility"), desc: t("producerDashboard.actions.feasibilityDesc"), icon: Factory, href: "/dashboard/feasibility" },
    { title: t("producerDashboard.actions.gtm"), desc: t("producerDashboard.actions.gtmDesc"), icon: Rocket, href: "/dashboard/gtm" },
  ];

  const bomSummary = producerResults ? { name: producerResults.productName, components: producerResults.components.length, cost: producerResults.totalEstimatedCost, confidence: producerResults.overallConfidence } : null;

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t("producerDashboard.welcome", { name: user?.firstName ?? "Producer" })}</CardTitle>
              <CardDescription>{t("producerDashboard.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {productionStats.map((s) => (
                  <Card key={s.label} className="bg-muted/40">
                    <CardContent className="flex items-center gap-3 p-4">
                      <s.icon className={`h-8 w-8 ${s.color}`} />
                      <div>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                        <p className="text-lg font-semibold">{s.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyActions.map((a) => (
            <Card key={a.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(a.href)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <a.icon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{t("producerDashboard.sections.costBreakdown")}</CardTitle></CardHeader>
            <CardContent className="h-[260px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costBreakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {costBreakdownData.map((_, idx) => (<Cell key={idx} fill={COST_COLORS[idx % COST_COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("producerDashboard.sections.topComponentSpend")}</CardTitle>
                <Badge variant="secondary" className="gap-1"><DollarSign className="h-3 w-3" /> {fc(40000)} {t("producerDashboard.total")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={componentCostBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {bomSummary && (
          <motion.div variants={item}>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t("producerDashboard.sections.latestBomAnalysis")}</CardTitle>
                  <Badge variant="secondary">{Math.round(bomSummary.confidence * 100)}% {t("producerDashboard.confidence")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><p className="text-sm text-muted-foreground">{t("producerDashboard.tables.product")}</p><p className="font-semibold">{bomSummary.name}</p></div>
                  <div><p className="text-sm text-muted-foreground">{t("producerDashboard.componentsIdentified")}</p><p className="font-semibold">{bomSummary.components}</p></div>
                  <div><p className="text-sm text-muted-foreground">{t("producerDashboard.estTotalCost")}</p><p className="font-semibold">{fc(bomSummary.cost)}</p></div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/dashboard/bom")}>
                  {t("producerDashboard.buttons.viewFullBom")} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{t("producerDashboard.sections.recentBoms")}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("producerDashboard.tables.product")}</TableHead>
                    <TableHead className="text-right">{t("producerDashboard.tables.components")}</TableHead>
                    <TableHead className="text-right">{t("producerDashboard.tables.estCost")}</TableHead>
                    <TableHead className="text-right">{t("producerDashboard.tables.feasibility")}</TableHead>
                    <TableHead className="text-right">{t("producerDashboard.tables.updated")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBOMs.map((b) => (
                    <TableRow key={b.name} className="cursor-pointer" onClick={() => navigate("/dashboard/bom")}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-right">{b.components}</TableCell>
                      <TableCell className="text-right">{fc(b.cost)}</TableCell>
                      <TableCell className="text-right">{getFeasibilityBadge(b.feasibility)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(b.updated), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("producerDashboard.sections.supplyChainAlerts")}</CardTitle>
                <Button variant="link" size="sm" className="text-xs" onClick={() => navigate("/dashboard/feasibility")}>{t("producerDashboard.buttons.viewFeasibility")}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-md border p-3">
                  {alertIconMap[a.type]}
                  <div className="min-w-0">
                    <p className="text-sm">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
