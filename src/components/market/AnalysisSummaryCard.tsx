import { motion } from "framer-motion";
import { Lightbulb, ExternalLink, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketAnalysisResult } from "@/lib/market-intel-service";
import { useTranslation } from "react-i18next";

interface AnalysisSummaryCardProps {
  result: MarketAnalysisResult;
}

export function AnalysisSummaryCard({ result }: AnalysisSummaryCardProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("market.analysisSummary")}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(result.analyzedAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-muted/50"
        >
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </motion.div>

        {result.insights.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              {t("market.keyInsights")}
            </p>
            <ul className="space-y-2">
              {result.insights.map((insight, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{insight}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {result.sources && result.sources.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">{t("market.sources")}</p>
            <div className="flex flex-wrap gap-1">
              {result.sources.map((source, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
