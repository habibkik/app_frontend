/**
 * Mapbox Map Component
 * Interactive map with markers, clustering, and popups
 */
import { useState, useCallback, useMemo } from "react";
import Map, { 
  Marker, 
  Popup, 
  NavigationControl,
  FullscreenControl,
  ScaleControl,
} from "react-map-gl";
import { MapPin, Factory, Store, Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MapEntity } from "@/stores/analysisStore";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps {
  entities: MapEntity[];
  mode: "buyer" | "producer" | "seller";
  className?: string;
  height?: string | number;
  onEntityClick?: (entity: MapEntity) => void;
}

const modeColors = {
  buyer: "hsl(var(--primary))",
  producer: "hsl(262, 83%, 58%)", // Indigo
  seller: "hsl(280, 65%, 60%)", // Purple
};

const modeIcons = {
  supplier: Package,
  competitor: Store,
  producer: Factory,
};

// Get Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export function MapboxMap({
  entities,
  mode,
  className,
  height = 400,
  onEntityClick,
}: MapboxMapProps) {
  const [popupInfo, setPopupInfo] = useState<MapEntity | null>(null);

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    if (entities.length === 0) return null;

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    entities.forEach((entity) => {
      const { longitude, latitude } = entity.geoLocation;
      minLng = Math.min(minLng, longitude);
      maxLng = Math.max(maxLng, longitude);
      minLat = Math.min(minLat, latitude);
      maxLat = Math.max(maxLat, latitude);
    });

    // Add padding
    const lngPad = (maxLng - minLng) * 0.1 || 1;
    const latPad = (maxLat - minLat) * 0.1 || 1;

    return {
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
    };
  }, [entities]);

  const initialViewState = useMemo(() => {
    if (bounds) {
      return {
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        zoom: 2,
      };
    }
    return {
      longitude: 0,
      latitude: 20,
      zoom: 1.5,
    };
  }, [bounds]);

  const handleMarkerClick = useCallback((entity: MapEntity) => {
    setPopupInfo(entity);
    onEntityClick?.(entity);
  }, [onEntityClick]);

  const getGoogleMapsUrl = (entity: MapEntity) => {
    const { formattedAddress } = entity.geoLocation;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`;
  };

  if (!MAPBOX_TOKEN) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Mapbox Token Required</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Add your Mapbox access token to enable the interactive map.
            Set VITE_MAPBOX_ACCESS_TOKEN in your environment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (entities.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Location Data</h3>
          <p className="text-muted-foreground text-sm">
            Upload a product image to discover entities with location data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div style={{ height }}>
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={initialViewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-left" />

          {entities.map((entity) => {
            const Icon = modeIcons[entity.type];
            const color = modeColors[mode];

            return (
              <Marker
                key={entity.id}
                longitude={entity.geoLocation.longitude}
                latitude={entity.geoLocation.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(entity);
                }}
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderRadius: "50%",
                    padding: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </Marker>
            );
          })}

          {popupInfo && (
            <Popup
              anchor="top"
              longitude={popupInfo.geoLocation.longitude}
              latitude={popupInfo.geoLocation.latitude}
              onClose={() => setPopupInfo(null)}
              closeOnClick={false}
              className="rounded-xl overflow-hidden"
            >
              <div className="p-3 min-w-[200px]">
                <h3 className="font-semibold text-foreground mb-1">
                  {popupInfo.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {popupInfo.geoLocation.city}, {popupInfo.geoLocation.country}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {popupInfo.matchScore && (
                    <Badge variant="secondary" className="text-xs">
                      {popupInfo.matchScore}% match
                    </Badge>
                  )}
                  {popupInfo.marketShare && (
                    <Badge variant="outline" className="text-xs">
                      {popupInfo.marketShare} share
                    </Badge>
                  )}
                  {popupInfo.demandConcentration && (
                    <Badge variant="outline" className="text-xs">
                      {popupInfo.demandConcentration}% demand
                    </Badge>
                  )}
                </div>

                {popupInfo.priceRange && (
                  <p className="text-xs text-muted-foreground mb-2">
                    ${popupInfo.priceRange.min} - ${popupInfo.priceRange.max}
                  </p>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => window.open(getGoogleMapsUrl(popupInfo), "_blank")}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Open in Google Maps
                </Button>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </Card>
  );
}
