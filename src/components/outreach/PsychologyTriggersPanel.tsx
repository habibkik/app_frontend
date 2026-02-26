import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const TRIGGERS = [
  { type: "Curiosity", phrase: "Are you currently supplying [industry] companies in [region]?" },
  { type: "Scarcity", phrase: "We are shortlisting 3 suppliers for long-term partnership." },
  { type: "Authority", phrase: "Our procurement team is conducting a structured sourcing program." },
  { type: "Social Proof", phrase: "We are currently working with suppliers in [region] and expanding." },
  { type: "Future Opportunity", phrase: "This project could expand to multiple locations next year." },
  { type: "Urgency", phrase: "We are finalizing supplier selection this week." },
];

export function PsychologyTriggersPanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (phrase: string, type: string) => {
    navigator.clipboard.writeText(phrase);
    setCopied(type);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Brain className="h-3.5 w-3.5" />
          Psychology Triggers
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {TRIGGERS.map((t) => (
            <Card key={t.type} className="p-3 border-border/50">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-primary">{t.type}</span>
                  <p className="text-xs text-muted-foreground mt-1 italic">"{t.phrase}"</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => handleCopy(t.phrase, t.type)}
                >
                  {copied === t.type ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
