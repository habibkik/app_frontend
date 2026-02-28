import { useState, useEffect } from "react";
import { Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAnalysisStore, type BOMAnalysisResult, type IdentifiedComponent } from "@/stores/analysisStore";
import { supabase } from "@/integrations/supabase/client";

interface SavedBOM {
  id: string;
  product_name: string;
  components_json: any;
  confidence: number;
  created_at: string;
  product_category: string | null;
}

interface BOMSelectorProps {
  /** Label for the empty/fallback option */
  fallbackLabel?: string;
  /** Called after a BOM is selected and loaded into the store */
  onBOMSelected?: (bomId: string) => void;
  /** Additional class names for the trigger */
  className?: string;
}

export function BOMSelector({ fallbackLabel = "Demo Data", onBOMSelected, className }: BOMSelectorProps) {
  const producerResults = useAnalysisStore((s) => s.producerResults);
  const setProducerResults = useAnalysisStore((s) => s.setProducerResults);
  const [savedBOMs, setSavedBOMs] = useState<SavedBOM[]>([]);
  const [selectedBOMId, setSelectedBOMId] = useState<string>("current");

  useEffect(() => {
    const fetchBOMs = async () => {
      const { data } = await supabase
        .from("bom_analyses")
        .select("id, product_name, components_json, confidence, created_at, product_category")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setSavedBOMs(data);
    };
    fetchBOMs();
  }, []);

  const handleBOMSelect = (bomId: string) => {
    setSelectedBOMId(bomId);
    if (bomId === "current") {
      onBOMSelected?.(bomId);
      return;
    }
    if (bomId === "fallback") {
      useAnalysisStore.getState().clearResults("producer");
      onBOMSelected?.(bomId);
      return;
    }
    const bom = savedBOMs.find(b => b.id === bomId);
    if (!bom) return;
    const components = (Array.isArray(bom.components_json) ? bom.components_json : []) as IdentifiedComponent[];
    const totalCost = components.reduce((s, c) => s + (c.estimatedUnitCost || 0) * (c.quantity || 1), 0);
    const result: BOMAnalysisResult = {
      success: true,
      productName: bom.product_name,
      productCategory: bom.product_category || "General",
      components,
      overallConfidence: bom.confidence || 0.8,
      processingTime: 0,
      suggestedTags: [],
      attributes: {},
      totalEstimatedCost: totalCost,
    };
    setProducerResults(result);
    onBOMSelected?.(bomId);
  };

  return (
    <Select value={selectedBOMId} onValueChange={handleBOMSelect}>
      <SelectTrigger className={className || "w-[220px] h-9 text-sm"}>
        <Package className="h-3.5 w-3.5 mr-1.5 shrink-0" />
        <SelectValue placeholder="Select BOM / Product" />
      </SelectTrigger>
      <SelectContent>
        {producerResults && (
          <SelectItem value="current">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>{producerResults.productName}</span>
              <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">Active</Badge>
            </div>
          </SelectItem>
        )}
        <SelectItem value="fallback">
          <span className="text-muted-foreground">{fallbackLabel}</span>
        </SelectItem>
        {savedBOMs.map((bom) => (
          <SelectItem key={bom.id} value={bom.id}>
            <div className="flex items-center gap-1.5">
              <span>{bom.product_name}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(bom.created_at).toLocaleDateString()}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
