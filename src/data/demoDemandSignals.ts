export type DemandPlatform = "facebook" | "tiktok" | "instagram" | "google" | "youtube" | "pinterest" | "twitter";
export type SignalType = "trending_product" | "rising_niche" | "geographic_hotspot";
export type VolumeLevel = "high" | "medium" | "low";
export type GrowthDirection = "surging" | "rising" | "stable" | "declining";

export interface DemandSignal {
  id: string;
  platform: DemandPlatform;
  signalType: SignalType;
  name: string;
  category: string;
  trendScore: number;
  volume: VolumeLevel;
  growth: GrowthDirection;
  region?: string;
  confidence: number;
  detectedAt: string;
  keywords: string[];
  engagementMetrics?: {
    mentions: number;
    hashtags: number;
    searchVolume: number;
  };
}

export interface DemandSignalTimeline {
  date: string;
  facebook: number;
  tiktok: number;
  instagram: number;
  google: number;
  youtube: number;
  pinterest: number;
  twitter: number;
}

export const PLATFORM_META: Record<DemandPlatform, { label: string; icon: string; color: string }> = {
  facebook: { label: "Facebook", icon: "📘", color: "#1877F2" },
  tiktok: { label: "TikTok", icon: "🎵", color: "#000000" },
  instagram: { label: "Instagram", icon: "📸", color: "#E4405F" },
  google: { label: "Google Trends", icon: "🔍", color: "#4285F4" },
  youtube: { label: "YouTube", icon: "▶️", color: "#FF0000" },
  pinterest: { label: "Pinterest", icon: "📌", color: "#E60023" },
  twitter: { label: "X / Twitter", icon: "𝕏", color: "#1DA1F2" },
};

export const DEMO_DEMAND_SIGNALS: DemandSignal[] = [
  // Trending Products
  { id: "ds-1", platform: "tiktok", signalType: "trending_product", name: "Portable Blender Bottles", category: "Kitchen & Home", trendScore: 94, volume: "high", growth: "surging", region: "North America", confidence: 91, detectedAt: "2026-02-19T08:00:00Z", keywords: ["portable blender", "smoothie on the go", "gym blender"], engagementMetrics: { mentions: 284000, hashtags: 52000, searchVolume: 410000 } },
  { id: "ds-2", platform: "instagram", signalType: "trending_product", name: "LED Sunset Lamp", category: "Home Decor", trendScore: 88, volume: "high", growth: "rising", region: "Europe", confidence: 85, detectedAt: "2026-02-18T14:30:00Z", keywords: ["sunset lamp", "aesthetic room", "golden hour"], engagementMetrics: { mentions: 192000, hashtags: 38000, searchVolume: 310000 } },
  { id: "ds-3", platform: "facebook", signalType: "trending_product", name: "Smart Pet Feeder", category: "Pet Supplies", trendScore: 82, volume: "medium", growth: "rising", region: "North America", confidence: 80, detectedAt: "2026-02-18T10:00:00Z", keywords: ["smart feeder", "pet tech", "automatic feeder"], engagementMetrics: { mentions: 67000, hashtags: 12000, searchVolume: 185000 } },
  { id: "ds-4", platform: "google", signalType: "trending_product", name: "Ergonomic Laptop Stand", category: "Office", trendScore: 79, volume: "high", growth: "stable", region: "Global", confidence: 88, detectedAt: "2026-02-17T16:00:00Z", keywords: ["laptop stand", "ergonomic desk", "WFH setup"], engagementMetrics: { mentions: 45000, hashtags: 8000, searchVolume: 520000 } },
  { id: "ds-5", platform: "youtube", signalType: "trending_product", name: "Mini Projector 4K", category: "Electronics", trendScore: 91, volume: "high", growth: "surging", region: "Asia Pacific", confidence: 87, detectedAt: "2026-02-19T06:00:00Z", keywords: ["mini projector", "home cinema", "portable projector"], engagementMetrics: { mentions: 156000, hashtags: 29000, searchVolume: 390000 } },
  { id: "ds-6", platform: "pinterest", signalType: "trending_product", name: "Macramé Plant Hangers", category: "Home Decor", trendScore: 76, volume: "medium", growth: "rising", region: "Europe", confidence: 82, detectedAt: "2026-02-17T12:00:00Z", keywords: ["macrame", "plant hanger", "boho decor"], engagementMetrics: { mentions: 98000, hashtags: 42000, searchVolume: 175000 } },
  { id: "ds-7", platform: "twitter", signalType: "trending_product", name: "AI Writing Assistant Gadget", category: "Tech Gadgets", trendScore: 85, volume: "medium", growth: "surging", region: "North America", confidence: 78, detectedAt: "2026-02-19T09:15:00Z", keywords: ["AI gadget", "writing tool", "productivity"], engagementMetrics: { mentions: 112000, hashtags: 18000, searchVolume: 260000 } },

  // Rising Niches
  { id: "ds-8", platform: "tiktok", signalType: "rising_niche", name: "Cottagecore Kitchenware", category: "Lifestyle & Home", trendScore: 87, volume: "high", growth: "surging", region: "Global", confidence: 84, detectedAt: "2026-02-18T20:00:00Z", keywords: ["cottagecore", "vintage kitchen", "rustic aesthetic"], engagementMetrics: { mentions: 320000, hashtags: 75000, searchVolume: 195000 } },
  { id: "ds-9", platform: "instagram", signalType: "rising_niche", name: "Sustainable Activewear", category: "Fashion", trendScore: 83, volume: "medium", growth: "rising", region: "Europe", confidence: 86, detectedAt: "2026-02-18T11:00:00Z", keywords: ["sustainable fashion", "eco gym", "recycled fabric"], engagementMetrics: { mentions: 145000, hashtags: 56000, searchVolume: 220000 } },
  { id: "ds-10", platform: "google", signalType: "rising_niche", name: "Home Biohacking Kits", category: "Health & Wellness", trendScore: 78, volume: "medium", growth: "rising", region: "North America", confidence: 75, detectedAt: "2026-02-17T09:00:00Z", keywords: ["biohacking", "health optimization", "supplements"], engagementMetrics: { mentions: 52000, hashtags: 9500, searchVolume: 340000 } },
  { id: "ds-11", platform: "youtube", signalType: "rising_niche", name: "Desk-Friendly Fitness", category: "Health & Fitness", trendScore: 81, volume: "medium", growth: "rising", region: "Global", confidence: 80, detectedAt: "2026-02-18T15:30:00Z", keywords: ["desk workout", "office fitness", "mini exercise"], engagementMetrics: { mentions: 88000, hashtags: 14000, searchVolume: 280000 } },
  { id: "ds-12", platform: "facebook", signalType: "rising_niche", name: "Senior Tech Accessories", category: "Electronics", trendScore: 72, volume: "low", growth: "rising", region: "North America", confidence: 79, detectedAt: "2026-02-16T18:00:00Z", keywords: ["senior tech", "elderly gadgets", "simplified devices"], engagementMetrics: { mentions: 34000, hashtags: 4200, searchVolume: 150000 } },
  { id: "ds-13", platform: "pinterest", signalType: "rising_niche", name: "Japandi Interior Design", category: "Home Decor", trendScore: 90, volume: "high", growth: "surging", region: "Europe", confidence: 92, detectedAt: "2026-02-19T07:45:00Z", keywords: ["japandi", "minimalist design", "scandinavian japanese"], engagementMetrics: { mentions: 210000, hashtags: 68000, searchVolume: 410000 } },

  // Geographic Hotspots
  { id: "ds-14", platform: "google", signalType: "geographic_hotspot", name: "EV Charging Accessories", category: "Automotive", trendScore: 86, volume: "high", growth: "surging", region: "Scandinavia", confidence: 90, detectedAt: "2026-02-19T05:00:00Z", keywords: ["EV charger", "electric vehicle", "charging cable"], engagementMetrics: { mentions: 78000, hashtags: 11000, searchVolume: 480000 } },
  { id: "ds-15", platform: "tiktok", signalType: "geographic_hotspot", name: "K-Beauty Skincare Tools", category: "Beauty", trendScore: 93, volume: "high", growth: "surging", region: "Southeast Asia", confidence: 88, detectedAt: "2026-02-19T04:00:00Z", keywords: ["k-beauty", "skin care routine", "gua sha"], engagementMetrics: { mentions: 410000, hashtags: 95000, searchVolume: 350000 } },
  { id: "ds-16", platform: "instagram", signalType: "geographic_hotspot", name: "Artisan Coffee Equipment", category: "Food & Beverage", trendScore: 80, volume: "medium", growth: "rising", region: "Middle East", confidence: 83, detectedAt: "2026-02-18T13:00:00Z", keywords: ["specialty coffee", "pour over", "coffee gear"], engagementMetrics: { mentions: 120000, hashtags: 32000, searchVolume: 190000 } },
  { id: "ds-17", platform: "twitter", signalType: "geographic_hotspot", name: "Solar Power Banks", category: "Electronics", trendScore: 77, volume: "medium", growth: "rising", region: "Sub-Saharan Africa", confidence: 81, detectedAt: "2026-02-17T14:00:00Z", keywords: ["solar charger", "off-grid power", "portable solar"], engagementMetrics: { mentions: 56000, hashtags: 7800, searchVolume: 210000 } },
  { id: "ds-18", platform: "facebook", signalType: "geographic_hotspot", name: "Outdoor Adventure Gear", category: "Sports & Outdoors", trendScore: 84, volume: "high", growth: "rising", region: "Oceania", confidence: 86, detectedAt: "2026-02-18T22:00:00Z", keywords: ["camping gear", "hiking", "adventure travel"], engagementMetrics: { mentions: 142000, hashtags: 28000, searchVolume: 320000 } },
  { id: "ds-19", platform: "youtube", signalType: "geographic_hotspot", name: "Smart Home Security", category: "Electronics", trendScore: 88, volume: "high", growth: "stable", region: "Latin America", confidence: 84, detectedAt: "2026-02-18T08:00:00Z", keywords: ["smart security", "home camera", "doorbell cam"], engagementMetrics: { mentions: 167000, hashtags: 22000, searchVolume: 440000 } },
  { id: "ds-20", platform: "pinterest", signalType: "geographic_hotspot", name: "Handmade Ceramic Tableware", category: "Home & Kitchen", trendScore: 75, volume: "medium", growth: "rising", region: "Eastern Europe", confidence: 79, detectedAt: "2026-02-17T10:30:00Z", keywords: ["handmade ceramics", "artisan tableware", "pottery"], engagementMetrics: { mentions: 87000, hashtags: 35000, searchVolume: 130000 } },
  { id: "ds-21", platform: "google", signalType: "trending_product", name: "Noise-Canceling Earbuds", category: "Electronics", trendScore: 92, volume: "high", growth: "stable", region: "Global", confidence: 93, detectedAt: "2026-02-19T10:00:00Z", keywords: ["ANC earbuds", "noise canceling", "wireless earbuds"], engagementMetrics: { mentions: 230000, hashtags: 41000, searchVolume: 680000 } },
  { id: "ds-22", platform: "twitter", signalType: "rising_niche", name: "AI-Powered Study Tools", category: "Education", trendScore: 86, volume: "medium", growth: "surging", region: "Global", confidence: 82, detectedAt: "2026-02-19T11:00:00Z", keywords: ["AI tutor", "study app", "flashcard AI"], engagementMetrics: { mentions: 95000, hashtags: 16000, searchVolume: 290000 } },
];

export const DEMO_TIMELINE: DemandSignalTimeline[] = [
  { date: "Feb 13", facebook: 32, tiktok: 45, instagram: 40, google: 55, youtube: 38, pinterest: 28, twitter: 35 },
  { date: "Feb 14", facebook: 35, tiktok: 52, instagram: 44, google: 58, youtube: 41, pinterest: 30, twitter: 38 },
  { date: "Feb 15", facebook: 38, tiktok: 61, instagram: 48, google: 56, youtube: 45, pinterest: 33, twitter: 42 },
  { date: "Feb 16", facebook: 42, tiktok: 68, instagram: 55, google: 60, youtube: 50, pinterest: 36, twitter: 40 },
  { date: "Feb 17", facebook: 45, tiktok: 74, instagram: 60, google: 63, youtube: 55, pinterest: 40, twitter: 44 },
  { date: "Feb 18", facebook: 50, tiktok: 82, instagram: 66, google: 67, youtube: 60, pinterest: 44, twitter: 48 },
  { date: "Feb 19", facebook: 55, tiktok: 90, instagram: 72, google: 70, youtube: 65, pinterest: 48, twitter: 52 },
];
