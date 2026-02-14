import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, TrendingUp, TrendingDown, Users, Package, Bell, RefreshCw,
  Loader2, BarChart3, Megaphone, AlertCircle, CheckCircle2, ChevronDown, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecommendationFeedback } from "@/components/shared/RecommendationFeedback";
import { format } from "date-fns";

interface DailyReport {
  id: string;
  report_date: string;
  metrics_json: {
    productsMonitored: number;
    competitorsFound: number;
    newPricesCollected: number;
    alertsTriggered: number;
    postsPublished: number;
    totalImpressions: number;
    totalEngagement: number;
    engagementRate: number;
    averageCompetitorPrice: number;
    priceDrops: number;
    priceIncreases: number;
  };
  recommendations_json: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
  }>;
  summary: string;
  created_at: string;
}

export function DailyReportViewer() {
  const { toast } = useToast();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metrics: true, recommendations: true, history: false,
  });

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("report_date", { ascending: false })
        .limit(7);

      if (error) throw error;
      setReports((data as any[]) || []);
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-report", {});
      if (error) throw error;
      if (data?.success) {
        toast({ title: "Report Generated", description: "Your daily intelligence report is ready." });
        await fetchReports();
      } else {
        throw new Error(data?.error || "Failed to generate");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const latestReport = reports[0];
  const metrics = latestReport?.metrics_json;
  const recommendations = latestReport?.recommendations_json || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pricing": return <TrendingUp className="h-4 w-4" />;
      case "content": return <Megaphone className="h-4 w-4" />;
      case "competitor": return <Users className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Intelligence Report</h2>
          <p className="text-muted-foreground">
            {latestReport
              ? `Last generated: ${format(new Date(latestReport.created_at), "PPp")}`
              : "No reports generated yet"}
          </p>
        </div>
        <Button onClick={generateReport} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {generating ? "Generating..." : "Generate Now"}
        </Button>
      </div>

      {!latestReport ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Generate your first daily intelligence report to see market insights and recommendations.
            </p>
            <Button onClick={generateReport} disabled={generating}>Generate Report</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          {latestReport.summary && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{latestReport.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          <Collapsible open={expandedSections.metrics} onOpenChange={() => toggleSection("metrics")}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Key Metrics
                  </CardTitle>
                  {expandedSections.metrics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-2">
                {[
                  { label: "Products Monitored", value: metrics?.productsMonitored || 0, icon: Package, color: "text-primary" },
                  { label: "Competitors Found", value: metrics?.competitorsFound || 0, icon: Users, color: "text-primary" },
                  { label: "Prices Collected", value: metrics?.newPricesCollected || 0, icon: TrendingUp, color: "text-primary" },
                  { label: "Alerts Triggered", value: metrics?.alertsTriggered || 0, icon: Bell, color: "text-destructive" },
                  { label: "Posts Published", value: metrics?.postsPublished || 0, icon: Megaphone, color: "text-primary" },
                  { label: "Total Impressions", value: (metrics?.totalImpressions || 0).toLocaleString(), icon: BarChart3, color: "text-primary" },
                  { label: "Engagement Rate", value: `${metrics?.engagementRate || 0}%`, icon: TrendingUp, color: "text-primary" },
                  { label: "Avg Competitor Price", value: `$${metrics?.averageCompetitorPrice || 0}`, icon: TrendingDown, color: "text-primary" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Recommendations */}
          <Collapsible open={expandedSections.recommendations} onOpenChange={() => toggleSection("recommendations")}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Recommendations ({recommendations.length})
                  </CardTitle>
                  {expandedSections.recommendations ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 mt-2">
                {recommendations.map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          {getCategoryIcon(rec.category)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <Badge variant={getPriorityColor(rec.priority) as any}>{rec.priority}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                            <RecommendationFeedback
                              feature="report"
                              recommendationId={`report-${latestReport.id}-${i}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Historical Reports */}
          {reports.length > 1 && (
            <Collapsible open={expandedSections.history} onOpenChange={() => toggleSection("history")}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Previous Reports ({reports.length - 1})
                    </CardTitle>
                    {expandedSections.history ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-64 mt-2">
                  <div className="space-y-2">
                    {reports.slice(1).map((report) => (
                      <Card key={report.id} className="cursor-pointer hover:bg-muted/50">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{format(new Date(report.report_date), "PPP")}</p>
                              <p className="text-sm text-muted-foreground">{report.summary}</p>
                            </div>
                            <Badge variant="outline">
                              {(report.recommendations_json || []).length} recs
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );
}
