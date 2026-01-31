/**
 * Market Intelligence Service
 * 
 * Configure this service to connect to your backend API for market analysis.
 * Update the API_ENDPOINT to point to your market intelligence backend.
 */

export interface MarketAnalysisRequest {
  query: string;
  type: "product" | "competitor" | "trend" | "pricing";
  industry?: string;
  region?: string;
}

export interface CompetitorData {
  name: string;
  marketShare: number;
  priceRange: { min: number; max: number };
  strengths: string[];
  weaknesses: string[];
  recentActivity: string[];
}

export interface TrendData {
  name: string;
  direction: "up" | "down" | "stable";
  changePercent: number;
  timeframe: string;
  description: string;
  confidence: number;
}

export interface PricingInsight {
  productCategory: string;
  averagePrice: number;
  priceRange: { min: number; max: number };
  recommendedPrice: number;
  demandLevel: "high" | "medium" | "low";
  competitorPrices: { name: string; price: number }[];
}

export interface MarketAnalysisResult {
  success: boolean;
  query: string;
  summary: string;
  competitors?: CompetitorData[];
  trends?: TrendData[];
  pricing?: PricingInsight;
  insights: string[];
  sources?: string[];
  analyzedAt: string;
  error?: string;
}

export interface SavedAnalysis {
  id: string;
  query: string;
  type: MarketAnalysisRequest["type"];
  result: MarketAnalysisResult;
  createdAt: string;
}

const API_ENDPOINT = import.meta.env.VITE_MARKET_INTEL_ENDPOINT || "/api/market-intelligence";
const STORAGE_KEY = "market-intel-history";

/**
 * Analyzes market data using your backend API
 */
export async function analyzeMarket(request: MarketAnalysisRequest): Promise<MarketAnalysisResult> {
  try {
    // If no endpoint configured, use mock data
    if (!import.meta.env.VITE_MARKET_INTEL_ENDPOINT) {
      console.log("No market intel endpoint configured - using mock analysis");
      return await mockMarketAnalysis(request);
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add your auth headers here
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Market analysis error:", error);
    return await mockMarketAnalysis(request);
  }
}

/**
 * Mock analysis for demonstration
 */
async function mockMarketAnalysis(request: MarketAnalysisRequest): Promise<MarketAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1500));

  const baseResult: MarketAnalysisResult = {
    success: true,
    query: request.query,
    summary: "",
    insights: [],
    analyzedAt: new Date().toISOString(),
    sources: [
      "Industry Report Q4 2025",
      "Market Research Database",
      "Competitive Intelligence Network",
    ],
  };

  if (request.type === "competitor") {
    return {
      ...baseResult,
      summary: `Competitive analysis for "${request.query}" reveals a dynamic market with 5 major players. The market leader holds 28% share with strong brand recognition, while emerging competitors are gaining ground through innovative pricing strategies.`,
      competitors: [
        {
          name: "MarketLeader Corp",
          marketShare: 28,
          priceRange: { min: 299, max: 599 },
          strengths: ["Brand recognition", "Distribution network", "R&D investment"],
          weaknesses: ["Higher pricing", "Slower innovation cycle"],
          recentActivity: ["Launched premium tier", "Expanded to APAC region"],
        },
        {
          name: "InnovateTech Inc",
          marketShare: 22,
          priceRange: { min: 199, max: 449 },
          strengths: ["Innovation speed", "Competitive pricing", "Tech features"],
          weaknesses: ["Limited distribution", "Brand awareness"],
          recentActivity: ["New AI features", "Partnership with retailers"],
        },
        {
          name: "ValueFirst Solutions",
          marketShare: 18,
          priceRange: { min: 149, max: 349 },
          strengths: ["Cost leadership", "Volume production", "Quick delivery"],
          weaknesses: ["Quality perception", "Limited features"],
          recentActivity: ["Cost reduction program", "New entry-level model"],
        },
        {
          name: "QualityPro Ltd",
          marketShare: 15,
          priceRange: { min: 399, max: 799 },
          strengths: ["Premium quality", "Customer service", "Warranty"],
          weaknesses: ["Premium pricing", "Niche market"],
          recentActivity: ["Sustainability initiative", "B2B focus expansion"],
        },
      ],
      insights: [
        "Market consolidation expected in next 12-18 months",
        "Price sensitivity increasing among mid-market buyers",
        "AI/ML features becoming key differentiator",
        "Sustainability certifications gaining importance",
      ],
    };
  }

  if (request.type === "trend") {
    return {
      ...baseResult,
      summary: `Market trends for "${request.query}" show strong growth momentum with sustainability and AI integration as key drivers. Consumer preferences are shifting towards eco-friendly options with smart features.`,
      trends: [
        {
          name: "AI Integration",
          direction: "up",
          changePercent: 45,
          timeframe: "12 months",
          description: "Products with AI/ML capabilities seeing rapid adoption",
          confidence: 92,
        },
        {
          name: "Sustainability Focus",
          direction: "up",
          changePercent: 38,
          timeframe: "12 months",
          description: "Eco-friendly materials and packaging in high demand",
          confidence: 88,
        },
        {
          name: "Direct-to-Consumer",
          direction: "up",
          changePercent: 28,
          timeframe: "12 months",
          description: "Brands bypassing traditional retail channels",
          confidence: 85,
        },
        {
          name: "Traditional Retail",
          direction: "down",
          changePercent: -15,
          timeframe: "12 months",
          description: "Brick-and-mortar channel share declining",
          confidence: 90,
        },
        {
          name: "Premium Segment",
          direction: "stable",
          changePercent: 3,
          timeframe: "12 months",
          description: "Luxury segment maintaining steady growth",
          confidence: 78,
        },
      ],
      insights: [
        "Early adopters of AI features gaining market share",
        "Sustainability certifications becoming purchase drivers",
        "Omnichannel presence critical for brand visibility",
        "Subscription models growing in recurring revenue categories",
      ],
    };
  }

  if (request.type === "pricing") {
    return {
      ...baseResult,
      summary: `Pricing analysis for "${request.query}" indicates optimal pricing range of $249-$349 for maximum market penetration. Current market average sits at $285 with high demand elasticity below $300.`,
      pricing: {
        productCategory: request.query,
        averagePrice: 285,
        priceRange: { min: 149, max: 599 },
        recommendedPrice: 279,
        demandLevel: "high",
        competitorPrices: [
          { name: "MarketLeader Corp", price: 349 },
          { name: "InnovateTech Inc", price: 289 },
          { name: "ValueFirst Solutions", price: 199 },
          { name: "QualityPro Ltd", price: 449 },
          { name: "NewEntrant Co", price: 259 },
        ],
      },
      insights: [
        "Price point below $300 shows 40% higher conversion rate",
        "Bundle pricing can increase average order value by 25%",
        "Seasonal promotions most effective in Q4",
        "Premium positioning requires $400+ price point",
      ],
    };
  }

  // Default product analysis
  return {
    ...baseResult,
    summary: `Product market analysis for "${request.query}" shows strong potential with growing demand. The market size is estimated at $4.2B with 12% YoY growth. Key success factors include quality, pricing, and distribution reach.`,
    trends: [
      {
        name: "Market Growth",
        direction: "up",
        changePercent: 12,
        timeframe: "YoY",
        description: "Overall market expanding steadily",
        confidence: 90,
      },
      {
        name: "Online Sales",
        direction: "up",
        changePercent: 25,
        timeframe: "12 months",
        description: "E-commerce channel accelerating",
        confidence: 88,
      },
    ],
    insights: [
      "High growth potential in emerging markets",
      "Quality differentiation key to premium positioning",
      "Supply chain efficiency critical for competitiveness",
      "Customer reviews heavily influence purchase decisions",
    ],
  };
}

// History management
export function getAnalysisHistory(): SavedAnalysis[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAnalysisToHistory(
  query: string,
  type: MarketAnalysisRequest["type"],
  result: MarketAnalysisResult
): SavedAnalysis {
  const history = getAnalysisHistory();
  const saved: SavedAnalysis = {
    id: `analysis-${Date.now()}`,
    query,
    type,
    result,
    createdAt: new Date().toISOString(),
  };
  
  history.unshift(saved);
  // Keep last 20 analyses
  const trimmed = history.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  
  return saved;
}

export function deleteFromHistory(id: string): void {
  const history = getAnalysisHistory();
  const filtered = history.filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
