import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Inbox, Zap, BarChart3, Rocket, UserPlus, Heart,
  FlaskConical, Trash2, KanbanSquare, TrendingUp, Settings, Users,
  RotateCcw, ChevronDown, Flame, Clock,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ChecklistItem {
  id: string;
  task: string;
  description: string;
  timeBlock: "morning" | "midday" | "afternoon" | "weekly";
  icon: React.ElementType;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
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

export function DailyWorkflowChecklist() {
  const dateKey = getDateKey();
  const weekKey = getWeekKey();
  const [checkedDaily, setCheckedDaily] = useLocalStorage<Record<string, boolean>>(`outreach-checklist-${dateKey}`, {});
  const [checkedWeekly, setCheckedWeekly] = useLocalStorage<Record<string, boolean>>(`outreach-checklist-week-${weekKey}`, {});
  const [streak, setStreak] = useLocalStorage<number>("outreach-streak", 0);
  const [lastStreakDate, setLastStreakDate] = useLocalStorage<string>("outreach-streak-date", "");
  const [collapsed, setCollapsed] = useState(false);

  const isChecked = useCallback((item: ChecklistItem) => {
    return item.timeBlock === "weekly" ? !!checkedWeekly[item.id] : !!checkedDaily[item.id];
  }, [checkedDaily, checkedWeekly]);

  const toggle = useCallback((item: ChecklistItem) => {
    if (item.timeBlock === "weekly") {
      setCheckedWeekly((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
    } else {
      const next = { ...checkedDaily, [item.id]: !checkedDaily[item.id] };
      setCheckedDaily(next);
      // Check streak
      const dailyItems = dailyChecklist.filter((i) => i.timeBlock !== "weekly");
      const allDone = dailyItems.every((i) => next[i.id]);
      if (allDone && lastStreakDate !== dateKey) {
        setStreak(streak + 1);
        setLastStreakDate(dateKey);
      }
    }
  }, [checkedDaily, checkedWeekly, dateKey, lastStreakDate, streak, setCheckedDaily, setCheckedWeekly, setStreak, setLastStreakDate]);

  const resetDay = () => setCheckedDaily({});

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
              <CardTitle className="text-base">Daily Workflow</CardTitle>
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
                <div className="space-y-1.5">
                  {block.items.map((item) => {
                    const checked = isChecked(item);
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                          checked
                            ? "bg-muted/50 border-border/20 opacity-60"
                            : "border-border/40 hover:bg-muted/30"
                        }`}
                        onClick={() => toggle(item)}
                      >
                        <Checkbox checked={checked} className="flex-shrink-0" />
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityDot[item.priority]}`} />
                        <ItemIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${checked ? "line-through text-muted-foreground" : ""}`}>{item.task}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.estimatedMinutes}min</span>
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
