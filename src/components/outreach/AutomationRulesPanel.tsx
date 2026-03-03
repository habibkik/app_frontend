import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus, Trash2, MessageSquareReply, PauseCircle, Bell, ArrowRight, FileText,
  XCircle, Clock, FolderInput, Mail, CalendarClock, CalendarCheck,
  MessageCircle, TrendingUp, AlertTriangle, ArrowUpCircle, Star, Eye,
  AlertCircle, Search, RefreshCw, MinusCircle, Zap, Flame, Sparkles,
} from "lucide-react";
import type { AutomationRule } from "@/stores/outreachCampaignStore";

const ALL_CHANNELS = [
  "email", "linkedin", "whatsapp", "sms", "phone_call",
  "facebook", "instagram", "tiktok", "twitter",
];

interface TriggerWorkflow {
  id: string;
  name: string;
  trigger: string;
  triggerIcon: React.ElementType;
  actions: { action: string; icon: React.ElementType }[];
  status: "active" | "inactive";
  borderColor: string;
  priority: "critical" | "high" | "medium";
}

const triggerWorkflows: TriggerWorkflow[] = [
  {
    id: "tw1", name: "Reply Received → Pause & Notify",
    trigger: "When a prospect replies to any message", triggerIcon: MessageSquareReply,
    actions: [
      { action: "Pause active sequence for this contact", icon: PauseCircle },
      { action: "Send notification to assigned rep", icon: Bell },
      { action: "Move lead to 'Engaged' stage", icon: ArrowRight },
      { action: "Log interaction in CRM", icon: FileText },
    ],
    status: "active", borderColor: "border-l-emerald-500", priority: "critical",
  },
  {
    id: "tw2", name: "No Reply → Nurture List",
    trigger: "When full sequence completes with zero replies", triggerIcon: XCircle,
    actions: [
      { action: "Wait 30 days (cooling period)", icon: Clock },
      { action: "Move to 'Nurture' segment", icon: FolderInput },
      { action: "Add to monthly newsletter", icon: Mail },
      { action: "Schedule re-engagement in 60 days", icon: CalendarClock },
    ],
    status: "active", borderColor: "border-l-amber-500", priority: "high",
  },
  {
    id: "tw3", name: "Meeting Booked → Confirm & Prepare",
    trigger: "When a prospect books a meeting via calendar link", triggerIcon: CalendarCheck,
    actions: [
      { action: "Send confirmation email with agenda", icon: Mail },
      { action: "Send WhatsApp reminder 1h before", icon: MessageCircle },
      { action: "Create meeting prep doc", icon: FileText },
      { action: "Notify sales team", icon: Bell },
    ],
    status: "active", borderColor: "border-l-primary", priority: "critical",
  },
  {
    id: "tw4", name: "Hot Lead → Fast Track",
    trigger: "When lead score crosses 80 points", triggerIcon: TrendingUp,
    actions: [
      { action: "Alert senior sales rep immediately", icon: AlertTriangle },
      { action: "Prioritize in outreach queue", icon: ArrowUpCircle },
      { action: "Send personalized high-value message", icon: Star },
      { action: "Add to VIP tracking", icon: Eye },
    ],
    status: "active", borderColor: "border-l-destructive", priority: "critical",
  },
  {
    id: "tw5", name: "Email Bounced → Clean & Re-route",
    trigger: "When an email hard bounces", triggerIcon: AlertCircle,
    actions: [
      { action: "Mark email as invalid in CRM", icon: XCircle },
      { action: "Search for alternative email", icon: Search },
      { action: "Switch to LinkedIn or WhatsApp", icon: RefreshCw },
      { action: "Update lead score (-10 points)", icon: MinusCircle },
    ],
    status: "active", borderColor: "border-l-muted-foreground", priority: "medium",
  },
  {
    id: "tw6", name: "3+ Opens → Strike While Hot",
    trigger: "When prospect opens same email 3+ times", triggerIcon: Eye,
    actions: [
      { action: "Send immediate follow-up within 1h", icon: Zap },
      { action: "Boost lead score by +15 points", icon: TrendingUp },
      { action: "Notify rep: 'High intent detected'", icon: Bell },
      { action: "Add to 'Hot Prospects' segment", icon: Flame },
    ],
    status: "active", borderColor: "border-l-orange-500", priority: "high",
  },
];

const priorityConfig = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-600" },
  medium: { label: "Medium", className: "bg-primary/10 text-primary" },
};

interface AutomationRulesPanelProps {
  rules: AutomationRule[];
  onAddRule: (rule: Omit<AutomationRule, "id" | "created_at" | "updated_at">) => void;
  onUpdateRule: (id: string, updates: Partial<AutomationRule>) => void;
  onDeleteRule: (id: string) => void;
  userId: string;
}

export function AutomationRulesPanel({ rules, onAddRule, onUpdateRule, onDeleteRule, userId }: AutomationRulesPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newChannel, setNewChannel] = useState("email");
  const [newMaxRuns, setNewMaxRuns] = useState(3);
  const [newInterval, setNewInterval] = useState(24);
  const [workflowToggles, setWorkflowToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(triggerWorkflows.map((tw) => [tw.id, tw.status === "active"]))
  );

  const handleAdd = () => {
    if (!newProductName.trim()) return;
    onAddRule({
      user_id: userId, product_name: newProductName.trim(),
      channel: newChannel, enabled: true, max_runs: newMaxRuns, interval_hours: newInterval,
    });
    setNewProductName("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Existing Automation Rules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Automation Rules</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Rule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Automation Rule</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Product Name</Label><Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="e.g. Wireless Earbuds" /></div>
                <div>
                  <Label>Channel</Label>
                  <Select value={newChannel} onValueChange={setNewChannel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ALL_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Max Runs: {newMaxRuns}</Label><Slider value={[newMaxRuns]} onValueChange={([v]) => setNewMaxRuns(v)} min={1} max={20} step={1} /></div>
                <div><Label>Interval: Every {newInterval} hours</Label><Slider value={[newInterval]} onValueChange={([v]) => setNewInterval(v)} min={1} max={168} step={1} /></div>
                <Button onClick={handleAdd} className="w-full">Add Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No automation rules configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Max Runs</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.product_name}</TableCell>
                    <TableCell>{rule.channel.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</TableCell>
                    <TableCell>{rule.max_runs}</TableCell>
                    <TableCell>{rule.interval_hours}h</TableCell>
                    <TableCell>
                      <Switch checked={rule.enabled} onCheckedChange={(checked) => onUpdateRule(rule.id, { enabled: checked })} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeleteRule(rule.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Smart Trigger Workflows */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Smart Trigger Workflows</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Automated actions triggered by prospect behavior</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {triggerWorkflows.map((tw) => {
              const TriggerIcon = tw.triggerIcon;
              const pc = priorityConfig[tw.priority];
              const isActive = workflowToggles[tw.id];
              return (
                <Card key={tw.id} className={`border-l-4 ${tw.borderColor} border-border/50 transition-all ${!isActive ? "opacity-50" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TriggerIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        <h4 className="text-sm font-medium leading-tight">{tw.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`${pc.className} text-[10px] px-1.5 py-0 border-0`}>{pc.label}</Badge>
                        <Switch checked={isActive} onCheckedChange={(v) => setWorkflowToggles((prev) => ({ ...prev, [tw.id]: v }))} />
                      </div>
                    </div>

                    {/* Trigger */}
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">WHEN</p>
                      <p className="text-xs">{tw.trigger}</p>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">THEN</p>
                      <div className="space-y-1">
                        {tw.actions.map((action, idx) => {
                          const ActionIcon = action.icon;
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="text-[10px] text-muted-foreground w-3 flex-shrink-0">{idx + 1}.</span>
                              <ActionIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span>{action.action}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button variant="outline" className="w-full mt-4 gap-1.5 text-xs" disabled>
            <Plus className="h-3.5 w-3.5" /> Create Custom Workflow (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
