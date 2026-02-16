import { motion } from "framer-motion";
import { DollarSign, Clock, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComponentPart, SupplierQuote, ComparisonSelection, mockSupplierQuotes } from "@/data/components";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useTranslation } from "react-i18next";

interface ComparisonSummaryProps {
  parts: ComponentPart[];
  selections: ComparisonSelection[];
  onCreateOrder: () => void;
}

export function ComparisonSummary({ parts, selections, onCreateOrder }: ComparisonSummaryProps) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();

  const selectedQuotes = selections
    .map((s) => mockSupplierQuotes.find((q) => q.id === s.selectedQuoteId))
    .filter(Boolean) as SupplierQuote[];

  const totalSelected = selectedQuotes.length;
  const totalParts = parts.length;
  const completionPercent = (totalSelected / totalParts) * 100;

  const totalCost = selections.reduce((sum, sel) => {
    const part = parts.find((p) => p.id === sel.componentId);
    const quote = mockSupplierQuotes.find((q) => q.id === sel.selectedQuoteId);
    if (!part || !quote) return sum;
    return sum + quote.unitPrice * part.requiredQuantity;
  }, 0);

  const maxPossibleCost = parts.reduce((sum, part) => {
    const quotes = mockSupplierQuotes.filter((q) => q.componentId === part.id);
    const maxPrice = Math.max(...quotes.map((q) => q.unitPrice));
    return sum + maxPrice * part.requiredQuantity;
  }, 0);

  const savings = maxPossibleCost - totalCost;
  const savingsPercent = (savings / maxPossibleCost) * 100;
  const maxLeadTime = Math.max(...selectedQuotes.map((q) => q.leadTimeDays), 0);

  const supplierBreakdown = selectedQuotes.reduce((acc, quote) => {
    if (!acc[quote.supplierId]) {
      acc[quote.supplierId] = { name: quote.supplierName, logo: quote.supplierLogo, cost: 0, items: 0 };
    }
    const part = parts.find((p) => p.id === quote.componentId);
    if (part) {
      acc[quote.supplierId].cost += quote.unitPrice * part.requiredQuantity;
      acc[quote.supplierId].items += 1;
    }
    return acc;
  }, {} as Record<string, { name: string; logo: string; cost: number; items: number }>);

  const sortedSuppliers = Object.entries(supplierBreakdown).sort((a, b) => b[1].cost - a[1].cost);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{t("componentSupply.selectionProgress")}</span>
              <Badge variant={completionPercent === 100 ? "default" : "secondary"}>
                {totalSelected} / {totalParts}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completionPercent === 100
                ? t("componentSupply.allComponentsSelected")
                : t("componentSupply.selectMoreComponents", { count: totalParts - totalSelected })}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("componentSupply.totalCost")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fc(totalCost)}</div>
            {savings > 0 && totalSelected === totalParts && (
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                {t("componentSupply.saving", { amount: fc(savings), percent: savingsPercent.toFixed(1) })}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("componentSupply.estLeadTime")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maxLeadTime > 0 ? `${maxLeadTime} ${t("componentSupply.days")}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("componentSupply.basedOnLongest")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {sortedSuppliers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("componentSupply.bySupplier")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedSuppliers.map(([id, data]) => (
                <div key={id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {data.logo}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{data.name}</p>
                      <p className="text-xs text-muted-foreground">{data.items} item{data.items > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{fc(data.cost)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button
          className="w-full"
          size="lg"
          disabled={totalSelected < totalParts}
          onClick={onCreateOrder}
        >
          {totalSelected < totalParts ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t("componentSupply.selectAllToContinue")}
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {t("componentSupply.createPurchaseOrder")}
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
