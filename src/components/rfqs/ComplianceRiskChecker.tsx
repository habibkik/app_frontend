import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Loader2, FileSearch, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Finding {
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  suggestedFix: string;
  clause?: string;
}

interface ComplianceResult {
  overallRiskScore: number;
  overallRiskLevel: string;
  summary: string;
  findings: Finding[];
  missingElements?: string[];
  recommendations?: string[];
}

const SEVERITY_CONFIG = {
  low: { color: "bg-info/10 text-info border-info/30", icon: CheckCircle, label: "Low" },
  medium: { color: "bg-warning/10 text-warning border-warning/30", icon: AlertCircle, label: "Medium" },
  high: { color: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle, label: "High" },
  critical: { color: "bg-destructive/20 text-destructive border-destructive/40", icon: Shield, label: "Critical" },
};

const CATEGORY_LABELS: Record<string, string> = {
  legal: "Legal",
  certifications: "Certifications",
  regulatory: "Regulatory",
  financial: "Financial",
  delivery: "Delivery",
  data_privacy: "Data Privacy",
  general: "General",
};

interface ComplianceRiskCheckerProps {
  initialText?: string;
  documentType?: string;
}

export function ComplianceRiskChecker({ initialText, documentType }: ComplianceRiskCheckerProps) {
  const [text, setText] = useState(initialText || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please paste document text to analyze");
      return;
    }
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("compliance-checker", {
        body: { text: text.trim(), documentType: documentType || "procurement" },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Analysis failed");

      setResult(data.data);
      toast.success("Compliance analysis complete");
    } catch (err: any) {
      console.error("Compliance check error:", err);
      toast.error(err.message || "Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const riskColor = result
    ? result.overallRiskScore < 30 ? "text-success" : result.overallRiskScore < 60 ? "text-warning" : "text-destructive"
    : "text-muted-foreground";

  return (
    <div className="space-y-4">
      {/* Input */}
      {!result && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">AI Compliance & Risk Checker</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Paste contract or RFQ text to analyze for compliance gaps and risks</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Paste your procurement document, contract, or RFQ text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none text-sm"
            />
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !text.trim()} className="w-full gap-2">
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              {isAnalyzing ? "Analyzing..." : "Analyze for Compliance & Risks"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Risk Score */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                  <p className={cn("text-3xl font-bold", riskColor)}>{result.overallRiskScore}/100</p>
                  <Badge variant="outline" className={cn("mt-1", SEVERITY_CONFIG[result.overallRiskLevel as keyof typeof SEVERITY_CONFIG]?.color)}>
                    {result.overallRiskLevel?.toUpperCase()} RISK
                  </Badge>
                </div>
                <div className="w-24 h-24 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                      fill="none" stroke={result.overallRiskScore < 30 ? "hsl(var(--success))" : result.overallRiskScore < 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                      strokeWidth="3" strokeDasharray={`${result.overallRiskScore}, 100`} />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Findings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Findings ({result.findings?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {result.findings?.map((f, i) => {
                    const sev = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.medium;
                    const Icon = sev.icon;
                    return (
                      <div key={i} className={cn("border rounded-md p-3", sev.color.split(" ")[0])}>
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{f.title}</p>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-[10px] h-4">{CATEGORY_LABELS[f.category] || f.category}</Badge>
                                <Badge variant="outline" className={cn("text-[10px] h-4", sev.color)}>{sev.label}</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{f.description}</p>
                            {f.clause && (
                              <div className="bg-muted/50 rounded px-2 py-1 text-xs italic">"{f.clause}"</div>
                            )}
                            <div className="bg-success/5 border border-success/20 rounded px-2 py-1">
                              <p className="text-xs"><strong>Fix:</strong> {f.suggestedFix}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Missing Elements & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.missingElements?.length ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-destructive">Missing Elements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.missingElements.map((el, i) => (
                      <li key={i} className="text-sm flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive shrink-0" />
                        {el}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
            {result.recommendations?.length ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-success">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex items-start gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-success shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Button variant="outline" onClick={() => setResult(null)} className="w-full">
            Analyze Another Document
          </Button>
        </>
      )}
    </div>
  );
}
