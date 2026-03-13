import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check, CheckCheck, Trash2, Mail, Linkedin, MessageCircle, Phone, Facebook, Instagram, Send, Twitter, Target, RefreshCw, Leaf, GitBranch, FileText, Sparkles } from "lucide-react";
import { ChannelMessageEditor } from "./ChannelMessageEditor";
import { PersonalizationScore } from "./PersonalizationScore";
import { SequenceBuilder } from "./SequenceBuilder";
import type { OutreachCampaign } from "@/stores/outreachCampaignStore";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  sms: <Phone className="h-4 w-4" />,
  phone_call: <Phone className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <Send className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", linkedin: "LinkedIn", whatsapp: "WhatsApp", sms: "SMS",
  phone_call: "Phone Call", facebook: "Facebook", instagram: "Instagram",
  tiktok: "TikTok", twitter: "Twitter/X",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-primary/10 text-primary",
  sent: "bg-emerald-500/10 text-emerald-600",
};

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  A: { label: "Tier A — Strategic", color: "bg-primary/10 text-primary" },
  B: { label: "Tier B — Operational", color: "bg-amber-500/10 text-amber-600" },
  C: { label: "Tier C — Backup", color: "bg-muted text-muted-foreground" },
};

const OBJECTIVE_BADGES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  sourcing: { label: "Sourcing", icon: <Target className="h-3 w-3" />, color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  renewal: { label: "Renewal", icon: <RefreshCw className="h-3 w-3" />, color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
  esg: { label: "ESG", icon: <Leaf className="h-3 w-3" />, color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  dual: { label: "Dual Source", icon: <GitBranch className="h-3 w-3" />, color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  "rfq-followup": { label: "RFQ Follow-up", icon: <FileText className="h-3 w-3" />, color: "bg-chart-5/10 text-chart-5 border-chart-5/20" },
  general: { label: "General", icon: <Sparkles className="h-3 w-3" />, color: "bg-muted text-muted-foreground border-border" },
};

interface OutreachCampaignCardProps {
  supplierName: string;
  campaigns: OutreachCampaign[];
  onApprove: (id: string) => void;
  onApproveAll: (ids: string[]) => void;
  onUpdateMessage: (id: string, message: string, subject?: string) => void;
  onDelete: (id: string) => void;
}

export function OutreachCampaignCard({
  supplierName,
  campaigns,
  onApprove,
  onApproveAll,
  onUpdateMessage,
  onDelete,
}: OutreachCampaignCardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("timeline");
  const draftCount = campaigns.filter((c) => c.status === "draft").length;
  const productName = campaigns[0]?.product_name;
  const tier = campaigns[0]?.supplier_tier;
  const objective = campaigns[0]?.objective;
  const objectiveBadge = objective ? OBJECTIVE_BADGES[objective] : null;
  const hasSequence = campaigns.some((c) => (c.scheduled_day || 1) > 1 || (c.sequence_step || 1) > 1);

  return (
    <Card className="border-border/50">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{supplierName}</CardTitle>
                  {tier && TIER_LABELS[tier] && (
                    <Badge className={`text-[10px] ${TIER_LABELS[tier].color}`}>{TIER_LABELS[tier].label}</Badge>
                  )}
                  {objectiveBadge && (
                    <Badge variant="outline" className={`text-[10px] gap-1 ${objectiveBadge.color}`}>
                      {objectiveBadge.icon}
                      {objectiveBadge.label}
                    </Badge>
                  )}
                </div>
                {productName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{productName}</p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {campaigns.length} channels
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {hasSequence && (
                <div className="flex border border-border rounded-md overflow-hidden">
                  <button
                    className={`px-2 py-1 text-xs ${viewMode === "timeline" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                    onClick={() => setViewMode("timeline")}
                  >Timeline</button>
                  <button
                    className={`px-2 py-1 text-xs ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                    onClick={() => setViewMode("list")}
                  >List</button>
                </div>
              )}
              {draftCount > 0 && (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1.5"
                  onClick={() => onApproveAll(campaigns.filter((c) => c.status === "draft").map((c) => c.id))}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Approve All ({draftCount})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {viewMode === "timeline" && hasSequence ? (
              <SequenceBuilder campaigns={campaigns} supplierName={supplierName} />
            ) : null}

            {/* Always show editable list */}
            {(viewMode === "list" || !hasSequence) && campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex flex-col items-center gap-1 pt-1 min-w-[80px]">
                  <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center">
                    {CHANNEL_ICONS[campaign.channel] || <Send className="h-4 w-4" />}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {CHANNEL_LABELS[campaign.channel] || campaign.channel}
                  </span>
                  {campaign.scheduled_day > 1 && (
                    <Badge variant="outline" className="text-[10px]">Day {campaign.scheduled_day}</Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <ChannelMessageEditor
                    channel={campaign.channel}
                    message={campaign.message || ""}
                    subject={campaign.subject}
                    onSave={(msg, subj) => onUpdateMessage(campaign.id, msg, subj)}
                  />
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[90px]">
                  <div className="flex items-center gap-1">
                    <Badge className={`text-xs ${STATUS_COLORS[campaign.status] || ""}`}>
                      {campaign.status}
                    </Badge>
                    <PersonalizationScore
                      message={campaign.message}
                      supplierName={supplierName}
                      productName={productName}
                    />
                  </div>
                  <div className="flex gap-1">
                    {campaign.status === "draft" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onApprove(campaign.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDelete(campaign.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
