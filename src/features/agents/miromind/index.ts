/**
 * MiroMind Agent
 * Product understanding and content generation using Claude Vision API
 * 
 * This agent communicates with your backend endpoint that handles
 * the Anthropic Claude Vision API. Configure the endpoint via:
 * VITE_MIROMIND_API_ENDPOINT environment variable
 * 
 * Your backend should expose:
 * - POST /analyze - Accepts image and returns component analysis
 * - POST /generate-content - Generates marketing content
 */

// Types
export type {
  ProductUnderstandingRequest,
  ProductAnalysisResult,
  IdentifiedComponent,
  ContentGenerationRequest,
  ContentGenerationResult,
  MiroMindConfig,
} from "./types";

// Content Generation Types
export type {
  GeneratedContent,
  TargetAudience,
  ContentTone,
  GenerateContentOptions,
} from "./contentGeneration";

// API Functions
export { analyzeProductImage, generateProductContent } from "./api";

// Content Generation (AI-powered marketing content)
export { 
  generateMarketingContent, 
  generateContentWithOptions 
} from "./contentGeneration";

// Prompts (for reference/customization)
export { PRODUCT_ANALYSIS_PROMPT, CONTENT_GENERATION_PROMPTS, TONE_MODIFIERS } from "./prompts";

// Legacy exports for backward compatibility
export { analyzeProductImage as productUnderstanding } from "./api";
export { generateProductContent as contentGeneration } from "./api";

// Re-export main function as default
export { analyzeProductImage as default } from "./api";
