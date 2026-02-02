import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { FeasibilityStatus } from "../types/feasibility";

interface FeasibilityScoreCircleProps {
  score: number;
  status: FeasibilityStatus;
  size?: "sm" | "md" | "lg";
}

export function FeasibilityScoreCircle({
  score,
  status,
  size = "lg",
}: FeasibilityScoreCircleProps) {
  const sizeConfig = {
    sm: { width: 120, stroke: 8, fontSize: "text-2xl", iconSize: 16 },
    md: { width: 160, stroke: 10, fontSize: "text-3xl", iconSize: 20 },
    lg: { width: 200, stroke: 12, fontSize: "text-4xl", iconSize: 24 },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const statusConfig = {
    feasible: {
      color: "text-emerald-500",
      strokeColor: "stroke-emerald-500",
      bgColor: "bg-emerald-500/10",
      label: "Production Viable",
      Icon: CheckCircle2,
    },
    risky: {
      color: "text-amber-500",
      strokeColor: "stroke-amber-500",
      bgColor: "bg-amber-500/10",
      label: "Needs Optimization",
      Icon: AlertTriangle,
    },
    "not-feasible": {
      color: "text-red-500",
      strokeColor: "stroke-red-500",
      bgColor: "bg-red-500/10",
      label: "Not Recommended",
      Icon: XCircle,
    },
  };

  const { color, strokeColor, bgColor, label, Icon } = statusConfig[status];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        {/* Background circle */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.width}
          height={config.width}
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-muted/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            className={strokeColor}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${config.fontSize} font-bold ${color}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Score
          </span>
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-full ${bgColor}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </motion.div>
    </div>
  );
}
