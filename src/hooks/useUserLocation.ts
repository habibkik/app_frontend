import { useState, useEffect } from "react";

export interface UserCoords {
  lat: number;
  lng: number;
}

/**
 * Returns the user's geolocation coordinates.
 * Silently fails (returns null) if denied or unavailable.
 */
export function useUserLocation(): UserCoords | null {
  const [coords, setCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}, // silently ignore denied / unavailable
      { timeout: 8000 }
    );
  }, []);

  return coords;
}
