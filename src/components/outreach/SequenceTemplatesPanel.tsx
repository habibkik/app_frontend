import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LayoutTemplate, Mail, Linkedin, Phone, Send, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  duration: string;
  touches: number;
  steps: { day: number; channel: string; label: string }[];
}

const TEMPLATES: SequenceTemplate[] = [
  {
    id: "supplier-sourcing", name: "Supplier Sourcing", description: "Identify, qualify, and shortlist new suppliers",
    duration: "15–18 days", touches: 6,
    steps: [
      { day: 1, channel: "email", label: "Introduction Email" },
      { day: 3, channel: "linkedin", label: "LinkedIn Connection" },
      { day: 5, channel: "email", label: "Follow-up + Qualification" },
      { day: 8, channel: "phone_call", label: "Phone Call" },
      { day: 12, channel: "email", label: "Value Add Email" },
      { day: 16, channel: "email", label: "Breakup Email" },
    ],
  },
  {
    id: "contract-renewal", name: "Contract Renewal Leverage", description: "Create competitive pressure before renegotiation",
    duration: "10–14 days", touches: 3,
    steps: [
      { day: 1, channel: "email", label: "Soft Market Check" },
      { day: 5, channel: "email", label: "Competitor Benchmarking" },
      { day: 10, channel: "linkedin", label: "LinkedIn Touch" },
    ],
  },
  {
    id: "esg-compliance", name: "ESG Compliance", description: "Request updated certifications from suppliers",
    duration: "12 days", touches: 3,
    steps: [
      { day: 1, channel: "email", label: "Certification Request" },
      { day: 5, channel: "email", label: "Reminder" },
      { day: 12, channel: "phone_call", label: "Escalation Call" },
    ],
  },
  {
    id: "dual-sourcing", name: "Dual Sourcing", description: "Find and qualify backup supplier",
    duration: "14 days", touches: 4,
    steps: [
      { day: 1, channel: "email", label: "Capability Inquiry" },
      { day: 3, channel: "linkedin", label: "LinkedIn Connect" },
      { day: 7, channel: "email", label: "Qualification Follow-up" },
      { day: 14, channel: "email", label: "RFQ Invitation" },
    ],
  },
];

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  email: <Mail className="h-3 w-3" />,
  linkedin: <Linkedin className="h-3 w-3" />,
  phone_call: <Phone className="h-3 w-3" />,
};

interface SequenceTemplatesPanelProps {
  onApplyTemplate: (template: SequenceTemplate) => void;
}

export function SequenceTemplatesPanel({ onApplyTemplate }: SequenceTemplatesPanelProps) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <LayoutTemplate className="h-3.5 w-3.5" />
          {t("sequenceTemplates.templates")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("sequenceTemplates.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {TEMPLATES.map((tmpl) => (
            <Card key={tmpl.id} className="p-4 border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-sm">{tmpl.name}</h4>
                  <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{t("sequenceTemplates.touches", { count: tmpl.touches })}</Badge>
                  <Badge variant="outline" className="text-xs">{tmpl.duration}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap mb-3">
                {tmpl.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1">
                      {CHANNEL_ICON[step.channel] || <Send className="h-3 w-3" />}
                      <span className="text-[10px]">D{step.day}</span>
                    </div>
                    {i < tmpl.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
              <Button size="sm" variant="default" onClick={() => onApplyTemplate(tmpl)} className="w-full">
                {t("sequenceTemplates.applyTemplate")}
              </Button>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}