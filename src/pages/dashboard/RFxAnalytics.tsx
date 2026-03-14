import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, DollarSign, TrendingUp, Users, FileText, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/features/dashboard";
import { mockRFQs, mockSupplierQuotes, statusConfig } from "@/data/rfqs";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
];

export default function RFxAnalytics() {
  const fc = useFormatCurrency();

  const stats = useMemo(() => {
    const totalRFQs = mockRFQs.length;
    const awarded = mockRFQs.filter((r) => r.status === "awarded").length;
    const quoted = mockRFQs.filter((r) => r.status === "quoted").length;
    const pending = mockRFQs.filter((r) => r.status === "pending").length;

    const totalQuotes = Object.values(mockSupplierQuotes).flat().length;
    const avgQuotesPerRFQ = totalQuotes / Math.max(totalRFQs, 1);

    // Calculate average savings from target vs best quote
    let totalSavings = 0;
    mockRFQs.forEach((rfq) => {
      const quotes = mockSupplierQuotes[rfq.id];
      if (quotes?.length && rfq.targetPrice) {
        const bestPrice = Math.min(...quotes.map((q) => q.unitPrice));
        if (bestPrice < rfq.targetPrice) {
          totalSavings += (rfq.targetPrice - bestPrice) * rfq.quantity;
        }
      }
    });

    // Avg lead time
    const allQuotes = Object.values(mockSupplierQuotes).flat();
    const avgLeadTime = allQuotes.length
      ? Math.round(allQuotes.reduce((s, q) => s + q.leadTimeDays, 0) / allQuotes.length)
      : 0;

    return {
      totalRFQs,
      awarded,
      quoted,
      pending,
      totalQuotes,
      avgQuotesPerRFQ: avgQuotesPerRFQ.toFixed(1),
      totalSavings,
      avgLeadTime,
      winRate: totalRFQs ? Math.round((awarded / totalRFQs) * 100) : 0,
    };
  }, []);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    mockRFQs.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: statusConfig[status as keyof typeof statusConfig]?.label || status,
      value: count,
    }));
  }, []);

  const categorySpend = useMemo(() => {
    const spend: Record<string, number> = {};
    mockRFQs.forEach((r) => {
      const val = (r.targetPrice || 0) * r.quantity;
      spend[r.category] = (spend[r.category] || 0) + val;
    });
    return Object.entries(spend)
      .map(([cat, val]) => ({ category: cat, spend: val }))
      .sort((a, b) => b.spend - a.spend);
  }, []);

  const monthlyTrend = useMemo(() => {
    const months: Record<string, number> = {};
    mockRFQs.forEach((r) => {
      const month = r.createdAt.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months)
      .sort()
      .map(([month, count]) => ({ month: month.slice(5), rfqs: count }));
  }, []);

  const kpis = [
    { label: "Total RFx", value: stats.totalRFQs, icon: FileText, color: "text-primary" },
    { label: "Award Rate", value: `${stats.winRate}%`, icon: TrendingUp, color: "text-success" },
    { label: "Total Savings", value: fc(stats.totalSavings), icon: DollarSign, color: "text-chart-2" },
    { label: "Avg Lead Time", value: `${stats.avgLeadTime} days`, icon: Clock, color: "text-warning" },
    { label: "Quotes Received", value: stats.totalQuotes, icon: Users, color: "text-chart-3" },
    { label: "Avg Quotes/RFQ", value: stats.avgQuotesPerRFQ, icon: BarChart3, color: "text-chart-4" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">RFx Analytics</h1>
          <p className="text-sm text-muted-foreground">Procurement performance insights and KPIs</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-3">
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                    <p className="text-xl font-bold mt-1">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" /> RFx by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {statusDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> RFx Creation Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip />
                    <Line type="monotone" dataKey="rfqs" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Spend */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Spend by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySpend} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip formatter={(val: number) => fc(val)} />
                    <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
