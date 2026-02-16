/**
 * Results Badge
 */
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHasResults } from "@/stores/analysisStore";
import type { DashboardMode } from "@/features/dashboard";

interface ResultsBadgeProps { mode: DashboardMode; className?: string; }

export function ResultsBadge({ mode, className }: ResultsBadgeProps) {
  const { t } = useTranslation();
  const hasResults = useHasResults(mode);
  if (!hasResults) return null;

  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={className}>
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-3 w-3" />
        <span className="text-xs font-medium">{t("resultsBadge.results")}</span>
      </div>
    </motion.div>
  );
}
