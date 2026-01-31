// Seller feature barrel export

// Market Intelligence Components
export { MarketSearch } from "@/components/market/MarketSearch";
export { AnalysisSummaryCard } from "@/components/market/AnalysisSummaryCard";
export { TrendAnalysisCard } from "@/components/market/TrendAnalysisCard";
export { CompetitorAnalysisCard } from "@/components/market/CompetitorAnalysisCard";
export { PricingAnalysisCard } from "@/components/market/PricingAnalysisCard";
export { AnalysisHistory } from "@/components/market/AnalysisHistory";

// Pages
export { default as MarketIntelligencePage } from "@/pages/dashboard/MarketIntelligence";
export { default as PricingPage } from "@/pages/dashboard/Pricing";
export { default as CampaignsPage } from "@/pages/dashboard/Campaigns";
export { default as WebsiteBuilderPage } from "@/pages/dashboard/WebsiteBuilder";

// API/Services
export { 
  analyzeMarket, 
  saveAnalysisToHistory,
  type MarketAnalysisRequest,
  type MarketAnalysisResult,
} from "@/lib/market-intel-service";
