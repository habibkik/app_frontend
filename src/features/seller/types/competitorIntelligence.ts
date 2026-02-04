/**
 * Competitor Intelligence Types
 * 
 * This module defines all types used for tracking, analyzing, and monitoring
 * competitor data in the seller mode intelligence system.
 * 
 * Includes:
 * - Competitor profiles and contact information
 * - Price tracking and historical data
 * - Market analysis and statistics
 * - Alerts and notifications
 * - Data quality metrics
 */

// ============================================================================
// COMPETITOR CORE TYPES
// ============================================================================

/**
 * Platform types for competitor tracking
 */
export type CompetitorPlatform = 
  | 'facebook' 
  | 'instagram' 
  | 'olx' 
  | 'amazon' 
  | 'whatsapp' 
  | 'website' 
  | 'telegram' 
  | 'viber' 
  | 'tiktok' 
  | 'linkedin'
  | 'ouedkniss'
  | 'other';

/**
 * Business type classification
 */
export type BusinessType = 'retailer' | 'wholesaler' | 'producer' | 'importer' | 'distributor';

/**
 * Competitor status in tracking system
 */
export type CompetitorStatus = 'active' | 'inactive' | 'verified' | 'flagged_suspicious';

/**
 * Price availability status
 */
export type AvailabilityStatus = 'in_stock' | 'limited' | 'pre_order' | 'out_of_stock';

/**
 * Data source method
 */
export type DataSource = 'scrape' | 'message_response' | 'manual' | 'api' | 'phone_call' | 'email';

/**
 * Contact and digital presence information
 */
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

/**
 * Seller reputation metrics
 */
export interface ReputationMetrics {
  /** Total number of reviews/ratings received */
  reviewCount: number;
  /** Average rating (0-5 stars) */
  averageRating: number;
  /** Average response time in hours */
  responseTime: number;
  /** Return/refund rate percentage */
  returnRate: number;
  /** Verified seller badge status */
  isVerified: boolean;
  /** Seller account age in days */
  accountAge: number;
}

/**
 * Engagement metrics
 */
export interface EngagementMetrics {
  /** Follower/subscriber count */
  followers: number;
  /** Monthly order volume estimate */
  monthlyOrders: number;
  /** Last activity timestamp */
  lastActivityAt: string;
}

/**
 * Core competitor profile
 * Represents a single competitor entity (seller, producer, supplier)
 */
export interface Competitor {
  /** Unique identifier in system */
  id: string;
  /** Business name */
  name: string;
  /** Platform where competitor operates */
  platform: CompetitorPlatform;
  /** Operating location (city/region) */
  location: string;
  /** Country of operation */
  country: string;
  /** Business category/type */
  businessType?: BusinessType;
  /** Contact and digital presence information */
  contactInfo?: ContactInfo;
  /** Seller reputation metrics */
  reputation: ReputationMetrics;
  /** Engagement metrics */
  engagement?: EngagementMetrics;
  /** When competitor was last contacted */
  lastContactedAt?: string;
  /** When last response was received from competitor */
  lastResponseReceivedAt?: string;
  /** Risk/reliability score (0-100) */
  reliabilityScore: number;
  /** Data collection status */
  status: CompetitorStatus;
  /** System tracking metadata */
  firstSeenAt: string;
  updatedAt: string;
}

// ============================================================================
// PRICING TYPES
// ============================================================================

/**
 * Single price point from a competitor
 * Represents one price observation at a specific time
 */
export interface CompetitorPrice {
  /** Unique identifier */
  id: string;
  /** Reference to competitor */
  competitorId: string;
  /** Reference to product being priced */
  productId: string;
  /** Unit price amount */
  price: number;
  /** Currency code (USD, EUR, etc) */
  currency: string;
  /** Product availability status */
  availability: AvailabilityStatus;
  /** Data source method */
  source: DataSource;
  /** Reference to original message if from response */
  messageId?: string;
  /** Confidence in price accuracy (0-1) */
  confidence: number;
  /** Optional notes about price (e.g., discount, bulk pricing) */
  notes?: string;
  /** Minimum order quantity for this price */
  moq?: number;
  /** Lead time in days for delivery */
  leadTimeDays?: number;
  /** Shipping included in price */
  includesShipping: boolean;
  /** When price was collected */
  collectedAt: string;
  /** Expiration of price quote (if applicable) */
  expiresAt?: string;
}

/**
 * Aggregate competitor listing with pricing history
 * Complete view of competitor and their price trajectory
 */
export interface CompetitorListing extends Competitor {
  /** Current/most recent price */
  currentPrice: CompetitorPrice;
  /** Historical price points */
  priceHistory: CompetitorPrice[];
  /** Price change over 7 days (%) */
  priceChangePercent7d: number;
  /** Price change over 24 hours (%) */
  priceChangeDayPercent: number;
  /** Trend direction based on recent changes */
  priceTrend: 'rising' | 'stable' | 'declining';
  /** Number of price observations */
  priceObservations: number;
  /** Reliability of price data */
  priceDataQuality: 'high' | 'medium' | 'low';
}

// ============================================================================
// MARKET ANALYSIS TYPES
// ============================================================================

/**
 * Market statistics for price analysis
 */
export interface MarketStats {
  /** Average price across all competitors */
  averagePrice: number;
  /** Median price (middle value) */
  medianPrice: number;
  /** Lowest competitor price */
  minPrice: number;
  /** Highest competitor price */
  maxPrice: number;
  /** Price variation/spread */
  standardDeviation: number;
  /** Price range (max - min) */
  priceRange: number;
  /** Your price difference from average (%) */
  yourPricePosition: number;
  /** Your price compared to median */
  yourVsMedian: number;
  /** Competitiveness assessment */
  yourCompetitiveness: 'underpriced' | 'competitive' | 'overpriced' | 'significantly_underpriced' | 'significantly_overpriced';
  /** Recommended optimal price based on market */
  suggestedOptimalPrice: number;
  /** Suggested price range for competitiveness */
  suggestedPriceRange: {
    min: number;
    max: number;
  };
  /** Average competitor rating */
  averageCompetitorRating: number;
  /** Most common availability status */
  mostCommonAvailability: AvailabilityStatus;
}

/**
 * Market trend information
 */
export interface MarketTrends {
  /** Price change over last 24 hours (%) */
  avgPriceChange24h: number;
  /** Price change over last 7 days (%) */
  avgPriceChange7d: number;
  /** Price change over last 30 days (%) */
  avgPriceChange30d: number;
  /** Overall trend direction */
  trend: 'rising' | 'stable' | 'declining';
  /** Price stability level */
  volatility: 'low' | 'medium' | 'high';
  /** Momentum (accelerating/decelerating change) */
  momentum: 'accelerating_up' | 'decelerating_up' | 'stable' | 'decelerating_down' | 'accelerating_down';
  /** Competitor entry rate last 7 days */
  newCompetitorsLast7d: number;
  /** Competitors that exited market */
  exitedCompetitorsLast7d: number;
}

/**
 * Availability metrics across market
 */
export interface AvailabilityMetrics {
  /** % of competitors with item in stock */
  percentInStock: number;
  /** % with limited stock */
  percentLimited: number;
  /** % out of stock */
  percentOutOfStock: number;
  /** Average lead time across competitors (days) */
  averageLeadTime: number;
}

/**
 * Data quality metrics
 */
export interface DataQualityMetrics {
  /** Number of competitors actively tracked */
  competitorsTracked: number;
  /** Total price observations collected */
  dataPoints: number;
  /** Average observations per competitor */
  avgObservationsPerCompetitor: number;
  /** Last time data was updated */
  lastUpdate: string;
  /** Next scheduled update */
  nextScheduledUpdate: string;
  /** Update frequency */
  updateFrequency: 'realtime' | 'hourly' | '6hourly' | '12hourly' | 'daily' | 'weekly';
  /** Overall data completeness (0-100) */
  completeness: number;
  /** Data reliability score (0-100) */
  reliability: number;
  /** Geographic coverage */
  geographicCoverage: {
    citiesCovered: number;
    regionsMonitored: string[];
  };
}

/**
 * Market insights
 */
export interface MarketInsights {
  /** High-level market summary */
  marketSummary: string;
  /** Key opportunities identified */
  opportunities: string[];
  /** Market threats/challenges */
  threats: string[];
  /** Recommended actions */
  recommendedActions: string[];
  /** Market maturity assessment */
  marketMaturity: 'emerging' | 'growth' | 'mature' | 'declining';
  /** Competitive intensity */
  competitiveIntensity: 'low' | 'medium' | 'high' | 'very_high';
  /** Price elasticity estimate */
  estimatedPriceElasticity?: number;
}

/**
 * Complete market intelligence for a single product
 * Aggregates all competitor data for market analysis
 */
export interface CompetitorMarketData {
  /** Product identifier */
  productId: string;
  /** Product name */
  productName: string;
  /** Your product price (for context) */
  yourPrice: number;
  /** Your product currency */
  yourCurrency: string;
  /** Marketplace being analyzed */
  marketplace: CompetitorPlatform | 'all';
  /** Geographic market */
  market: {
    country: string;
    region?: string;
    city?: string;
  };
  /** All tracked competitors for this product */
  competitors: CompetitorListing[];
  /** Total number of competitors tracked */
  totalCompetitors: number;
  /** Top 5 competitors by sales/engagement */
  topCompetitors: CompetitorListing[];
  /** Market statistics */
  marketStats: MarketStats;
  /** Market trends */
  trends: MarketTrends;
  /** Availability metrics */
  availability: AvailabilityMetrics;
  /** Data quality metrics */
  dataQuality: DataQualityMetrics;
  /** Market insights */
  insights?: MarketInsights;
  /** Timestamp when this data was generated */
  generatedAt: string;
}

// ============================================================================
// ALERT & NOTIFICATION TYPES
// ============================================================================

/**
 * Alert severity levels
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert type categories
 */
export type AlertCategory = 
  | 'price_drop' 
  | 'price_rise' 
  | 'new_competitor' 
  | 'competitor_exit' 
  | 'out_of_stock' 
  | 'availability_change' 
  | 'rating_change' 
  | 'market_shift';

/**
 * Alert status
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

/**
 * Notification channels
 */
export type NotificationChannel = 'email' | 'push' | 'in_app' | 'slack' | 'webhook';

/**
 * Price alert triggered by market changes
 * Notifies seller of significant competitive movements
 */
export interface PriceAlert {
  /** Unique alert identifier */
  id: string;
  /** Alert severity level */
  severity: AlertSeverity;
  /** Alert type category */
  type: AlertCategory;
  /** Which competitor triggered alert */
  competitorId: string;
  competitorName: string;
  /** Related product */
  productId: string;
  productName: string;
  /** Human-readable alert message */
  message: string;
  /** Alert details */
  details: {
    oldPrice?: number;
    newPrice?: number;
    priceChangePercent?: number;
    oldRating?: number;
    newRating?: number;
    ratingChange?: number;
    previousAvailability?: string;
    currentAvailability?: string;
  };
  /** When alert was triggered */
  timestamp: string;
  /** Alert status */
  status: AlertStatus;
  /** When alert was acknowledged by user */
  acknowledgedAt?: string;
  /** User action taken on alert */
  actionTaken?: string;
  /** Should user be notified */
  notifyUser: boolean;
  /** Notification channels */
  notificationChannels: NotificationChannel[];
}

/**
 * Alert configuration/preferences
 * Defines when alerts should be triggered
 */
export interface AlertConfiguration {
  /** Unique configuration ID */
  id: string;
  /** Product this config applies to */
  productId: string;
  /** User who configured */
  userId: string;
  /** Price drop threshold (%) to trigger alert */
  priceDropThreshold: number;
  /** Price rise threshold (%) to trigger alert */
  priceRiseThreshold: number;
  /** New competitor detection enabled */
  alertOnNewCompetitor: boolean;
  /** Stock/availability changes enabled */
  alertOnAvailabilityChange: boolean;
  /** Rating changes enabled */
  alertOnRatingChange: boolean;
  /** Market shift enabled */
  alertOnMarketShift: boolean;
  /** Only alert if your price is uncompetitive */
  onlyAlertIfUncompetitive: boolean;
  /** Quiet hours (don't send alerts) */
  quietHours?: {
    startTime: string;  // HH:MM
    endTime: string;    // HH:MM
    timezone: string;
  };
  /** Configuration active status */
  isEnabled: boolean;
  /** Created timestamp */
  createdAt: string;
  /** Last modified timestamp */
  updatedAt: string;
}

// ============================================================================
// HISTORICAL & TRENDING TYPES
// ============================================================================

/**
 * Price trend data point for charts
 * Single observation for time-series visualization
 */
export interface PriceTrendPoint {
  /** Timestamp of observation */
  timestamp: string;
  /** Your price at this time */
  yourPrice: number;
  /** Market average price */
  marketAveragePrice: number;
  /** Median price */
  medianPrice: number;
  /** Minimum competitor price */
  minPrice: number;
  /** Maximum competitor price */
  maxPrice: number;
  /** Number of competitors tracked at this time */
  competitorCount: number;
  /** Market volatility at this time */
  volatility: number;
}

/**
 * Activity type for competitor logs
 */
export type ActivityType = 
  | 'price_change' 
  | 'availability_change' 
  | 'new_listing' 
  | 'listing_removed' 
  | 'rating_updated' 
  | 'contacted' 
  | 'response_received' 
  | 'status_change';

/**
 * Competitor activity history
 * Tracks changes in competitor status/data
 */
export interface CompetitorActivityLog {
  /** Log entry ID */
  id: string;
  /** Competitor being tracked */
  competitorId: string;
  /** Product being tracked */
  productId: string;
  /** Type of activity */
  activityType: ActivityType;
  /** Previous value */
  previousValue?: string | number;
  /** New value */
  newValue?: string | number;
  /** Percent change if numeric */
  percentChange?: number;
  /** Activity timestamp */
  activityAt: string;
  /** Source of information */
  source: DataSource;
}

// ============================================================================
// MARKET COMPARISON TYPES
// ============================================================================

/**
 * Direct competitor comparison
 * Side-by-side view of multiple competitors
 */
export interface CompetitorComparison {
  /** Unique comparison ID */
  id: string;
  /** Competitors being compared */
  competitors: CompetitorListing[];
  /** Your product for reference */
  yourProduct: {
    name: string;
    price: number;
    currency: string;
  };
  /** Comparison metrics */
  metrics: {
    /** Price comparison vs you */
    priceVsYou: Array<{
      competitorId: string;
      competitorName: string;
      price: number;
      difference: number;
      percentDifference: number;
    }>;
    /** Availability comparison */
    availability: Array<{
      competitorId: string;
      availability: string;
      leadTime?: number;
    }>;
    /** Rating comparison */
    ratings: Array<{
      competitorId: string;
      rating: number;
      reviewCount: number;
    }>;
  };
  /** Generated timestamp */
  generatedAt: string;
}

// ============================================================================
// TRACKING & MANAGEMENT TYPES
// ============================================================================

/**
 * Tracking priority levels
 */
export type TrackingPriority = 'low' | 'medium' | 'high';

/**
 * Tracking status
 */
export type TrackingStatus = 'active' | 'paused' | 'archived';

/**
 * Update frequency options
 */
export type UpdateFrequency = 'realtime' | 'hourly' | '6hourly' | '12hourly' | 'daily' | 'weekly';

/**
 * Competitor tracking configuration
 * Defines which competitors to track for which products
 */
export interface CompetitorTracking {
  /** Unique tracking ID */
  id: string;
  /** Product being tracked */
  productId: string;
  /** Competitor being tracked */
  competitorId: string;
  /** User who created this tracking */
  userId: string;
  /** Tracking status */
  status: TrackingStatus;
  /** Tracking priority */
  priority: TrackingPriority;
  /** Update frequency for this tracking */
  updateFrequency: UpdateFrequency;
  /** Manual price checks enabled */
  manualCheckingEnabled: boolean;
  /** Message-based price collection enabled */
  messageCollectionEnabled: boolean;
  /** Last successful price check */
  lastSuccessfulCheck?: string;
  /** Number of failed attempts in a row */
  failedAttempts: number;
  /** When tracking was started */
  startedAt: string;
  /** When tracking was last updated */
  updatedAt: string;
}

/**
 * Bulk competitor management
 * Group multiple competitors for coordinated actions
 */
export interface CompetitorGroup {
  /** Group ID */
  id: string;
  /** Group name */
  name: string;
  /** Group description */
  description?: string;
  /** User who created group */
  userId: string;
  /** Competitors in this group */
  competitorIds: string[];
  /** Group color for UI */
  color?: string;
  /** Group tags */
  tags: string[];
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

/**
 * Market report export format
 * Exportable market intelligence summary
 */
export interface MarketReport {
  /** Report ID */
  id: string;
  /** Report title */
  title: string;
  /** Product analyzed */
  productId: string;
  productName: string;
  /** Report date range */
  dateRange: {
    startDate: string;
    endDate: string;
  };
  /** Market data included */
  marketData: CompetitorMarketData;
  /** Competitor listings included */
  competitors: CompetitorListing[];
  /** Price trends data */
  priceTrends: PriceTrendPoint[];
  /** Alerts during period */
  alerts: PriceAlert[];
  /** Report insights */
  insights: string;
  /** Report generated timestamp */
  generatedAt: string;
  /** Export format */
  exportFormat: ExportFormat;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response wrapper
 */
export interface CompetitorDataResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: string;
    duration: number;  // ms
    cached: boolean;
  };
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated competitor list response
 */
export interface PaginatedCompetitorResponse {
  data: CompetitorListing[];
  pagination: PaginationInfo;
  filters?: {
    marketplace?: string;
    minRating?: number;
    maxPrice?: number;
    minPrice?: number;
    availability?: string;
  };
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

/**
 * Competitor filtering options
 */
export interface CompetitorFilters {
  /** Filter by platform */
  platforms?: CompetitorPlatform[];
  /** Filter by location/country */
  countries?: string[];
  /** Filter by minimum rating */
  minRating?: number;
  /** Filter by price range */
  priceRange?: {
    min: number;
    max: number;
  };
  /** Filter by competitor status */
  status?: CompetitorStatus[];
  /** Filter by business type */
  businessTypes?: BusinessType[];
  /** Search text */
  searchText?: string;
  /** Sort field */
  sortBy?: 'price' | 'rating' | 'name' | 'lastUpdated';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Pagination */
  page?: number;
  pageSize?: number;
}

/**
 * Market data filter options
 */
export interface MarketDataFilters {
  /** Geographic market */
  marketplace?: CompetitorPlatform | 'all';
  /** Country/region filter */
  country?: string;
  /** Date range for trends */
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  /** Include top competitors only */
  topCompetitorsOnly?: boolean;
  /** Minimum data quality threshold */
  minDataQuality?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for Competitor
 */
export function isCompetitor(obj: unknown): obj is Competitor {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'platform' in obj &&
    'reputation' in obj
  );
}

/**
 * Type guard for CompetitorPrice
 */
export function isCompetitorPrice(obj: unknown): obj is CompetitorPrice {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'price' in obj &&
    'currency' in obj &&
    'collectedAt' in obj
  );
}

/**
 * Type guard for CompetitorMarketData
 */
export function isCompetitorMarketData(obj: unknown): obj is CompetitorMarketData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'productId' in obj &&
    'competitors' in obj &&
    'marketStats' in obj
  );
}

/**
 * Type guard for PriceAlert
 */
export function isPriceAlert(obj: unknown): obj is PriceAlert {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'severity' in obj &&
    'timestamp' in obj
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Partial updates
 */
export type CompetitorUpdate = Partial<Omit<Competitor, 'id' | 'firstSeenAt'>>;
export type PriceAlertUpdate = Partial<Omit<PriceAlert, 'id'>>;

/**
 * Batch operations
 */
export interface BatchCompetitorOperation {
  action: 'track' | 'untrack' | 'update' | 'delete';
  competitorIds: string[];
  productId: string;
  data?: CompetitorUpdate;
}

/**
 * Status type for async operations
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  isLoading: boolean;
}
