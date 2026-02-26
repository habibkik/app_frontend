import { Badge } from "@/components/ui/badge";
import { Mail, Linkedin, MessageCircle, Phone, Send } from "lucide-react";
import type { OutreachCampaign } from "@/stores/outreachCampaignStore";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  linkedin: <Linkedin className="h-3.5 w-3.5" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  phone_call: <Phone className="h-3.5 w-3.5" />,
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-primary/10 text-primary",
  sent: "bg-emerald-500/10 text-emerald-600",
};

interface SequenceBuilderProps {
  campaigns: OutreachCampaign[];
  supplierName: string;
}

export function SequenceBuilder({ campaigns, supplierName }: SequenceBuilderProps) {
  const sorted = [...campaigns].sort((a, b) => (a.sequence_step || 1) - (b.sequence_step || 1));

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        Sequence Timeline — {sorted.length} touches
      </h4>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-border" />

        <div className="space-y-2">
          {sorted.map((c, i) => (
            <div key={c.id} className="flex items-start gap-3 relative">
              {/* Step circle */}
              <div className="relative z-10 h-9 w-9 rounded-full bg-background border-2 border-border flex items-center justify-center flex-shrink-0">
                {CHANNEL_ICON[c.channel] || <Send className="h-3.5 w-3.5" />}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Day {c.scheduled_day || (i + 1)}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                    {c.channel}
                  </Badge>
                  <Badge className={`text-[10px] h-4 px-1.5 ${STATUS_COLORS[c.status] || ""}`}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {c.message?.slice(0, 80) || "No message"}
                  {(c.message?.length || 0) > 80 ? "..." : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
