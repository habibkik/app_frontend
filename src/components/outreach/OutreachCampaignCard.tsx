import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check, CheckCheck, Trash2, Mail, Linkedin, MessageCircle, Phone, Facebook, Instagram, Send, Twitter } from "lucide-react";
import { ChannelMessageEditor } from "./ChannelMessageEditor";
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
  email: "Email",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  sms: "SMS",
  phone_call: "Phone Call",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "Twitter/X",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-primary/10 text-primary",
  sent: "bg-emerald-500/10 text-emerald-600",
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
  const [open, setOpen] = useState(true);
  const draftCount = campaigns.filter((c) => c.status === "draft").length;
  const productName = campaigns[0]?.product_name;

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
                <CardTitle className="text-base">{supplierName}</CardTitle>
                {productName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{productName}</p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {campaigns.length} channels
              </Badge>
            </div>
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
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {campaigns.map((campaign) => (
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
                  <Badge className={`text-xs ${STATUS_COLORS[campaign.status] || ""}`}>
                    {campaign.status}
                  </Badge>
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
