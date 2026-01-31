/**
 * Producer Competition Component
 * Shows competing manufacturers/producers for the analyzed product
 */
import { motion } from "framer-motion";
import { 
  Factory, 
  MapPin, 
  Clock, 
  DollarSign,
  Award,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ProducerCompetitor } from "@/stores/analysisStore";

interface ProducerCompetitionProps {
  competitors: ProducerCompetitor[];
  onViewCompetitor?: (competitor: ProducerCompetitor) => void;
}

export function ProducerCompetition({ 
  competitors,
  onViewCompetitor,
}: ProducerCompetitionProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Factory className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Competitors Found</h3>
          <p className="text-muted-foreground text-sm">
            Upload a product to analyze manufacturing competition
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
            <Factory className="h-5 w-5 text-indigo-500" />
            Manufacturing Competition
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {competitors.length} producers
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Competing manufacturers producing the same or similar products
        </p>

        <div className="space-y-4">
          {competitors.map((competitor, index) => {
            const shareValue = parseFloat(competitor.marketShare) || 0;
            const sharePercent = totalShare > 0 ? (shareValue / totalShare) * 100 : 0;

            return (
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
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-500">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {competitor.location}
                        </p>
                      </div>
                    </div>

                    {/* Market Share */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Market Share</span>
                        <span className="font-medium">{competitor.marketShare}</span>
                      </div>
                      <Progress value={sharePercent} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${competitor.priceRange.min} - ${competitor.priceRange.max}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{competitor.leadTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>Capacity: {competitor.productionCapacity}</span>
                      </div>
                    </div>

                    {/* Certifications */}
                    {competitor.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {competitor.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1 text-amber-500" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Strengths */}
                    <div className="flex flex-wrap gap-1.5">
                      {competitor.strengths.slice(0, 3).map((strength) => (
                        <Badge 
                          key={strength} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {strength}
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
