import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BookOpen, ChevronDown, CheckCircle2, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndustryData {
  id: string;
  name: string;
  emoji: string;
  rfqBestPractices: string[];
  negotiationTactics: string[];
  keyStrategy: string;
}

const industries: IndustryData[] = [
  {
    id: "manufacturing", name: "Manufacturing", emoji: "🏭",
    rfqBestPractices: [
      "Provide detailed technical drawings & tolerances",
      "Include material grade & certification requirements",
      "Request tooling cost separately from piece price",
      "Request piece price breakdown (material %, labor %, overhead %)",
      "Include scrap rate expectations",
      "Define lead time for mass production vs prototype",
      "Ask for PPAP / First Article Approval",
    ],
    negotiationTactics: [
      "Use volume leverage for price reduction",
      "Negotiate tool amortization over contract duration",
      "Request annual price reduction clause (2–5%)",
      "Include raw material indexation clause",
      "Benchmark raw material prices (steel, aluminum indexes)",
    ],
    keyStrategy: "Focus on Total Cost of Ownership (TCO), not unit price only.",
  },
  {
    id: "it-software", name: "IT & Software", emoji: "💻",
    rfqBestPractices: [
      "Clearly define scope of work and deliverables",
      "Include SLA (Service Level Agreement) requirements",
      "Specify cybersecurity and data protection requirements",
      "Request licensing model details (user-based, subscription)",
      "Ask for maintenance and upgrade cost breakdown",
    ],
    negotiationTactics: [
      "Negotiate multi-year discounts",
      "Request bundled services at reduced rate",
      "Push for free implementation and training",
      "Lock price for 2–3 years minimum",
    ],
    keyStrategy: "Vendors have high margins (20–40%) → strong room for negotiation.",
  },
  {
    id: "construction", name: "Construction", emoji: "🏗",
    rfqBestPractices: [
      "Include detailed BOQ (Bill of Quantities)",
      "Specify penalties for delays in contract",
      "Request project timeline and resource plan",
      "Ask for equipment list and insurance coverage",
    ],
    negotiationTactics: [
      "Negotiate milestone-based payments",
      "Request performance guarantees",
      "Define retention percentage",
      "Compare labor cost assumptions across bidders",
    ],
    keyStrategy: "Control variation orders — the biggest hidden cost risk.",
  },
  {
    id: "healthcare", name: "Healthcare", emoji: "🏥",
    rfqBestPractices: [
      "Require regulatory compliance (FDA, CE, GMP)",
      "Mandate batch traceability documentation",
      "Define expiry date requirements",
      "Audit supplier quality management system",
    ],
    negotiationTactics: [
      "Negotiate consignment stock arrangements",
      "Push for longer payment terms",
      "Request volume rebate structures",
      "Price is often fixed due to regulation — focus on value-adds",
    ],
    keyStrategy: "Risk management is more important than price reduction.",
  },
  {
    id: "retail-fmcg", name: "Retail & FMCG", emoji: "🛒",
    rfqBestPractices: [
      "Include detailed packaging specifications",
      "Define shelf-life requirements",
      "Ask for marketing support contribution",
      "Specify return policy expectations",
    ],
    negotiationTactics: [
      "Negotiate promotional discount schedules",
      "Request tiered rebate structures",
      "Define clear return/defect policies",
      "Use competitive bidding aggressively — high competition exists",
    ],
    keyStrategy: "High supplier competition → strong price leverage available.",
  },
  {
    id: "energy", name: "Energy & Utilities", emoji: "⚡",
    rfqBestPractices: [
      "Require technical compliance certificates",
      "Mandate safety certifications",
      "Include site inspection capability requirement",
      "Clarify Incoterms very carefully for heavy equipment",
    ],
    negotiationTactics: [
      "Use long-term contract leverage (3–5 years)",
      "Negotiate escalation clauses linked to commodity index",
      "Include performance penalties for non-compliance",
      "Focus on risk-sharing contract models",
    ],
    keyStrategy: "Contract structure is more important than price.",
  },
  {
    id: "logistics", name: "Logistics & Transport", emoji: "🚚",
    rfqBestPractices: [
      "Define volume forecast accurately",
      "Specify routes and service frequency",
      "Include insurance coverage requirements",
      "Define KPI and SLA expectations",
    ],
    negotiationTactics: [
      "Negotiate fuel surcharge cap",
      "Lock rate stability period (6–12 months)",
      "Include service penalty clauses",
      "Use competitive benchmarking across carriers",
    ],
    keyStrategy: "Lock rates when fuel prices are low.",
  },
  {
    id: "hospitality", name: "Hospitality", emoji: "🏨",
    rfqBestPractices: [
      "Define quality grade standards clearly",
      "Include delivery frequency requirements",
      "Clarify return and replacement policy",
    ],
    negotiationTactics: [
      "Negotiate seasonal discount schedules",
      "Request volume rebates",
      "Push for extended credit terms",
      "Use multiple suppliers for supply flexibility",
    ],
    keyStrategy: "Balance price and quality perception for guest experience.",
  },
  {
    id: "financial", name: "Financial Services", emoji: "🏦",
    rfqBestPractices: [
      "Focus on compliance and regulatory requirements",
      "Define data protection and privacy standards",
      "Include SLA performance metrics",
      "Define KPI monitoring and reporting system",
    ],
    negotiationTactics: [
      "Negotiate fixed management fees vs percentage-based",
      "Push for performance-based fee structures",
      "Ensure contract exit flexibility",
    ],
    keyStrategy: "Reduce long-term dependency risk on single provider.",
  },
  {
    id: "agriculture", name: "Agriculture", emoji: "🌾",
    rfqBestPractices: [
      "Specify quality grade precisely",
      "Define moisture percentage requirements",
      "Include harvest period specifications",
      "Define inspection terms at origin and destination",
    ],
    negotiationTactics: [
      "Use market price index for benchmarking",
      "Lock forward contracts during low season",
      "Negotiate storage cost separately",
    ],
    keyStrategy: "Hedge against seasonal price volatility with forward contracts.",
  },
  {
    id: "chemical", name: "Chemical Industry", emoji: "🏭",
    rfqBestPractices: [
      "Require MSDS (Material Safety Data Sheet)",
      "Define purity level requirements precisely",
      "Clarify hazardous transport requirements",
      "Include storage and handling specifications",
    ],
    negotiationTactics: [
      "Use raw material index benchmarking",
      "Negotiate annual volume commitment discounts",
      "Include price adjustment formula linked to feedstock",
    ],
    keyStrategy: "Supply security is critical — prioritize reliability over price.",
  },
  {
    id: "textile", name: "Textile & Apparel", emoji: "🧵",
    rfqBestPractices: [
      "Provide fabric composition specifications",
      "Include Pantone color code references",
      "Define shrinkage tolerance limits",
      "Request sample approval before mass production",
    ],
    negotiationTactics: [
      "Negotiate MOQ reduction for initial orders",
      "Request free sampling",
      "Push for better payment terms (Net 60+)",
      "Leverage production country competition",
    ],
    keyStrategy: "Lead time flexibility gives the strongest negotiation leverage.",
  },
];

function PlaybookSection({ title, icon: Icon, items, variant }: { title: string; icon: any; items: string[]; variant: "check" | "bulb" }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-2 group">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-sm flex-1">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pb-3">
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              {variant === "check" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              )}
              {item}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function IndustryPlaybookPage() {
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Industry Procurement Playbook
          </h1>
          <p className="text-sm text-muted-foreground">RFQ best practices and negotiation tactics for 12 industries</p>
        </motion.div>

        <motion.div variants={item}>
          <Tabs defaultValue="manufacturing">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
              {industries.map((ind) => (
                <TabsTrigger key={ind.id} value={ind.id} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {ind.emoji} {ind.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {industries.map((ind) => (
              <TabsContent key={ind.id} value={ind.id} className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-xl">{ind.emoji}</span> {ind.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Key Strategy Banner */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Target className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm font-medium text-primary">{ind.keyStrategy}</p>
                    </div>

                    <PlaybookSection title="RFQ Best Practices" icon={CheckCircle2} items={ind.rfqBestPractices} variant="check" />
                    <PlaybookSection title="Negotiation Tactics" icon={Lightbulb} items={ind.negotiationTactics} variant="bulb" />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
