import { useState, useMemo } from "react";
import { Radar, TrendingUp, Flame, MapPin, Clock, Search, Loader2, Zap, Globe, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  DEMO_DEMAND_SIGNALS,
  DEMO_TIMELINE,
  PLATFORM_META,
  type DemandSignal,
  type DemandPlatform,
  type DemandSignalTimeline,
} from "@/data/demoDemandSignals";

const ALL_PLATFORMS: DemandPlatform[] = ["facebook", "tiktok", "instagram", "google", "youtube", "pinterest", "twitter"];

const growthBadge: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  surging: { variant: "destructive", label: "🔥 Surging" },
  rising: { variant: "default", label: "📈 Rising" },
  stable: { variant: "secondary", label: "➡️ Stable" },
  declining: { variant: "outline", label: "📉 Declining" },
};

export function DemandSignalsDashboard() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<DemandPlatform[]>([...ALL_PLATFORMS]);
  const [keywords, setKeywords] = useState("");
  const [signals, setSignals] = useState<DemandSignal[]>(DEMO_DEMAND_SIGNALS);
  const [timeline, setTimeline] = useState<DemandSignalTimeline[]>(DEMO_TIMELINE);
  const [scanning, setScanning] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  const togglePlatform = (p: DemandPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const filteredSignals = useMemo(
    () => signals.filter((s) => selectedPlatforms.includes(s.platform)),
    [signals, selectedPlatforms]
  );

  const trending = filteredSignals.filter((s) => s.signalType === "trending_product");
  const niches = filteredSignals.filter((s) => s.signalType === "rising_niche");
  const hotspots = filteredSignals.filter((s) => s.signalType === "geographic_hotspot");

  const surgingCount = filteredSignals.filter((s) => s.growth === "surging").length;
  const topPlatform = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSignals.forEach((s) => { counts[s.platform] = (counts[s.platform] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as DemandPlatform | undefined;
  }, [filteredSignals]);
  const topRegion = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSignals.forEach((s) => { if (s.region) counts[s.region] = (counts[s.region] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [filteredSignals]);

  const handleScan = async () => {
    if (selectedPlatforms.length === 0) {
      toast({ title: "Select at least one platform", variant: "destructive" });
      return;
    }
    setScanning(true);
    try {
      const kw = keywords.trim().split(",").map((k) => k.trim()).filter(Boolean);
      const { data, error } = await supabase.functions.invoke("demand-signal-scan", {
        body: { platforms: selectedPlatforms, keywords: kw.length ? kw : undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.signals?.length) {
        setSignals(data.signals);
        setIsDemo(false);
      }
      if (data?.timeline?.length) setTimeline(data.timeline);
      toast({ title: "Scan complete", description: data?.summary || `Found ${data?.signals?.length || 0} signals` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Radar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Demand Signal Detection</h1>
          <p className="text-sm text-muted-foreground">
            Scan social & search platforms for trending products and rising niches
          </p>
        </div>
        {isDemo && (
          <Badge variant="outline" className="ml-auto text-xs">Demo Data</Badge>
        )}
      </div>

      {/* Platform selector + keyword + scan */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {ALL_PLATFORMS.map((p) => {
              const meta = PLATFORM_META[p];
              const active = selectedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Keywords (comma-separated, optional)..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleScan} disabled={scanning} className="gap-2">
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
              {scanning ? "Scanning…" : "Scan for Signals"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={Zap} label="Total Signals" value={filteredSignals.length} />
        <SummaryCard icon={Flame} label="Surging Trends" value={surgingCount} accent />
        <SummaryCard icon={BarChart3} label="Top Platform" value={topPlatform ? PLATFORM_META[topPlatform].label : "—"} />
        <SummaryCard icon={Globe} label="Top Region" value={topRegion || "—"} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="trending" className="gap-1"><TrendingUp className="h-3.5 w-3.5" />Trending Products ({trending.length})</TabsTrigger>
          <TabsTrigger value="niches" className="gap-1"><Flame className="h-3.5 w-3.5" />Rising Niches ({niches.length})</TabsTrigger>
          <TabsTrigger value="hotspots" className="gap-1"><MapPin className="h-3.5 w-3.5" />Geographic Hotspots ({hotspots.length})</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1"><Clock className="h-3.5 w-3.5" />Signal Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="trending">
          <SignalGrid signals={trending} />
        </TabsContent>
        <TabsContent value="niches">
          <SignalGrid signals={niches} />
        </TabsContent>
        <TabsContent value="hotspots">
          <SignalGrid signals={hotspots} />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineChart data={timeline} platforms={selectedPlatforms} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---- Sub-components ---- */

function SummaryCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${accent ? "bg-destructive/10" : "bg-muted"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SignalGrid({ signals }: { signals: DemandSignal[] }) {
  if (!signals.length) return <p className="text-center py-8 text-muted-foreground">No signals in this category.</p>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {signals.sort((a, b) => b.trendScore - a.trendScore).map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">{s.name}</CardTitle>
                  <Badge className="shrink-0 text-xs" style={{ backgroundColor: PLATFORM_META[s.platform].color, color: "#fff" }}>
                    {PLATFORM_META[s.platform].icon} {PLATFORM_META[s.platform].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{s.category}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={growthBadge[s.growth]?.variant || "secondary"}>
                    {growthBadge[s.growth]?.label || s.growth}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Score: <strong>{s.trendScore}</strong></span>
                  <span className="text-xs text-muted-foreground">Vol: {s.volume}</span>
                </div>
                {s.region && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {s.region}
                  </div>
                )}
                {s.engagementMetrics && (
                  <div className="flex gap-3 text-xs text-muted-foreground pt-1 border-t">
                    <span>{(s.engagementMetrics.mentions / 1000).toFixed(0)}k mentions</span>
                    <span>{(s.engagementMetrics.searchVolume / 1000).toFixed(0)}k searches</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 pt-1">
                  {s.keywords.slice(0, 3).map((kw) => (
                    <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function TimelineChart({ data, platforms }: { data: DemandSignalTimeline[]; platforms: DemandPlatform[] }) {
  const colors: Record<DemandPlatform, string> = {
    facebook: "#1877F2", tiktok: "#010101", instagram: "#E4405F",
    google: "#4285F4", youtube: "#FF0000", pinterest: "#E60023", twitter: "#1DA1F2",
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            {platforms.map((p) => (
              <Area
                key={p}
                type="monotone"
                dataKey={p}
                name={PLATFORM_META[p].label}
                stroke={colors[p]}
                fill={colors[p]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
