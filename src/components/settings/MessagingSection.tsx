import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MessageSquare, Check, X, ExternalLink, Settings, Phone, MessageCircle, Bot } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface MessagingPlatform {
  id: string; name: string; description: string; icon: string; connected: boolean;
  config?: { apiKey?: string; phoneNumber?: string; accountSid?: string; webhookUrl?: string };
}

const initialPlatforms: MessagingPlatform[] = [
  { id: "whatsapp", name: "WhatsApp Business", description: "Connect WhatsApp Business API for customer messaging", icon: "💬", connected: false },
  { id: "twilio", name: "Twilio", description: "SMS and voice messaging platform", icon: "📱", connected: false },
  { id: "telegram", name: "Telegram Bot", description: "Create and manage Telegram bots", icon: "✈️", connected: false },
  { id: "slack", name: "Slack", description: "Team communication and notifications", icon: "#", connected: false },
  { id: "discord", name: "Discord", description: "Community messaging and webhooks", icon: "🎮", connected: false },
  { id: "intercom", name: "Intercom", description: "Customer messaging platform", icon: "💭", connected: false },
];

interface AutoResponseSettings {
  enabled: boolean; greetingMessage: string; awayMessage: string; responseDelay: number;
}

export function MessagingSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<MessagingPlatform[]>(initialPlatforms);
  const [configuringPlatform, setConfiguringPlatform] = useState<MessagingPlatform | null>(null);
  const [autoResponse, setAutoResponse] = useState<AutoResponseSettings>({
    enabled: false,
    greetingMessage: "Hello! Thanks for reaching out. How can I help you today?",
    awayMessage: "We're currently away. We'll get back to you as soon as possible.",
    responseDelay: 5,
  });

  const [apiKey, setApiKey] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleConnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setConfiguringPlatform(platform);
      setApiKey(platform.config?.apiKey || "");
      setPhoneNumber(platform.config?.phoneNumber || "");
      setAccountSid(platform.config?.accountSid || "");
      setWebhookUrl(platform.config?.webhookUrl || "");
    }
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms(prev => prev.map(p => p.id === platformId ? { ...p, connected: false, config: undefined } : p));
    toast({ title: t("messaging.disconnected"), description: t("messaging.disconnectedDesc") });
  };

  const handleSaveConnection = () => {
    if (!configuringPlatform) return;
    if (!apiKey) {
      toast({ title: t("messaging.apiKeyRequired"), description: t("messaging.apiKeyRequiredDesc"), variant: "destructive" });
      return;
    }
    setPlatforms(prev => prev.map(p => p.id === configuringPlatform.id ? { ...p, connected: true, config: { apiKey, phoneNumber, accountSid, webhookUrl } } : p));
    setConfiguringPlatform(null);
    setApiKey(""); setPhoneNumber(""); setAccountSid(""); setWebhookUrl("");
    toast({ title: t("messaging.connected"), description: t("messaging.connectedDesc", { name: configuringPlatform.name }) });
  };

  const handleTestMessage = () => {
    toast({ title: t("messaging.testMessageSent"), description: t("messaging.testMessageSentDesc") });
  };

  const getConfigFields = (platformId: string) => {
    switch (platformId) {
      case "whatsapp": return ["apiKey", "phoneNumber"];
      case "twilio": return ["accountSid", "apiKey", "phoneNumber"];
      case "telegram": return ["apiKey"];
      case "slack": return ["apiKey", "webhookUrl"];
      case "discord": return ["webhookUrl"];
      case "intercom": return ["apiKey"];
      default: return ["apiKey"];
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />{t("messaging.title")}</CardTitle>
          <CardDescription>{t("messaging.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform, index) => (
              <motion.div key={platform.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className={`p-4 border rounded-lg ${platform.connected ? "border-primary bg-primary/5" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">{platform.icon}</div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {platform.name}
                        {platform.connected && <Badge variant="outline" className="bg-success/10 text-success text-xs">{t("messaging.active")}</Badge>}
                      </h4>
                      <p className="text-xs text-muted-foreground">{platform.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {platform.connected ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleConnect(platform.id)}>
                        <Settings className="h-4 w-4 mr-1" />{t("messaging.configure")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDisconnect(platform.id)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <Button size="sm" className="w-full" onClick={() => handleConnect(platform.id)}>{t("messaging.connect")}</Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />{t("messaging.autoResponseSettings")}</CardTitle>
          <CardDescription>{t("messaging.autoResponseSettingsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("messaging.enableAutoResponse")}</Label>
              <p className="text-sm text-muted-foreground">{t("messaging.enableAutoResponseDesc")}</p>
            </div>
            <Switch checked={autoResponse.enabled} onCheckedChange={(checked) => setAutoResponse(prev => ({ ...prev, enabled: checked }))} />
          </div>

          {autoResponse.enabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="greeting">{t("messaging.greetingMessage")}</Label>
                <Textarea id="greeting" placeholder={t("messaging.greetingPlaceholder")} value={autoResponse.greetingMessage}
                  onChange={(e) => setAutoResponse(prev => ({ ...prev, greetingMessage: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="away">{t("messaging.awayMessage")}</Label>
                <Textarea id="away" placeholder={t("messaging.awayPlaceholder")} value={autoResponse.awayMessage}
                  onChange={(e) => setAutoResponse(prev => ({ ...prev, awayMessage: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delay">{t("messaging.responseDelay")}</Label>
                <Input id="delay" type="number" min={0} max={60} value={autoResponse.responseDelay}
                  onChange={(e) => setAutoResponse(prev => ({ ...prev, responseDelay: parseInt(e.target.value) || 0 }))} className="w-24" />
              </div>
            </motion.div>
          )}

          {platforms.some(p => p.connected) && (
            <div className="pt-4 border-t">
              <Button onClick={handleTestMessage} variant="outline"><MessageCircle className="h-4 w-4 mr-2" />{t("messaging.sendTestMessage")}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!configuringPlatform} onOpenChange={() => setConfiguringPlatform(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("messaging.configureProvider", { name: configuringPlatform?.name })}</DialogTitle>
            <DialogDescription>{t("messaging.configureProviderDesc", { name: configuringPlatform?.name })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("accountSid") && (
              <div className="space-y-2">
                <Label htmlFor="account-sid">{t("messaging.accountSid")}</Label>
                <Input id="account-sid" placeholder={t("messaging.accountSidPlaceholder")} value={accountSid} onChange={(e) => setAccountSid(e.target.value)} />
              </div>
            )}
            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("apiKey") && (
              <div className="space-y-2">
                <Label htmlFor="msg-api-key">
                  {configuringPlatform.id === "telegram" ? t("messaging.botToken") : t("messaging.apiKeyAuthToken")}
                </Label>
                <Input id="msg-api-key" type="password" placeholder={t("messaging.apiKeyPlaceholder")} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </div>
            )}
            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("phoneNumber") && (
              <div className="space-y-2">
                <Label htmlFor="phone-number">{t("messaging.phoneNumber")}</Label>
                <Input id="phone-number" placeholder="+1234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
            )}
            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("webhookUrl") && (
              <div className="space-y-2">
                <Label htmlFor="webhook-url">{t("messaging.webhookUrl")}</Label>
                <Input id="webhook-url" placeholder="https://..." value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
                {t("messaging.howToGetCredentials")} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguringPlatform(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleSaveConnection}><Check className="h-4 w-4 mr-2" />{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
