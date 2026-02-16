import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Settings2, Play, Loader2, Clock, Zap, MessageSquare, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface OutreachConfig {
  id: string;
  user_id: string;
  product_id: string | null;
  enabled: boolean;
  frequency_hours: number;
  message_template: string;
  max_contacts_per_run: number;
  last_run_at: string | null;
  last_run_results: any;
}

export function PriceCollectionConfig() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [config, setConfig] = useState<OutreachConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningNow, setRunningNow] = useState(false);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [frequencyHours, setFrequencyHours] = useState(6);
  const [maxContacts, setMaxContacts] = useState(10);
  const [messageTemplate, setMessageTemplate] = useState(
    "Hi, I'm interested in {{product_name}}. What's your best price for bulk orders? Current market range is {{price_range}}."
  );

  const fetchConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase
        .from("outreach_configs" as any)
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle() as any);

      if (error) throw error;

      if (data) {
        setConfig(data);
        setEnabled(data.enabled);
        setFrequencyHours(data.frequency_hours);
        setMaxContacts(data.max_contacts_per_run);
        if (data.message_template) setMessageTemplate(data.message_template);
      }
    } catch (e) {
      console.error("Failed to fetch outreach config:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        enabled,
        frequency_hours: frequencyHours,
        max_contacts_per_run: maxContacts,
        message_template: messageTemplate,
      };

      if (config) {
        const { error } = await (supabase
          .from("outreach_configs" as any)
          .update(payload)
          .eq("id", config.id)
          .eq("user_id", user.id) as any);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from("outreach_configs" as any)
          .insert(payload) as any);
        if (error) throw error;
      }

      toast({ title: t("common.success"), description: t("automation.title") });
      await fetchConfig();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const runNow = async () => {
    setRunningNow(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("auto-outreach", {
        body: { user_id: user.id },
      });

      if (error) throw error;

      toast({
        title: t("automation.collectionComplete"),
        description: `${data?.sent || 0} ${t("automation.messagesCreated")}`,
      });
      await fetchConfig();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    } finally {
      setRunningNow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Zap className={`h-5 w-5 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm text-muted-foreground">{t("automation.title")}</p>
                <p className="text-lg font-bold">{enabled ? t("automation.active") : t("automation.inactive")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t("automation.frequency")}</p>
                <p className="text-lg font-bold">{frequencyHours}h</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t("automation.lastRun")}</p>
                <p className="text-lg font-bold">
                  {config?.last_run_at
                    ? format(new Date(config.last_run_at), "PPp")
                    : t("automation.never")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Last Run Results */}
      {config?.last_run_results && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t("automation.lastRun")}:</span>
              <Badge variant="secondary">
                {config.last_run_results.messages_created || 0} {t("automation.messagesCreated")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {t("automation.title")}
          </CardTitle>
          <CardDescription>
            {t("automation.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">{t("automation.enableAutomation")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("automation.enableDescription")}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>{t("automation.frequency")}</Label>
            <Select
              value={String(frequencyHours)}
              onValueChange={(v) => setFrequencyHours(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">{t("automation.every6h")}</SelectItem>
                <SelectItem value="12">{t("automation.every12h")}</SelectItem>
                <SelectItem value="24">{t("automation.daily")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Contacts */}
          <div className="space-y-2">
            <Label>{t("automation.maxContacts")}: {maxContacts}</Label>
            <Slider
              value={[maxContacts]}
              onValueChange={(v) => setMaxContacts(v[0])}
              min={5}
              max={20}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {t("automation.maxContactsDesc")}
            </p>
          </div>

          {/* Message Template */}
          <div className="space-y-2">
            <Label>{t("automation.messageTemplate")}</Label>
            <Textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {t("automation.templateVariables")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={saveConfig} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("automation.saveSettings")}
            </Button>
            <Button
              variant="outline"
              onClick={runNow}
              disabled={runningNow}
            >
              {runningNow ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {t("automation.runNow")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
