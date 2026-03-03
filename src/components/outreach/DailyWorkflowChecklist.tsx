import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Inbox, Zap, BarChart3, Rocket, UserPlus, Heart,
  FlaskConical, Trash2, KanbanSquare, TrendingUp, Settings, Users,
  RotateCcw, ChevronDown, Flame, Clock, Play, Check, X, Sparkles, SkipForward,
  CheckCircle2, Lightbulb, ArrowRight,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  task: string;
  description: string;
  timeBlock: "morning" | "midday" | "afternoon" | "weekly";
  icon: React.ElementType;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
}

interface AIResult {
  summary: string;
  recommendations: string[];
  suggestedActions: { label: string; detail: string }[];
}

interface OutreachCampaign {
  id: string;
  supplier_id: string;
  supplier_name: string;
  channel: string;
  status: string;
  message: string | null;
  response_received: string | null;
  product_name: string | null;
  response_channel: string | null;
  updated_at: string;
  [key: string]: any;
}

interface DailyWorkflowChecklistProps {
  campaigns?: OutreachCampaign[];
}

const dailyChecklist: ChecklistItem[] = [
  { id: "m1", task: "Check unified inbox for replies", description: "Review all channel inboxes — prioritize warm leads", timeBlock: "morning", icon: Inbox, priority: "high", estimatedMinutes: 15 },
  { id: "m2", task: "Respond to warm leads", description: "Reply within 5 minutes to interested prospects", timeBlock: "morning", icon: Zap, priority: "high", estimatedMinutes: 20 },
  { id: "m3", task: "Review analytics dashboard", description: "Check open rates, reply rates, bounce rates", timeBlock: "morning", icon: BarChart3, priority: "medium", estimatedMinutes: 10 },
  { id: "d1", task: "Launch new outreach sequences", description: "Start today's batch across all active channels", timeBlock: "midday", icon: Rocket, priority: "high", estimatedMinutes: 20 },
  { id: "d2", task: "Add new leads to database", description: "Import from Apollo, LinkedIn, referrals. Verify emails.", timeBlock: "midday", icon: UserPlus, priority: "medium", estimatedMinutes: 25 },
  { id: "d3", task: "Social media engagement", description: "Like, comment, share posts from prospects", timeBlock: "midday", icon: Heart, priority: "medium", estimatedMinutes: 15 },
  { id: "a1", task: "A/B test new message templates", description: "Create variants of top-performing templates", timeBlock: "afternoon", icon: FlaskConical, priority: "medium", estimatedMinutes: 20 },
  { id: "a2", task: "Clean bounced & invalid contacts", description: "Remove hard bounces and invalid numbers", timeBlock: "afternoon", icon: Trash2, priority: "low", estimatedMinutes: 15 },
  { id: "a3", task: "Update CRM pipeline", description: "Move leads through stages, update notes", timeBlock: "afternoon", icon: KanbanSquare, priority: "medium", estimatedMinutes: 15 },
  { id: "w1", task: "Review weekly performance metrics", description: "Compare this week vs last. Identify winners.", timeBlock: "weekly", icon: TrendingUp, priority: "high", estimatedMinutes: 30 },
  { id: "w2", task: "Optimize underperforming channels", description: "Pause channels with <5% reply rate", timeBlock: "weekly", icon: Settings, priority: "high", estimatedMinutes: 25 },
  { id: "w3", task: "Team sync meeting", description: "Share insights, blockers, and wins", timeBlock: "weekly", icon: Users, priority: "high", estimatedMinutes: 30 },
];

const timeBlocks = [
  { key: "morning" as const, label: "🌅 Morning", items: dailyChecklist.filter((i) => i.timeBlock === "morning") },
  { key: "midday" as const, label: "☀️ Midday", items: dailyChecklist.filter((i) => i.timeBlock === "midday") },
  { key: "afternoon" as const, label: "🌇 Afternoon", items: dailyChecklist.filter((i) => i.timeBlock === "afternoon") },
  { key: "weekly" as const, label: "📅 Weekly", items: dailyChecklist.filter((i) => i.timeBlock === "weekly") },
];

const priorityDot: Record<string, string> = {
  high: "bg-destructive", medium: "bg-amber-500", low: "bg-emerald-500",
};

function getDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekKey() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function DailyWorkflowChecklist({ campaigns = [] }: DailyWorkflowChecklistProps) {
  const dateKey = getDateKey();
  const weekKey = getWeekKey();
  const [checkedDaily, setCheckedDaily] = useLocalStorage<Record<string, boolean>>(`outreach-checklist-${dateKey}`, {});
  const [checkedWeekly, setCheckedWeekly] = useLocalStorage<Record<string, boolean>>(`outreach-checklist-week-${weekKey}`, {});
  const [streak, setStreak] = useLocalStorage<number>("outreach-streak", 0);
  const [lastStreakDate, setLastStreakDate] = useLocalStorage<string>("outreach-streak-date", "");
  const [collapsed, setCollapsed] = useState(false);

  // AI state
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, AIResult>>({});
  const [approvedAt, setApprovedAt] = useState<Record<string, string>>({});

  const aiContext = useMemo(() => {
    const channelBreakdown: Record<string, number> = {};
    campaigns.forEach((c) => {
      channelBreakdown[c.channel] = (channelBreakdown[c.channel] || 0) + 1;
    });
    const uniqueSuppliers = [...new Set(campaigns.map((c) => c.supplier_name))];
    return {
      totalCampaigns: campaigns.length,
      draftCount: campaigns.filter((c) => c.status === "draft").length,
      sentCount: campaigns.filter((c) => c.status === "sent" || c.status === "approved").length,
      responsesReceived: campaigns.filter((c) => c.response_received).length,
      channelBreakdown,
      topSuppliers: uniqueSuppliers.slice(0, 5),
      totalSuppliers: uniqueSuppliers.length,
    };
  }, [campaigns]);

  const isChecked = useCallback((item: ChecklistItem) => {
    return item.timeBlock === "weekly" ? !!checkedWeekly[item.id] : !!checkedDaily[item.id];
  }, [checkedDaily, checkedWeekly]);

  const markComplete = useCallback((item: ChecklistItem) => {
    if (item.timeBlock === "weekly") {
      setCheckedWeekly((prev) => ({ ...prev, [item.id]: true }));
    } else {
      const next = { ...checkedDaily, [item.id]: true };
      setCheckedDaily(next);
      const dailyItems = dailyChecklist.filter((i) => i.timeBlock !== "weekly");
      const allDone = dailyItems.every((i) => next[i.id]);
      if (allDone && lastStreakDate !== dateKey) {
        setStreak(streak + 1);
        setLastStreakDate(dateKey);
      }
    }
  }, [checkedDaily, checkedWeekly, dateKey, lastStreakDate, streak, setCheckedDaily, setCheckedWeekly, setStreak, setLastStreakDate]);

  const runAI = useCallback(async (item: ChecklistItem) => {
    setLoadingTasks((prev) => ({ ...prev, [item.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("workflow-ai-task", {
        body: { taskId: item.id, context: aiContext },
      });

      if (error) {
        console.error("AI task error:", error);
        toast.error("AI analysis failed. Please try again.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setAiResults((prev) => ({ ...prev, [item.id]: data as AIResult }));
    } catch (e) {
      console.error("AI task exception:", e);
      toast.error("Failed to run AI analysis.");
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [item.id]: false }));
    }
  }, [aiContext]);

  const approveTask = useCallback((item: ChecklistItem) => {
    markComplete(item);
    setApprovedAt((prev) => ({ ...prev, [item.id]: new Date().toLocaleTimeString() }));
    setAiResults((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    toast.success(`"${item.task}" approved & completed`);
  }, [markComplete]);

  const dismissTask = useCallback((item: ChecklistItem) => {
    setAiResults((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  }, []);

  const skipTask = useCallback((item: ChecklistItem) => {
    markComplete(item);
    toast.info(`"${item.task}" skipped`);
  }, [markComplete]);

  const resetDay = () => {
    setCheckedDaily({});
    setAiResults({});
    setApprovedAt({});
  };

  const dailyItems = dailyChecklist.filter((i) => i.timeBlock !== "weekly");
  const completedCount = dailyItems.filter((i) => checkedDaily[i.id]).length;
  const totalDailyItems = dailyItems.length;
  const progress = totalDailyItems > 0 ? Math.round((completedCount / totalDailyItems) * 100) : 0;
  const remainingMinutes = dailyItems.filter((i) => !checkedDaily[i.id]).reduce((sum, i) => sum + i.estimatedMinutes, 0);

  return (
    <Collapsible open={!collapsed} onOpenChange={(o) => setCollapsed(!o)}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Daily Workflow
              </CardTitle>
              <Badge variant="outline" className="text-xs">{completedCount}/{totalDailyItems} done</Badge>
              {streak > 0 && <Badge className="bg-orange-500/10 text-orange-600 border-0 text-xs gap-1"><Flame className="h-3 w-3" />{streak}-day streak!</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> ~{remainingMinutes}min left</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${!collapsed ? "rotate-180" : ""}`} />
            </div>
          </CollapsibleTrigger>
          <Progress value={progress} className="h-1.5 mt-2" />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {timeBlocks.map((block) => (
              <div key={block.key}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{block.label}</p>
                <div className="space-y-2">
                  {block.items.map((item) => {
                    const checked = isChecked(item);
                    const loading = !!loadingTasks[item.id];
                    const result = aiResults[item.id];
                    const approved = approvedAt[item.id];
                    const ItemIcon = item.icon;

                    // Completed state
                    if (checked) {
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/50 border-border/20 opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityDot[item.priority]}`} />
                          <ItemIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium line-through text-muted-foreground">{item.task}</p>
                          </div>
                          {approved && (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 gap-1">
                              <Check className="h-2.5 w-2.5" /> Approved {approved}
                            </Badge>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={item.id} className="rounded-lg border border-border/40 overflow-hidden">
                        {/* Task header */}
                        <div className="flex items-center gap-3 p-2.5">
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityDot[item.priority]}`} />
                          <ItemIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{item.task}</p>
                            <p className="text-[10px] text-muted-foreground">{item.description}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.estimatedMinutes}min</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!loading && !result && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs gap-1.5 px-3"
                                  onClick={() => runAI(item)}
                                >
                                  <Play className="h-3 w-3" /> Run AI
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs gap-1 px-2 text-muted-foreground"
                                  onClick={() => skipTask(item)}
                                >
                                  <SkipForward className="h-3 w-3" /> Skip
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Loading state */}
                        {loading && (
                          <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-3">
                            <div className="flex items-center gap-2 text-xs text-primary">
                              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                              AI analyzing your outreach data...
                            </div>
                            <Skeleton className="h-16 w-full rounded" />
                            <Skeleton className="h-4 w-3/4 rounded" />
                            <Skeleton className="h-4 w-1/2 rounded" />
                          </div>
                        )}

                        {/* AI Result state */}
                        {result && !loading && (
                          <div className="border-t border-border/30 bg-muted/20">
                            <div className="p-3 space-y-3">
                              {/* Summary */}
                              <div className="bg-background/80 rounded-lg p-3 border border-border/30">
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                                  <Sparkles className="h-3 w-3 text-primary" /> AI Analysis
                                </p>
                                <p className="text-sm leading-relaxed">{result.summary}</p>
                              </div>

                              {/* Recommendations */}
                              {result.recommendations?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                    <Lightbulb className="h-3 w-3" /> Recommendations
                                  </p>
                                  <ul className="space-y-1">
                                    {result.recommendations.map((rec, i) => (
                                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                                        <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Suggested Actions */}
                              {result.suggestedActions?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {result.suggestedActions.map((action, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs cursor-default"
                                      title={action.detail}
                                    >
                                      {action.label}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Validation buttons */}
                              <div className="flex items-center gap-2 pt-1">
                                <Button
                                  size="sm"
                                  className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => approveTask(item)}
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve & Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs gap-1.5 text-muted-foreground"
                                  onClick={() => dismissTask(item)}
                                >
                                  <X className="h-3.5 w-3.5" /> Dismiss
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs w-full" onClick={resetDay}>
              <RotateCcw className="h-3 w-3" /> Reset Day
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
