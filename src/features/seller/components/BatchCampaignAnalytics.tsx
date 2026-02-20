import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Eye, Heart, MessageSquare, Share2, MousePointerClick, Layers, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CampaignPost {
  id: string;
  platform: string;
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  content: string;
}

interface Campaign {
  batchId: string;
  posts: CampaignPost[];
  createdAt: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  whatsapp: "WhatsApp",
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "📘",
  instagram: "📸",
  tiktok: "🎵",
  linkedin: "💼",
  twitter: "𝕏",
  whatsapp: "💬",
};

export function BatchCampaignAnalytics() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch posts with batch_id
        const { data, error } = await supabase
          .from("scheduled_posts")
          .select("*")
          .eq("user_id", user.id)
          .not("batch_id" as any, "is", null)
          .order("created_at", { ascending: false })
          .limit(200);

        if (error) throw error;
        if (!data) return;

        // Group by batch_id
        const groups: Record<string, Campaign> = {};
        for (const row of data as any[]) {
          const bid = row.batch_id;
          if (!bid) continue;
          if (!groups[bid]) {
            groups[bid] = { batchId: bid, posts: [], createdAt: row.created_at };
          }
          const platform = row.platforms?.[0] || "unknown";
          groups[bid].posts.push({
            id: row.id,
            platform,
            impressions: row.total_impressions ?? 0,
            clicks: row.total_clicks ?? 0,
            likes: row.total_likes ?? 0,
            comments: row.total_comments ?? 0,
            shares: row.total_shares ?? 0,
            engagementRate: Number(row.engagement_rate ?? 0),
            content: row.content?.substring(0, 80) || "",
          });
        }

        const sorted = Object.values(groups).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setCampaigns(sorted);
        if (sorted.length > 0) setSelectedBatch(sorted[0].batchId);
      } catch (err) {
        console.error("Failed to load campaign analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const campaign = useMemo(
    () => campaigns.find((c) => c.batchId === selectedBatch),
    [campaigns, selectedBatch]
  );

  const barData = useMemo(() => {
    if (!campaign) return [];
    return campaign.posts.map((p) => ({
      platform: PLATFORM_LABELS[p.platform] || p.platform,
      Impressions: p.impressions,
      Clicks: p.clicks,
      Likes: p.likes,
      Comments: p.comments,
      Shares: p.shares,
    }));
  }, [campaign]);

  const radarData = useMemo(() => {
    if (!campaign) return [];
    const maxImp = Math.max(...campaign.posts.map((p) => p.impressions), 1);
    const maxClicks = Math.max(...campaign.posts.map((p) => p.clicks), 1);
    const maxLikes = Math.max(...campaign.posts.map((p) => p.likes), 1);
    const maxComments = Math.max(...campaign.posts.map((p) => p.comments), 1);
    const maxShares = Math.max(...campaign.posts.map((p) => p.shares), 1);

    return campaign.posts.map((p) => ({
      platform: PLATFORM_LABELS[p.platform] || p.platform,
      Impressions: Math.round((p.impressions / maxImp) * 100),
      Clicks: Math.round((p.clicks / maxClicks) * 100),
      Engagement: Math.round((p.likes / maxLikes) * 100),
      Comments: Math.round((p.comments / maxComments) * 100),
      Shares: Math.round((p.shares / maxShares) * 100),
    }));
  }, [campaign]);

  const bestPerformer = useMemo(() => {
    if (!campaign || campaign.posts.length === 0) return null;
    return campaign.posts.reduce((best, p) =>
      p.engagementRate > best.engagementRate ? p : best
    );
  }, [campaign]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Loading campaign analytics...
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No batch campaigns yet. Send posts from Content Studio using "Send All to Publisher" to create a campaign.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-primary" />
              Campaign Performance Comparison
            </CardTitle>
            <CardDescription>Compare engagement across platforms within a batch campaign</CardDescription>
          </div>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((c) => (
                <SelectItem key={c.batchId} value={c.batchId}>
                  {c.batchId} ({c.posts.length} posts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {campaign && (
          <>
            {/* Best performer banner */}
            {bestPerformer && bestPerformer.engagementRate > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    Best performer: <span className="text-primary">{PLATFORM_ICONS[bestPerformer.platform]} {PLATFORM_LABELS[bestPerformer.platform]}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bestPerformer.engagementRate.toFixed(1)}% engagement rate · {bestPerformer.impressions.toLocaleString()} impressions
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">🏆 Winner</Badge>
              </div>
            )}

            {/* Per-platform metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {campaign.posts.map((p) => (
                <div key={p.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{PLATFORM_ICONS[p.platform]}</span>
                    <span className="text-sm font-medium">{PLATFORM_LABELS[p.platform] || p.platform}</span>
                    {bestPerformer?.id === p.id && p.engagementRate > 0 && (
                      <Badge variant="outline" className="text-xs ml-auto text-primary border-primary/30">Best</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: Eye, val: p.impressions, label: "Views" },
                      { icon: MousePointerClick, val: p.clicks, label: "Clicks" },
                      { icon: Heart, val: p.likes, label: "Likes" },
                      { icon: MessageSquare, val: p.comments, label: "Comments" },
                      { icon: Share2, val: p.shares, label: "Shares" },
                    ].map((m) => (
                      <div key={m.label} className="py-1">
                        <m.icon className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                        <p className="text-sm font-bold">{m.val.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                    <div className="py-1">
                      <TrendingUp className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                      <p className="text-sm font-bold">{p.engagementRate.toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">Eng. Rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart comparison */}
            {barData.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Engagement by Platform</p>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="platform" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <Tooltip />
                      <Bar dataKey="Likes" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Comments" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Shares" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Clicks" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
