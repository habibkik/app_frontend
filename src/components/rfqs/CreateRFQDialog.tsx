import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Upload, Trash2, Sparkles, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  rfqCategories, rfqUnits, incoterms, paymentTermsOptions, qualityStandardsList, certificationsList,
  type RFQItem, type Incoterm, type PaymentTerm,
} from "@/data/rfqs";
import { cn } from "@/lib/utils";

const requiredDocumentsList = [
  "Company Profile", "Financial Statement", "Certifications", "References", "Compliance Declaration",
];

const createRFQSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  category: z.string().min(1, "Please select a category"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Please select a unit"),
  targetPrice: z.coerce.number().optional(),
  currency: z.string().default("USD"),
  deliveryLocation: z.string().min(3, "Please enter delivery location"),
  deliveryDate: z.date({ required_error: "Please select a delivery date" }),
  // Requirements
  incoterm: z.string().optional(),
  paymentTerms: z.string().optional(),
  qualityStandards: z.array(z.string()).default([]),
  certificationsRequired: z.array(z.string()).default([]),
  sampleRequired: z.boolean().default(false),
  warrantyTerms: z.string().optional(),
  complianceNotes: z.string().optional(),
  // Evaluation
  pricingBreakdownRequired: z.boolean().default(true),
  clarificationDeadline: z.date().optional(),
  // New professional fields
  quotationValidity: z.coerce.number().default(90),
  countryOfOrigin: z.string().optional(),
  packagingRequirements: z.string().optional(),
  labellingRequirements: z.string().optional(),
  requiredDocuments: z.array(z.string()).default([]),
  submissionInstructions: z.string().optional(),
});

type CreateRFQFormData = z.infer<typeof createRFQSchema>;

interface CreateRFQDialogProps {
  onCreateRFQ: (rfq: Omit<RFQItem, "id" | "createdAt" | "expiresAt" | "quotesReceived" | "attachments" | "status">) => void;
}

export function CreateRFQDialog({ onCreateRFQ }: CreateRFQDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [evalCriteria, setEvalCriteria] = useState<{ criterion: string; weight: number }[]>([
    { criterion: "Price", weight: 40 },
    { criterion: "Quality", weight: 30 },
    { criterion: "Delivery", weight: 20 },
    { criterion: "Terms", weight: 10 },
  ]);

  const form = useForm<CreateRFQFormData>({
    resolver: zodResolver(createRFQSchema),
    defaultValues: {
      title: "", description: "", category: "", quantity: 1, unit: "units",
      targetPrice: undefined, currency: "USD", deliveryLocation: "",
      qualityStandards: [], certificationsRequired: [],
      sampleRequired: false, pricingBreakdownRequired: true,
      quotationValidity: 90, countryOfOrigin: "", packagingRequirements: "",
      labellingRequirements: "", requiredDocuments: [], submissionInstructions: "",
    },
  });

  const totalWeight = evalCriteria.reduce((sum, c) => sum + c.weight, 0);

  const AI_DRAFTS: Record<string, { title: string; description: string; category: string; quantity: number; unit: string }> = {
    Electronics: { title: "PCB Assembly for IoT Sensor Module", description: "We require high-precision PCB assembly for our next-generation IoT sensor modules. Components include SMD resistors, capacitors, microcontrollers (ARM Cortex-M4), and RF antenna modules. Boards must pass IPC Class 2 inspection standards with <0.1% defect rate. Lead-free soldering (RoHS) mandatory.", category: "Electronics", quantity: 5000, unit: "units" },
    "Raw Materials": { title: "High-Grade Stainless Steel 304L Sheets", description: "Sourcing cold-rolled stainless steel 304L sheets for industrial equipment manufacturing. Thickness: 2mm ± 0.1mm. Surface finish: 2B. Must comply with ASTM A240 standards. Mill test certificates required with each shipment.", category: "Raw Materials", quantity: 20000, unit: "kg" },
    Textiles: { title: "Organic Cotton Fabric for Apparel Line", description: "We need GOTS-certified organic cotton fabric (200 GSM, twill weave) for our sustainable fashion line. Colors: navy, white, forest green. Pre-shrunk and colorfast. AZO-free dyes required. OEKO-TEX Standard 100 certification needed.", category: "Textiles", quantity: 15000, unit: "meters" },
    Machinery: { title: "CNC Milling Machine — 5-Axis", description: "Procurement of a 5-axis CNC milling machine for precision metal parts manufacturing. Requirements: travel X/Y/Z 800×500×500mm, spindle speed ≥12,000 RPM, tool changer ≥24 positions. Installation, training, and 24-month warranty included.", category: "Machinery", quantity: 2, unit: "units" },
  };

  const handleAIDraft = async () => {
    setAiDrafting(true);
    await new Promise((r) => setTimeout(r, 1500));
    const category = form.getValues("category") || "Electronics";
    const draft = AI_DRAFTS[category] || AI_DRAFTS["Electronics"];
    form.setValue("title", draft.title);
    form.setValue("description", draft.description);
    form.setValue("category", draft.category);
    form.setValue("quantity", draft.quantity);
    form.setValue("unit", draft.unit);
    setAiDrafting(false);
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const onSubmit = async (data: CreateRFQFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onCreateRFQ({
      title: data.title,
      description: data.description,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      targetPrice: data.targetPrice,
      currency: data.currency,
      deliveryLocation: data.deliveryLocation,
      deliveryDate: format(data.deliveryDate, "yyyy-MM-dd"),
      incoterm: data.incoterm as Incoterm | undefined,
      paymentTerms: data.paymentTerms as PaymentTerm | undefined,
      qualityStandards: data.qualityStandards,
      certificationsRequired: data.certificationsRequired,
      evaluationCriteria: evalCriteria,
      pricingBreakdownRequired: data.pricingBreakdownRequired,
      clarificationDeadline: data.clarificationDeadline ? format(data.clarificationDeadline, "yyyy-MM-dd") : undefined,
      sampleRequired: data.sampleRequired,
      warrantyTerms: data.warrantyTerms,
      complianceNotes: data.complianceNotes,
    });

    setIsSubmitting(false);
    setOpen(false);
    form.reset();
    setActiveTab("basics");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create RFQ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Create New RFQ</DialogTitle>
              <DialogDescription>Professional Request for Quotation with evaluation criteria.</DialogDescription>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleAIDraft} disabled={aiDrafting}>
              <Sparkles className={`h-3.5 w-3.5 ${aiDrafting ? "animate-spin" : ""}`} />
              {aiDrafting ? "Drafting..." : "AI Draft"}
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basics">1. Basics</TabsTrigger>
                <TabsTrigger value="requirements">2. Requirements</TabsTrigger>
                <TabsTrigger value="evaluation">3. Evaluation</TabsTrigger>
              </TabsList>

              {/* TAB 1 — Basics */}
              <TabsContent value="basics" className="space-y-4 mt-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>RFQ Title</FormLabel>
                    <FormControl><Input placeholder="e.g., PCB Assembly for IoT Devices" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your requirements in detail..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Include specifications, quality requirements, and certifications needed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {rfqCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="deliveryLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Location</FormLabel>
                      <FormControl><Input placeholder="City, Country" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {rfqUnits.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="targetPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Price (opt.)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input type="number" step="0.01" min={0} className="pl-7" placeholder="0.00" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="quotationValidity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quotation Validity (days)</FormLabel>
                      <FormControl><Input type="number" min={1} placeholder="90" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="countryOfOrigin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Origin</FormLabel>
                      <FormControl><Input placeholder="e.g., China, Germany" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="packagingRequirements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packaging Requirements</FormLabel>
                    <FormControl><Textarea placeholder="Anti-static bags, moisture barrier, palletized..." className="min-h-[60px]" {...field} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="labellingRequirements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labelling Requirements</FormLabel>
                    <FormControl><Textarea placeholder="Part number, lot code, date of manufacture..." className="min-h-[60px]" {...field} /></FormControl>
                  </FormItem>
                )} />
              </TabsContent>

              {/* TAB 2 — Requirements */}
              <TabsContent value="requirements" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="incoterm" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incoterm</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Incoterm" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {incoterms.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {paymentTermsOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="qualityStandards" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Standards</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {qualityStandardsList.map((qs) => (
                        <Badge
                          key={qs}
                          variant={field.value?.includes(qs) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => field.onChange(toggleArrayItem(field.value || [], qs))}
                        >
                          {qs}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )} />

                <FormField control={form.control} name="certificationsRequired" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications Required</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {certificationsList.map((c) => (
                        <Badge
                          key={c}
                          variant={field.value?.includes(c) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => field.onChange(toggleArrayItem(field.value || [], c))}
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sampleRequired" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="text-sm">Sample Required</FormLabel>
                        <FormDescription className="text-xs">Request sample before award</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="warrantyTerms" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Terms</FormLabel>
                      <FormControl><Input placeholder="e.g., 12 months" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="complianceNotes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compliance / Regulatory Notes</FormLabel>
                    <FormControl><Textarea placeholder="Import restrictions, regulatory requirements..." className="min-h-[60px]" {...field} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="requiredDocuments" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Documents</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {requiredDocumentsList.map((doc) => (
                        <Badge
                          key={doc}
                          variant={field.value?.includes(doc) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => field.onChange(toggleArrayItem(field.value || [], doc))}
                        >
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )} />

                <FormField control={form.control} name="submissionInstructions" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Instructions</FormLabel>
                    <FormControl><Textarea placeholder="Send PDF quotation to procurement@company.com before deadline..." className="min-h-[60px]" {...field} /></FormControl>
                  </FormItem>
                )} />
              </TabsContent>

              {/* TAB 3 — Evaluation & Timeline */}
              <TabsContent value="evaluation" className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Evaluation Criteria</FormLabel>
                    <span className={cn("text-sm font-medium", totalWeight === 100 ? "text-success" : "text-destructive")}>
                      Total: {totalWeight}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {evalCriteria.map((ec, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={ec.criterion}
                          onChange={(e) => {
                            const updated = [...evalCriteria];
                            updated[idx].criterion = e.target.value;
                            setEvalCriteria(updated);
                          }}
                          placeholder="Criterion name"
                          className="flex-1"
                        />
                        <div className="relative w-20">
                          <Input
                            type="number"
                            value={ec.weight}
                            onChange={(e) => {
                              const updated = [...evalCriteria];
                              updated[idx].weight = Number(e.target.value);
                              setEvalCriteria(updated);
                            }}
                            min={0}
                            max={100}
                            className="pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setEvalCriteria(evalCriteria.filter((_, i) => i !== idx))}
                          disabled={evalCriteria.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setEvalCriteria([...evalCriteria, { criterion: "", weight: 0 }])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Criterion
                  </Button>
                  {totalWeight !== 100 && (
                    <p className="text-xs text-destructive mt-1">Weights must sum to 100%</p>
                  )}
                  <Progress value={totalWeight} className="mt-2 h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="clarificationDeadline" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Clarification Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Submission Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="pricingBreakdownRequired" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-sm">Pricing Breakdown Required</FormLabel>
                      <FormDescription className="text-xs">Request cost transparency from suppliers</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />

                {/* Attachments placeholder */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Drag & drop files here or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, XLS, images up to 10MB</p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 sm:gap-0">
              {activeTab !== "basics" && (
                <Button type="button" variant="outline" onClick={() => setActiveTab(activeTab === "evaluation" ? "requirements" : "basics")}>
                  Back
                </Button>
              )}
              {activeTab !== "evaluation" ? (
                <Button type="button" onClick={() => setActiveTab(activeTab === "basics" ? "requirements" : "evaluation")}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || totalWeight !== 100}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create RFQ"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
