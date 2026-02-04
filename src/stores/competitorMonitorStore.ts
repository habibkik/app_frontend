import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { 
  CompetitorTableRow, 
  PriceMovementAlert, 
  MarketInsight,
  MonitoredProduct,
  PriceTrendDataPoint,
  CompetitorMonitorMetrics
} from "@/features/seller/types/competitorMonitor";
import { subDays, format } from "date-fns";

// Generate mock price trend data
const generatePriceTrendData = (days: number): PriceTrendDataPoint[] => {
  const data: PriceTrendDataPoint[] = [];
  const baseYourPrice = 42.99;
  const baseMarketAvg = 45.99;
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const variance = Math.sin(i * 0.5) * 3;
    const yourPrice = baseYourPrice + variance * 0.5 + (i === 5 ? -3 : 0); // Price drop 5 days ago
    const marketAvg = baseMarketAvg + variance;
    
    data.push({
      date: format(date, "MMM d"),
      yourPrice: Number(yourPrice.toFixed(2)),
      marketAvg: Number(marketAvg.toFixed(2)),
      minPrice: Number((marketAvg - 6 - Math.random() * 2).toFixed(2)),
      maxPrice: Number((marketAvg + 5 + Math.random() * 2).toFixed(2)),
    });
  }
  return data;
};

// Mock competitor data
const mockCompetitors: CompetitorTableRow[] = [
  {
    rank: 1,
    id: "1",
    name: "TechSupply Co",
    logo: "TS",
    platform: "Amazon",
    currentPrice: 39.99,
    priceChange7d: -8.2,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 234,
    avgRating: 4.5,
    isAboveYourPrice: false,
    location: "San Francisco, CA",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.minPrice + 2 })),
  },
  {
    rank: 2,
    id: "2",
    name: "PartsPlus Direct",
    logo: "PP",
    platform: "Facebook",
    currentPrice: 41.50,
    priceChange7d: 2.1,
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    stockStatus: "limited",
    reviewCount: 156,
    avgRating: 4.2,
    isAboveYourPrice: false,
    location: "Chicago, IL",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.marketAvg - 1 })),
  },
  {
    rank: 3,
    id: "3",
    name: "GlobalParts Inc",
    logo: "GP",
    platform: "Website",
    currentPrice: 44.00,
    priceChange7d: 0,
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 89,
    avgRating: 4.7,
    isAboveYourPrice: true,
    location: "New York, NY",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.marketAvg + 1 })),
  },
  {
    rank: 4,
    id: "4",
    name: "MegaTrade",
    logo: "MT",
    platform: "OLX",
    currentPrice: 38.50,
    priceChange7d: -5.4,
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000),
    stockStatus: "out_of_stock",
    reviewCount: 67,
    avgRating: 3.9,
    isAboveYourPrice: false,
    location: "Phoenix, AZ",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.minPrice })),
  },
  {
    rank: 5,
    id: "5",
    name: "Algiers Industrial",
    logo: "AI",
    platform: "Ouedkniss",
    currentPrice: 43.25,
    priceChange7d: 1.8,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 45,
    avgRating: 4.0,
    isAboveYourPrice: true,
    location: "Algiers, Algeria",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.marketAvg })),
  },
  {
    rank: 6,
    id: "6",
    name: "Industrial Direct",
    logo: "ID",
    platform: "Website",
    currentPrice: 46.99,
    priceChange7d: 3.2,
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 312,
    avgRating: 4.6,
    isAboveYourPrice: true,
    location: "Dallas, TX",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.maxPrice - 2 })),
  },
  {
    rank: 7,
    id: "7",
    name: "QuickParts",
    logo: "QP",
    platform: "Amazon",
    currentPrice: 40.25,
    priceChange7d: -2.8,
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
    stockStatus: "limited",
    reviewCount: 178,
    avgRating: 4.3,
    isAboveYourPrice: false,
    location: "Seattle, WA",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.minPrice + 3 })),
  },
  {
    rank: 8,
    id: "8",
    name: "BulkSupply Pro",
    logo: "BS",
    platform: "Website",
    currentPrice: 37.99,
    priceChange7d: -10.5,
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 423,
    avgRating: 4.4,
    isAboveYourPrice: false,
    location: "Houston, TX",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.minPrice - 1 })),
  },
  {
    rank: 9,
    id: "9",
    name: "Oran Supplies",
    logo: "OS",
    platform: "Ouedkniss",
    currentPrice: 45.50,
    priceChange7d: 0.5,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 34,
    avgRating: 3.8,
    isAboveYourPrice: true,
    location: "Oran, Algeria",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.marketAvg + 2 })),
  },
  {
    rank: 10,
    id: "10",
    name: "FastShip Parts",
    logo: "FS",
    platform: "Facebook",
    currentPrice: 42.75,
    priceChange7d: -1.2,
    lastUpdated: new Date(Date.now() - 45 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 198,
    avgRating: 4.1,
    isAboveYourPrice: false,
    location: "Miami, FL",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.yourPrice + 0.5 })),
  },
  {
    rank: 11,
    id: "11",
    name: "ValueTech",
    logo: "VT",
    platform: "OLX",
    currentPrice: 39.25,
    priceChange7d: -6.7,
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000),
    stockStatus: "limited",
    reviewCount: 87,
    avgRating: 3.7,
    isAboveYourPrice: false,
    location: "Atlanta, GA",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.minPrice + 1.5 })),
  },
  {
    rank: 12,
    id: "12",
    name: "PremiumParts Co",
    logo: "PC",
    platform: "Website",
    currentPrice: 49.99,
    priceChange7d: 4.5,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000),
    stockStatus: "in_stock",
    reviewCount: 256,
    avgRating: 4.8,
    isAboveYourPrice: true,
    location: "Boston, MA",
    priceHistory: generatePriceTrendData(30).map(d => ({ date: d.date, price: d.maxPrice })),
  },
];

// Mock alerts
const mockAlerts: PriceMovementAlert[] = [
  {
    id: "alert_1",
    type: "drop",
    competitorName: "TechSupply Co",
    competitorId: "1",
    productName: "Servo Motor XR-500",
    oldPrice: 45.00,
    newPrice: 39.99,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dismissed: false,
    message: "Your margin is at risk!",
  },
  {
    id: "alert_2",
    type: "increase",
    competitorName: "Market Average",
    productName: "General",
    oldPrice: 42.50,
    newPrice: 45.99,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    dismissed: false,
    message: "Opportunity to raise your price",
  },
  {
    id: "alert_3",
    type: "new_entry",
    competitorName: "BulkSupply Pro",
    competitorId: "8",
    productName: "Servo Motor XR-500",
    newPrice: 37.99,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    dismissed: false,
    message: "New competitor entered below your price",
  },
  {
    id: "alert_4",
    type: "out_of_stock",
    competitorName: "MegaTrade",
    competitorId: "4",
    productName: "Servo Motor XR-500",
    newPrice: 38.50,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    dismissed: false,
    message: "You'll capture their customers!",
  },
];

// Mock market insight with extended data
const mockMarketInsight: MarketInsight = {
  optimalPrice: 45.00,
  currentMargin: 35,
  recommendedMargin: 40,
  priceAdjustment: 2.01,
  trend: {
    direction: "down",
    percentage: 2,
    period: "week",
  },
  demandLevel: "high",
  newCompetitorsThisWeek: 2,
  supplyStatus: "stable",
  // Extended market statistics
  marketStats: {
    averagePrice: 45.99,
    medianPrice: 44.50,
    minPrice: 37.99,
    maxPrice: 49.99,
    standardDeviation: 3.25,
    priceRange: 12.00,
    yourPricePosition: -6.5,
    yourVsMedian: -3.4,
    yourCompetitiveness: "competitive",
    suggestedOptimalPrice: 45.00,
    suggestedPriceRange: {
      min: 42.00,
      max: 47.00,
    },
    averageCompetitorRating: 4.3,
  },
  // Availability metrics
  availability: {
    percentInStock: 75,
    percentLimited: 17,
    percentOutOfStock: 8,
    averageLeadTime: 3,
  },
  // Data quality metrics
  dataQuality: {
    competitorsTracked: 12,
    dataPoints: 360,
    avgObservationsPerCompetitor: 30,
    lastUpdate: new Date().toISOString(),
    completeness: 87,
    reliability: 92,
  },
  // Market insights
  insights: {
    marketSummary: "The market is showing moderate competition with stable pricing trends. Your competitive position is strong.",
    opportunities: [
      "2 competitors out of stock - capture their customers",
      "Market average trending down - opportunity to gain market share",
      "High demand with limited supply creates pricing power",
    ],
    threats: [
      "New competitor BulkSupply Pro entered below your price",
      "TechSupply Co aggressive pricing may pressure margins",
    ],
    recommendedActions: [
      "Consider raising price by $2-3 to match optimal",
      "Monitor BulkSupply Pro pricing strategy",
      "Highlight your reliability score vs competitors",
    ],
    marketMaturity: "growth",
    competitiveIntensity: "medium",
  },
};

// Mock products
const mockProducts: MonitoredProduct[] = [
  { id: "1", name: "Servo Motor XR-500", category: "Motors", yourPrice: 42.99, marketAverage: 45.99 },
  { id: "2", name: "Hydraulic Pump HP-200", category: "Pumps", yourPrice: 189.99, marketAverage: 195.50 },
  { id: "3", name: "CNC Controller Board", category: "Electronics", yourPrice: 892.00, marketAverage: 845.00 },
];

interface CompetitorMonitorStore {
  // Products
  products: MonitoredProduct[];
  selectedProducts: string[];
  
  // Date range
  dateRange: { from: Date; to: Date };
  
  // Refresh settings
  autoRefresh: boolean;
  refreshInterval: 1 | 2 | 4;
  lastUpdated: Date;
  isRefreshing: boolean;
  
  // Data
  competitors: CompetitorTableRow[];
  priceTrendData: PriceTrendDataPoint[];
  alerts: PriceMovementAlert[];
  marketInsight: MarketInsight | null;
  metrics: CompetitorMonitorMetrics;
  
  // Platform filter - Extended with all platforms
  selectedPlatforms: string[];
  
  // Actions
  setSelectedProducts: (products: string[]) => void;
  setDateRange: (range: { from: Date; to: Date }) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (hours: 1 | 2 | 4) => void;
  refreshData: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
  setSelectedPlatforms: (platforms: string[]) => void;
}

export const useCompetitorMonitorStore = create<CompetitorMonitorStore>()(
  persist(
    (set, get) => ({
      // Initial state
      products: mockProducts,
      selectedProducts: ["1"],
      dateRange: { from: subDays(new Date(), 30), to: new Date() },
      autoRefresh: true,
      refreshInterval: 2,
      lastUpdated: new Date(),
      isRefreshing: false,
      competitors: mockCompetitors,
      priceTrendData: generatePriceTrendData(30),
      alerts: mockAlerts,
      marketInsight: mockMarketInsight,
      metrics: {
        marketAverage: 45.99,
        yourPrice: 42.99,
        pricePosition: -6.5,
        competitorsFound: 12,
      },
      selectedPlatforms: ["Facebook", "Amazon", "OLX", "Ouedkniss", "Website", "Instagram", "WhatsApp", "Telegram", "Viber", "TikTok", "LinkedIn", "Other"],
      
      // Actions
      setSelectedProducts: (products) => set({ selectedProducts: products }),
      
      setDateRange: (range) => {
        const days = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
        set({ 
          dateRange: range,
          priceTrendData: generatePriceTrendData(days),
        });
      },
      
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      
      setRefreshInterval: (hours) => set({ refreshInterval: hours }),
      
      refreshData: async () => {
        set({ isRefreshing: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const days = Math.ceil((get().dateRange.to.getTime() - get().dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        
        set({ 
          isRefreshing: false,
          lastUpdated: new Date(),
          priceTrendData: generatePriceTrendData(days),
          // Simulate slight price changes
          competitors: get().competitors.map(c => ({
            ...c,
            currentPrice: Number((c.currentPrice + (Math.random() - 0.5) * 0.5).toFixed(2)),
            lastUpdated: new Date(),
          })),
        });
      },
      
      dismissAlert: (alertId) => set(state => ({
        alerts: state.alerts.map(a => 
          a.id === alertId ? { ...a, dismissed: true } : a
        ),
      })),
      
      setSelectedPlatforms: (platforms) => set({ selectedPlatforms: platforms }),
    }),
    {
      name: "competitor-monitor-storage",
      partialize: (state) => ({
        selectedProducts: state.selectedProducts,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
        selectedPlatforms: state.selectedPlatforms,
      }),
    }
  )
);
