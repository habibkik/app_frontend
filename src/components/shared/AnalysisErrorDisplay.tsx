/**
 * Analysis Error Display
 * Shows error state with retry option
 */
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisError } from "@/stores/analysisStore";

interface AnalysisErrorDisplayProps {
  error: AnalysisError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function AnalysisErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss 
}: AnalysisErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            
            <h3 className="font-semibold text-foreground mb-1">
              Analysis Failed
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {error.message}
            </p>
            
            <div className="flex items-center gap-3">
              {error.retryable && onRetry && (
                <Button onClick={onRetry} size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button variant="outline" onClick={onDismiss} size="sm">
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
