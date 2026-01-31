/**
 * Substitute Competitors Component
 * Shows competitors selling substitute/alternative products for sellers
 */
import { motion } from "framer-motion";
import { 
  Repeat2, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SubstituteCompetitor } from "@/stores/analysisStore";

interface SubstituteCompetitorsProps {
  competitors: SubstituteCompetitor[];
  onViewCompetitor?: (competitor: SubstituteCompetitor) => void;
}

const threatColors = {
  high: "bg-red-500/10 text-red-600 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

const threatIcons = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-emerald-500",
};

export function SubstituteCompetitors({ 
  competitors,
  onViewCompetitor,
}: SubstituteCompetitorsProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Repeat2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Substitute Competitors</h3>
          <p className="text-muted-foreground text-sm">
            No alternative product competitors identified
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-amber-500" />
            Substitute Product Competitors
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {competitors.length} threats identified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Competitors selling alternative products that could capture your market share
        </p>

        <div className="space-y-4">
          {competitors.map((competitor, index) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border border-border bg-card",
                "hover:border-primary/30 hover:shadow-sm transition-all duration-200"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className={cn("h-5 w-5", threatIcons[competitor.threat])} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Sells: {competitor.substituteProduct}
                      </p>
                    </div>
                    <Badge className={cn("ml-auto", threatColors[competitor.threat])}>
                      {competitor.threat} threat
                    </Badge>
                  </div>

                  {/* Similarity Score */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Product Similarity</span>
                      <span className="font-medium">{competitor.similarity}%</span>
                    </div>
                    <Progress value={competitor.similarity} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${competitor.priceRange.min} - ${competitor.priceRange.max}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{competitor.marketShare} market share</span>
                    </div>
                  </div>

                  {/* Differentiators */}
                  <div className="flex flex-wrap gap-1.5">
                    {competitor.differentiators.map((diff) => (
                      <Badge key={diff} variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCompetitor?.(competitor)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
