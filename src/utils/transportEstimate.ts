/**
 * Haversine distance & smart transport mode/cost estimator.
 */

const R = 6371; // Earth radius in km

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type TransportMode = "road" | "sea" | "air";

export interface TransportInfo {
  mode: TransportMode;
  label: string;
  costRange: string;
  color: string;
}

/**
 * Determines the most likely transport mode and provides a rough cost estimate
 * based on great-circle distance.
 *
 * Thresholds:
 * - Road  : ≤ 1 500 km  — same continent, driveable
 * - Sea   : 1 500 – 8 000 km — intercontinental short-haul / medium-haul
 * - Air   : > 8 000 km  — long-haul, typically air freight
 */
export function getTransportInfo(distanceKm: number): TransportInfo {
  if (distanceKm <= 1500) {
    const cost = Math.round(distanceKm * 0.12); // ~$0.12/km rough CBM cost
    return {
      mode: "road",
      label: "Road freight",
      costRange: `~$${cost}–${Math.round(cost * 1.4)}/CBM`,
      color: "#10b981", // emerald
    };
  }
  if (distanceKm <= 8000) {
    const base = distanceKm <= 4000 ? 300 : 900;
    return {
      mode: "sea",
      label: "Sea freight",
      costRange: `~$${base}–${base + 700}/TEU`,
      color: "#3b82f6", // blue
    };
  }
  return {
    mode: "air",
    label: "Air freight",
    costRange: "~$4–8/kg (high cost)",
    color: "#f59e0b", // amber
  };
}

/** Returns a human-readable distance string. */
export function formatDistance(km: number): string {
  if (km < 1) return "<1 km";
  if (km < 1000) return `${Math.round(km)} km`;
  return `${(km / 1000).toFixed(1)}k km`;
}
