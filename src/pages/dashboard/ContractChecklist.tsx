import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ClipboardCheck, ChevronDown, Copy, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContractClause {
  id: string;
  name: string;
  description: string;
  keyPoints: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

const clauses: ContractClause[] = [
  {
    id: "price-protection", name: "Price Protection", riskLevel: "high",
    description: "Fixed price for a defined period, or an indexed price adjustment formula tied to commodity indexes.",
    keyPoints: ["Fixed price for X months", "Price adjustments only if raw material index fluctuates ±5%", "Prevents random price increases"],
  },
  {
    id: "delivery-penalty", name: "Delivery & Delay Penalty", riskLevel: "high",
    description: "Clear delivery dates with liquidated damages for delays to protect your production schedule.",
    keyPoints: ["Clear delivery date defined", "Liquidated damages (e.g., 0.5% per week delay)", "Maximum penalty cap (e.g., 10%)"],
  },
  {
    id: "quality-inspection", name: "Quality & Inspection", riskLevel: "critical",
    description: "Right to inspect goods before shipment, reject non-conforming items, and assign cost responsibility for defects.",
    keyPoints: ["Right to inspect before shipment", "Rejection rights for non-conforming goods", "Replacement timeline defined", "Cost responsibility for defects on supplier"],
  },
  {
    id: "warranty", name: "Warranty", riskLevel: "medium",
    description: "Define warranty period, coverage scope, response time, and repair/replacement responsibilities.",
    keyPoints: ["Warranty period clearly defined", "Coverage scope specified", "Response time SLA", "Repair/replacement responsibility assigned"],
  },
  {
    id: "termination", name: "Termination", riskLevel: "critical",
    description: "Include termination options for convenience, default, and insolvency. Never sign without an exit option.",
    keyPoints: ["Termination for convenience (with notice)", "Termination for default", "Termination for insolvency", "Notice period defined"],
  },
  {
    id: "force-majeure", name: "Force Majeure", riskLevel: "high",
    description: "Clearly define qualifying events, notification timeline, and mitigation obligations.",
    keyPoints: ["Qualifying events clearly listed", "Notification timeline specified", "Mitigation obligation included", "Avoid vague force majeure language"],
  },
  {
    id: "confidentiality-ip", name: "Confidentiality & IP Protection", riskLevel: "critical",
    description: "Critical for IT, manufacturing, and R&D projects. Protects trade secrets and intellectual property.",
    keyPoints: ["Non-disclosure terms defined", "IP ownership clarified", "Duration of confidentiality obligation", "Penalties for breach specified"],
  },
  {
    id: "indemnification", name: "Indemnification", riskLevel: "high",
    description: "Supplier must indemnify you against product liability, third-party claims, and IP infringement.",
    keyPoints: ["Product liability coverage", "Third-party claims protection", "IP infringement indemnity"],
  },
  {
    id: "insurance", name: "Insurance Requirement", riskLevel: "medium",
    description: "Supplier must maintain adequate insurance coverage and provide certificate proof.",
    keyPoints: ["Product liability insurance", "Professional liability (for services)", "Workers compensation", "Certificate of insurance required"],
  },
  {
    id: "payment-protection", name: "Payment Protection", riskLevel: "high",
    description: "Tie payments to milestones, delivery acceptance, or performance validation. Avoid 100% advance payment.",
    keyPoints: ["Payments tied to milestones", "Delivery acceptance triggers payment", "Performance validation required", "No 100% advance payment"],
  },
  {
    id: "performance-bond", name: "Performance Bond", riskLevel: "medium",
    description: "Especially important for construction, engineering, and high-value manufacturing contracts.",
    keyPoints: ["Bond amount defined (typically 5–10% of contract)", "Bond duration matches project timeline", "Release conditions specified"],
  },
  {
    id: "dispute-resolution", name: "Dispute Resolution", riskLevel: "medium",
    description: "Define governing law, jurisdiction, and whether disputes go to arbitration or court.",
    keyPoints: ["Governing law specified", "Jurisdiction defined", "Arbitration vs court preference", "International contracts must clarify"],
  },
  {
    id: "change-management", name: "Change Management", riskLevel: "high",
    description: "Prevents uncontrolled cost increases. All scope changes must be approved in writing before execution.",
    keyPoints: ["All changes require written approval", "Impact assessment before changes", "Cost implications documented", "Critical for construction & IT"],
  },
  {
    id: "audit-rights", name: "Audit Rights", riskLevel: "low",
    description: "Right to audit supplier cost structure (open-book contracts) and verify compliance.",
    keyPoints: ["Cost structure audit rights", "Compliance verification", "Useful for strategic suppliers", "Annual audit schedule defined"],
  },
  {
    id: "esg-compliance", name: "ESG & Compliance", riskLevel: "high",
    description: "Modern risk protection including anti-corruption, labor law, environmental, and sanctions compliance.",
    keyPoints: ["Anti-corruption declaration", "Labor law compliance", "Environmental compliance", "Sanctions compliance", "Protects brand reputation"],
  },
];

const RISK_STYLES: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  medium: { label: "Medium", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  high: { label: "High", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20" },
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function ContractChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = (checkedCount / clauses.length) * 100;

  const exportSummary = () => {
    const lines = clauses.map((c) => `${checked[c.id] ? "✅" : "❌"} ${c.name} (${c.riskLevel} risk)`);
    const summary = `CONTRACT CLAUSE CHECKLIST\n${"=".repeat(40)}\nProgress: ${checkedCount}/${clauses.length} clauses reviewed\n\n${lines.join("\n")}`;
    navigator.clipboard.writeText(summary);
    toast.success("Checklist copied to clipboard");
  };

  const anim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={anim} className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Contract Clause Checklist
            </h1>
            <p className="text-sm text-muted-foreground">15 essential clauses for procurement contract risk protection</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportSummary}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Export Summary
          </Button>
        </motion.div>

        {/* Progress */}
        <motion.div variants={anim}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Review Progress</span>
                <span className={cn("text-sm font-bold", checkedCount === clauses.length ? "text-emerald-600" : "text-muted-foreground")}>
                  {checkedCount}/{clauses.length} clauses
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Clauses */}
        <div className="space-y-2">
          {clauses.map((clause) => (
            <motion.div key={clause.id} variants={anim}>
              <Collapsible>
                <Card className={cn(checked[clause.id] && "border-emerald-500/30 bg-emerald-500/5")}>
                  <div className="flex items-center gap-3 p-4">
                    <Checkbox checked={!!checked[clause.id]} onCheckedChange={() => toggle(clause.id)} />
                    <CollapsibleTrigger className="flex-1 flex items-center justify-between text-left group">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium text-sm", checked[clause.id] && "line-through text-muted-foreground")}>
                          {clause.name}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px]", RISK_STYLES[clause.riskLevel].className)}>
                          {RISK_STYLES[clause.riskLevel].label} Risk
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 pl-12 space-y-2">
                      <p className="text-sm text-muted-foreground">{clause.description}</p>
                      <ul className="space-y-1">
                        {clause.keyPoints.map((kp, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                            {kp}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </motion.div>
          ))}
        </div>

        {/* Professional advice */}
        <motion.div variants={anim}>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Professional Level Strategy
              </h3>
              <p className="text-xs text-muted-foreground">
                Before signing any contract: ✅ Legal review ✅ Risk scoring assessment ✅ Supplier financial check ✅ Kraljic classification ✅ Scenario analysis (What if supplier fails?)
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                "Strong negotiation gets you a good price. Strong contract protects you for 5–10 years."
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
