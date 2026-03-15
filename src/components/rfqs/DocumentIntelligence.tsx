import { useState, useCallback } from "react";
import { Upload, FileText, FileSpreadsheet, X, Loader2, AlertTriangle, CheckCircle2, DollarSign, Shield, Clipboard, ClipboardCheck, ChevronDown, ChevronUp, Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Requirement {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category?: string;
}

interface Specification {
  title: string;
  value: string;
  unit?: string;
  standard?: string;
}

interface ComplianceClause {
  clause: string;
  type: "legal" | "regulatory" | "certification" | "insurance" | "environmental" | "other";
  mandatory: boolean;
  reference?: string;
}

interface PricingItem {
  item: string;
  amount?: number;
  currency?: string;
  unit?: string;
  notes?: string;
}

interface SuggestedRFQFields {
  product_name: string;
  category?: string;
  description?: string;
  quantity?: number;
  budget_min?: number;
  budget_max?: number;
  delivery_deadline?: string;
  quality_standard?: string;
}

interface ExtractionResult {
  document_summary: string;
  document_type: string;
  requirements: Requirement[];
  specifications: Specification[];
  compliance_clauses: ComplianceClause[];
  pricing_items: PricingItem[];
  suggested_rfq_fields: SuggestedRFQFields;
}

interface DocumentIntelligenceProps {
  onImportToRFQ?: (fields: SuggestedRFQFields) => void;
}

export function DocumentIntelligence({ onImportToRFQ }: DocumentIntelligenceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    requirements: true,
    specifications: true,
    compliance: true,
    pricing: true,
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
      f.type === "application/pdf" ||
      f.type === "text/plain" ||
      f.type === "text/csv" ||
      f.type.includes("spreadsheet") ||
      f.type.includes("excel") ||
      f.type.includes("word") ||
      f.name.endsWith(".txt") ||
      f.name.endsWith(".csv") ||
      f.name.endsWith(".md")
    );
    if (droppedFiles.length === 0) {
      toast.error("Unsupported file type. Use PDF, Excel, Word, CSV, or text files.");
      return;
    }
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  }, []);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const analyzeDocuments = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setProgress(10);
    setResult(null);

    try {
      // Read all files as text
      setProgress(25);
      const textParts: string[] = [];
      for (const file of files) {
        try {
          const text = await readFileAsText(file);
          textParts.push(`--- File: ${file.name} ---\n${text}`);
        } catch {
          textParts.push(`--- File: ${file.name} --- [Could not read as text — binary file]`);
        }
      }

      setProgress(50);
      const combinedText = textParts.join("\n\n");
      const fileNames = files.map(f => f.name).join(", ");

      const { data, error } = await supabase.functions.invoke("document-intelligence", {
        body: { document_text: combinedText, file_name: fileNames },
      });

      setProgress(90);

      if (error) throw new Error(error.message || "Analysis failed");
      if (!data?.success) throw new Error(data?.error || "No data extracted");

      setResult(data.data);
      setProgress(100);
      toast.success(`Extracted ${data.data.requirements.length} requirements, ${data.data.specifications.length} specs, ${data.data.compliance_clauses.length} compliance clauses, and ${data.data.pricing_items.length} pricing items.`);
    } catch (err: any) {
      console.error("Document intelligence error:", err);
      toast.error(err.message || "Failed to analyze documents");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const complianceTypeColor = (t: string) => {
    const map: Record<string, string> = {
      legal: "bg-destructive/10 text-destructive",
      regulatory: "bg-amber-500/10 text-amber-600",
      certification: "bg-primary/10 text-primary",
      insurance: "bg-blue-500/10 text-blue-600",
      environmental: "bg-emerald-500/10 text-emerald-600",
      other: "bg-muted text-muted-foreground",
    };
    return map[t] || map.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Document Intelligence
        </h2>
        <p className="text-muted-foreground mt-1">
          Upload procurement documents and let AI extract requirements, specs, compliance clauses, and pricing data.
        </p>
      </div>

      {/* Upload Zone */}
      {!result && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-10 transition-all duration-200 text-center",
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
                isAnalyzing && "pointer-events-none opacity-50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isAnalyzing}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Drop documents here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, Word, Excel, CSV, TXT — Max 10 files
                  </p>
                </div>
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{files.length} file(s) selected</p>
                  <Button variant="ghost" size="sm" onClick={() => setFiles([])} disabled={isAnalyzing}>
                    Clear all
                  </Button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {files.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                      {file.name.endsWith(".pdf") ? <FileText className="h-4 w-4 text-destructive" /> : <FileSpreadsheet className="h-4 w-4 text-emerald-500" />}
                      <span className="flex-1 truncate text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} disabled={isAnalyzing} className="p-1 hover:bg-muted rounded">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                {isAnalyzing && (
                  <div className="space-y-2 pt-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">Analyzing with AI… This may take a moment.</p>
                  </div>
                )}

                <Button onClick={analyzeDocuments} disabled={isAnalyzing} className="w-full mt-2">
                  {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing…</>
                  ) : (
                    <><FileText className="h-4 w-4 mr-2" /> Analyze Documents</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary Card */}
            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{result.document_type}</Badge>
                    <p className="text-sm text-foreground">{result.document_summary}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setResult(null); setFiles([]); setProgress(0); }}>
                      New Analysis
                    </Button>
                    {onImportToRFQ && (
                      <Button size="sm" onClick={() => onImportToRFQ(result.suggested_rfq_fields)}>
                        <Import className="h-4 w-4 mr-1" /> Import to RFQ
                      </Button>
                    )}
                  </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    { label: "Requirements", count: result.requirements.length, icon: ClipboardCheck, color: "text-primary" },
                    { label: "Specifications", count: result.specifications.length, icon: Clipboard, color: "text-amber-500" },
                    { label: "Compliance", count: result.compliance_clauses.length, icon: Shield, color: "text-destructive" },
                    { label: "Pricing Items", count: result.pricing_items.length, icon: DollarSign, color: "text-emerald-500" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50">
                      <s.icon className={cn("h-5 w-5 mx-auto mb-1", s.color)} />
                      <p className="text-xl font-bold text-foreground">{s.count}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabbed extraction details */}
            <Tabs defaultValue="requirements" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="requirements">Requirements ({result.requirements.length})</TabsTrigger>
                <TabsTrigger value="specifications">Specs ({result.specifications.length})</TabsTrigger>
                <TabsTrigger value="compliance">Compliance ({result.compliance_clauses.length})</TabsTrigger>
                <TabsTrigger value="pricing">Pricing ({result.pricing_items.length})</TabsTrigger>
              </TabsList>

              {/* Requirements */}
              <TabsContent value="requirements">
                <Card>
                  <CardContent className="pt-4">
                    {result.requirements.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No requirements found in the document.</p>
                    ) : (
                      <ScrollArea className="max-h-[400px]">
                        <div className="space-y-3">
                          {result.requirements.map((req, i) => (
                            <div key={i} className="p-3 rounded-lg border bg-card">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm text-foreground">{req.title}</p>
                                <Badge variant="outline" className={cn("text-xs shrink-0", priorityColor(req.priority))}>{req.priority}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                              {req.category && <Badge variant="secondary" className="mt-2 text-xs">{req.category}</Badge>}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Specifications */}
              <TabsContent value="specifications">
                <Card>
                  <CardContent className="pt-4">
                    {result.specifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No specifications found.</p>
                    ) : (
                      <ScrollArea className="max-h-[400px]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Specification</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Value</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Unit</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Standard</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.specifications.map((spec, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-2 px-2 font-medium text-foreground">{spec.title}</td>
                                <td className="py-2 px-2 text-foreground">{spec.value}</td>
                                <td className="py-2 px-2 text-muted-foreground">{spec.unit || "—"}</td>
                                <td className="py-2 px-2 text-muted-foreground">{spec.standard || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Compliance */}
              <TabsContent value="compliance">
                <Card>
                  <CardContent className="pt-4">
                    {result.compliance_clauses.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No compliance clauses found.</p>
                    ) : (
                      <ScrollArea className="max-h-[400px]">
                        <div className="space-y-3">
                          {result.compliance_clauses.map((cc, i) => (
                            <div key={i} className="p-3 rounded-lg border bg-card">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-foreground">{cc.clause}</p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Badge className={cn("text-xs", complianceTypeColor(cc.type))}>{cc.type}</Badge>
                                  {cc.mandatory && <Badge variant="destructive" className="text-xs">Mandatory</Badge>}
                                </div>
                              </div>
                              {cc.reference && <p className="text-xs text-muted-foreground mt-1">Ref: {cc.reference}</p>}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing */}
              <TabsContent value="pricing">
                <Card>
                  <CardContent className="pt-4">
                    {result.pricing_items.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No pricing data found.</p>
                    ) : (
                      <ScrollArea className="max-h-[400px]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Item</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Amount</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Unit</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.pricing_items.map((pi, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-2 px-2 font-medium text-foreground">{pi.item}</td>
                                <td className="py-2 px-2 text-right text-foreground">
                                  {pi.amount != null ? `${pi.currency || "$"}${pi.amount.toLocaleString()}` : "—"}
                                </td>
                                <td className="py-2 px-2 text-muted-foreground">{pi.unit || "—"}</td>
                                <td className="py-2 px-2 text-muted-foreground text-xs">{pi.notes || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Suggested RFQ Fields */}
            {result.suggested_rfq_fields && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Suggested RFQ Auto-Fill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(result.suggested_rfq_fields).filter(([, v]) => v != null && v !== "").map(([key, value]) => (
                      <div key={key} className="p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                        <p className="font-medium text-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                  {onImportToRFQ && (
                    <Button className="w-full mt-4" onClick={() => onImportToRFQ(result.suggested_rfq_fields)}>
                      <Import className="h-4 w-4 mr-2" /> Import These Fields to New RFQ
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
