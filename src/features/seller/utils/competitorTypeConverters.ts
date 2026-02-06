/**
 * Type Converters for Competitor Intelligence
 * 
 * Utility functions to convert between legacy types and new comprehensive types
 */

import type { CompetitorTableRow, PriceMovementAlert, Platform } from "../types/competitorMonitor";
import type { 
  Competitor, 
  CompetitorListing, 
  CompetitorPrice, 
  PriceAlert,
  CompetitorPlatform,
  AlertCategory,
  AlertSeverity,
} from "../types/competitorIntelligence";

/**
 * Convert legacy Platform to CompetitorPlatform
 */
export function toCompetitorPlatform(platform: Platform): CompetitorPlatform {
  const platformMap: Record<Platform, CompetitorPlatform> = {
    "Facebook": "facebook",
    "Amazon": "amazon",
    "OLX": "olx",
    "Ouedkniss": "ouedkniss",
    "Website": "website",
    "Instagram": "instagram",
    "WhatsApp": "whatsapp",
    "Telegram": "telegram",
    "Viber": "viber",
    "TikTok": "tiktok",
    "LinkedIn": "linkedin",
    "Other": "other",
  };
  return platformMap[platform] || "other";
}

/**
 * Convert CompetitorPlatform to legacy Platform
 */
export function fromCompetitorPlatform(platform: CompetitorPlatform): Platform {
  const platformMap: Record<CompetitorPlatform, Platform> = {
    "facebook": "Facebook",
    "amazon": "Amazon",
    "olx": "OLX",
    "ouedkniss": "Ouedkniss",
    "website": "Website",
    "instagram": "Instagram",
    "whatsapp": "WhatsApp",
    "telegram": "Telegram",
    "viber": "Viber",
    "tiktok": "TikTok",
    "linkedin": "LinkedIn",
    "other": "Other",
  };
  return platformMap[platform] || "Other";
}

/**
 * Convert CompetitorTableRow to Competitor core type
 */
export function toCompetitor(row: CompetitorTableRow): Competitor {
  return {
    id: row.id,
    name: row.name,
    platform: toCompetitorPlatform(row.platform),
    location: row.location || "Unknown",
    country: row.country || "Unknown",
    businessType: row.businessType,
    contactInfo: row.contactInfo,
    reputation: row.reputation || {
      reviewCount: row.reviewCount,
      averageRating: row.avgRating,
      responseTime: 24,
      returnRate: 5,
      isVerified: false,
      accountAge: 365,
    },
    engagement: row.engagement,
    reliabilityScore: row.reliabilityScore || 75,
    status: row.status || "active",
    firstSeenAt: new Date().toISOString(),
    updatedAt: row.lastUpdated.toISOString(),
  };
}

/**
 * Convert CompetitorTableRow to full CompetitorListing
 */
export function toCompetitorListing(row: CompetitorTableRow, currency = "USD"): CompetitorListing {
  const currentPrice: CompetitorPrice = {
    id: `price_${row.id}_current`,
    competitorId: row.id,
    productId: "default",
    price: row.currentPrice,
    currency,
    availability: row.stockStatus === "pre_order" ? "pre_order" : row.stockStatus,
    source: "scrape",
    confidence: 0.9,
    includesShipping: false,
    collectedAt: row.lastUpdated.toISOString(),
  };

  const priceHistory: CompetitorPrice[] = row.priceHistory.map((ph, idx) => ({
    id: `price_${row.id}_${idx}`,
    competitorId: row.id,
    productId: "default",
    price: ph.price,
    currency,
    availability: "in_stock",
    source: "scrape",
    confidence: 0.85,
    includesShipping: false,
    collectedAt: new Date(ph.date).toISOString(),
  }));

  // Determine price trend
  let priceTrend: "rising" | "stable" | "declining" = "stable";
  if (row.priceChange7d > 2) priceTrend = "rising";
  else if (row.priceChange7d < -2) priceTrend = "declining";

  return {
    ...toCompetitor(row),
    currentPrice,
    priceHistory,
    priceChangePercent7d: row.priceChange7d,
    priceChangeDayPercent: row.priceChange7d / 7, // Approximate daily change
    priceTrend,
    priceObservations: row.priceHistory.length,
    priceDataQuality: row.priceHistory.length > 20 ? "high" : row.priceHistory.length > 10 ? "medium" : "low",
  };
}

/**
 * Convert CompetitorListing back to CompetitorTableRow
 */
export function fromCompetitorListing(listing: CompetitorListing, rank: number, yourPrice: number): CompetitorTableRow {
  return {
    rank,
    id: listing.id,
    name: listing.name,
    logo: listing.name.substring(0, 2).toUpperCase(),
    platform: fromCompetitorPlatform(listing.platform),
    currentPrice: listing.currentPrice.price,
    priceChange7d: listing.priceChangePercent7d,
    lastUpdated: new Date(listing.updatedAt),
    stockStatus: listing.currentPrice.availability === "pre_order" ? "limited" : listing.currentPrice.availability,
    reviewCount: listing.reputation.reviewCount,
    avgRating: listing.reputation.averageRating,
    isAboveYourPrice: listing.currentPrice.price > yourPrice,
    priceHistory: listing.priceHistory.map(ph => ({
      date: ph.collectedAt,
      price: ph.price,
    })),
    location: listing.location,
    country: listing.country,
    businessType: listing.businessType,
    contactInfo: listing.contactInfo,
    reputation: listing.reputation,
    engagement: listing.engagement,
    reliabilityScore: listing.reliabilityScore,
    status: listing.status,
  };
}

/**
 * Convert legacy alert type to AlertCategory
 */
export function toAlertCategory(type: PriceMovementAlert["type"]): AlertCategory {
  const typeMap: Record<PriceMovementAlert["type"], AlertCategory> = {
    "drop": "price_drop",
    "increase": "price_rise",
    "new_entry": "new_competitor",
    "out_of_stock": "out_of_stock",
    "availability_change": "availability_change",
    "rating_change": "rating_change",
    "market_shift": "market_shift",
  };
  return typeMap[type] || "price_drop";
}

/**
 * Determine severity based on price change
 */
export function determineSeverity(priceChange?: number): AlertSeverity {
  if (!priceChange) return "low";
  const absChange = Math.abs(priceChange);
  if (absChange >= 20) return "critical";
  if (absChange >= 10) return "high";
  if (absChange >= 5) return "medium";
  return "low";
}

/**
 * Convert PriceMovementAlert to comprehensive PriceAlert
 */
export function toPriceAlert(alert: PriceMovementAlert): PriceAlert {
  const priceChangePercent = alert.oldPrice 
    ? ((alert.newPrice - alert.oldPrice) / alert.oldPrice) * 100 
    : undefined;

  return {
    id: alert.id,
    severity: alert.severity || determineSeverity(priceChangePercent),
    type: toAlertCategory(alert.type),
    competitorId: alert.competitorId || "",
    competitorName: alert.competitorName,
    productId: "default",
    productName: alert.productName,
    message: alert.message || getDefaultAlertMessage(alert),
    details: {
      oldPrice: alert.oldPrice,
      newPrice: alert.newPrice,
      priceChangePercent,
      ...alert.details,
    },
    timestamp: alert.timestamp.toISOString(),
    status: alert.dismissed ? "dismissed" : (alert.status || "active"),
    acknowledgedAt: alert.acknowledgedAt,
    actionTaken: alert.actionTaken,
    notifyUser: true,
    notificationChannels: alert.notificationChannels || ["in_app"],
  };
}

/**
 * Convert comprehensive PriceAlert back to PriceMovementAlert
 */
export function fromPriceAlert(alert: PriceAlert): PriceMovementAlert {
  const typeMap: Record<AlertCategory, PriceMovementAlert["type"]> = {
    "price_drop": "drop",
    "price_rise": "increase",
    "new_competitor": "new_entry",
    "competitor_exit": "out_of_stock",
    "out_of_stock": "out_of_stock",
    "availability_change": "availability_change",
    "rating_change": "rating_change",
    "market_shift": "market_shift",
  };

  return {
    id: alert.id,
    type: typeMap[alert.type] || "drop",
    competitorName: alert.competitorName,
    competitorId: alert.competitorId,
    productName: alert.productName,
    oldPrice: alert.details.oldPrice,
    newPrice: alert.details.newPrice || 0,
    timestamp: new Date(alert.timestamp),
    dismissed: alert.status === "dismissed",
    message: alert.message,
    severity: alert.severity,
    status: alert.status,
    notificationChannels: alert.notificationChannels,
    details: alert.details,
    acknowledgedAt: alert.acknowledgedAt,
    actionTaken: alert.actionTaken,
  };
}

/**
 * Generate default alert message
 * @param alert The price movement alert
 * @param formatPrice Optional currency formatter function. Falls back to basic $ formatting.
 */
export function getDefaultAlertMessage(
  alert: PriceMovementAlert, 
  formatPrice: (amount: number) => string = (n) => `$${n.toFixed(2)}`
): string {
  switch (alert.type) {
    case "drop":
      return `${alert.competitorName} dropped price to ${formatPrice(alert.newPrice)}`;
    case "increase":
      return `${alert.competitorName} raised price to ${formatPrice(alert.newPrice)}`;
    case "new_entry":
      return `New competitor ${alert.competitorName} entered at ${formatPrice(alert.newPrice)}`;
    case "out_of_stock":
      return `${alert.competitorName} is now out of stock`;
    case "availability_change":
      return `${alert.competitorName} availability changed`;
    case "rating_change":
      return `${alert.competitorName} rating updated`;
    case "market_shift":
      return `Market shift detected for ${alert.productName}`;
    default:
      return `Alert for ${alert.competitorName}`;
  }
}

/**
 * Get severity color classes
 */
export function getSeverityColors(severity: AlertSeverity): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-100 dark:bg-red-950",
        text: "text-red-800 dark:text-red-200",
        border: "border-red-300 dark:border-red-800",
      };
    case "high":
      return {
        bg: "bg-orange-100 dark:bg-orange-950",
        text: "text-orange-800 dark:text-orange-200",
        border: "border-orange-300 dark:border-orange-800",
      };
    case "medium":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-950",
        text: "text-yellow-800 dark:text-yellow-200",
        border: "border-yellow-300 dark:border-yellow-800",
      };
    case "low":
      return {
        bg: "bg-blue-100 dark:bg-blue-950",
        text: "text-blue-800 dark:text-blue-200",
        border: "border-blue-300 dark:border-blue-800",
      };
  }
}

/**
 * Get platform icon
 */
export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    "Facebook": "📘",
    "Instagram": "📸",
    "Amazon": "🛒",
    "OLX": "🟡",
    "Ouedkniss": "🟢",
    "Website": "🌐",
    "WhatsApp": "💬",
    "Telegram": "✈️",
    "Viber": "💜",
    "TikTok": "🎵",
    "LinkedIn": "💼",
    "Other": "📦",
  };
  return icons[platform] || "📦";
}

/**
 * Get competitiveness badge info
 */
export function getCompetitivenessBadge(competitiveness: string): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  switch (competitiveness) {
    case "significantly_underpriced":
      return {
        label: "Significantly Underpriced",
        variant: "destructive",
        className: "bg-red-500",
      };
    case "underpriced":
      return {
        label: "Underpriced",
        variant: "secondary",
        className: "bg-yellow-500 text-yellow-950",
      };
    case "competitive":
      return {
        label: "Competitive",
        variant: "default",
        className: "bg-emerald-500",
      };
    case "overpriced":
      return {
        label: "Overpriced",
        variant: "secondary",
        className: "bg-orange-500 text-orange-950",
      };
    case "significantly_overpriced":
      return {
        label: "Significantly Overpriced",
        variant: "destructive",
        className: "bg-red-600",
      };
    default:
      return {
        label: "Unknown",
        variant: "outline",
        className: "",
      };
  }
}
