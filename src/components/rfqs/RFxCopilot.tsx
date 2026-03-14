import { useState } from "react";
import { Brain, FileText, Clipboard, Download, Loader2, Sparkles, Send, BookOpen, Shield, Mail, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RFxPackage {
  productName: string;
  category: string;
  rfi?: any;
  rfp?: any;
  rfq?: any;
  sow?: any;
  evaluation_matrix?: any;
  supplier_email?: any;
}

const DOC_TABS = [
  { key: "rfi", label: "RFI", icon: FileText, description: "Request for Information" },
  { key: "rfp", label: "RFP", icon: BookOpen, description: "Request for Proposal" },
  { key: "rfq", label: "RFQ", icon: Send, description: "Request for Quotation" },
  { key: "sow", label: "SOW", icon: Clipboard, description: "Statement of Work" },
  { key: "evaluation_matrix", label: "Evaluation", icon: BarChart3, description: "Evaluation Matrix" },
  { key: "supplier_email", label: "Email", icon: Mail, description: "Supplier Invitation" },
] as const;

function renderRFI(rfi: any) {
  if (!rfi) return <EmptyDoc />;
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-bold text-foreground">{rfi.title}</h3>
      <Section title="Purpose">{rfi.purpose}</Section>
      {rfi.companyBackground && <Section title="Company Background">{rfi.companyBackground}</Section>}
      <Section title="Scope of Work">{rfi.scopeOfWork}</Section>
      <ListSection title="Technical Requirements" items={rfi.technicalRequirements} />
      <ListSection title="Vendor Qualifications" items={rfi.vendorQualifications} />
      <ListSection title="Questions for Vendors" items={rfi.questions} numbered />
      {rfi.responseFormat && <Section title="Response Format">{rfi.responseFormat}</Section>}
      {rfi.submissionDeadline && <Section title="Submission Deadline">{rfi.submissionDeadline}</Section>}
    </div>
  );
}

function renderRFP(rfp: any) {
  if (!rfp) return <EmptyDoc />;
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-bold text-foreground">{rfp.title}</h3>
      <Section title="Introduction">{rfp.introduction}</Section>
      {rfp.projectOverview && <Section title="Project Overview">{rfp.projectOverview}</Section>}
      <Section title="Scope of Work">{rfp.scopeOfWork}</Section>
      <ListSection title="Deliverables" items={rfp.deliverables} />
      <ListSection title="Technical Requirements" items={rfp.technicalRequirements} />
      <ListSection title="Qualifications" items={rfp.qualifications} />
      {rfp.evaluationCriteria?.length > 0 && (
        <div>
          <p className="font-semibold text-foreground mb-2">Evaluation Criteria</p>
          <div className="space-y-1">
            {rfp.evaluationCriteria.map((ec: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5">
                <span>{ec.criterion}</span>
                <Badge variant="outline">{ec.weight}%</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {rfp.timeline && <Section title="Timeline">{rfp.timeline}</Section>}
      {rfp.budget && <Section title="Budget">{rfp.budget}</Section>}
    </div>
  );
}

function renderRFQ(rfq: any) {
  if (!rfq) return <EmptyDoc />;
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-bold text-foreground">{rfq.title}</h3>
      <Section title="Description">{rfq.description}</Section>
      {rfq.lineItems?.length > 0 && (
        <div>
          <p className="font-semibold text-foreground mb-2">Line Items</p>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Item</th>
                  <th className="text-left px-3 py-2 font-medium">Specification</th>
                  <th className="text-right px-3 py-2 font-medium">Qty</th>
                  <th className="text-left px-3 py-2 font-medium">Unit</th>
                </tr>
              </thead>
              <tbody>
                {rfq.lineItems.map((li: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{li.item}</td>
                    <td className="px-3 py-2 text-muted-foreground">{li.specification || "—"}</td>
                    <td className="px-3 py-2 text-right">{li.quantity?.toLocaleString()}</td>
                    <td className="px-3 py-2">{li.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {rfq.deliveryTerms && <Section title="Delivery Terms">{rfq.deliveryTerms}</Section>}
      {rfq.paymentTerms && <Section title="Payment Terms">{rfq.paymentTerms}</Section>}
      {rfq.incoterm && <Section title="Incoterm">{rfq.incoterm}</Section>}
      <ListSection title="Quality Standards" items={rfq.qualityStandards} />
      <ListSection title="Certifications Required" items={rfq.certifications} />
    </div>
  );
}

function renderSOW(sow: any) {
  if (!sow) return <EmptyDoc />;
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-bold text-foreground">{sow.title}</h3>
      {sow.background && <Section title="Background">{sow.background}</Section>}
      <ListSection title="Objectives" items={sow.objectives} numbered />
      <Section title="Scope">{sow.scope}</Section>
      {sow.tasks?.length > 0 && (
        <div>
          <p className="font-semibold text-foreground mb-2">Tasks</p>
          <div className="space-y-2">
            {sow.tasks.map((t: any, i: number) => (
              <div key={i} className="bg-muted/50 rounded-md p-3">
                <p className="font-medium">{i + 1}. {t.task}</p>
                <p className="text-muted-foreground mt-1">{t.description}</p>
                {t.deliverable && <p className="text-xs mt-1">📦 Deliverable: {t.deliverable}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <ListSection title="Acceptance Criteria" items={sow.acceptanceCriteria} />
      <ListSection title="Assumptions" items={sow.assumptions} />
      {sow.timeline && <Section title="Timeline">{sow.timeline}</Section>}
    </div>
  );
}

function renderEvalMatrix(matrix: any) {
  if (!matrix) return <EmptyDoc />;
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-bold text-foreground">{matrix.title}</h3>
      {matrix.scoringScale && <Section title="Scoring Scale">{matrix.scoringScale}</Section>}
      {matrix.minimumScore && <p className="text-muted-foreground">Minimum qualifying score: <strong>{matrix.minimumScore}</strong></p>}
      {matrix.criteria?.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Category</th>
                <th className="text-left px-3 py-2 font-medium">Criterion</th>
                <th className="text-right px-3 py-2 font-medium">Weight</th>
                <th className="text-left px-3 py-2 font-medium">Scoring Guide</th>
              </tr>
            </thead>
            <tbody>
              {matrix.criteria.map((c: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{c.category}</td>
                  <td className="px-3 py-2">{c.criterion}</td>
                  <td className="px-3 py-2 text-right font-medium">{c.weight}%</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{c.scoringGuide || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function renderEmail(email: any) {
  if (!email) return <EmptyDoc />;
  return (
    <div className="space-y-4 text-sm">
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-xs text-muted-foreground">Subject</p>
        <p className="font-medium">{email.subject}</p>
      </div>
      <div className="whitespace-pre-wrap text-foreground leading-relaxed">{email.body}</div>
      {email.deadline && (
        <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
          <p className="text-xs font-medium text-warning">⏰ Deadline: {email.deadline}</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-foreground mb-1">{title}</p>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function ListSection({ title, items, numbered }: { title: string; items?: string[]; numbered?: boolean }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="font-semibold text-foreground mb-1">{title}</p>
      <ul className={numbered ? "list-decimal" : "list-disc"} style={{ paddingLeft: "1.25rem" }}>
        {items.map((item, i) => (
          <li key={i} className="text-muted-foreground mb-0.5">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyDoc() {
  return <p className="text-muted-foreground text-center py-8">This document type was not generated.</p>;
}

const RENDERERS: Record<string, (data: any) => JSX.Element> = {
  rfi: renderRFI,
  rfp: renderRFP,
  rfq: renderRFQ,
  sow: renderSOW,
  evaluation_matrix: renderEvalMatrix,
  supplier_email: renderEmail,
};

const EXAMPLE_PROMPTS = [
  "I need suppliers for 100HP agricultural tractors for farming operations in Algeria",
  "Looking for PCB assembly services for IoT sensor devices, 5000 units, SMT and through-hole",
  "Need organic cotton fabric with custom digital prints for sustainable fashion line, 2000 meters",
  "Surgical grade stainless steel instruments for minimally invasive procedures, FDA compliance required",
];

export function RFxCopilot() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [rfxPackage, setRfxPackage] = useState<RFxPackage | null>(null);
  const [activeTab, setActiveTab] = useState("rfi");

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Please describe your sourcing requirement");
      return;
    }
    setIsGenerating(true);
    setRfxPackage(null);

    try {
      const { data, error } = await supabase.functions.invoke("rfx-copilot", {
        body: { description: description.trim() },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Generation failed");

      setRfxPackage(data.data);
      setActiveTab("rfi");
      toast.success(`RFx package generated for "${data.data.productName}"`);
    } catch (err: any) {
      console.error("RFx generation error:", err);
      toast.error(err.message || "Failed to generate RFx package");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyTabContent = () => {
    const el = document.getElementById("rfx-doc-content");
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI RFx Copilot</CardTitle>
              <p className="text-sm text-muted-foreground">Describe what you need — AI generates complete RFI, RFP, RFQ, SOW, and evaluation matrix</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: I need suppliers for 100HP agricultural tractors for farming operations in Algeria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setDescription(prompt)}
                className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full transition-colors"
              >
                {prompt.slice(0, 50)}...
              </button>
            ))}
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || !description.trim()} className="w-full gap-2">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Generating RFx Package..." : "Generate RFx Package"}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {rfxPackage && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{rfxPackage.productName}</CardTitle>
                <Badge variant="outline" className="mt-1">{rfxPackage.category}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={copyTabContent} className="gap-1">
                <Clipboard className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex w-full flex-wrap h-auto gap-1 p-1">
                {DOC_TABS.map((dt) => {
                  const Icon = dt.icon;
                  const hasContent = !!(rfxPackage as any)[dt.key];
                  return (
                    <TabsTrigger key={dt.key} value={dt.key} className="text-xs gap-1" disabled={!hasContent}>
                      <Icon className="h-3 w-3" />
                      {dt.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {DOC_TABS.map((dt) => (
                <TabsContent key={dt.key} value={dt.key} className="mt-4">
                  <ScrollArea className="max-h-[500px]">
                    <div id="rfx-doc-content">
                      {RENDERERS[dt.key]?.((rfxPackage as any)[dt.key]) || <EmptyDoc />}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
