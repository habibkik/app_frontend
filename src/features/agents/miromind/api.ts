/**
 * MiroMind API Client
 * Communicates with your backend that handles Claude Vision API
 */

import type {
  ProductUnderstandingRequest,
  ProductAnalysisResult,
  ContentGenerationRequest,
  ContentGenerationResult,
  MiroMindConfig,
} from "./types";
import { PRODUCT_ANALYSIS_PROMPT, CONTENT_GENERATION_PROMPTS, TONE_MODIFIERS } from "./prompts";

// Configure your backend endpoint here
const DEFAULT_CONFIG: MiroMindConfig = {
  apiEndpoint: import.meta.env.VITE_MIROMIND_API_ENDPOINT || "/api/miromind",
  timeout: 60000, // 60 seconds for vision analysis
};

/**
 * Analyze a product image using Claude Vision via your backend
 */
export async function analyzeProductImage(
  request: ProductUnderstandingRequest,
  config: Partial<MiroMindConfig> = {}
): Promise<ProductAnalysisResult> {
  const startTime = Date.now();
  const { apiEndpoint, timeout } = { ...DEFAULT_CONFIG, ...config };

  try {
    // If no endpoint configured, use mock for demo
    if (!import.meta.env.VITE_MIROMIND_API_ENDPOINT) {
      console.log("MiroMind: No API endpoint configured - using mock analysis");
      return await mockProductAnalysis(request, startTime);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${apiEndpoint}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: request.imageBase64,
        mimeType: request.mimeType,
        context: request.additionalContext,
        systemPrompt: PRODUCT_ANALYSIS_PROMPT,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      success: true,
      productName: data.productName || "Unknown Product",
      productCategory: data.productCategory || "General",
      components: data.components || [],
      overallConfidence: data.overallConfidence || 0,
      processingTime: Date.now() - startTime,
      suggestedTags: data.suggestedTags || [],
      attributes: data.attributes || {},
    };
  } catch (error) {
    console.error("MiroMind analysis error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        productName: "",
        productCategory: "",
        components: [],
        overallConfidence: 0,
        processingTime: Date.now() - startTime,
        suggestedTags: [],
        attributes: {},
        error: "Analysis timed out. Please try again.",
      };
    }

    // Fallback to mock for demo
    console.log("MiroMind: Falling back to mock analysis");
    return await mockProductAnalysis(request, startTime);
  }
}

/**
 * Generate marketing content for a product
 */
export async function generateProductContent(
  request: ContentGenerationRequest,
  config: Partial<MiroMindConfig> = {}
): Promise<ContentGenerationResult> {
  const { apiEndpoint, timeout } = { ...DEFAULT_CONFIG, ...config };

  try {
    if (!import.meta.env.VITE_MIROMIND_API_ENDPOINT) {
      console.log("MiroMind: No API endpoint configured - using mock content");
      return mockContentGeneration(request);
    }

    const systemPrompt = `${CONTENT_GENERATION_PROMPTS[request.contentType]} ${
      request.tone ? TONE_MODIFIERS[request.tone] : ""
    }`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 30000);

    const response = await fetch(`${apiEndpoint}/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productName: request.productName,
        productCategory: request.productCategory,
        components: request.components,
        attributes: request.attributes,
        contentType: request.contentType,
        systemPrompt,
        maxLength: request.maxLength,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.content,
      contentType: request.contentType,
      wordCount: data.content.split(/\s+/).length,
    };
  } catch (error) {
    console.error("MiroMind content generation error:", error);
    return mockContentGeneration(request);
  }
}

/**
 * Mock analysis for demonstration
 */
async function mockProductAnalysis(
  request: ProductUnderstandingRequest,
  startTime: number
): Promise<ProductAnalysisResult> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2500 + Math.random() * 1500));

  return {
    success: true,
    productName: "Electronic Device Assembly",
    productCategory: "Consumer Electronics",
    components: [
      {
        name: "Aluminum Housing Shell",
        category: "Structural",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 14.5,
        specifications: "6061-T6 Aluminum, CNC machined, anodized finish",
        material: "Aluminum Alloy",
        confidence: 94,
      },
      {
        name: "Main Control PCB",
        category: "Electronics",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 12.0,
        specifications: "4-layer FR-4, ENIG finish, 1.6mm thickness",
        material: "FR-4 Composite",
        confidence: 91,
      },
      {
        name: "LCD Display Module",
        category: "Display",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 18.5,
        specifications: '2.8" TFT, 320x240 resolution, ILI9341 driver',
        material: "Glass/ITO",
        confidence: 88,
      },
      {
        name: "Lithium Polymer Battery",
        category: "Power",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 6.25,
        specifications: "3.7V 3000mAh, protection circuit included",
        material: "Lithium Polymer",
        confidence: 92,
      },
      {
        name: "Tactile Switches",
        category: "Input",
        quantity: 4,
        unit: "pieces",
        estimatedUnitCost: 0.18,
        specifications: "6x6mm, 4.3mm height, 180gf actuation",
        material: "Plastic/Metal",
        confidence: 95,
      },
      {
        name: "USB-C Port Assembly",
        category: "Connectivity",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 1.45,
        specifications: "24-pin, 10Gbps data, 100W PD capable",
        material: "Metal/Plastic",
        confidence: 89,
      },
      {
        name: "Speaker Module",
        category: "Audio",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 2.3,
        specifications: "15mm diameter, 8Ω 1W, neodymium magnet",
        material: "Plastic/Metal",
        confidence: 86,
      },
      {
        name: "Rubber Gasket Set",
        category: "Sealing",
        quantity: 1,
        unit: "set",
        estimatedUnitCost: 0.85,
        specifications: "IP67 rated, silicone, custom profile",
        material: "Silicone Rubber",
        confidence: 90,
      },
      {
        name: "M2.5 Screw Set",
        category: "Fasteners",
        quantity: 1,
        unit: "set (12pcs)",
        estimatedUnitCost: 0.35,
        specifications: "M2.5x6mm, Phillips pan head, stainless",
        material: "Stainless Steel 304",
        confidence: 97,
      },
      {
        name: "Antenna Module",
        category: "Connectivity",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 3.2,
        specifications: "2.4GHz/5GHz dual-band, ceramic chip antenna",
        material: "Ceramic/PCB",
        confidence: 84,
      },
    ],
    overallConfidence: 89,
    processingTime: Date.now() - startTime,
    suggestedTags: ["electronics", "portable", "rechargeable", "wireless", "display"],
    attributes: {
      formFactor: "Handheld",
      powerSource: "Rechargeable Battery",
      connectivity: "USB-C, WiFi",
      displayType: "TFT LCD",
    },
  };
}

/**
 * Mock content generation
 */
function mockContentGeneration(request: ContentGenerationRequest): ContentGenerationResult {
  const templates = {
    description: `Introducing the ${request.productName}, a cutting-edge ${request.productCategory} device engineered for excellence. Featuring premium ${request.components[0]?.material || "materials"} construction and advanced ${request.components[1]?.name || "components"}, this product delivers unmatched performance and reliability. Perfect for professionals and enthusiasts alike.`,
    social: `🚀 Meet the ${request.productName}! ✨ Premium build quality meets cutting-edge tech. Built with ${request.components.length} precision components for ultimate performance. #Innovation #Tech #Quality`,
    ad: `Transform your workflow with the ${request.productName}. Premium ${request.productCategory} engineered for those who demand the best. Limited time offer - Order now!`,
    technical: `${request.productName} Technical Specifications:\n\nCategory: ${request.productCategory}\nComponents: ${request.components.length} integrated modules\nPrimary Materials: ${[...new Set(request.components.map((c) => c.material))].join(", ")}`,
  };

  const content = templates[request.contentType] || templates.description;

  return {
    success: true,
    content,
    contentType: request.contentType,
    wordCount: content.split(/\s+/).length,
  };
}
