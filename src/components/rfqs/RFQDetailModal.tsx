import { useState } from "react";
import { format } from "date-fns";
import { Award, Calendar, Clock, FileText, MessageSquare, Package, Shield, TrendingUp, Users, BarChart3 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { type RFQItem, type SupplierQuote, mockSupplierQuotes, statusConfig } from "@/data/rfqs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { RFQTeamComments } from "./RFQTeamComments";
import { PurchaseOrderGenerator } from "./PurchaseOrderGenerator";
import { PriceForecastPanel } from "./PriceForecastPanel";
import { QuoteComparisonEngine } from "./QuoteComparisonEngine";
import { ComplianceRiskChecker } from "./ComplianceRiskChecker";

interface RFQDetailModalProps {
  rfq: RFQItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function calculateScores(rfq: RFQItem, quotes: SupplierQuote[]): (SupplierQuote & { totalScore: number })[] {
  if (!rfq.evaluationCriteria?.length || !quotes.length) return quotes.map((q) => ({ ...q, totalScore: 0 }));

  const prices = quotes.map((q) => q.unitPrice);
  const leads = quotes.map((q) => q.leadTimeDays);
  const minPrice = Math.min(...prices);
  const minLead = Math.min(...leads);

  return quotes.map((q) => {
    let score = 0;
    rfq.evaluationCriteria!.forEach((ec) => {
      const w = ec.weight / 100;
      const name = ec.criterion.toLowerCase();
      if (name.includes("price") || name.includes("cost")) {
        score += (minPrice / q.unitPrice) * 5 * w;
      } else if (name.includes("delivery") || name.includes("lead")) {
        score += (minLead / q.leadTimeDays) * 5 * w;
      } else if (name.includes("quality") || name.includes("compliance")) {
        score += (q.certifications.length / 3) * 5 * w;
      } else {
        score += 3.5 * w; // neutral for unknown criteria
      }
    });
    return { ...q, totalScore: Math.round(score * 100) / 100 };
  });
}

const timelineSteps = [
  { label: "Created", icon: FileText },
  { label: "Clarification", icon: MessageSquare },
  { label: "Submission", icon: Package },
  { label: "Evaluation", icon: TrendingUp },
  { label: "Award", icon: Award },
];

const statusToStep: Record<string, number> = {
  draft: 0, pending: 2, quoted: 3, awarded: 4, closed: 4, expired: 2,
};

export function RFQDetailModal({ rfq, open, onOpenChange }: RFQDetailModalProps) {
  const [tab, setTab] = useState("details");

  if (!rfq) return null;

  const quotes = mockSupplierQuotes[rfq.id] || [];
  const scoredQuotes = calculateScores(rfq, quotes).sort((a, b) => b.totalScore - a.totalScore);
  const currentStep = statusToStep[rfq.status] ?? 0;
  const cfg = statusConfig[rfq.status];

  const chartData = scoredQuotes.map((q) => ({
    name: q.supplierName.split(" ").slice(0, 2).join(" "),
    score: q.totalScore,
  }));

  const mockActivity = [
    { time: rfq.createdAt, event: "RFQ created and published", type: "info" },
    ...(rfq.clarificationDeadline ? [{ time: rfq.clarificationDeadline, event: "Clarification period ended", type: "info" }] : []),
    ...quotes.map((q) => ({ time: q.submittedAt, event: `Quote received from ${q.supplierName}`, type: "quote" })),
    ...(rfq.status === "awarded" ? [{ time: rfq.expiresAt, event: "RFQ awarded to best supplier", type: "award" }] : []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{rfq.id} — {rfq.title}</DialogTitle>
            <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            <TabsTrigger value="quotes" className="text-xs">Quotes ({quotes.length})</TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs">Approvals</TabsTrigger>
            <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs">Forecast</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
          </TabsList>

          {/* DETAILS */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{rfq.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Category", value: rfq.category },
                { label: "Quantity", value: `${rfq.quantity.toLocaleString()} ${rfq.unit}` },
                { label: "Target Price", value: rfq.targetPrice ? `$${rfq.targetPrice}` : "—" },
                { label: "Delivery", value: rfq.deliveryLocation },
                { label: "Incoterm", value: rfq.incoterm || "—" },
                { label: "Payment Terms", value: rfq.paymentTerms || "—" },
                { label: "Warranty", value: rfq.warrantyTerms || "—" },
                { label: "Sample Required", value: rfq.sampleRequired ? "Yes" : "No" },
                { label: "Pricing Breakdown", value: rfq.pricingBreakdownRequired ? "Required" : "Optional" },
              ].map((f) => (
                <div key={f.label} className="bg-muted/50 rounded-md p-2.5">
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium">{f.value}</p>
                </div>
              ))}
            </div>

            {(rfq.qualityStandards?.length || rfq.certificationsRequired?.length) && (
              <div className="space-y-2">
                {rfq.qualityStandards?.length ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Quality Standards</p>
                    <div className="flex flex-wrap gap-1">
                      {rfq.qualityStandards.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                ) : null}
                {rfq.certificationsRequired?.length ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Certifications Required</p>
                    <div className="flex flex-wrap gap-1">
                      {rfq.certificationsRequired.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {rfq.evaluationCriteria?.length ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Evaluation Criteria</p>
                <div className="flex flex-wrap gap-2">
                  {rfq.evaluationCriteria.map((ec) => (
                    <Badge key={ec.criterion} variant="outline">{ec.criterion}: {ec.weight}%</Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {rfq.complianceNotes && (
              <div className="bg-warning/5 border border-warning/20 rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-warning" />
                  <p className="text-xs font-medium">Compliance Notes</p>
                </div>
                <p className="text-sm text-muted-foreground">{rfq.complianceNotes}</p>
              </div>
            )}
          </TabsContent>

          {/* QUOTES COMPARISON */}
          <TabsContent value="quotes" className="space-y-4 mt-4">
            {quotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No quotes received yet</p>
              </div>
            ) : (
              <>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 5]} className="text-muted-foreground" />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Tooling</TableHead>
                        <TableHead className="text-right">MOQ</TableHead>
                        <TableHead className="text-right">Logistics</TableHead>
                        <TableHead className="text-right">Lead Time</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scoredQuotes.map((q, idx) => (
                        <TableRow key={q.id} className={idx === 0 ? "bg-success/5" : ""}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{q.supplierName}</p>
                              <p className="text-xs text-muted-foreground">{q.supplierCountry}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">${q.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${q.toolingCost.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{q.moq.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${q.logisticsCost.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{q.leadTimeDays}d</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={idx === 0 ? "default" : "outline"}>{q.totalScore.toFixed(1)}</Badge>
                          </TableCell>
                          <TableCell>
                            {idx === 0 && rfq.status !== "awarded" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                                onClick={() => toast.success(`Awarded to ${q.supplierName}`)}>
                                <Award className="h-3 w-3" /> Award
                              </Button>
                            )}
                            {idx === 0 && rfq.status === "awarded" && (
                              <Badge variant="default" className="text-xs">Winner</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Automated PO for awarded RFQs */}
                {rfq.status === "awarded" && scoredQuotes.length > 0 && (
                  <div className="mt-4">
                    <PurchaseOrderGenerator
                      rfqId={rfq.id}
                      rfqTitle={rfq.title}
                      supplierName={scoredQuotes[0].supplierName}
                      unitPrice={scoredQuotes[0].unitPrice}
                      quantity={rfq.quantity}
                      unit={rfq.unit}
                      toolingCost={scoredQuotes[0].toolingCost}
                      logisticsCost={scoredQuotes[0].logisticsCost}
                      leadTimeDays={scoredQuotes[0].leadTimeDays}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* APPROVALS */}
          <TabsContent value="approvals" className="mt-4">
            <ApprovalWorkflow rfqId={rfq.id} />
          </TabsContent>

          {/* TEAM */}
          <TabsContent value="team" className="mt-4">
            <RFQTeamComments rfqId={rfq.id} />
          </TabsContent>

          {/* FORECAST */}
          <TabsContent value="forecast" className="mt-4">
            <PriceForecastPanel category={rfq.category} currentPrice={rfq.targetPrice} />
          </TabsContent>

          {/* TIMELINE */}
          <TabsContent value="timeline" className="mt-4">
            <div className="flex items-center justify-between px-4 py-8">
              {timelineSteps.map((step, idx) => {
                const isActive = idx <= currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex flex-col items-center gap-2 relative flex-1">
                    {idx > 0 && (
                      <div className={cn(
                        "absolute top-5 -left-1/2 w-full h-0.5",
                        idx <= currentStep ? "bg-primary" : "bg-border"
                      )} />
                    )}
                    <div className={cn(
                      "relative z-10 rounded-full p-2.5 border-2",
                      isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ACTIVITY LOG */}
          <TabsContent value="activity" className="mt-4">
            <div className="space-y-3">
              {mockActivity.map((a, idx) => (
                <div key={idx} className="flex items-start gap-3 border-l-2 border-border pl-4 py-2">
                  <div className="min-w-0">
                    <p className="text-sm">{a.event}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(a.time), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
