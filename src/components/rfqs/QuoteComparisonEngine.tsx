import { useMemo } from "react";
import { AlertTriangle, Award, TrendingDown, TrendingUp, DollarSign, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { type RFQItem, type SupplierQuote } from "@/data/rfqs";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { cn } from "@/lib/utils";

interface QuoteComparisonEngineProps {
  rfq: RFQItem;
  quotes: SupplierQuote[];
}

interface EnrichedQuote extends SupplierQuote {
  totalScore: number;
  tco: number;
  anomaly: "low" | "high" | null;
  recommended: boolean;
  pricePerUnit: number;
  costBreakdown: { unit: number; tooling: number; logistics: number; taxes: number };
}

function detectAnomalies(prices: number[]): { mean: number; std: number } {
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const std = Math.sqrt(prices.reduce((s, p) => s + (p - mean) ** 2, 0) / prices.length);
  return { mean, std };
}

export function QuoteComparisonEngine({ rfq, quotes }: QuoteComparisonEngineProps) {
  const fc = useFormatCurrency();

  const enrichedQuotes = useMemo<EnrichedQuote[]>(() => {
    if (!quotes.length) return [];

    const prices = quotes.map((q) => q.unitPrice);
    const { mean, std } = detectAnomalies(prices);
    const minPrice = Math.min(...prices);
    const minLead = Math.min(...quotes.map((q) => q.leadTimeDays));

    return quotes.map((q) => {
      const tco = q.unitPrice * rfq.quantity + q.toolingCost + q.logisticsCost + q.taxes;

      // Anomaly detection: 1.5 std devs
      let anomaly: "low" | "high" | null = null;
      if (q.unitPrice < mean - 1.5 * std) anomaly = "low";
      if (q.unitPrice > mean + 1.5 * std) anomaly = "high";

      // Scoring
      let score = 0;
      const criteria = rfq.evaluationCriteria || [
        { criterion: "Price", weight: 40 },
        { criterion: "Quality", weight: 25 },
        { criterion: "Delivery", weight: 20 },
        { criterion: "Terms", weight: 15 },
      ];

      criteria.forEach((ec) => {
        const w = ec.weight / 100;
        const name = ec.criterion.toLowerCase();
        if (name.includes("price") || name.includes("cost")) {
          score += (minPrice / q.unitPrice) * 5 * w;
        } else if (name.includes("delivery") || name.includes("lead")) {
          score += (minLead / q.leadTimeDays) * 5 * w;
        } else if (name.includes("quality") || name.includes("compliance")) {
          score += (q.certifications.length / Math.max(rfq.certificationsRequired?.length || 1, 1)) * 5 * w;
        } else {
          score += 3.5 * w;
        }
      });

      return {
        ...q,
        totalScore: Math.round(score * 100) / 100,
        tco,
        anomaly,
        recommended: false,
        pricePerUnit: q.unitPrice,
        costBreakdown: {
          unit: q.unitPrice * rfq.quantity,
          tooling: q.toolingCost,
          logistics: q.logisticsCost,
          taxes: q.taxes,
        },
      };
    }).sort((a, b) => b.totalScore - a.totalScore).map((q, i) => ({
      ...q,
      recommended: i === 0,
    }));
  }, [quotes, rfq]);

  if (!quotes.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>No quotes to compare</p>
      </div>
    );
  }

  const bestQuote = enrichedQuotes[0];
  const lowestTCO = Math.min(...enrichedQuotes.map((q) => q.tco));
  const highestTCO = Math.max(...enrichedQuotes.map((q) => q.tco));
  const savings = highestTCO - lowestTCO;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-success" />
              <p className="text-xs text-muted-foreground">Recommended</p>
            </div>
            <p className="text-sm font-bold mt-1 truncate">{bestQuote.supplierName}</p>
            <p className="text-xs text-muted-foreground">Score: {bestQuote.totalScore.toFixed(1)}/5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Lowest TCO</p>
            </div>
            <p className="text-sm font-bold mt-1">{fc(lowestTCO)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-success" />
              <p className="text-xs text-muted-foreground">Potential Savings</p>
            </div>
            <p className="text-sm font-bold mt-1">{fc(savings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <p className="text-xs text-muted-foreground">Fastest Lead</p>
            </div>
            <p className="text-sm font-bold mt-1">{Math.min(...enrichedQuotes.map((q) => q.leadTimeDays))} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Side-by-Side Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">TCO</TableHead>
                  <TableHead className="text-right">MOQ</TableHead>
                  <TableHead className="text-right">Lead Time</TableHead>
                  <TableHead>Certs</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedQuotes.map((q) => (
                  <TableRow key={q.id} className={q.recommended ? "bg-success/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-sm flex items-center gap-1">
                            {q.supplierName}
                            {q.recommended && <Badge className="text-[10px] h-4 bg-success">Best Value</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">{q.supplierCountry}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium">{fc(q.unitPrice)}</span>
                        {q.anomaly === "low" && (
                          <span title="Unusually low price — verify quality">
                            <TrendingDown className="h-3.5 w-3.5 text-warning" />
                          </span>
                        )}
                        {q.anomaly === "high" && (
                          <span title="Above average price">
                            <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{fc(q.tco)}</TableCell>
                    <TableCell className="text-right">{q.moq.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{q.leadTimeDays}d</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-0.5">
                        {q.certifications.slice(0, 2).map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px] h-4">{c}</Badge>
                        ))}
                        {q.certifications.length > 2 && (
                          <Badge variant="outline" className="text-[10px] h-4">+{q.certifications.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={(q.totalScore / 5) * 100} className="w-12 h-1.5" />
                        <span className="text-sm font-medium">{q.totalScore.toFixed(1)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {enrichedQuotes.slice(0, 4).map((q) => (
          <Card key={q.id} className={q.recommended ? "border-success/30" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{q.supplierName}</span>
                {q.anomaly && (
                  <Badge variant="outline" className="text-[10px] gap-1 text-warning border-warning/30">
                    <AlertTriangle className="h-3 w-3" />
                    {q.anomaly === "low" ? "Low price alert" : "Above average"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(q.costBreakdown).map(([key, val]) => {
                const pct = (val / q.tco) * 100;
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{key === "unit" ? `Unit × ${rfq.quantity}` : key}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="w-16 h-1.5" />
                      <span className="font-medium w-20 text-right">{fc(val)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="border-t pt-2 flex items-center justify-between text-sm font-bold">
                <span>Total Cost of Ownership</span>
                <span>{fc(q.tco)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
