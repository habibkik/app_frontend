import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Mail, MessageCircle, Linkedin, Instagram, Phone, Shield,
  UserCheck, Flame, Smartphone, Clock, FlaskConical, Repeat, Layers, Trash2,
  AlertTriangle, Info,
} from "lucide-react";

interface ComplianceRule {
  rule: string;
  description: string;
  severity: "critical" | "high" | "recommended";
}

interface ComplianceSection {
  title: string;
  icon: React.ElementType;
  rules: ComplianceRule[];
}

const severityConfig = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-600 border-amber-300/20" },
  recommended: { label: "Recommended", className: "bg-primary/10 text-primary border-primary/20" },
};

const complianceSections: ComplianceSection[] = [
  {
    title: "Email Compliance", icon: Mail,
    rules: [
      { rule: "CAN-SPAM Act (US)", description: "Must include physical address, unsubscribe link, honest subject lines. Violations: up to $46,517 per email.", severity: "critical" },
      { rule: "GDPR (EU/UK)", description: "Requires explicit consent or legitimate interest. Right to erasure. Must have privacy policy.", severity: "critical" },
      { rule: "CASL (Canada)", description: "Express or implied consent required. Must identify sender clearly.", severity: "high" },
      { rule: "Domain Warm-up", description: "New domains: start with 20 emails/day, increase by 10-20% daily over 2-4 weeks.", severity: "recommended" },
    ],
  },
  {
    title: "WhatsApp Compliance", icon: MessageCircle,
    rules: [
      { rule: "Opt-in Required", description: "Users must explicitly opt-in before receiving messages. No cold messaging on WhatsApp Business API.", severity: "critical" },
      { rule: "Template Approval", description: "Marketing templates must be approved by Meta before sending. Allow 24-48 hours.", severity: "high" },
      { rule: "24-Hour Window", description: "Free-form messages only within 24 hours of user's last message. Outside: use approved templates only.", severity: "critical" },
      { rule: "Quality Rating", description: "Maintain high quality rating. Too many blocks/reports = restricted.", severity: "high" },
    ],
  },
  {
    title: "LinkedIn Compliance", icon: Linkedin,
    rules: [
      { rule: "Connection Limit", description: "Maximum ~100 connection requests per week. Exceeding triggers restrictions or account ban.", severity: "critical" },
      { rule: "Message Limit", description: "InMail: 50/month (Premium). Regular messages: unlimited to connections only.", severity: "high" },
      { rule: "Profile View Limit", description: "~80-150 profile views per day on Sales Navigator. Pace throughout the day.", severity: "recommended" },
      { rule: "No Automation Detection", description: "LinkedIn actively detects automation tools. Use human-like delays (30-90 sec between actions).", severity: "critical" },
    ],
  },
  {
    title: "Instagram & Facebook", icon: Instagram,
    rules: [
      { rule: "DM Limits", description: "New accounts: 20-30 DMs/day. Established: 50-80/day. Exceeding triggers temp ban.", severity: "high" },
      { rule: "ManyChat Compliance", description: "Automated DMs must be triggered by user action (comment, keyword). No unsolicited bulk DMs.", severity: "critical" },
      { rule: "Content Guidelines", description: "No misleading claims, no engagement bait that violates community guidelines.", severity: "high" },
    ],
  },
  {
    title: "SMS Compliance", icon: Phone,
    rules: [
      { rule: "TCPA (US)", description: "Prior express written consent required. Must include opt-out. Violations: $500-$1,500 per message.", severity: "critical" },
      { rule: "10DLC Registration", description: "US SMS requires 10DLC campaign registration. Unregistered numbers get filtered.", severity: "critical" },
    ],
  },
];

interface BestPractice {
  practice: string;
  icon: React.ElementType;
  status: "active" | "warning";
  tip: string;
}

const bestPractices: BestPractice[] = [
  { practice: "Personalize 20%+ of message", icon: UserCheck, status: "active", tip: "Use first name, company name, recent activity, or mutual connection in every message" },
  { practice: "Warm up email domains", icon: Flame, status: "active", tip: "Use warm-up tools for 2-4 weeks before outreach" },
  { practice: "Mobile-friendly content", icon: Smartphone, status: "active", tip: "Keep subject lines <40 chars, preview text <90 chars, single CTA" },
  { practice: "Send at optimal times", icon: Clock, status: "active", tip: "Email: Tue-Thu 8-10am. WhatsApp: 10am-12pm. LinkedIn: 7-9am" },
  { practice: "A/B test everything", icon: FlaskConical, status: "active", tip: "Test subject lines, opening lines, CTAs. Minimum 50 sends per variant" },
  { practice: "Follow up 4-7 times", icon: Repeat, status: "active", tip: "80% of deals close after 5+ touchpoints. Space 2-4 days apart." },
  { practice: "Multi-channel approach", icon: Layers, status: "active", tip: "Use 3+ channels per prospect. Email + LinkedIn + WhatsApp = highest conversion." },
  { practice: "Clean list monthly", icon: Trash2, status: "warning", tip: "Remove bounced emails, disconnected numbers, unresponsive leads every 30 days" },
];

export function ComplianceBestPractices() {
  return (
    <div className="space-y-4">
      {/* Compliance Accordion */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Channel Compliance Rules</h3>
          </div>
          <Accordion type="multiple" className="w-full">
            {complianceSections.map((section, idx) => {
              const SIcon = section.icon;
              return (
                <AccordionItem key={idx} value={`s-${idx}`} className="border-border/30">
                  <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <SIcon className="h-4 w-4 text-muted-foreground" />
                      {section.title}
                      <Badge variant="outline" className="text-[10px] ml-1">{section.rules.length} rules</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {section.rules.map((rule, rIdx) => {
                        const sev = severityConfig[rule.severity];
                        return (
                          <div key={rIdx} className="flex items-start gap-2 text-xs p-2 rounded bg-background border border-border/30">
                            <Badge className={`${sev.className} text-[10px] px-1.5 py-0 border flex-shrink-0 mt-0.5`}>{sev.label}</Badge>
                            <div>
                              <p className="font-medium">{rule.rule}</p>
                              <p className="text-muted-foreground mt-0.5">{rule.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Best Practices Grid */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Best Practices</h3>
          </div>
          <TooltipProvider>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {bestPractices.map((bp, idx) => {
                const BpIcon = bp.icon;
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors cursor-help">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${bp.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <BpIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{bp.practice}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px]">
                      <p className="text-xs">{bp.tip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
