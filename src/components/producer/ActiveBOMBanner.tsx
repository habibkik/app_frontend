import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useModeStore } from "@/stores/modeStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, ArrowRight, Plus } from "lucide-react";

export function ActiveBOMBanner() {
  const mode = useModeStore((s) => s.mode);
  const producerResults = useAnalysisStore((s) => s.producerResults);
  const navigate = useNavigate();

  // Only show in producer mode
  if (mode !== "producer") return null;

  if (!producerResults) {
    return (
      <div className="mx-2 sm:mx-4 md:mx-6 mt-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>No active BOM analysis. Upload a product image to get started.</span>
        </div>
        <Button size="sm" variant="default" className="gap-1.5" onClick={() => navigate("/dashboard/bom")}>
          <Plus className="h-3.5 w-3.5" /> New Analysis
        </Button>
      </div>
    );
  }

  const componentCount = producerResults.components.length;
  const confidence = Math.round(producerResults.overallConfidence * 100);
  const totalCost = producerResults.totalEstimatedCost;

  return (
    <div className="mx-2 sm:mx-4 md:mx-6 mt-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="gap-1 shrink-0">
          <Sparkles className="h-3 w-3" /> Active BOM
        </Badge>
        <span className="text-sm font-medium text-foreground">{producerResults.productName}</span>
        <span className="text-xs text-muted-foreground">
          {componentCount} components • ${totalCost.toFixed(2)} est. • {confidence}% confidence
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="gap-1 text-xs h-7" onClick={() => navigate("/dashboard/bom")}>
          View BOM <ArrowRight className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => {
          useAnalysisStore.getState().clearResults("producer");
          navigate("/dashboard/bom");
        }}>
          <Plus className="h-3 w-3" /> New
        </Button>
      </div>
    </div>
  );
}
