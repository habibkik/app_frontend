import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, DollarSign, Palette, Send, ArrowRight, TrendingUp, Star, Package,
  ShoppingCart, AlertTriangle, Eye, Facebook, Instagram, Linkedin, Twitter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

// ── Mock data ──────────────────────────────────────────────

const salesTrendData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  sales: 1200 + Math.round(Math.sin(i * 0.4) * 400 + Math.random() * 300),
}));

const topProductsBarData = [
  { name: "Servo Motor XR-500", revenue: 12400 },
  { name: "Hydraulic Pump HP-200", revenue: 9800 },
  { name: "CNC Controller Board", revenue: 8200 },
  { name: "Linear Actuator LA-100", revenue: 6500 },
  { name: "Stepper Driver SD-300", revenue: 5100 },
];

const topProductsTable = [
  { name: "Servo Motor XR-500", unitsSold: 287, revenue: 12340, rating: 4.7 },
  { name: "Hydraulic Pump HP-200", unitsSold: 52, revenue: 9880, rating: 4.5 },
  { name: "CNC Controller Board", unitsSold: 9, revenue: 8028, rating: 4.8 },
  { name: "Linear Actuator LA-100", unitsSold: 131, revenue: 6500, rating: 4.3 },
  { name: "Stepper Driver SD-300", unitsSold: 204, revenue: 5100, rating: 4.1 },
];

const mockPosts = [
  { id: "1", content: "🔧 New Servo Motor XR-500 now available! High torque, low noise.", platforms: ["facebook", "instagram"], created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", content: "💡 Industrial automation tips — 5 ways to cut costs this quarter.", platforms: ["linkedin", "twitter"], created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", content: "🏭 Behind the scenes at our new testing facility.", platforms: ["instagram"], created_at: new Date(Date.now() - 172800000).toISOString() },
];

const platformIcon: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
};

// ── Key actions config ─────────────────────────────────────

const keyActions = [
  { title: "Monitor Competitors", desc: "Track pricing & stock changes", icon: Users, href: "/dashboard/competitors" },
  { title: "Optimize Pricing", desc: "AI-driven pricing strategies", icon: DollarSign, href: "/dashboard/pricing" },
  { title: "Create Content", desc: "Generate marketing assets", icon: Palette, href: "/dashboard/content-studio" },
  { title: "Publish Post", desc: "Schedule social media posts", icon: Send, href: "/dashboard/publisher" },
];

// ── Component ──────────────────────────────────────────────

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alerts } = useCompetitorMonitorStore();
  const { symbol } = useCurrency();
  const [posts, setPosts] = useState(mockPosts);

  // Try loading published posts from DB
  useEffect(() => {
    supabase
      .from("scheduled_posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPosts(data.map((p) => ({ id: p.id, content: p.content, platforms: p.platforms, created_at: p.created_at })));
        }
      });
  }, []);

  const recentAlerts = alerts.filter((a) => !a.dismissed && Date.now() - new Date(a.timestamp).getTime() < 86400000);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        {/* ── 1. Welcome Card ─────────────────────────── */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Welcome back, {user?.firstName ?? "Seller"}!</CardTitle>
              <CardDescription>Here's what's happening with your store today.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Active Products", value: "1,247", icon: Package, color: "text-primary" },
                  { label: "Sales This Month", value: `${symbol}45,800`, icon: ShoppingCart, color: "text-emerald-500" },
                  { label: "Average Rating", value: "4.2 ⭐", icon: Star, color: "text-amber-500" },
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

        {/* ── 2. Key Actions ──────────────────────────── */}
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

        {/* ── 3. Sales Performance ─────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sales Trend (30 days)</CardTitle>
                <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" /> Up 15%</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top 5 Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 4. Top Performing Products ───────────────── */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductsTable.map((p) => (
                    <TableRow key={p.name} className="cursor-pointer">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{p.unitsSold}</TableCell>
                      <TableCell className="text-right">${p.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{p.rating} ⭐</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 5 & 6. Competitor Alerts + Recent Posts ──── */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Competitor Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Competitor Alerts</CardTitle>
                <Button variant="link" size="sm" className="text-xs" onClick={() => navigate("/dashboard/competitors")}>
                  View all alerts
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAlerts.length === 0 && <p className="text-sm text-muted-foreground">No new alerts in the last 24 hours.</p>}
              {recentAlerts.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-md border p-3">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.competitorName}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{p.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {p.platforms.map((pl) => (
                        <span key={pl} className="text-muted-foreground">{platformIcon[pl] ?? pl}</span>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <Eye className="h-4 w-4 mr-1" /> Analytics
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
