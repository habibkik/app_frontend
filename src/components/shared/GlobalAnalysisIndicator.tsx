/**
 * Global Analysis Loading Indicator
 */
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAnalysisStatus } from "@/stores/analysisStore";
import { cn } from "@/lib/utils";

export function GlobalAnalysisIndicator() {
  const { t } = useTranslation();
  const { status, progress, step, isAnalyzing } = useAnalysisStatus();
  if (!isAnalyzing && status !== "analyzing") return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 w-full bg-primary/20">
          <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("flex items-center gap-2 px-4 py-2 rounded-full", "bg-background/95 backdrop-blur-sm border border-border shadow-lg")}>
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">{step || t("globalAnalysis.analyzing")}</span>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
