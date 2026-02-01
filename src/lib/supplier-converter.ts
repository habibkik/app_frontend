/**
 * Supplier Converter - Utilities to convert AI result types to standard Supplier type
 */
import type { Supplier, SupplierGeoLocation, SupplierContact, SupplierBusinessProfile } from "@/data/suppliers";
import type { SupplierMatch, SubstituteSupplier, GeoLocation, BusinessContact, BusinessProfile } from "@/stores/analysisStore";

/**
 * Convert GeoLocation from analysis to SupplierGeoLocation
 */
function convertGeoLocation(geo?: GeoLocation): SupplierGeoLocation | undefined {
  if (!geo) return undefined;
  return {
    latitude: geo.latitude,
    longitude: geo.longitude,
    formattedAddress: geo.formattedAddress,
    city: geo.city,
    state: geo.state,
    country: geo.country,
  };
}

/**
 * Convert BusinessContact from analysis to SupplierContact
 */
function convertContact(contact?: BusinessContact): SupplierContact | undefined {
  if (!contact) return undefined;
  return {
    email: contact.email,
    phone: contact.phone,
    website: contact.website,
    linkedIn: contact.linkedIn,
  };
}

/**
 * Convert BusinessProfile from analysis to SupplierBusinessProfile
 */
function convertBusinessProfile(profile?: BusinessProfile): SupplierBusinessProfile | undefined {
  if (!profile) return undefined;
  return {
    annualRevenue: profile.annualRevenue,
    companySize: profile.companySize,
  };
}

/**
 * Parse location string to location object
 */
function parseLocation(locationStr: string, geo?: GeoLocation): { city: string; country: string; countryCode: string } {
  // Try to extract city and country from location string
  const parts = locationStr.split(",").map((p) => p.trim());
  const city = geo?.city || parts[0] || "Unknown";
  const country = geo?.country || parts[parts.length - 1] || "Unknown";
  
  // Generate country code from country name
  const countryCode = getCountryCode(country);
  
  return { city, country, countryCode };
}

/**
 * Get country code from country name
 */
function getCountryCode(country: string): string {
  const countryCodes: Record<string, string> = {
    "China": "CN",
    "India": "IN",
    "Germany": "DE",
    "Thailand": "TH",
    "Ireland": "IE",
    "Brazil": "BR",
    "USA": "US",
    "United States": "US",
    "Vietnam": "VN",
    "Japan": "JP",
    "South Korea": "KR",
    "Taiwan": "TW",
    "Malaysia": "MY",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Singapore": "SG",
    "UK": "GB",
    "United Kingdom": "GB",
    "France": "FR",
    "Italy": "IT",
    "Spain": "ES",
    "Mexico": "MX",
    "Canada": "CA",
    "Australia": "AU",
  };
  
  return countryCodes[country] || country.substring(0, 2).toUpperCase();
}

/**
 * Guess industry from business profile
 */
function guessIndustry(profile?: BusinessProfile): string {
  if (!profile?.specializations?.length) return "Manufacturing";
  
  const specString = profile.specializations.join(" ").toLowerCase();
  
  if (specString.includes("electronic") || specString.includes("pcb") || specString.includes("iot")) {
    return "Electronics";
  }
  if (specString.includes("textile") || specString.includes("fabric") || specString.includes("cotton")) {
    return "Textiles";
  }
  if (specString.includes("automotive") || specString.includes("car") || specString.includes("vehicle")) {
    return "Automotive";
  }
  if (specString.includes("medical") || specString.includes("surgical") || specString.includes("diagnostic")) {
    return "Medical";
  }
  if (specString.includes("food") || specString.includes("beverage") || specString.includes("organic")) {
    return "Food & Beverage";
  }
  if (specString.includes("packaging") || specString.includes("box") || specString.includes("container")) {
    return "Packaging";
  }
  if (specString.includes("machine") || specString.includes("cnc") || specString.includes("metal")) {
    return "Machinery";
  }
  
  return "Manufacturing";
}

/**
 * Calculate rating from match score
 */
function calculateRating(matchScore: number): number {
  // Convert 0-100 score to 0-5 rating with some variance
  const baseRating = (matchScore / 100) * 5;
  return Math.round(baseRating * 10) / 10; // Round to 1 decimal
}

/**
 * Convert SupplierMatch to Supplier
 */
export function supplierMatchToSupplier(match: SupplierMatch): Supplier {
  const location = parseLocation(match.location, match.geoLocation);
  
  return {
    id: `ai-match-${match.id}`,
    name: match.name,
    logo: match.name.substring(0, 2).toUpperCase(),
    location,
    industry: guessIndustry(match.businessProfile),
    specializations: match.businessProfile?.specializations || [],
    verified: match.verified,
    rating: calculateRating(match.matchScore),
    reviewCount: 0, // AI-discovered, no reviews yet
    responseTime: match.leadTime,
    minOrderValue: match.moq * match.priceRange.min,
    yearEstablished: match.businessProfile?.yearEstablished || new Date().getFullYear(),
    employeeCount: match.businessProfile?.companySize || "Unknown",
    description: `AI-discovered supplier with ${match.matchScore}% match score. Price range: $${match.priceRange.min.toLocaleString()} - $${match.priceRange.max.toLocaleString()}. MOQ: ${match.moq} units.`,
    certifications: match.businessProfile?.certifications || [],
    geoLocation: convertGeoLocation(match.geoLocation),
    contact: convertContact(match.contact),
    businessProfile: convertBusinessProfile(match.businessProfile),
    // AI Discovery metadata
    isAIDiscovered: true,
    matchScore: match.matchScore,
    discoveredAt: new Date(),
  };
}

/**
 * Convert SubstituteSupplier to Supplier
 */
export function substituteSupplierToSupplier(sub: SubstituteSupplier): Supplier {
  const location = parseLocation(sub.location, sub.geoLocation);
  
  return {
    id: `ai-sub-${sub.id}`,
    name: sub.name,
    logo: sub.name.substring(0, 2).toUpperCase(),
    location,
    industry: "Manufacturing", // Default for substitutes
    specializations: [sub.substituteProduct],
    verified: false,
    rating: calculateRating(sub.similarity),
    reviewCount: 0,
    responseTime: sub.leadTime,
    minOrderValue: 1000, // Default for substitutes
    yearEstablished: new Date().getFullYear(),
    employeeCount: "Unknown",
    description: `AI-discovered substitute supplier. Original product: ${sub.originalProduct}. Substitute: ${sub.substituteProduct}. Similarity: ${sub.similarity}%. Price advantage: ${sub.priceAdvantage}.`,
    certifications: [],
    geoLocation: convertGeoLocation(sub.geoLocation),
    contact: convertContact(sub.contact),
    // AI Discovery metadata
    isAIDiscovered: true,
    matchScore: sub.similarity,
    discoveredAt: new Date(),
    substituteOf: sub.originalProduct,
  };
}
