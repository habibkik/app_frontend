/**
 * AI Analysis Service
 * 
 * This service uses MiroMind agent for product image analysis.
 * Configure your backend endpoint via VITE_MIROMIND_API_ENDPOINT
 * 
 * Your backend should implement Claude Vision API integration
 * and expose the endpoints that MiroMind expects.
 */

import { 
  analyzeProductImage as miroMindAnalyze,
  type ProductAnalysisResult,
  type IdentifiedComponent,
} from "@/features/agents/miromind";

// Re-export types with legacy names for backward compatibility
export interface AnalyzedComponent {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  specifications: string;
  material: string;
  confidence: number;
}

export interface AnalysisResult {
  success: boolean;
  productName: string;
  components: AnalyzedComponent[];
  overallConfidence: number;
  processingTime: number;
  error?: string;
}

export interface AnalysisRequest {
  imageBase64: string;
  mimeType: string;
  additionalContext?: string;
}

/**
 * Analyzes a product image using MiroMind (Claude Vision)
 */
export async function analyzeProductImage(request: AnalysisRequest): Promise<AnalysisResult> {
  const result = await miroMindAnalyze({
    imageBase64: request.imageBase64,
    mimeType: request.mimeType,
    additionalContext: request.additionalContext,
  });

  // Map MiroMind result to legacy AnalysisResult format
  return {
    success: result.success,
    productName: result.productName,
    components: result.components.map(mapComponent),
    overallConfidence: result.overallConfidence,
    processingTime: result.processingTime,
    error: result.error,
  };
}

/**
 * Maps MiroMind component to legacy format
 */
function mapComponent(component: IdentifiedComponent): AnalyzedComponent {
  return {
    name: component.name,
    category: component.category,
    quantity: component.quantity,
    unit: component.unit,
    estimatedUnitCost: component.estimatedUnitCost,
    specifications: component.specifications,
    material: component.material,
    confidence: component.confidence,
  };
}

/**
 * Converts a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
