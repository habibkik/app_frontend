import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useAnalysisStore, type SupplierDiscoveryResult } from "@/stores/analysisStore";
import { useSavedSuppliersStore } from "@/stores/savedSuppliersStore";
import { mockRFQs, statusConfig } from "@/data/rfqs";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Search, FileText, MessageSquare, Bookmark, ArrowRight,
  ShoppingCart, Users, Clock, CheckCircle2, AlertCircle, TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ── Derived data ───────────────────────────────────────────

const activeRFQs = mockRFQs.filter((r) => r.status === "pending" || r.status === "quoted");
const totalQuotes = mockRFQs.reduce((sum, r) => sum + r.quotesReceived, 0);

const rfqStatusData = (() => {
  const counts: Record<string, number> = {};
  mockRFQs.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  return Object.entries(counts).map(([status, count]) => ({ name: statusConfig[status as keyof typeof statusConfig]?.label ?? status, value: count }));
})();

const STATUS_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

const quotesByCategory = (() => {
  const map: Record<string, number> = {};
  mockRFQs.forEach((r) => { map[r.category] = (map[r.category] || 0) + r.quotesReceived; });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quotes]) => ({ name, quotes }));
})();

const mockAlerts = [
  { id: "1", type: "quote" as const, message: "3 new quotes received for \"PCB Assembly for IoT Sensors\"", timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: "2", type: "price" as const, message: "Market price dropped 8% for CNC Machined Aluminum Parts", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "3", type: "expiry" as const, message: "RFQ-2024-004 expires in 2 days — 2 quotes pending review", timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: "4", type: "supplier" as const, message: "New verified supplier matched for EV Battery Pack Components", timestamp: new Date(Date.now() - 43200000).toISOString() },
];

const alertIconMap: Record<string, React.ReactNode> = {
  quote: <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />,
  price: <TrendingUp className="h-4 w-4 mt-0.5 text-primary shrink-0" />,
  expiry: <Clock className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />,
  supplier: <Users className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />,
};

// ── Component ──────────────────────────────────────────────

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyerResults = useAnalysisStore((s) => s.buyerResults);
  const savedCount = useSavedSuppliersStore((s) => s.savedSupplierIds.size);

  const keyActions = [
    { title: t("buyerDashboard.actions.supplierSearch"), desc: t("buyerDashboard.actions.supplierSearchDesc"), icon: Search, href: "/dashboard/suppliers" },
    { title: t("buyerDashboard.actions.myRfqs"), desc: t("buyerDashboard.actions.myRfqsDesc"), icon: FileText, href: "/dashboard/rfqs" },
    { title: t("buyerDashboard.actions.conversations"), desc: t("buyerDashboard.actions.conversationsDesc"), icon: MessageSquare, href: "/dashboard/conversations" },
    { title: t("buyerDashboard.actions.savedSuppliers"), desc: t("buyerDashboard.actions.savedSuppliersDesc"), icon: Bookmark, href: "/dashboard/saved" },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t("buyerDashboard.welcome", { name: user?.firstName ?? "Buyer" })}</CardTitle>
              <CardDescription>{t("buyerDashboard.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: t("buyerDashboard.stats.activeRfqs"), value: String(activeRFQs.length), icon: ShoppingCart, color: "text-primary" },
                  { label: t("buyerDashboard.stats.quotesReceived"), value: String(totalQuotes), icon: FileText, color: "text-emerald-500" },
                  { label: t("buyerDashboard.stats.savedSuppliers"), value: String(savedCount), icon: Bookmark, color: "text-amber-500" },
                ].map((s) => (
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("buyerDashboard.sections.rfqStatus")}</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rfqStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {rfqStatusData.map((_, idx) => (<Cell key={idx} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("buyerDashboard.sections.quotesByCategory")}</CardTitle>
                <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" /> {totalQuotes} {t("buyerDashboard.total")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quotesByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Bar dataKey="quotes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {buyerResults && (
          <motion.div variants={item}>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t("buyerDashboard.sections.latestDiscovery")}</CardTitle>
                  <Badge variant="secondary">{Math.round(buyerResults.confidence * 100)}% {t("buyerDashboard.confidence")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("buyerDashboard.product")}</p>
                    <p className="font-semibold">{buyerResults.productIdentification.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("buyerDashboard.suppliersFound")}</p>
                    <p className="font-semibold">{buyerResults.suggestedSuppliers.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("buyerDashboard.estMarketPrice")}</p>
                    <p className="font-semibold">${buyerResults.estimatedMarketPrice.min} – ${buyerResults.estimatedMarketPrice.max}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/dashboard/suppliers")}>
                  {t("buyerDashboard.buttons.viewSuppliers")} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("buyerDashboard.sections.activeRfqs")}</CardTitle>
                <Button variant="link" size="sm" className="text-xs" onClick={() => navigate("/dashboard/rfqs")}>
                  {t("buyerDashboard.buttons.viewAllRfqs")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("buyerDashboard.tables.title")}</TableHead>
                    <TableHead>{t("buyerDashboard.tables.category")}</TableHead>
                    <TableHead className="text-right">{t("buyerDashboard.tables.quotes")}</TableHead>
                    <TableHead className="text-right">{t("buyerDashboard.tables.status")}</TableHead>
                    <TableHead className="text-right">{t("buyerDashboard.tables.expires")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRFQs.slice(0, 5).map((r) => {
                    const cfg = statusConfig[r.status];
                    return (
                      <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate("/dashboard/rfqs")}>
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell className="text-right">{r.quotesReceived}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{r.expiresAt}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("buyerDashboard.sections.sourcingAlerts")}</CardTitle>
                <Button variant="link" size="sm" className="text-xs" onClick={() => navigate("/dashboard/suppliers")}>
                  {t("buyerDashboard.buttons.viewSupplierSearch")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-md border p-3">
                  {alertIconMap[a.type]}
                  <div className="min-w-0">
                    <p className="text-sm">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                    </p>
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