import { motion } from "framer-motion";
import { Factory, ShoppingCart, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MakeVsBuyAnalysis } from "../types/feasibility";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface MakeVsBuyCardProps {
  analysis: MakeVsBuyAnalysis;
}

export function MakeVsBuyCard({ analysis }: MakeVsBuyCardProps) {
  const fc = useFormatCurrency();
  const { makeCost, buyCost, difference, savingsPercent, recommendation } = analysis;

  const maxCost = Math.max(makeCost, buyCost);
  const makePercent = (makeCost / maxCost) * 100;
  const buyPercent = (buyCost / maxCost) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            Make vs Buy Decision
          </div>
          <Badge
            variant="secondary"
            className={`gap-1 ${
              recommendation === "make"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            {recommendation === "make" ? "Recommend Make" : "Recommend Buy"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border-2 transition-all ${
              recommendation === "make"
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                recommendation === "make" ? "bg-emerald-500/10" : "bg-muted"
              }`}>
                <Factory className={`h-4 w-4 ${recommendation === "make" ? "text-emerald-500" : "text-muted-foreground"}`} />
              </div>
              <span className="font-medium text-sm">Make</span>
            </div>
            <p className={`text-2xl font-bold ${recommendation === "make" ? "text-emerald-600" : "text-foreground"}`}>
              {fc(makeCost)}
            </p>
            <p className="text-xs text-muted-foreground">per unit</p>
            <Progress value={makePercent} className="h-1.5 mt-3" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-xl border-2 transition-all ${
              recommendation === "buy"
                ? "border-blue-500 bg-blue-500/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                recommendation === "buy" ? "bg-blue-500/10" : "bg-muted"
              }`}>
                <ShoppingCart className={`h-4 w-4 ${recommendation === "buy" ? "text-blue-500" : "text-muted-foreground"}`} />
              </div>
              <span className="font-medium text-sm">Buy</span>
            </div>
            <p className={`text-2xl font-bold ${recommendation === "buy" ? "text-blue-600" : "text-foreground"}`}>
              {fc(buyCost)}
            </p>
            <p className="text-xs text-muted-foreground">per unit (retail)</p>
            <Progress value={buyPercent} className="h-1.5 mt-3" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-xl ${
            recommendation === "make"
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-blue-500/10 border border-blue-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {recommendation === "make" ? "Savings by Manufacturing" : "Cost Difference"}
              </p>
              <p className={`text-xl font-bold ${recommendation === "make" ? "text-emerald-600" : "text-blue-600"}`}>
                {fc(difference)} per unit
              </p>
            </div>
            <div className={`text-right px-3 py-1.5 rounded-lg ${
              recommendation === "make" ? "bg-emerald-500/20" : "bg-blue-500/20"
            }`}>
              <p className={`text-2xl font-bold ${recommendation === "make" ? "text-emerald-600" : "text-blue-600"}`}>
                {savingsPercent}%
              </p>
              <p className="text-xs text-muted-foreground">
                {recommendation === "make" ? "cheaper" : "more"}
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-sm text-center text-muted-foreground">
          {recommendation === "make" ? (
            <>Manufacturing in-house is <strong className="text-emerald-600">{savingsPercent}% cheaper</strong> than buying retail</>
          ) : (
            <>Consider <strong className="text-blue-600">outsourcing or buying</strong> as manufacturing costs are high</>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
