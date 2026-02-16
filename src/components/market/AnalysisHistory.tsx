import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Clock, Search as SearchIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  getAnalysisHistory, 
  deleteFromHistory, 
  clearHistory,
  SavedAnalysis,
  MarketAnalysisResult 
} from "@/lib/market-intel-service";
import { useTranslation } from "react-i18next";

interface AnalysisHistoryProps {
  onLoadAnalysis: (result: MarketAnalysisResult, query: string) => void;
  refreshTrigger?: number;
}

export function AnalysisHistory({ onLoadAnalysis, refreshTrigger }: AnalysisHistoryProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    setHistory(getAnalysisHistory());
  }, [refreshTrigger]);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    setClearDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeBadge = (type: SavedAnalysis["type"]) => {
    const variants: Record<typeof type, { label: string; variant: "default" | "secondary" | "outline" }> = {
      product: { label: t("market.product"), variant: "default" },
      competitor: { label: t("market.competitors"), variant: "secondary" },
      trend: { label: t("market.trends"), variant: "outline" },
      pricing: { label: t("market.pricing"), variant: "secondary" },
    };
    return variants[type];
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            {t("market.recentAnalyses")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <SearchIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {t("market.noHistoryYet")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("market.recentAnalysesWillAppear")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              {t("market.recentAnalyses")}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => setClearDialogOpen(true)}
            >
              {t("market.clearAll")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              <AnimatePresence>
                {history.map((item, index) => {
                  const typeBadge = getTypeBadge(item.type);
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group"
                      onClick={() => onLoadAnalysis(item.result, item.query)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.query}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={typeBadge.variant} className="text-xs">
                              {typeBadge.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("market.clearAllHistory")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("market.clearAllDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("market.clearAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
