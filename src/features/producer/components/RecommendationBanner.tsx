import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeasibilityStatus } from "../types/feasibility";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface RecommendationBannerProps {
  status: FeasibilityStatus;
  score: number;
  totalCostPerUnit: number;
  breakEvenUnits: number;
  recommendedMinOrder: number;
  risks: number;
}

export function RecommendationBanner({
  status,
  score,
  totalCostPerUnit,
  breakEvenUnits,
  recommendedMinOrder,
  risks,
}: RecommendationBannerProps) {
  const fc = useFormatCurrency();
  
  const statusConfig = {
    feasible: {
      Icon: CheckCircle2,
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent",
      border: "border-emerald-500/30",
      title: "Production is Viable",
      subtitle: `Manufacturing at ${fc(totalCostPerUnit)}/unit is recommended`,
    },
    risky: {
      Icon: AlertTriangle,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent",
      border: "border-amber-500/30",
      title: "Production Has Risks",
      subtitle: `${risks} risk${risks !== 1 ? "s" : ""} identified that may affect production`,
    },
    "not-feasible": {
      Icon: XCircle,
      color: "text-red-700 dark:text-red-400",
      bg: "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent",
      border: "border-red-500/30",
      title: "Not Recommended for In-House Production",
      subtitle: "Consider outsourcing or alternative sourcing strategies",
    },
  };

  const config = statusConfig[status];
  const { Icon, color, bg, border, title, subtitle } = config;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-6 rounded-2xl border ${border} ${bg}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Main recommendation */}
        <div className="flex items-start gap-3 flex-1">
          <div className={`h-10 w-10 rounded-xl ${status === "feasible" ? "bg-emerald-500/20" : status === "risky" ? "bg-amber-500/20" : "bg-red-500/20"} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Key metrics */}
        {status !== "not-feasible" && (
          <div className="flex flex-wrap gap-3">
            <Badge
              variant="secondary"
              className="gap-1.5 bg-background/80 border border-border/50 px-3 py-1.5"
            >
              <Package className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground">
                Min order: <strong>{recommendedMinOrder.toLocaleString()}</strong>
              </span>
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1.5 bg-background/80 border border-border/50 px-3 py-1.5"
            >
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground">
                Break-even: <strong>{breakEvenUnits.toLocaleString()}</strong> units
              </span>
            </Badge>
          </div>
        )}

        {/* Alternative suggestions for not-feasible */}
        {status === "not-feasible" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Consider contract manufacturing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Explore importing finished goods</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions hint for risky status */}
      {status === "risky" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-border/50"
        >
          <p className="text-xs text-muted-foreground">
            💡 <strong>Quick wins:</strong> Address supply chain risks and optimize component sourcing to improve feasibility score
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
