// Competitor Monitor Types

export type Platform = "Facebook" | "Amazon" | "OLX" | "Ouedkniss" | "Website" | "Other";
export type StockStatus = "in_stock" | "limited" | "out_of_stock";
export type AlertType = "drop" | "increase" | "new_entry" | "out_of_stock";
export type TrendDirection = "up" | "down" | "stable";
export type DemandLevel = "low" | "medium" | "high";
export type SupplyStatus = "low" | "stable" | "high";

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
  contact?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
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
}

export interface PriceTrendDataPoint {
  date: string;
  yourPrice: number;
  marketAvg: number;
  minPrice: number;
  maxPrice: number;
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
