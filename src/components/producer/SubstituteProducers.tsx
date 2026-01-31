/**
 * Substitute Producers Component
 * Shows manufacturers producing alternative/substitute products
 */
import { motion } from "framer-motion";
import { 
  Repeat2, 
  Factory, 
  MapPin, 
  TrendingDown,
  Award,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SubstituteProducer } from "@/stores/analysisStore";

interface SubstituteProducersProps {
  producers: SubstituteProducer[];
  onViewProducer?: (producer: SubstituteProducer) => void;
}

export function SubstituteProducers({ 
  producers,
  onViewProducer,
}: SubstituteProducersProps) {
  if (!producers || producers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Repeat2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Substitute Producers</h3>
          <p className="text-muted-foreground text-sm">
            No alternative product manufacturers identified
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
            Substitute Product Manufacturers
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {producers.length} alternatives
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Manufacturers producing similar alternative products that could compete with yours
        </p>

        <div className="space-y-4">
          {producers.map((producer, index) => (
            <motion.div
              key={producer.id}
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
                      <Factory className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{producer.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Produces: {producer.substituteProduct}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-emerald-500/10 text-emerald-600 border-0"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {producer.priceAdvantage}
                    </Badge>
                  </div>

                  {/* Similarity */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Product Similarity</span>
                      <span className="font-medium">{producer.similarity}%</span>
                    </div>
                    <Progress value={producer.similarity} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{producer.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{producer.productionCapacity}</span>
                    </div>
                  </div>

                  {/* Certifications */}
                  {producer.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {producer.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1 text-amber-500" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewProducer?.(producer)}
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
