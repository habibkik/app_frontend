/**
 * Recent Analyses Component - Shows history of AI product analyses
 */
import { motion } from "framer-motion";
import { Package, Search, TrendingUp, Clock, ArrowRight, ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisHistoryItem } from "@/stores/analysisStore";
import type { DashboardMode } from "@/features/dashboard";

const modeIcons: Record<DashboardMode, React.ElementType> = {
  buyer: Search,
  producer: Package,
  seller: TrendingUp,
};

interface RecentAnalysesProps {
  history: AnalysisHistoryItem[];
}

export function RecentAnalyses({ history }: RecentAnalysesProps) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentAnalyses.title")}</CardTitle>
          <CardDescription>{t("recentAnalyses.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">{t("recentAnalyses.emptyText")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("recentAnalyses.title")}</CardTitle>
          <CardDescription>{t("recentAnalyses.subtitleWithData")}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          {t("recentAnalyses.viewAll")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.slice(0, 5).map((item, index) => {
            const ModeIcon = modeIcons[item.mode];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ModeIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {t(`recentAnalyses.modeLabels.${item.mode}`)}
                    </span>
                    <span>•</span>
                    <span>{item.productCategory}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}