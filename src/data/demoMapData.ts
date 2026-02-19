/**
 * Demo map entities for Buyer and Producer modes on the Heat Map page.
 * These show example data when no real AI analysis has been run.
 */
import type { MapEntity } from "@/stores/analysisStore";

// ============================================================
// BUYER MODE — Sample suppliers around the world
// ============================================================
export const DEMO_BUYER_MAP_ENTITIES: MapEntity[] = [
  {
    id: "demo-buyer-1",
    name: "Shenzhen Electronics Co.",
    type: "supplier",
    geoLocation: {
      latitude: 22.5431,
      longitude: 114.0579,
      formattedAddress: "12 Tech Park Road, Shenzhen 518055, China",
      city: "Shenzhen",
      state: "Guangdong",
      country: "China",
    },
    matchScore: 94,
    priceRange: { min: 8, max: 22 },
  },
  {
    id: "demo-buyer-2",
    name: "Mumbai Textiles Ltd",
    type: "supplier",
    geoLocation: {
      latitude: 19.076,
      longitude: 72.8777,
      formattedAddress: "45 Industrial Estate, Mumbai 400093, India",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
    },
    matchScore: 81,
    priceRange: { min: 5, max: 18 },
  },
  {
    id: "demo-buyer-3",
    name: "Frankfurt Parts GmbH",
    type: "supplier",
    geoLocation: {
      latitude: 50.1109,
      longitude: 8.6821,
      formattedAddress: "Hanauer Landstraße 200, 60314 Frankfurt, Germany",
      city: "Frankfurt",
      state: "Hesse",
      country: "Germany",
    },
    matchScore: 76,
    priceRange: { min: 18, max: 45 },
  },
  {
    id: "demo-buyer-4",
    name: "Toronto Supply Corp",
    type: "supplier",
    geoLocation: {
      latitude: 43.6532,
      longitude: -79.3832,
      formattedAddress: "200 King Street West, Toronto ON M5H 3T4, Canada",
      city: "Toronto",
      state: "Ontario",
      country: "Canada",
    },
    matchScore: 68,
    priceRange: { min: 14, max: 38 },
  },
  {
    id: "demo-buyer-5",
    name: "Osaka Industrial",
    type: "supplier",
    geoLocation: {
      latitude: 34.6937,
      longitude: 135.5023,
      formattedAddress: "2-1 Namba, Chuo-ku, Osaka 542-0076, Japan",
      city: "Osaka",
      country: "Japan",
    },
    matchScore: 88,
    priceRange: { min: 12, max: 30 },
  },
  {
    id: "demo-buyer-6",
    name: "São Paulo Manufacturing",
    type: "supplier",
    geoLocation: {
      latitude: -23.5505,
      longitude: -46.6333,
      formattedAddress: "Av. Paulista 1374, São Paulo SP 01310-100, Brazil",
      city: "São Paulo",
      country: "Brazil",
    },
    matchScore: 59,
    priceRange: { min: 7, max: 20 },
  },
];

// ============================================================
// PRODUCER MODE — Sample competitor factories around the world
// ============================================================
export const DEMO_PRODUCER_MAP_ENTITIES: MapEntity[] = [
  {
    id: "demo-producer-1",
    name: "Shanghai Auto Parts",
    type: "producer",
    geoLocation: {
      latitude: 31.2304,
      longitude: 121.4737,
      formattedAddress: "88 Zhangjiang Hi-Tech Park, Shanghai 201203, China",
      city: "Shanghai",
      state: "Shanghai",
      country: "China",
    },
    marketShare: "24%",
    priceRange: { min: 12, max: 28 },
    demandConcentration: 82,
  },
  {
    id: "demo-producer-2",
    name: "Detroit Precision Mfg",
    type: "producer",
    geoLocation: {
      latitude: 42.3314,
      longitude: -83.0458,
      formattedAddress: "1001 Woodward Avenue, Detroit MI 48226, USA",
      city: "Detroit",
      state: "Michigan",
      country: "USA",
    },
    marketShare: "19%",
    priceRange: { min: 25, max: 55 },
    demandConcentration: 65,
  },
  {
    id: "demo-producer-3",
    name: "Stuttgart Engineering GmbH",
    type: "producer",
    geoLocation: {
      latitude: 48.7758,
      longitude: 9.1829,
      formattedAddress: "Porschestraße 1, 70435 Stuttgart, Germany",
      city: "Stuttgart",
      state: "Baden-Württemberg",
      country: "Germany",
    },
    marketShare: "16%",
    priceRange: { min: 30, max: 70 },
    demandConcentration: 58,
  },
  {
    id: "demo-producer-4",
    name: "Monterrey Components SA",
    type: "producer",
    geoLocation: {
      latitude: 25.6866,
      longitude: -100.3161,
      formattedAddress: "Parque Industrial, Monterrey NL 64000, Mexico",
      city: "Monterrey",
      state: "Nuevo León",
      country: "Mexico",
    },
    marketShare: "11%",
    priceRange: { min: 9, max: 24 },
    demandConcentration: 44,
  },
  {
    id: "demo-producer-5",
    name: "Pune Auto Systems",
    type: "producer",
    geoLocation: {
      latitude: 18.5204,
      longitude: 73.8567,
      formattedAddress: "Pimpri-Chinchwad Industrial Area, Pune 411018, India",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
    },
    marketShare: "9%",
    priceRange: { min: 6, max: 18 },
    demandConcentration: 38,
  },
];
