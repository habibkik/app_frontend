/**
 * Competitor Display Component
 * Shows competitors identified from image analysis
 */
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp,
  DollarSign,
  Star,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CompetitorInfo } from "@/stores/analysisStore";

interface CompetitorDisplayProps {
  competitors: CompetitorInfo[];
  onViewCompetitor?: (competitor: CompetitorInfo) => void;
}

export function CompetitorDisplay({ 
  competitors,
  onViewCompetitor,
}: CompetitorDisplayProps) {
  if (competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Competitors Found</h3>
          <p className="text-muted-foreground text-sm">
            Upload a product image to analyze competitors
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate relative market share for visualization
  const totalShare = competitors.reduce((sum, c) => {
    const share = parseFloat(c.marketShare) || 0;
    return sum + share;
  }, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Competitive Landscape
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {competitors.length} competitors
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {competitors.map((competitor, index) => {
          const shareValue = parseFloat(competitor.marketShare) || 0;
          const sharePercent = totalShare > 0 ? (shareValue / totalShare) * 100 : 0;
          
          return (
            <motion.div
              key={competitor.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border border-border bg-card",
                "hover:border-primary/30 hover:shadow-sm transition-all duration-200"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Competitor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-500">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {competitor.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {competitor.marketShare} market share
                      </p>
                    </div>
                  </div>

                  {/* Market Share Bar */}
                  <div className="mb-3">
                    <Progress 
                      value={sharePercent} 
                      className="h-2"
                    />
                  </div>

                  {/* Price Range */}
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      ${competitor.priceRange.min} - ${competitor.priceRange.max}
                    </span>
                  </div>

                  {/* Strengths */}
                  <div className="flex flex-wrap gap-1.5">
                    {competitor.strengths.slice(0, 3).map((strength) => (
                      <Badge 
                        key={strength} 
                        variant="outline" 
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1 text-amber-500" />
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCompetitor?.(competitor)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
