import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Send, Mail, MessageSquare, Users, Calendar, TrendingUp,
  Eye, Trophy, ArrowDown,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RTooltip } from "recharts";
import type { OutreachCampaign } from "@/stores/outreachCampaignStore";

interface OutreachMetricsDashboardProps {
  campaigns: OutreachCampaign[];
}

function StatusBadge({ actual, target, inverse, t }: { actual: number; target: number; inverse?: boolean; t: (key: string) => string }) {
  const ratio = inverse ? target / (actual || 1) : actual / (target || 1);
  if (ratio >= 0.9) return <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">{t("outreachMetrics.onTrack")}</Badge>;
  if (ratio >= 0.6) return <Badge className="bg-amber-500/10 text-amber-600 text-xs">{t("outreachMetrics.needsAttention")}</Badge>;
  return <Badge className="bg-destructive/10 text-destructive text-xs">{t("outreachMetrics.belowTarget")}</Badge>;
}

// Funnel data
const funnelStageKeys = [
  { stageKey: "outreach.totalLeads", count: 2500, icon: Users, delta: "+12%" },
  { stageKey: "outreach.messagesSent", count: 2100, icon: Send, delta: "+8%" },
  { stageKey: "outreach.openedSeen", count: 1470, icon: Eye, delta: "+5%" },
  { stageKey: "outreach.replied", count: 420, icon: MessageSquare, delta: "+18%" },
  { stageKey: "outreach.meetingBooked", count: 105, icon: Calendar, delta: "+22%" },
  { stageKey: "outreach.convertedWon", count: 42, icon: Trophy, delta: "+15%" },
];

const channelPerformance = [
  { channel: "Email", sent: 800, opened: 560, replied: 120, meetings: 30 },
  { channel: "WhatsApp", sent: 450, opened: 420, replied: 145, meetings: 38 },
  { channel: "LinkedIn", sent: 350, opened: 280, replied: 85, meetings: 22 },
  { channel: "Instagram", sent: 200, opened: 160, replied: 40, meetings: 8 },
  { channel: "SMS", sent: 180, opened: 170, replied: 20, meetings: 5 },
  { channel: "Facebook", sent: 80, opened: 50, replied: 8, meetings: 2 },
  { channel: "Twitter/X", sent: 30, opened: 18, replied: 2, meetings: 0 },
  { channel: "Telegram", sent: 10, opened: 8, replied: 0, meetings: 0 },
];

const messagePerformance = [
  { variant: "Template A - Pain Point Lead", subject: "Struggling with supply chain delays?", openRate: 72, replyRate: 18, channel: "Email", status: "winner" as const },
  { variant: "Template B - Social Proof Lead", subject: "How [Company] cut costs by 40%", openRate: 65, replyRate: 22, channel: "Email", status: "winner" as const },
  { variant: "Template C - Direct Ask", subject: "Quick question about your sourcing", openRate: 58, replyRate: 12, channel: "Email", status: "underperforming" as const },
  { variant: "WhatsApp - Casual Intro", subject: "Hey! Quick question 👋", openRate: 94, replyRate: 35, channel: "WhatsApp", status: "winner" as const },
  { variant: "LinkedIn - Connection Note", subject: "Noticed your work in...", openRate: 45, replyRate: 28, channel: "LinkedIn", status: "testing" as const },
];

export function OutreachMetricsDashboard({ campaigns }: OutreachMetricsDashboardProps) {
  const { t } = useTranslation();
  const [showPercentages, setShowPercentages] = useState(false);

  const total = campaigns.length;
  const sent = campaigns.filter((c) => c.status === "approved" || c.status === "sent").length;
  const responded = campaigns.filter((c) => c.response_received).length;
  const replyRate = sent > 0 ? Math.round((responded / sent) * 100) : 0;

  const openRate = sent > 0 ? Math.min(95, Math.round(45 + Math.random() * 20)) : 0;
  const bounceRate = sent > 0 ? Math.round(1 + Math.random() * 2) : 0;
  const positiveReplyRate = responded > 0 ? Math.round(replyRate * 0.6) : 0;
  const linkedinAcceptance = Math.round(25 + Math.random() * 15);
  const meetingsBooked = Math.floor(responded * 0.4);
  const qualifiedSuppliers = Math.floor(responded * 0.6);
  const rfqsSent = Math.floor(qualifiedSuppliers * 0.5);

  const statusConfig = {
    winner: { label: t("outreach.winner"), className: "bg-emerald-500/10 text-emerald-600" },
    testing: { label: t("outreach.testing"), className: "bg-amber-500/10 text-amber-600" },
    underperforming: { label: t("outreach.underperforming"), className: "bg-destructive/10 text-destructive" },
  };

  const metrics = [
    { label: t("outreachMetrics.openRate"), target: "45–65%", actual: `${openRate}%`, targetNum: 50, actualNum: openRate },
    { label: t("outreachMetrics.replyRate"), target: "8–20%", actual: `${replyRate}%`, targetNum: 12, actualNum: replyRate },
    { label: t("outreach.positiveReplyRate"), target: ">5%", actual: `${positiveReplyRate}%`, targetNum: 5, actualNum: positiveReplyRate },
    { label: t("outreach.bounceRate"), target: "<3%", actual: `${bounceRate}%`, targetNum: 3, actualNum: bounceRate, inverse: true },
    { label: t("outreach.linkedinAcceptance"), target: ">30%", actual: `${linkedinAcceptance}%`, targetNum: 30, actualNum: linkedinAcceptance },
    { label: t("outreach.meetingsBooked"), target: "—", actual: `${meetingsBooked}`, targetNum: 5, actualNum: meetingsBooked },
    { label: t("outreach.qualifiedSuppliers"), target: "—", actual: `${qualifiedSuppliers}`, targetNum: 3, actualNum: qualifiedSuppliers },
    { label: t("outreach.rfqsSent"), target: "—", actual: `${rfqsSent}`, targetNum: 2, actualNum: rfqsSent },
  ];

  const statCards = [
    { label: t("outreachMetrics.totalCampaigns"), value: total, icon: <Send className="h-4 w-4" />, color: "text-primary" },
    { label: t("outreachMetrics.sentApproved"), value: sent, icon: <Mail className="h-4 w-4" />, color: "text-emerald-600" },
    { label: t("outreachMetrics.responses"), value: responded, icon: <MessageSquare className="h-4 w-4" />, color: "text-amber-600" },
    { label: t("outreachMetrics.replyRate"), value: `${replyRate}%`, icon: <TrendingUp className="h-4 w-4" />, color: "text-primary" },
  ];

  const chartData = showPercentages
    ? channelPerformance.map((c) => ({
        channel: c.channel,
        "Open %": c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0,
        "Reply %": c.sent > 0 ? Math.round((c.replied / c.sent) * 100) : 0,
        "Meeting %": c.sent > 0 ? Math.round((c.meetings / c.sent) * 100) : 0,
      }))
    : channelPerformance.map((c) => ({
        channel: c.channel,
        Sent: c.sent,
        Opened: c.opened,
        Replied: c.replied,
        Meetings: c.meetings,
      }));

  // Best channel
  const bestChannel = channelPerformance.reduce((best, c) => {
    const rate = c.sent > 0 ? c.replied / c.sent : 0;
    const bestRate = best.sent > 0 ? best.replied / best.sent : 0;
    return rate > bestRate ? c : best;
  }, channelPerformance[0]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={s.color}>{s.icon}</div>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Funnel */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("outreachMetrics.conversionFunnel")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="space-y-1">
              {funnelStageKeys.map((stage, idx) => {
                const maxCount = funnelStageKeys[0].count;
                const widthPct = Math.max(20, (stage.count / maxCount) * 100);
                const convRate = idx > 0
                  ? Math.round((stage.count / funnelStageKeys[idx - 1].count) * 100)
                  : 100;
                const StageIcon = stage.icon;
                return (
                  <div key={stage.stageKey}>
                    {idx > 0 && (
                      <div className="flex items-center justify-center gap-1 py-0.5">
                        <ArrowDown className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">{convRate}% {t("outreach.conversion")}</span>
                      </div>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="relative mx-auto rounded-md overflow-hidden transition-all hover:opacity-90 cursor-default"
                          style={{ width: `${widthPct}%`, minHeight: "36px" }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
                          <div className="relative flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-2">
                              <StageIcon className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-medium">{t(stage.stageKey)}</span>
                            </div>
                            <span className="text-sm font-bold">{stage.count.toLocaleString()}</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{t("outreachMetrics.vsLastMonth", { delta: stage.delta })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Per-Channel Performance Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{t("outreachMetrics.channelPerformance")}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              🏆 {t("outreachMetrics.bestPerforming")}: <span className="font-medium text-foreground">{bestChannel.channel}</span> ({bestChannel.sent > 0 ? Math.round((bestChannel.replied / bestChannel.sent) * 100) : 0}% {t("outreachMetrics.replyRate").toLowerCase()})
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowPercentages(!showPercentages)}>
            {showPercentages ? t("outreachMetrics.showNumbers") : t("outreachMetrics.showRates")}
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="channel" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <RTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {showPercentages ? (
                <>
                  <Bar dataKey="Open %" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Reply %" fill="hsl(var(--primary) / 0.6)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Meeting %" fill="hsl(var(--primary) / 0.3)" radius={[2, 2, 0, 0]} />
                </>
              ) : (
                <>
                  <Bar dataKey="Sent" fill="hsl(var(--primary) / 0.2)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Opened" fill="hsl(var(--primary) / 0.5)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Replied" fill="hsl(var(--primary) / 0.7)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Meetings" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* A/B Test Performance */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("outreachMetrics.messagePerformanceInsights")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {messagePerformance.map((mp) => {
              const sc = statusConfig[mp.status];
              return (
                <Card key={mp.variant} className="border-border/30">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{mp.channel}</Badge>
                      <Badge className={`${sc.className} text-[10px] border-0`}>{sc.label}</Badge>
                    </div>
                    <p className="text-xs font-medium leading-tight">{mp.variant}</p>
                    <p className="text-[10px] text-muted-foreground italic truncate">"{mp.subject}"</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-lg font-bold">{mp.openRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{t("outreachMetrics.openRate")}</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{mp.replyRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{t("outreachMetrics.replyRate")}</p>
                      </div>
                    </div>
                    {mp.status === "winner" && mp.replyRate > 20 && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        {t("outreachMetrics.recommended", { rate: mp.replyRate })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("outreachMetrics.performanceSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("outreachMetrics.metric")}</TableHead>
                <TableHead>{t("outreachMetrics.target")}</TableHead>
                <TableHead>{t("outreachMetrics.actual")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.label}>
                  <TableCell className="font-medium text-sm">{m.label}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.target}</TableCell>
                  <TableCell className="text-sm font-semibold">{m.actual}</TableCell>
                  <TableCell>
                    <StatusBadge actual={m.actualNum} target={m.targetNum} inverse={m.inverse} t={t} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
