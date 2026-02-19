"use client";

import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import maplibregl, {
  type StyleSpecification,
  type MarkerOptions,
  type PopupOptions,
  type MapOptions,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

// ============================================================
// STYLES
// ============================================================
const CARTO_LIGHT =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const CARTO_DARK =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// ============================================================
// TYPES
// ============================================================
export interface MapViewport {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

type ProjectionSpecification = { type: "mercator" | "globe" };

// ============================================================
// MAP CONTEXT
// ============================================================
interface MapContextValue {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextValue>({ map: null, isLoaded: false });

export function useMap() {
  return useContext(MapContext);
}

// ============================================================
// MARKER CONTEXT
// ============================================================
interface MarkerContextValue {
  marker: maplibregl.Marker | null;
  popup: maplibregl.Popup | null;
  tooltipPopup: maplibregl.Popup | null;
  setPopup: (popup: maplibregl.Popup | null) => void;
  setTooltipPopup: (popup: maplibregl.Popup | null) => void;
}

const MarkerContext = createContext<MarkerContextValue>({
  marker: null,
  popup: null,
  tooltipPopup: null,
  setPopup: () => {},
  setTooltipPopup: () => {},
});

// ============================================================
// THEME DETECTION
// ============================================================
function detectTheme(): "light" | "dark" {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) return "dark";
  }
  if (typeof window !== "undefined") {
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches)
      return "dark";
  }
  return "light";
}

function useTheme(themeProp?: "light" | "dark") {
  const [theme, setTheme] = useState<"light" | "dark">(
    themeProp ?? detectTheme()
  );

  useEffect(() => {
    if (themeProp) {
      setTheme(themeProp);
      return;
    }

    const observer = new MutationObserver(() => {
      setTheme(detectTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMqChange = () => setTheme(detectTheme());
    mq.addEventListener("change", onMqChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onMqChange);
    };
  }, [themeProp]);

  return theme;
}

// ============================================================
// MAP COMPONENT
// ============================================================
interface MapProps extends Omit<Partial<MapOptions>, "container" | "style"> {
  children?: React.ReactNode;
  className?: string;
  theme?: "light" | "dark";
  styles?: {
    light?: string | StyleSpecification;
    dark?: string | StyleSpecification;
  };
  projection?: ProjectionSpecification;
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
}

export function Map({
  children,
  className,
  theme: themeProp,
  styles,
  projection,
  viewport,
  onViewportChange,
  center,
  zoom,
  bearing,
  pitch,
  ...rest
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = useTheme(themeProp);

  const getStyle = useCallback(
    (t: "light" | "dark") => {
      if (styles) return styles[t] ?? (t === "dark" ? CARTO_DARK : CARTO_LIGHT);
      return t === "dark" ? CARTO_DARK : CARTO_LIGHT;
    },
    [styles]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter = viewport
      ? ([viewport.longitude ?? 0, viewport.latitude ?? 0] as [number, number])
      : center
      ? (center as [number, number])
      : ([0, 20] as [number, number]);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getStyle(theme),
      center: initialCenter,
      zoom: viewport?.zoom ?? (zoom as number) ?? 2,
      bearing: viewport?.bearing ?? (bearing as number) ?? 0,
      pitch: viewport?.pitch ?? (pitch as number) ?? 0,
      ...rest,
    });

    map.on("load", () => {
      // Set projection after style is fully loaded to avoid "Style is not done loading" error
      if (projection) {
        try {
          (map as any).setProjection?.(projection);
        } catch {
          // setProjection not supported — safe to ignore
        }
      }
      setIsLoaded(true);
    });

    if (onViewportChange) {
      map.on("move", () => {
        const c = map.getCenter();
        onViewportChange({
          longitude: c.lng,
          latitude: c.lat,
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setIsLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reactively update projection when the prop changes after initial load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded || !projection) return;
    try {
      (map as any).setProjection?.(projection);
    } catch {
      // setProjection not supported — safe to ignore
    }
  }, [projection, isLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;
    map.setStyle(getStyle(theme));
  }, [theme, getStyle, isLoaded]);

  // Sync controlled viewport
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !viewport) return;
    map.jumpTo({
      center: [viewport.longitude ?? 0, viewport.latitude ?? 0],
      zoom: viewport.zoom ?? map.getZoom(),
      bearing: viewport.bearing ?? map.getBearing(),
      pitch: viewport.pitch ?? map.getPitch(),
    });
  }, [viewport]);

  return (
    <MapContext.Provider value={{ map: mapRef.current, isLoaded }}>
      <div ref={containerRef} className={cn("w-full h-full relative", className)}>
        {isLoaded && children}
      </div>
    </MapContext.Provider>
  );
}

// ============================================================
// MAP CONTROLS
// ============================================================
interface MapControlsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

export function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map, isLoaded } = useMap();
  const addedRef = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded || addedRef.current) return;

    if (showZoom || showCompass) {
      map.addControl(
        new maplibregl.NavigationControl({ showCompass, showZoom }),
        position
      );
    }
    if (showFullscreen) {
      map.addControl(new maplibregl.FullscreenControl(), position);
    }
    if (showLocate) {
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        position
      );
    }

    addedRef.current = true;
  }, [map, isLoaded, position, showZoom, showCompass, showFullscreen, showLocate, onLocate]);

  return null;
}

// ============================================================
// MAP MARKER
// ============================================================
interface MapMarkerProps extends Omit<MarkerOptions, "element"> {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
}

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  ...markerOptions
}: MapMarkerProps) {
  const { map, isLoaded } = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement>(document.createElement("div"));
  const [popup, setPopup] = useState<maplibregl.Popup | null>(null);
  const [tooltipPopup, setTooltipPopup] = useState<maplibregl.Popup | null>(
    null
  );

  useEffect(() => {
    if (!map || !isLoaded) return;

    const el = elementRef.current;

    const marker = new maplibregl.Marker({
      element: el,
      ...markerOptions,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    if (onClick) el.addEventListener("click", onClick);
    if (onMouseEnter) el.addEventListener("mouseenter", onMouseEnter);
    if (onMouseLeave) el.addEventListener("mouseleave", onMouseLeave);

    if (onDragStart)
      marker.on("dragstart", () => onDragStart(marker.getLngLat()));
    if (onDrag) marker.on("drag", () => onDrag(marker.getLngLat()));
    if (onDragEnd) marker.on("dragend", () => onDragEnd(marker.getLngLat()));

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded]);

  // Update position
  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  return (
    <MarkerContext.Provider
      value={{
        marker: markerRef.current,
        popup,
        tooltipPopup,
        setPopup,
        setTooltipPopup,
      }}
    >
      {createPortal(children, elementRef.current)}
    </MarkerContext.Provider>
  );
}

// ============================================================
// MARKER CONTENT
// ============================================================
interface MarkerContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function MarkerContent({ children, className }: MarkerContentProps) {
  if (!children) {
    return (
      <div className={cn("w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-md cursor-pointer", className)} />
    );
  }
  return (
    <div className={cn("cursor-pointer", className)}>{children}</div>
  );
}

// ============================================================
// MARKER LABEL
// ============================================================
interface MarkerLabelProps {
  children?: React.ReactNode;
  className?: string;
  position?: "top" | "bottom";
}

export function MarkerLabel({ children, className, position = "top" }: MarkerLabelProps) {
  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-xs font-medium bg-background/90 text-foreground border shadow-sm pointer-events-none",
        position === "top" ? "bottom-full mb-1" : "top-full mt-1",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// MARKER POPUP
// ============================================================
interface MarkerPopupProps extends Omit<PopupOptions, "className" | "closeButton"> {
  children?: React.ReactNode;
  className?: string;
  closeButton?: boolean;
}

export function MarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MarkerPopupProps) {
  const { map, isLoaded } = useMap();
  const { marker, setPopup } = useContext(MarkerContext);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const containerRef = useRef<HTMLDivElement>(document.createElement("div"));

  useEffect(() => {
    if (!map || !isLoaded || !marker) return;

    // Reset MapLibre default popup styles
    const styleId = "mapcn-popup-reset";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .maplibregl-popup-content { padding: 0 !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }
        .maplibregl-popup-tip { display: none !important; }
        .maplibregl-popup-close-button { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    const popup = new maplibregl.Popup({
      closeButton,
      closeOnClick: true,
      maxWidth: "none",
      offset: 15,
      ...popupOptions,
    }).setDOMContent(containerRef.current);

    marker.getElement().addEventListener("click", () => {
      if (popup.isOpen()) {
        popup.remove();
      } else {
        popup.setLngLat(marker.getLngLat()).addTo(map);
      }
    });

    popupRef.current = popup;
    setPopup(popup);

    return () => {
      popup.remove();
      popupRef.current = null;
      setPopup(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded, marker]);

  return createPortal(
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden", className)}>
      {children}
    </div>,
    containerRef.current
  );
}

// ============================================================
// MARKER TOOLTIP
// ============================================================
interface MarkerTooltipProps extends Omit<PopupOptions, "className" | "closeButton" | "closeOnClick"> {
  children?: React.ReactNode;
  className?: string;
}

export function MarkerTooltip({ children, className, ...popupOptions }: MarkerTooltipProps) {
  const { map, isLoaded } = useMap();
  const { marker } = useContext(MarkerContext);
  const tooltipRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!map || !isLoaded || !marker) return;

    const tooltip = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      ...popupOptions,
    });

    const el = marker.getElement();

    const show = () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map);
    };
    const hide = () => tooltip.remove();

    el.addEventListener("mouseenter", show);
    el.addEventListener("mouseleave", hide);

    tooltipRef.current = tooltip;

    return () => {
      el.removeEventListener("mouseenter", show);
      el.removeEventListener("mouseleave", hide);
      tooltip.remove();
      tooltipRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded, marker]);

  if (!tooltipRef.current) return null;

  return createPortal(
    <div className={cn("px-2 py-1 rounded bg-popover text-popover-foreground text-xs font-medium shadow border", className)}>
      {children}
    </div>,
    tooltipRef.current.getElement() ?? document.createElement("div")
  );
}

// ============================================================
// MAP POPUP (standalone)
// ============================================================
interface MapPopupProps extends Omit<PopupOptions, "className" | "closeButton"> {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
  closeButton?: boolean;
}

export function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MapPopupProps) {
  const { map, isLoaded } = useMap();
  const containerRef = useRef<HTMLDivElement>(document.createElement("div"));

  useEffect(() => {
    if (!map || !isLoaded) return;

    const popup = new maplibregl.Popup({
      closeButton,
      closeOnClick: false,
      maxWidth: "none",
      ...popupOptions,
    })
      .setLngLat([longitude, latitude])
      .setDOMContent(containerRef.current)
      .addTo(map);

    if (onClose) popup.on("close", onClose);

    return () => {
      popup.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded]);

  return createPortal(
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-lg p-3", className)}>
      {children}
    </div>,
    containerRef.current
  );
}

// ============================================================
// MAP CLUSTER LAYER
// ============================================================
interface MapClusterLayerProps<T = Record<string, unknown>> {
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, T>;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  clusterColors?: [string, string, string];
  clusterThresholds?: [number, number];
  pointColor?: string;
  onPointClick?: (feature: GeoJSON.Feature, coordinates: [number, number]) => void;
  onClusterClick?: (clusterId: number, coordinates: [number, number], pointCount: number) => void;
}

export function MapClusterLayer<T = Record<string, unknown>>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#22c55e", "#eab308", "#ef4444"],
  clusterThresholds = [100, 750],
  pointColor = "#3b82f6",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps<T>) {
  const { map, isLoaded } = useMap();
  const sourceId = useRef(`cluster-source-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const sid = sourceId.current;

    map.addSource(sid, {
      type: "geojson",
      data: data as GeoJSON.FeatureCollection,
      cluster: true,
      clusterMaxZoom,
      clusterRadius,
    });

    map.addLayer({
      id: `${sid}-clusters`,
      type: "circle",
      source: sid,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          clusterColors[0],
          clusterThresholds[0],
          clusterColors[1],
          clusterThresholds[1],
          clusterColors[2],
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, clusterThresholds[0], 30, clusterThresholds[1], 40],
      },
    });

    map.addLayer({
      id: `${sid}-cluster-count`,
      type: "symbol",
      source: sid,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Open Sans Semibold"],
        "text-size": 12,
      },
      paint: { "text-color": "#ffffff" },
    });

    map.addLayer({
      id: `${sid}-unclustered-point`,
      type: "circle",
      source: sid,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": pointColor,
        "circle-radius": 6,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    if (onPointClick) {
      map.on("click", `${sid}-unclustered-point`, (e) => {
        const feature = e.features?.[0];
        if (feature) {
          const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
          onPointClick(feature as GeoJSON.Feature, coords);
        }
      });
    }

    if (!onClusterClick) {
      map.on("click", `${sid}-clusters`, async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [`${sid}-clusters`] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId) {
          const source = map.getSource(sid) as maplibregl.GeoJSONSource;
          const zoom = await source.getClusterExpansionZoom(clusterId);
          map.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number], zoom });
        }
      });
    } else {
      map.on("click", `${sid}-clusters`, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [`${sid}-clusters`] });
        const f = features[0];
        if (f) {
          onClusterClick(
            f.properties?.cluster_id,
            (f.geometry as GeoJSON.Point).coordinates as [number, number],
            f.properties?.point_count
          );
        }
      });
    }

    map.on("mouseenter", `${sid}-clusters`, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", `${sid}-clusters`, () => { map.getCanvas().style.cursor = ""; });
    map.on("mouseenter", `${sid}-unclustered-point`, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", `${sid}-unclustered-point`, () => { map.getCanvas().style.cursor = ""; });

    return () => {
      // Guard: MapLibre sets _removed=true after map.remove() is called.
      // React may run this cleanup after the map is already destroyed, so we
      // must check before touching any layers/sources to avoid the
      // "Cannot read properties of undefined (reading 'getLayer')" crash.
      try {
        if ((map as any)._removed) return;
        if (map.getLayer(`${sid}-clusters`)) map.removeLayer(`${sid}-clusters`);
        if (map.getLayer(`${sid}-cluster-count`)) map.removeLayer(`${sid}-cluster-count`);
        if (map.getLayer(`${sid}-unclustered-point`)) map.removeLayer(`${sid}-unclustered-point`);
        if (map.getSource(sid)) map.removeSource(sid);
      } catch {
        // Map was destroyed before cleanup ran — safe to ignore
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded]);

  return null;
}
