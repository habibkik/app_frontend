// Competitor Monitor Types - Extended for backward compatibility

// Extended Platform type including all social/messaging platforms
export type Platform = 
  | "Facebook" 
  | "Amazon" 
  | "OLX" 
  | "Ouedkniss" 
  | "Website" 
  | "Instagram"
  | "WhatsApp"
  | "Telegram"
  | "Viber"
  | "TikTok"
  | "LinkedIn"
  | "Other";

export type StockStatus = "in_stock" | "limited" | "pre_order" | "out_of_stock";
export type AlertType = "drop" | "increase" | "new_entry" | "out_of_stock" | "availability_change" | "rating_change" | "market_shift";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "dismissed";
export type TrendDirection = "up" | "down" | "stable";
export type DemandLevel = "low" | "medium" | "high";
export type SupplyStatus = "low" | "stable" | "high";
export type BusinessType = "retailer" | "wholesaler" | "producer" | "importer" | "distributor";
export type CompetitorStatusType = "active" | "inactive" | "verified" | "flagged_suspicious";
export type Competitiveness = "underpriced" | "competitive" | "overpriced" | "significantly_underpriced" | "significantly_overpriced";

export interface ContactInfo {
  website?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
  telegram?: string;
  viber?: string;
}

export interface ReputationMetrics {
  reviewCount: number;
  averageRating: number;
  responseTime: number; // hours
  returnRate: number; // percentage
  isVerified: boolean;
  accountAge: number; // days
}

export interface EngagementMetrics {
  followers: number;
  monthlyOrders: number;
  lastActivityAt: string;
}

export interface MonitoredProduct {
  id: string;
  name: string;
  category: string;
  yourPrice: number;
  marketAverage: number;
}

export interface CompetitorTableRow {
  rank: number;
  id: string;
  name: string;
  logo: string;
  platform: Platform;
  currentPrice: number;
  priceChange7d: number;
  lastUpdated: Date;
  stockStatus: StockStatus;
  reviewCount: number;
  avgRating: number;
  isAboveYourPrice: boolean;
  priceHistory: { date: string; price: number }[];
  location?: string;
  // Extended fields
  country?: string;
  businessType?: BusinessType;
  contactInfo?: ContactInfo;
  reputation?: ReputationMetrics;
  engagement?: EngagementMetrics;
  reliabilityScore?: number;
  status?: CompetitorStatusType;
  description?: string;
}

export interface PriceMovementAlert {
  id: string;
  type: AlertType;
  competitorName: string;
  competitorId?: string;
  productName: string;
  oldPrice?: number;
  newPrice: number;
  timestamp: Date;
  dismissed: boolean;
  message?: string;
  // Extended fields
  severity?: AlertSeverity;
  status?: AlertStatus;
  notificationChannels?: ("email" | "push" | "in_app" | "slack" | "webhook")[];
  details?: {
    priceChangePercent?: number;
    oldRating?: number;
    newRating?: number;
    ratingChange?: number;
    previousAvailability?: string;
    currentAvailability?: string;
  };
  acknowledgedAt?: string;
  actionTaken?: string;
}

export interface MarketStatsExtended {
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  standardDeviation: number;
  priceRange: number;
  yourPricePosition: number;
  yourVsMedian: number;
  yourCompetitiveness: Competitiveness;
  suggestedOptimalPrice: number;
  suggestedPriceRange: {
    min: number;
    max: number;
  };
  averageCompetitorRating: number;
}

export interface AvailabilityMetrics {
  percentInStock: number;
  percentLimited: number;
  percentOutOfStock: number;
  averageLeadTime: number;
}

export interface DataQualityMetrics {
  competitorsTracked: number;
  dataPoints: number;
  avgObservationsPerCompetitor: number;
  lastUpdate: string;
  completeness: number;
  reliability: number;
}

export interface MarketInsightsData {
  marketSummary: string;
  opportunities: string[];
  threats: string[];
  recommendedActions: string[];
  marketMaturity: "emerging" | "growth" | "mature" | "declining";
  competitiveIntensity: "low" | "medium" | "high" | "very_high";
}

export interface MarketInsight {
  optimalPrice: number;
  currentMargin: number;
  recommendedMargin: number;
  priceAdjustment: number;
  trend: { 
    direction: TrendDirection; 
    percentage: number; 
    period: string;
  };
  demandLevel: DemandLevel;
  newCompetitorsThisWeek: number;
  supplyStatus: SupplyStatus;
  // Extended fields
  marketStats?: MarketStatsExtended;
  availability?: AvailabilityMetrics;
  insights?: MarketInsightsData;
  dataQuality?: DataQualityMetrics;
}

export interface PriceTrendDataPoint {
  date: string;
  yourPrice: number;
  marketAvg: number;
  minPrice: number;
  maxPrice: number;
  // Extended fields
  medianPrice?: number;
  competitorCount?: number;
  volatility?: number;
}

export interface CompetitorMonitorMetrics {
  marketAverage: number;
  yourPrice: number;
  pricePosition: number; // percentage difference from market
  competitorsFound: number;
}

export interface DateRangeOption {
  label: string;
  days: number;
}

export interface AlertConfiguration {
  id: string;
  productId: string;
  userId: string;
  priceDropThreshold: number;
  priceRiseThreshold: number;
  alertOnNewCompetitor: boolean;
  alertOnAvailabilityChange: boolean;
  alertOnRatingChange: boolean;
  alertOnMarketShift: boolean;
  onlyAlertIfUncompetitive: boolean;
  quietHours?: {
    startTime: string;
    endTime: string;
    timezone: string;
  };
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorActivityLog {
  id: string;
  competitorId: string;
  productId: string;
  activityType: "price_change" | "availability_change" | "new_listing" | "listing_removed" | "rating_updated" | "contacted" | "response_received" | "status_change";
  previousValue?: string | number;
  newValue?: string | number;
  percentChange?: number;
  activityAt: string;
  source: "scrape" | "message_response" | "manual" | "api" | "phone_call" | "email";
}

export interface CompetitorGroup {
  id: string;
  name: string;
  description?: string;
  userId: string;
  competitorIds: string[];
  color?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
