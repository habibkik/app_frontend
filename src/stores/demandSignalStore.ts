/**
 * Store for demand signal scan results, shared between DemandSignalsDashboard and Heat Map.
 */
import { create } from "zustand";
import type { MapEntity } from "@/stores/analysisStore";
import type { DemandSignal } from "@/data/demoDemandSignals";

interface DemandSignalState {
  /** Map entities generated from the latest scan */
  scannedEntities: MapEntity[];
  /** Whether a live scan has been performed */
  hasScanned: boolean;
  /** Update entities from scan results */
  setFromScanResults: (signals: DemandSignal[]) => void;
  /** Clear scanned entities */
  clear: () => void;
}

export const useDemandSignalStore = create<DemandSignalState>((set) => ({
  scannedEntities: [],
  hasScanned: false,

  setFromScanResults: (signals) => {
    // Convert geographic_hotspot signals (which have regions) into MapEntity objects
    const hotspots = signals.filter(
      (s) => s.signalType === "geographic_hotspot" && s.region
    );

    // Map region names to approximate coordinates
    const regionCoords: Record<string, { lat: number; lng: number; country: string }> = {
      "North America": { lat: 39.8283, lng: -98.5795, country: "USA" },
      "South America": { lat: -14.235, lng: -51.9253, country: "Brazil" },
      "Western Europe": { lat: 48.8566, lng: 2.3522, country: "France" },
      "Eastern Europe": { lat: 52.2297, lng: 21.0122, country: "Poland" },
      "Northern Europe": { lat: 59.9139, lng: 10.7522, country: "Norway" },
      "Southern Europe": { lat: 41.9028, lng: 12.4964, country: "Italy" },
      "Middle East": { lat: 25.2048, lng: 55.2708, country: "UAE" },
      "East Asia": { lat: 35.6762, lng: 139.6503, country: "Japan" },
      "Southeast Asia": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
      "South Asia": { lat: 19.076, lng: 72.8777, country: "India" },
      "Central Asia": { lat: 41.2995, lng: 69.2401, country: "Uzbekistan" },
      "North Africa": { lat: 33.5731, lng: -7.5898, country: "Morocco" },
      "Sub-Saharan Africa": { lat: -1.2921, lng: 36.8219, country: "Kenya" },
      "West Africa": { lat: 6.5244, lng: 3.3792, country: "Nigeria" },
      "East Africa": { lat: -6.7924, lng: 39.2083, country: "Tanzania" },
      "Oceania": { lat: -33.8688, lng: 151.2093, country: "Australia" },
      "Caribbean": { lat: 18.1096, lng: -77.2975, country: "Jamaica" },
      "Central America": { lat: 14.6349, lng: -90.5069, country: "Guatemala" },
    };

    const entities: MapEntity[] = hotspots.map((s) => {
      const coords = regionCoords[s.region!] || { lat: 0, lng: 0, country: "Unknown" };
      return {
        id: `scan-${s.id}`,
        name: s.name,
        type: "competitor" as const,
        clientType: "demand_signal" as const,
        demandScore: s.trendScore,
        geoLocation: {
          latitude: coords.lat + (Math.random() - 0.5) * 2, // slight jitter to avoid overlap
          longitude: coords.lng + (Math.random() - 0.5) * 2,
          formattedAddress: s.region!,
          city: s.region!,
          country: coords.country,
        },
      };
    });

    // Also include trending products with regions
    const trending = signals.filter(
      (s) => s.signalType !== "geographic_hotspot" && s.region
    );
    trending.forEach((s) => {
      const coords = regionCoords[s.region!];
      if (coords) {
        entities.push({
          id: `scan-trend-${s.id}`,
          name: s.name,
          type: "competitor" as const,
          clientType: "demand_signal" as const,
          demandScore: s.trendScore,
          geoLocation: {
            latitude: coords.lat + (Math.random() - 0.5) * 3,
            longitude: coords.lng + (Math.random() - 0.5) * 3,
            formattedAddress: s.region!,
            city: s.region!,
            country: coords.country,
          },
        });
      }
    });

    set({ scannedEntities: entities, hasScanned: true });
  },

  clear: () => set({ scannedEntities: [], hasScanned: false }),
}));
