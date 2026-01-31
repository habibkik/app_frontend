import { motion } from "framer-motion";
import { Building2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompetitorData } from "@/lib/market-intel-service";
import { cn } from "@/lib/utils";

interface CompetitorAnalysisCardProps {
  competitors: CompetitorData[];
}

export function CompetitorAnalysisCard({ competitors }: CompetitorAnalysisCardProps) {
  const maxShare = Math.max(...competitors.map((c) => c.marketShare));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Competitor Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {competitors.map((competitor, index) => (
          <motion.div
            key={competitor.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border bg-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{competitor.name}</h4>
                  <Badge variant="outline">{competitor.marketShare}% share</Badge>
                </div>

                {/* Market Share Bar */}
                <div className="mt-2">
                  <Progress 
                    value={(competitor.marketShare / maxShare) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Price Range */}
                <p className="text-sm text-muted-foreground mt-2">
                  Price range: ${competitor.priceRange.min} - ${competitor.priceRange.max}
                </p>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.strengths.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-destructive mb-1">Weaknesses</p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.weaknesses.slice(0, 2).map((w) => (
                        <Badge key={w} variant="outline" className="text-xs">
                          {w}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {competitor.recentActivity.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Recent Activity
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {competitor.recentActivity.map((activity, i) => (
                        <li key={i}>• {activity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
