/**
 * Substitute Products Component
 * Shows alternative products identified from image analysis
 */
import { motion } from "framer-motion";
import { 
  Repeat2, 
  TrendingDown, 
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Substitute {
  name: string;
  similarity: number;
  priceAdvantage: string;
}

interface SubstituteProductsProps {
  substitutes: Substitute[];
  onExplore?: (substitute: Substitute) => void;
}

export function SubstituteProducts({ 
  substitutes,
  onExplore,
}: SubstituteProductsProps) {
  if (substitutes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat2 className="h-5 w-5 text-amber-500" />
          Alternative Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Similar products that could serve your needs with potential cost savings
        </p>
        
        <div className="space-y-3">
          {substitutes.map((substitute, index) => (
            <motion.div
              key={substitute.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                "bg-muted/50 hover:bg-muted transition-colors"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {substitute.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {substitute.similarity}% similar
                    </span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-emerald-500/10 text-emerald-600 border-0"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {substitute.priceAdvantage}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExplore?.(substitute)}
              >
                Explore
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
