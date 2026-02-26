import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Copy, Brain, MessageSquare, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Tactic {
  title: string;
  description: string;
  example: string;
  whenToUse: string;
}

const tactics: Tactic[] = [
  {
    title: "1. The Flinch",
    description: "React with controlled surprise when the supplier gives a high price. This triggers an automatic price adjustment instinct.",
    example: '"$12.80? That\'s significantly higher than expected."',
    whenToUse: "When receiving an initial quote that is above your benchmark.",
  },
  {
    title: "2. Strategic Silence",
    description: "After the supplier speaks, pause for 5 seconds. Silence creates discomfort and suppliers often fill it with concessions.",
    example: "(Pause 5 seconds after hearing the price. Say nothing.)",
    whenToUse: "After any price or term is stated. Never rush to speak first.",
  },
  {
    title: "3. Good Cop / Bad Cop (Internal)",
    description: "Use internal authority to shift pressure. Reference an invisible decision-maker who won't approve the current terms.",
    example: '"I personally see potential, but finance will never approve this price."',
    whenToUse: "In corporate environments where budget approval is multi-layered.",
  },
  {
    title: "4. The Nibble",
    description: "After reaching agreement, ask for one small extra. People who are psychologically committed are more likely to agree.",
    example: '"One last small point… can you also include free freight?"',
    whenToUse: "Only after main terms are agreed. Use for small extras only.",
  },
  {
    title: "5. Anchoring Power",
    description: "The first serious number shapes the entire negotiation zone. Anchor confidently but realistically.",
    example: '"Based on our analysis, we were targeting $88–90 for this volume."',
    whenToUse: "At the start of price discussion. Anchor low but credible.",
  },
  {
    title: "6. Limited Budget Frame",
    description: "State a fixed approved budget to create a psychological price ceiling, even if some flexibility exists.",
    example: '"We have a fixed approved budget for this project of $X."',
    whenToUse: "When you need to set an upper limit on discussions.",
  },
  {
    title: "7. Future Business Leverage",
    description: "Mention potential for expansion to trigger long-term thinking. Suppliers reduce short-term margin for future volume.",
    example: '"This project could expand to multiple locations next year."',
    whenToUse: "When credible future volume exists. Never fake large volumes.",
  },
  {
    title: "8. Controlled Concessions",
    description: "Never reduce in big jumps. Use small, decreasing steps to signal you're approaching your limit.",
    example: "You: $92 → Then $90 → Then $89 (small steps signal limit approaching)",
    whenToUse: "During back-and-forth price negotiation rounds.",
  },
  {
    title: "9. Walk-Away Power",
    description: "The strongest tactic. Only use if you genuinely have alternative suppliers and are prepared to walk.",
    example: '"We may need to pause discussions if we cannot reach alignment."',
    whenToUse: "When you have a real BATNA and alternatives exist.",
  },
  {
    title: "10. Scarcity Reversal",
    description: "When a supplier claims scarcity, shift the pressure back by implying your own timeline constraint.",
    example: '"We understand. We are also finalizing supplier selection this week."',
    whenToUse: "When a supplier tries to create urgency or scarcity.",
  },
  {
    title: "11. Data Dominance",
    description: "Bring market data, commodity indexes, and benchmarks. Facts eliminate emotional pricing.",
    example: '"Steel index dropped 6% last quarter. How is this reflected in your pricing?"',
    whenToUse: "Always. Preparation = negotiation control.",
  },
  {
    title: "12. Emotional Neutrality",
    description: "Never show excitement, urgency, or frustration. The calmer person controls the room.",
    example: "(Maintain neutral expression and tone throughout the meeting.)",
    whenToUse: "Every negotiation. The person who needs the deal less has more power.",
  },
];

interface ScriptCard {
  scenario: string;
  script: string;
}

const scripts: ScriptCard[] = [
  {
    scenario: "Opening",
    script: "Thank you for your quotation. We appreciate your effort. We would like to review some points to explore possible improvements.",
  },
  {
    scenario: "Price Too High",
    script: "Your offer is technically acceptable; however, the price is above our target range. Can you help us understand the cost structure?",
  },
  {
    scenario: "Anchoring Lower",
    script: "Based on our market benchmark and expected volume, we were expecting something closer to [$X]. How can we work together to reach that level?",
  },
  {
    scenario: "Impossible Response",
    script: "I understand constraints exist. Let's review the components together and see where flexibility may be possible.",
  },
  {
    scenario: "Trade-Off",
    script: "If we commit to a 12-month contract, what price improvement can you offer? If we increase volume by 20%, what would be your best price?",
  },
  {
    scenario: "Better Payment Terms",
    script: "To move forward, we would need 60 days payment terms. How can we structure this in a way that works for both of us?",
  },
  {
    scenario: "Competitive Pressure",
    script: "We are currently reviewing multiple offers. You are close, but not yet the most competitive.",
  },
  {
    scenario: "Closing Summary",
    script: "To summarize, we are aligned on:\n• Unit price: $___\n• Delivery: ___\n• Payment terms: ___\n• Contract duration: ___\n\nPlease confirm in writing so we can proceed.",
  },
];

const goldenRules = [
  { rule: "Preparation beats aggression", icon: "🎯" },
  { rule: "Data beats emotion", icon: "📊" },
  { rule: "Silence beats pressure", icon: "🤫" },
  { rule: "Long-term relationship beats short-term win", icon: "🤝" },
];

const universalPrinciples = [
  "Know your BATNA (Best Alternative To Negotiated Agreement)",
  "Always ask for a price breakdown",
  "Negotiate total value, not just price",
  "Trade concessions — never give without receiving",
  "Use data & benchmarks to support every request",
  "Secure long-term advantage over one-time savings",
];

export default function NegotiationPlaybookPage() {
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const anim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={anim}>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Negotiation Playbook & Scripts
          </h1>
          <p className="text-sm text-muted-foreground">12 psychological tactics, ready-to-use scripts, and golden rules</p>
        </motion.div>

        <Tabs defaultValue="tactics">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tactics"><Brain className="h-3.5 w-3.5 mr-1" /> Tactics (12)</TabsTrigger>
            <TabsTrigger value="scripts"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Scripts</TabsTrigger>
            <TabsTrigger value="rules"><Star className="h-3.5 w-3.5 mr-1" /> Golden Rules</TabsTrigger>
          </TabsList>

          {/* Tactics */}
          <TabsContent value="tactics" className="space-y-3 mt-4">
            {tactics.map((t, i) => (
              <motion.div key={i} variants={anim}>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                    <div className="bg-muted/50 rounded-md p-3 text-sm italic font-mono text-xs">
                      💬 {t.example}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                      <strong>When to use:</strong> {t.whenToUse}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Scripts */}
          <TabsContent value="scripts" className="space-y-3 mt-4">
            {scripts.map((s, i) => (
              <motion.div key={i} variants={anim}>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{s.scenario}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyText(s.script)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap font-mono text-xs leading-relaxed">
                      {s.script}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Golden Rules */}
          <TabsContent value="rules" className="space-y-4 mt-4">
            <motion.div variants={anim}>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-bold text-base mb-4 text-center">🏆 4 Golden Rules of Negotiation</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goldenRules.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                        <span className="text-2xl">{r.icon}</span>
                        <span className="font-medium text-sm">{r.rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">📊 Universal Negotiation Principles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {universalPrinciples.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={anim}>
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground italic">
                    "The person who needs the deal less has more power.<br/>
                    Your power = Alternatives + Preparation + Patience."
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
