import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, CheckCircle2, XCircle } from "lucide-react";

const CHANNELS = [
  { name: "Email", bestFor: "Formal qualification, RFQ, documentation", avoid: "Long messages, multiple CTAs" },
  { name: "LinkedIn", bestFor: "First touch, networking, engagement", avoid: "Hard selling, long pitches" },
  { name: "WhatsApp", bestFor: "Follow-up, quick confirmations", avoid: "Cold outreach, formal RFQ" },
  { name: "SMS", bestFor: "Reminders, receipt confirmations", avoid: "Prospecting, negotiations" },
  { name: "Phone", bestFor: "Fast decisions, qualification calls", avoid: "Unprepared calls, cold calling" },
  { name: "Facebook", bestFor: "Research, company verification", avoid: "Negotiation, formal outreach" },
  { name: "Instagram", bestFor: "Factory verification, legitimacy", avoid: "Formal RFQ, negotiation" },
  { name: "TikTok", bestFor: "Market intelligence, trends", avoid: "Business negotiation" },
  { name: "Twitter/X", bestFor: "Short pitch, thought leadership", avoid: "Long negotiations" },
];

const KEY_RULES = [
  "3–6 lines max per message",
  "One clear CTA per message",
  "Add a personalization line",
  "Follow up 3–5 days later",
  "Professional tone always",
];

export function ChannelStrategyGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Channel Strategy Guide</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Best For</TableHead>
              <TableHead>Avoid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CHANNELS.map((ch) => (
              <TableRow key={ch.name}>
                <TableCell className="font-medium text-sm">{ch.name}</TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-start gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {ch.bestFor}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-start gap-1">
                    <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                    {ch.avoid}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Key Rules</h4>
          <div className="flex flex-wrap gap-2">
            {KEY_RULES.map((rule) => (
              <Badge key={rule} variant="secondary" className="text-xs">{rule}</Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
