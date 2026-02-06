// Seller feature barrel export

// Market Intelligence Components
export { MarketSearch } from "@/components/market/MarketSearch";
export { AnalysisSummaryCard } from "@/components/market/AnalysisSummaryCard";
export { TrendAnalysisCard } from "@/components/market/TrendAnalysisCard";
export { CompetitorAnalysisCard } from "@/components/market/CompetitorAnalysisCard";
export { PricingAnalysisCard } from "@/components/market/PricingAnalysisCard";
export { AnalysisHistory } from "@/components/market/AnalysisHistory";

// Seller Components
export { CompetitorDisplay } from "@/components/seller/CompetitorDisplay";
export { PricingRecommendation } from "@/components/seller/PricingRecommendation";
export { DemandIndicators } from "@/components/seller/DemandIndicators";
export { ImageMarketAnalysis } from "@/components/seller/ImageMarketAnalysis";
export { MarketHeatMap } from "@/components/seller/MarketHeatMap";
export { SubstituteCompetitors } from "@/components/seller/SubstituteCompetitors";
export { CompetitorDetailModal, type CompetitorData } from "@/components/seller/CompetitorDetailModal";

// Competitor Monitor Components
export { CompetitorMonitor } from "./components/CompetitorMonitor";
export { CompetitorMonitorHeader } from "./components/CompetitorMonitorHeader";
export { CompetitorMetricsCards } from "./components/CompetitorMetricsCards";
export { CompetitorPriceTrendChart } from "./components/CompetitorPriceTrendChart";
export { CompetitorTable } from "./components/CompetitorTable";
export { PriceMovementAlerts } from "./components/PriceMovementAlerts";
export { MarketInsightsPanel } from "./components/MarketInsightsPanel";

// Competitor Monitor Types (Legacy)
export type {
  MonitoredProduct,
  CompetitorTableRow,
  PriceMovementAlert,
  MarketInsight,
  Platform,
  StockStatus,
  AlertType,
  AlertSeverity,
  AlertStatus,
  BusinessType,
  CompetitorStatusType,
  ContactInfo,
  ReputationMetrics,
  EngagementMetrics,
  MarketStatsExtended,
  AvailabilityMetrics,
  DataQualityMetrics,
  MarketInsightsData,
  AlertConfiguration,
  CompetitorActivityLog,
  CompetitorGroup,
} from "./types/competitorMonitor";

// Comprehensive Competitor Intelligence Types
export type {
  Competitor,
  CompetitorPrice,
  CompetitorListing,
  CompetitorMarketData,
  MarketStats,
  MarketTrends,
  MarketInsights,
  PriceAlert,
  AlertConfiguration as PriceAlertConfiguration,
  PriceTrendPoint,
  CompetitorActivityLog as CompetitorActivity,
  CompetitorComparison,
  CompetitorTracking,
  CompetitorGroup as CompetitorGroupFull,
  MarketReport,
  CompetitorFilters,
  MarketDataFilters,
  CompetitorDataResponse,
  PaginatedCompetitorResponse,
  CompetitorPlatform,
  AlertCategory,
  AsyncStatus,
  AsyncState,
} from "./types/competitorIntelligence";

// Type guards
export {
  isCompetitor,
  isCompetitorPrice,
  isCompetitorMarketData,
  isPriceAlert,
} from "./types/competitorIntelligence";

// Type converters
export {
  toCompetitor,
  toCompetitorListing,
  fromCompetitorListing,
  toPriceAlert,
  fromPriceAlert,
  toCompetitorPlatform,
  fromCompetitorPlatform,
  getSeverityColors,
  getPlatformIcon,
  getCompetitivenessBadge,
} from "./utils/competitorTypeConverters";

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

// Competitor API
export {
  startMonitoring,
  refreshCompetitors,
  getCompetitorData,
  getCompetitorDetails,
  getPriceHistory,
  setAutoRefresh,
  dismissAlert,
  competitorApi,
  type AutoRefreshSettings,
  type PriceHistoryItem,
  type CompetitorDetails,
} from "./api";
 
 // Content Studio
 export { ContentStudio } from "./components/ContentStudio";

 // Pricing Optimizer
 export { PricingOptimizerComponent } from "./components/PricingOptimizerComponent";

 // Social Publisher
 export { SocialPublisher } from "./components/SocialPublisher";

 // Seller Dashboard
 export { default as SellerDashboard } from "./pages/SellerDashboard";
