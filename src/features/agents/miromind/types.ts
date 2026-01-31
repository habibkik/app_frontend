/**
 * MiroMind Agent Types
 * Product understanding and content generation using Claude Vision
 */

export interface ProductUnderstandingRequest {
  imageBase64: string;
  mimeType: string;
  additionalContext?: string;
}

export interface IdentifiedComponent {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  specifications: string;
  material: string;
  confidence: number;
}

export interface ProductAnalysisResult {
  success: boolean;
  productName: string;
  productCategory: string;
  components: IdentifiedComponent[];
  overallConfidence: number;
  processingTime: number;
  suggestedTags: string[];
  attributes: Record<string, string>;
  error?: string;
}

export interface ContentGenerationRequest {
  productName: string;
  productCategory: string;
  components: IdentifiedComponent[];
  attributes: Record<string, string>;
  contentType: "description" | "social" | "ad" | "technical";
  tone?: "professional" | "casual" | "technical" | "marketing";
  maxLength?: number;
}

export interface ContentGenerationResult {
  success: boolean;
  content: string;
  contentType: string;
  wordCount: number;
  error?: string;
}

export interface MiroMindConfig {
  apiEndpoint: string;
  timeout?: number;
}
