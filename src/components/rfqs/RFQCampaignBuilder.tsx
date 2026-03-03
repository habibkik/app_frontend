import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Search, Users, MessageSquare, Send, Check, ChevronRight, ChevronLeft,
  Mail, Phone, MessageCircle, ArrowRight, Linkedin, Facebook, Instagram, Twitter, Youtube, Video, Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MOCK_SUPPLIERS = [
  { id: "1", name: "Shanghai Steel Co.", email: true, whatsapp: true, phone: true },
  { id: "2", name: "Gujarat Textiles Ltd.", email: true, whatsapp: false, phone: true },
  { id: "3", name: "Bavaria Machinery GmbH", email: true, whatsapp: true, phone: false },
  { id: "4", name: "Istanbul Ceramics", email: true, whatsapp: true, phone: true },
  { id: "5", name: "São Paulo Plastics", email: true, whatsapp: false, phone: false },
];

const CHANNEL_TEMPLATES: Record<string, { quick: string; bulk: string }> = {
  email: {
    quick: "Dear {{supplier_name}},\n\nWe are interested in {{product_name}}. Could you please send us a quote for {{quantity}} units with delivery by {{desired_delivery}}?\n\nWe look forward to your prompt response.\n\nBest regards",
    bulk: "Dear {{supplier_name}},\n\nWe are looking to place a bulk order for {{product_name}}. Required quantity: {{quantity}} units.\n\nPlease include volume discounts, delivery timeline to reach us by {{desired_delivery}}, and payment terms.\n\nThank you",
  },
  linkedin: {
    quick: "Hi {{supplier_name}}, we're sourcing {{product_name}} ({{quantity}} units, needed by {{desired_delivery}}). Would you be open to providing a quote? Looking forward to connecting.",
    bulk: "Hi {{supplier_name}}, we're evaluating partners for a bulk order of {{product_name}} — {{quantity}} units by {{desired_delivery}}. Could we discuss volume pricing and terms?",
  },
  whatsapp: {
    quick: "Hi {{supplier_name}}! 👋 We need a quote for {{product_name}}, qty {{quantity}}, delivery by {{desired_delivery}}. Can you help?",
    bulk: "Hi {{supplier_name}}! We're sourcing {{product_name}} in bulk — {{quantity}} units by {{desired_delivery}}. Could you share pricing & MOQ? Thanks! 🙏",
  },
  sms: {
    quick: "{{supplier_name}}: Quote needed for {{product_name}}, {{quantity}} units by {{desired_delivery}}. Reply or call us.",
    bulk: "{{supplier_name}}: Bulk inquiry — {{product_name}}, {{quantity}} units by {{desired_delivery}}. Volume pricing? Reply to discuss.",
  },
  phone: {
    quick: "Call script — Introduce yourself, mention interest in {{product_name}}, request quote for {{quantity}} units with delivery by {{desired_delivery}}. Ask about lead times and payment terms.",
    bulk: "Call script — Introduce yourself, explain bulk requirement for {{product_name}} ({{quantity}} units by {{desired_delivery}}). Discuss volume discounts, MOQ, logistics, and payment terms.",
  },
  telegram: {
    quick: "Hi {{supplier_name}}! We're looking for {{product_name}} — {{quantity}} units by {{desired_delivery}}. Could you share a quote?",
    bulk: "Hi {{supplier_name}}! Bulk order inquiry: {{product_name}}, {{quantity}} units needed by {{desired_delivery}}. Volume pricing available? 📦",
  },
  facebook: {
    quick: "Hello {{supplier_name}}, we're interested in {{product_name}}. Could you provide a quote for {{quantity}} units by {{desired_delivery}}? Thanks!",
    bulk: "Hello {{supplier_name}}, we need {{product_name}} in bulk — {{quantity}} units by {{desired_delivery}}. Can you share volume pricing and delivery options?",
  },
  instagram: {
    quick: "Hi {{supplier_name}}! 👋 Interested in {{product_name}}. Need {{quantity}} units by {{desired_delivery}}. DM us a quote?",
    bulk: "Hi {{supplier_name}}! Looking for bulk supply of {{product_name}} ({{quantity}} units by {{desired_delivery}}). Can you share pricing? 📩",
  },
  twitter: {
    quick: "Hi @{{supplier_name}}, interested in {{product_name}} — {{quantity}} units by {{desired_delivery}}. Can you DM us a quote?",
    bulk: "@{{supplier_name}} Bulk inquiry: {{product_name}}, {{quantity}} units by {{desired_delivery}}. Volume pricing? Let's connect via DM.",
  },
  tiktok: {
    quick: "Hi {{supplier_name}}! Saw your products — need a quote for {{product_name}}, {{quantity}} units by {{desired_delivery}} 🙏",
    bulk: "Hi {{supplier_name}}! Bulk inquiry for {{product_name}} — {{quantity}} units by {{desired_delivery}}. Volume deals? Let's chat! 📦",
  },
  youtube: {
    quick: "Hi {{supplier_name}}, we're interested in {{product_name}} ({{quantity}} units by {{desired_delivery}}). Could you share pricing details?",
    bulk: "Hi {{supplier_name}}, bulk sourcing inquiry for {{product_name}} — {{quantity}} units by {{desired_delivery}}. Please share volume pricing and lead times.",
  },
  pinterest: {
    quick: "Hi {{supplier_name}}, love your {{product_name}}! Need {{quantity}} units by {{desired_delivery}}. Can you send a quote?",
    bulk: "Hi {{supplier_name}}, bulk inquiry for {{product_name}} — {{quantity}} units by {{desired_delivery}}. Volume pricing available?",
  },
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", whatsapp: "WhatsApp", phone: "Phone", linkedin: "LinkedIn",
  sms: "SMS", facebook: "Facebook", instagram: "Instagram", twitter: "Twitter/X",
  telegram: "Telegram", tiktok: "TikTok", youtube: "YouTube", pinterest: "Pinterest",
};

const getTemplateForChannel = (channel: string, tplType: string): string => {
  const ch = CHANNEL_TEMPLATES[channel] || CHANNEL_TEMPLATES.email;
  if (tplType === "bulk") return ch.bulk;
  if (tplType === "custom") return "";
  return ch.quick;
};

const VARIABLES = ["{{supplier_name}}", "{{product_name}}", "{{quantity}}", "{{desired_delivery}}"];

export function RFQCampaignBuilder() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [template, setTemplate] = useState("quick");
  const [channelMessages, setChannelMessages] = useState<Record<string, string>>({
    email: getTemplateForChannel("email", "quick"),
  });
  const [activeChannel, setActiveChannel] = useState("email");
  const [emailSubject, setEmailSubject] = useState("");
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [confirmed, setConfirmed] = useState(false);

  // Sync channel messages when channels change
  useEffect(() => {
    setChannelMessages((prev) => {
      const next: Record<string, string> = {};
      for (const ch of channels) {
        next[ch] = prev[ch] ?? getTemplateForChannel(ch, template);
      }
      return next;
    });
    if (!channels.includes(activeChannel) && channels.length > 0) {
      setActiveChannel(channels[0]);
    }
  }, [channels]);

  const filteredSuppliers = MOCK_SUPPLIERS.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSupplier = (id: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    const next: Record<string, string> = {};
    for (const ch of channels) {
      next[ch] = getTemplateForChannel(ch, val);
    }
    setChannelMessages(next);
  };

  const insertVariable = (v: string) => {
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: (prev[activeChannel] || "") + " " + v,
    }));
  };

  const handleSend = () => {
    toast({
      title: t("rfqCampaign.sentTitle"),
      description: t("rfqCampaign.sentDesc", { count: selectedSuppliers.length }),
    });
    setStep(1);
    setSelectedSuppliers([]);
    setTemplate("quick");
    setChannelMessages({ email: getTemplateForChannel("email", "quick") });
    setChannels(["email"]);
    setActiveChannel("email");
    setConfirmed(false);
  };

  // Reorder: 1-Suppliers, 2-Channels, 3-Messages, 4-Review
  const steps = [
    { num: 1, label: t("rfqCampaign.step1"), icon: Users },
    { num: 2, label: t("rfqCampaign.step3"), icon: Send },
    { num: 3, label: t("rfqCampaign.step2"), icon: MessageSquare },
    { num: 4, label: t("rfqCampaign.step4"), icon: Check },
  ];

  const canNext = () => {
    if (step === 1) return selectedSuppliers.length > 0;
    if (step === 2) return channels.length > 0;
    if (step === 3) return Object.values(channelMessages).some((m) => m.trim().length > 0);
    if (step === 4) return confirmed;
    return false;
  };

  const currentMsg = channelMessages[activeChannel] || "";

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              step === s.num ? "bg-primary text-primary-foreground" :
              step > s.num ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("rfqCampaign.selectSuppliers")}</CardTitle>
              <CardDescription>{t("rfqCampaign.selectSuppliersDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("rfqCampaign.searchSuppliers")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              {selectedSuppliers.length > 0 && (
                <Badge variant="secondary">{t("rfqCampaign.selectedCount", { count: selectedSuppliers.length })}</Badge>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredSuppliers.map((sup) => (
                  <div key={sup.id} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedSuppliers.includes(sup.id) ? "border-primary bg-primary/5" : "hover:bg-muted"
                  )} onClick={() => toggleSupplier(sup.id)}>
                    <Checkbox checked={selectedSuppliers.includes(sup.id)} />
                    <span className="font-medium flex-1">{sup.name}</span>
                    <div className="flex gap-1">
                      {sup.email && <Mail className="h-3 w-3 text-muted-foreground" />}
                      {sup.whatsapp && <MessageCircle className="h-3 w-3 text-muted-foreground" />}
                      {sup.phone && <Phone className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("rfqCampaign.selectChannels")}</CardTitle>
              <CardDescription>{t("rfqCampaign.selectChannelsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "email", label: t("rfqCampaign.channelEmail"), icon: Mail },
                { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                { id: "phone", label: t("rfqCampaign.channelPhone"), icon: Phone },
                { id: "linkedin", label: "LinkedIn", icon: Linkedin },
                { id: "sms", label: "SMS", icon: MessageSquare },
                { id: "facebook", label: "Facebook", icon: Facebook },
                { id: "instagram", label: "Instagram", icon: Instagram },
                { id: "twitter", label: "Twitter / X", icon: Twitter },
                { id: "telegram", label: "Telegram", icon: Send },
                { id: "tiktok", label: "TikTok", icon: Video },
                { id: "youtube", label: "YouTube", icon: Youtube },
                { id: "pinterest", label: "Pinterest", icon: Globe },
              ].map((ch) => (
                <div key={ch.id} className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  channels.includes(ch.id) ? "border-primary bg-primary/5" : "hover:bg-muted"
                )} onClick={() => toggleChannel(ch.id)}>
                  <Checkbox checked={channels.includes(ch.id)} />
                  <ch.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{ch.label}</span>
                </div>
              ))}
              {channels.includes("email") && (
                <div className="pt-2">
                  <label className="text-sm font-medium mb-1 block">{t("rfqCampaign.emailSubject")}</label>
                  <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder={t("rfqCampaign.emailSubjectPlaceholder")} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("rfqCampaign.customizeMessage")}</CardTitle>
              <CardDescription>Each channel has an auto-adapted message. Switch tabs to customize per channel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">{t("rfqCampaign.templateQuick")}</SelectItem>
                  <SelectItem value="bulk">{t("rfqCampaign.templateBulk")}</SelectItem>
                  <SelectItem value="custom">{t("rfqCampaign.templateCustom")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Channel tabs */}
              <div className="flex flex-wrap gap-1.5 border-b pb-2">
                {channels.map((ch) => (
                  <Button
                    key={ch}
                    variant={activeChannel === ch ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveChannel(ch)}
                    className="text-xs"
                  >
                    {CHANNEL_LABELS[ch] || ch}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((v) => (
                  <Button key={v} variant="outline" size="sm" onClick={() => insertVariable(v)}>{v}</Button>
                ))}
              </div>
              <Textarea
                value={currentMsg}
                onChange={(e) => setChannelMessages((prev) => ({ ...prev, [activeChannel]: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{currentMsg.length} {t("common.characters")}</p>
                <Badge variant="outline" className="text-xs">{CHANNEL_LABELS[activeChannel]}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("rfqCampaign.reviewSend")}</CardTitle>
              <CardDescription>{t("rfqCampaign.reviewSendDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{selectedSuppliers.length}</p>
                  <p className="text-sm text-muted-foreground">{t("rfqCampaign.suppliers")}</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{channels.length}</p>
                  <p className="text-sm text-muted-foreground">{t("rfqCampaign.channels")}</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{Object.keys(channelMessages).length}</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
              </div>
              {/* Per-channel preview */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {channels.map((ch) => (
                  <div key={ch} className="bg-muted rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary mb-1">{CHANNEL_LABELS[ch]}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(channelMessages[ch] || "").slice(0, 150)}{(channelMessages[ch] || "").length > 150 ? "..." : ""}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2" onClick={() => setConfirmed(!confirmed)}>
                <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} />
                <span className="text-sm cursor-pointer">{t("rfqCampaign.confirmAccurate")}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
          <ChevronLeft className="h-4 w-4 mr-1" />{t("common.back")}
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            {t("common.next")}<ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={!confirmed}>
            <Send className="h-4 w-4 mr-1" />{t("rfqCampaign.sendRfq")}
          </Button>
        )}
      </div>
    </div>
  );
}