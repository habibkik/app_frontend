import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  nameKey: string;
  triggerKey: string;
  triggerIcon: React.ElementType;
  actionKeys: { key: string; icon: React.ElementType }[];
  status: "active" | "inactive";
  borderColor: string;
  priority: "critical" | "high" | "medium";
}

const triggerWorkflows: TriggerWorkflow[] = [
  {
    id: "tw1", nameKey: "automationRules.tw1Name",
    triggerKey: "automationRules.tw1Trigger", triggerIcon: MessageSquareReply,
    actionKeys: [
      { key: "automationRules.tw1a1", icon: PauseCircle },
      { key: "automationRules.tw1a2", icon: Bell },
      { key: "automationRules.tw1a3", icon: ArrowRight },
      { key: "automationRules.tw1a4", icon: FileText },
    ],
    status: "active", borderColor: "border-s-emerald-500", priority: "critical",
  },
  {
    id: "tw2", nameKey: "automationRules.tw2Name",
    triggerKey: "automationRules.tw2Trigger", triggerIcon: XCircle,
    actionKeys: [
      { key: "automationRules.tw2a1", icon: Clock },
      { key: "automationRules.tw2a2", icon: FolderInput },
      { key: "automationRules.tw2a3", icon: Mail },
      { key: "automationRules.tw2a4", icon: CalendarClock },
    ],
    status: "active", borderColor: "border-s-amber-500", priority: "high",
  },
  {
    id: "tw3", nameKey: "automationRules.tw3Name",
    triggerKey: "automationRules.tw3Trigger", triggerIcon: CalendarCheck,
    actionKeys: [
      { key: "automationRules.tw3a1", icon: Mail },
      { key: "automationRules.tw3a2", icon: MessageCircle },
      { key: "automationRules.tw3a3", icon: FileText },
      { key: "automationRules.tw3a4", icon: Bell },
    ],
    status: "active", borderColor: "border-s-primary", priority: "critical",
  },
  {
    id: "tw4", nameKey: "automationRules.tw4Name",
    triggerKey: "automationRules.tw4Trigger", triggerIcon: TrendingUp,
    actionKeys: [
      { key: "automationRules.tw4a1", icon: AlertTriangle },
      { key: "automationRules.tw4a2", icon: ArrowUpCircle },
      { key: "automationRules.tw4a3", icon: Star },
      { key: "automationRules.tw4a4", icon: Eye },
    ],
    status: "active", borderColor: "border-s-destructive", priority: "critical",
  },
  {
    id: "tw5", nameKey: "automationRules.tw5Name",
    triggerKey: "automationRules.tw5Trigger", triggerIcon: AlertCircle,
    actionKeys: [
      { key: "automationRules.tw5a1", icon: XCircle },
      { key: "automationRules.tw5a2", icon: Search },
      { key: "automationRules.tw5a3", icon: RefreshCw },
      { key: "automationRules.tw5a4", icon: MinusCircle },
    ],
    status: "active", borderColor: "border-s-muted-foreground", priority: "medium",
  },
  {
    id: "tw6", nameKey: "automationRules.tw6Name",
    triggerKey: "automationRules.tw6Trigger", triggerIcon: Eye,
    actionKeys: [
      { key: "automationRules.tw6a1", icon: Zap },
      { key: "automationRules.tw6a2", icon: TrendingUp },
      { key: "automationRules.tw6a3", icon: Bell },
      { key: "automationRules.tw6a4", icon: Flame },
    ],
    status: "active", borderColor: "border-s-orange-500", priority: "high",
  },
];

const priorityKeys: Record<string, string> = {
  critical: "automationRules.critical",
  high: "automationRules.high",
  medium: "automationRules.medium",
};

const priorityConfig = {
  critical: { className: "bg-destructive/10 text-destructive" },
  high: { className: "bg-amber-500/10 text-amber-600" },
  medium: { className: "bg-primary/10 text-primary" },
};

interface AutomationRulesPanelProps {
  rules: AutomationRule[];
  onAddRule: (rule: Omit<AutomationRule, "id" | "created_at" | "updated_at">) => void;
  onUpdateRule: (id: string, updates: Partial<AutomationRule>) => void;
  onDeleteRule: (id: string) => void;
  userId: string;
}

export function AutomationRulesPanel({ rules, onAddRule, onUpdateRule, onDeleteRule, userId }: AutomationRulesPanelProps) {
  const { t } = useTranslation();
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
          <CardTitle className="text-lg">{t("automationRules.title")}</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> {t("automationRules.addRule")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("automationRules.addAutomationRule")}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>{t("automationRules.productName")}</Label><Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder={t("outreach.productNamePlaceholder")} /></div>
                <div>
                  <Label>{t("automationRules.channel")}</Label>
                  <Select value={newChannel} onValueChange={setNewChannel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ALL_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>{t("automationRules.maxRuns")}: {newMaxRuns}</Label><Slider value={[newMaxRuns]} onValueChange={([v]) => setNewMaxRuns(v)} min={1} max={20} step={1} /></div>
                <div><Label>{t("automationRules.interval")}: {t("automationRules.everyHours", { hours: newInterval })}</Label><Slider value={[newInterval]} onValueChange={([v]) => setNewInterval(v)} min={1} max={168} step={1} /></div>
                <Button onClick={handleAdd} className="w-full">{t("automationRules.addRule")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("automationRules.noRules")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("automationRules.product")}</TableHead>
                  <TableHead>{t("automationRules.channel")}</TableHead>
                  <TableHead>{t("automationRules.maxRuns")}</TableHead>
                  <TableHead>{t("automationRules.interval")}</TableHead>
                  <TableHead>{t("automationRules.enabled")}</TableHead>
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
            <CardTitle className="text-lg">{t("automationRules.smartTriggerWorkflows")}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t("automationRules.automatedActions")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {triggerWorkflows.map((tw) => {
              const TriggerIcon = tw.triggerIcon;
              const pc = priorityConfig[tw.priority];
              const isActive = workflowToggles[tw.id];
              return (
                <Card key={tw.id} className={`border-s-4 ${tw.borderColor} border-border/50 transition-all ${!isActive ? "opacity-50" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TriggerIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        <h4 className="text-sm font-medium leading-tight">{t(tw.nameKey)}</h4>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`${pc.className} text-[10px] px-1.5 py-0 border-0`}>{t(priorityKeys[tw.priority])}</Badge>
                        <Switch checked={isActive} onCheckedChange={(v) => setWorkflowToggles((prev) => ({ ...prev, [tw.id]: v }))} />
                      </div>
                    </div>

                    {/* Trigger */}
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{t("automationRules.when")}</p>
                      <p className="text-xs">{t(tw.triggerKey)}</p>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("automationRules.then")}</p>
                      <div className="space-y-1">
                        {tw.actionKeys.map((action, idx) => {
                          const ActionIcon = action.icon;
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="text-[10px] text-muted-foreground w-3 flex-shrink-0">{idx + 1}.</span>
                              <ActionIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span>{t(action.key)}</span>
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
            <Plus className="h-3.5 w-3.5" /> {t("automationRules.createCustom")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
