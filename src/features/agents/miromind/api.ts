/**
 * MiroMind API Client
 * Communicates with your backend that handles Claude Vision API
 * Supports all three modes: Buyer (Sourcing), Producer (BOM), Seller (Market)
 */

import type {
  ProductUnderstandingRequest,
  ProductAnalysisResult,
  ContentGenerationRequest,
  ContentGenerationResult,
  MiroMindConfig,
} from "./types";
import { 
  PRODUCT_ANALYSIS_PROMPT, 
  SOURCING_ANALYSIS_PROMPT,
  MARKET_ANALYSIS_PROMPT,
  CONTENT_GENERATION_PROMPTS, 
  TONE_MODIFIERS 
} from "./prompts";
import type { 
  SupplierDiscoveryResult, 
  MarketAnalysisResult 
} from "@/stores/analysisStore";

// Configure your backend endpoint here
const DEFAULT_CONFIG: MiroMindConfig = {
  apiEndpoint: import.meta.env.VITE_MIROMIND_API_ENDPOINT || "/api/miromind",
  timeout: 60000, // 60 seconds for vision analysis
};

// ============================================================
// PRODUCER MODE - BOM Analysis
// ============================================================

/**
 * Analyze a product image using Claude Vision via your backend
 * Used for Producer mode - generates Bill of Materials
 */
export async function analyzeProductImage(
  request: ProductUnderstandingRequest,
  config: Partial<MiroMindConfig> = {}
): Promise<ProductAnalysisResult> {
  const startTime = Date.now();
  const { apiEndpoint, timeout } = { ...DEFAULT_CONFIG, ...config };

  try {
    if (!import.meta.env.VITE_MIROMIND_API_ENDPOINT) {
      console.log("MiroMind: No API endpoint configured - using mock analysis");
      return await mockProductAnalysis(startTime);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${apiEndpoint}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw new Error(`API error: ${response.status}`);
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
    return await mockProductAnalysis(startTime);
  }
}

// ============================================================
// BUYER MODE - Supplier Discovery & Sourcing
// ============================================================

/**
 * Analyze a product image for sourcing purposes
 * Used for Buyer mode - finds suppliers and alternatives
 */
export async function analyzeForSourcing(
  request: ProductUnderstandingRequest,
  config: Partial<MiroMindConfig> = {}
): Promise<SupplierDiscoveryResult> {
  const { apiEndpoint, timeout } = { ...DEFAULT_CONFIG, ...config };

  try {
    if (!import.meta.env.VITE_MIROMIND_API_ENDPOINT) {
      console.log("MiroMind: Using mock sourcing analysis");
      return await mockSourcingAnalysis();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${apiEndpoint}/analyze-for-sourcing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: request.imageBase64,
        mimeType: request.mimeType,
        context: request.additionalContext,
        systemPrompt: SOURCING_ANALYSIS_PROMPT,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("MiroMind sourcing analysis error:", error);
    return await mockSourcingAnalysis();
  }
}

// ============================================================
// SELLER MODE - Market Intelligence
// ============================================================

/**
 * Analyze a product image for market intelligence
 * Used for Seller mode - competitive analysis and pricing
 */
export async function analyzeForSelling(
  request: ProductUnderstandingRequest,
  config: Partial<MiroMindConfig> = {}
): Promise<MarketAnalysisResult> {
  const { apiEndpoint, timeout } = { ...DEFAULT_CONFIG, ...config };

  try {
    if (!import.meta.env.VITE_MIROMIND_API_ENDPOINT) {
      console.log("MiroMind: Using mock market analysis");
      return await mockMarketAnalysis();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${apiEndpoint}/analyze-for-selling`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: request.imageBase64,
        mimeType: request.mimeType,
        context: request.additionalContext,
        systemPrompt: MARKET_ANALYSIS_PROMPT,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("MiroMind market analysis error:", error);
    return await mockMarketAnalysis();
  }
}

// ============================================================
// CONTENT GENERATION (Shared across modes)
// ============================================================

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
      return mockContentGeneration(request);
    }

    const systemPrompt = `${CONTENT_GENERATION_PROMPTS[request.contentType]} ${
      request.tone ? TONE_MODIFIERS[request.tone] : ""
    }`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 30000);

    const response = await fetch(`${apiEndpoint}/generate-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

// ============================================================
// MOCK FUNCTIONS FOR DEMO MODE
// ============================================================

async function mockProductAnalysis(startTime: number): Promise<ProductAnalysisResult> {
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
        specifications: '2.8" TFT, 320x240 resolution',
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
        name: "USB-C Port Assembly",
        category: "Connectivity",
        quantity: 1,
        unit: "piece",
        estimatedUnitCost: 1.45,
        specifications: "24-pin, 10Gbps data, 100W PD capable",
        material: "Metal/Plastic",
        confidence: 89,
      },
    ],
    overallConfidence: 89,
    processingTime: Date.now() - startTime,
    suggestedTags: ["electronics", "portable", "rechargeable", "wireless"],
    attributes: {
      formFactor: "Handheld",
      powerSource: "Rechargeable Battery",
      connectivity: "USB-C, WiFi",
    },
  };
}

async function mockSourcingAnalysis(): Promise<SupplierDiscoveryResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

  return {
    productIdentification: {
      name: "Wireless Bluetooth Speaker",
      category: "Consumer Electronics",
      specifications: {
        "Power Output": "20W",
        "Battery Life": "12 hours",
        "Connectivity": "Bluetooth 5.0",
      },
    },
    suggestedSuppliers: [
      {
        id: "sup-001",
        name: "Shenzhen Audio Tech Co.",
        matchScore: 94,
        priceRange: { min: 12, max: 18 },
        moq: 500,
        leadTime: "15-20 days",
        location: "Shenzhen, China",
        verified: true,
      },
      {
        id: "sup-002",
        name: "Dongguan Sound Systems",
        matchScore: 89,
        priceRange: { min: 14, max: 22 },
        moq: 300,
        leadTime: "20-25 days",
        location: "Dongguan, China",
        verified: true,
      },
      {
        id: "sup-003",
        name: "Vietnam Electronics Mfg",
        matchScore: 82,
        priceRange: { min: 16, max: 24 },
        moq: 200,
        leadTime: "25-30 days",
        location: "Ho Chi Minh, Vietnam",
        verified: false,
      },
    ],
    substitutes: [
      { name: "Wired Portable Speaker", similarity: 75, priceAdvantage: "30% cheaper" },
      { name: "Mini Bluetooth Earbuds", similarity: 60, priceAdvantage: "Higher volume" },
    ],
    estimatedMarketPrice: { min: 29, max: 79 },
    confidence: 87,
  };
}

async function mockMarketAnalysis(): Promise<MarketAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

  return {
    productIdentification: {
      name: "Wireless Bluetooth Speaker",
      category: "Consumer Electronics",
      attributes: {
        "Target Segment": "Young professionals",
        "Quality Tier": "Mid-range",
      },
    },
    competitors: [
      {
        name: "JBL Flip Series",
        priceRange: { min: 99, max: 149 },
        marketShare: "28%",
        strengths: ["Brand recognition", "Bass quality", "Durability"],
      },
      {
        name: "Anker Soundcore",
        priceRange: { min: 49, max: 89 },
        marketShare: "18%",
        strengths: ["Value pricing", "Battery life"],
      },
      {
        name: "Sony SRS Series",
        priceRange: { min: 79, max: 199 },
        marketShare: "15%",
        strengths: ["Premium sound", "Brand trust"],
      },
    ],
    marketPriceRange: { min: 39, max: 149, average: 79 },
    pricingRecommendation: {
      suggested: 59,
      marginScenarios: [
        { margin: "Low (20%)", price: 45, competitiveness: "Very competitive" },
        { margin: "Medium (35%)", price: 59, competitiveness: "Balanced" },
        { margin: "High (50%)", price: 72, competitiveness: "Premium positioning" },
      ],
    },
    demandIndicators: {
      trend: "rising",
      seasonality: "Strong Q4, moderate summer peak",
      searchVolume: "High - 450K monthly searches",
    },
    confidence: 85,
  };
}

function mockContentGeneration(request: ContentGenerationRequest): ContentGenerationResult {
  const templates = {
    description: `Introducing the ${request.productName}, a cutting-edge ${request.productCategory} device engineered for excellence. Featuring premium construction and advanced components, this product delivers unmatched performance.`,
    social: `🚀 Meet the ${request.productName}! ✨ Premium quality meets innovation. #Tech #Quality #Innovation`,
    ad: `Transform your experience with the ${request.productName}. Premium ${request.productCategory} for those who demand the best. Order now!`,
    technical: `${request.productName} Specifications:\nCategory: ${request.productCategory}\nComponents: ${request.components.length} integrated modules`,
  };

  const content = templates[request.contentType] || templates.description;

  return {
    success: true,
    content,
    contentType: request.contentType,
    wordCount: content.split(/\s+/).length,
  };
}
