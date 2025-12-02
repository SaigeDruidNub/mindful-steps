"use client";

import { useState, useEffect, useRef } from "react";
import { LocationManager } from "@/lib/location";
import { LocationData, MapSettings } from "@/types/location";
import { getGoogleMapsApiKey } from "@/config/maps";

interface MapViewProps {
  isActive: boolean;
  onLocationUpdate?: (location: LocationData) => void;
  settings?: Partial<MapSettings>;
}

declare global {
  interface Window {
    google?: any;
    initMap?: () => void;
    MAPS_API_KEY?: string;
  }
}

export function MapView({
  isActive,
  onLocationUpdate,
  settings = {},
}: MapViewProps) {
  const [locationManager] = useState(() => new LocationManager());
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [path, setPath] = useState<Array<{ lat: number; lng: number }>>([]);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  const defaultSettings: MapSettings = {
    showPath: true,
    showCurrentLocation: true,
    mapType: "roadmap",
    zoomLevel: 16,
    ...settings,
  };

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isActive && mapLoaded) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isActive, mapLoaded]);

  useEffect(() => {
    locationManager.addListener(handleLocationUpdate);
    return () => {
      locationManager.removeListener(handleLocationUpdate);
    };
  }, [locationManager]);

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    // Use our configuration helper
    const apiKey = getGoogleMapsApiKey();

    console.log("🔍 Using API Key:", apiKey.substring(0, 10) + "...");

    if (!apiKey || apiKey === "your_google_maps_api_key_here") {
      console.error("❌ Invalid API key");
      setError("Invalid or missing Google Maps API key");
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;

    // Set up the callback
    window.initMap = () => {
      setMapLoaded(true);
      initializeMap();
    };

    // Handle loading errors
    script.onerror = () => {
      setError(
        "Failed to load Google Maps. Please check your internet connection."
      );
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
      zoom: defaultSettings.zoomLevel,
      mapTypeId: defaultSettings.mapType,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: false,
    };

    mapInstanceRef.current = new window.google.maps.Map(
      mapRef.current,
      mapOptions
    );
  };

  const startLocationTracking = async () => {
    if (!locationManager.supported) {
      setError("Location services are not supported by your browser");
      return;
    }

    try {
      setError(null);
      await locationManager.startTracking();
      setIsTracking(true);
    } catch (error) {
      console.error("Failed to start location tracking:", error);
      setError(
        "Unable to access your location. Please check location permissions."
      );
    }
  };

  const stopLocationTracking = () => {
    locationManager.stopTracking();
    setIsTracking(false);
  };

  const handleLocationUpdate = (location: LocationData) => {
    setCurrentLocation(location);
    onLocationUpdate?.(location);
    updateMap(location);

    // Update path
    const newPath = locationManager.getPathCoordinates();
    setPath(newPath);
  };

  const updateMap = (location: LocationData) => {
    if (!mapInstanceRef.current || !window.google) return;

    const position = { lat: location.latitude, lng: location.longitude };

    // Update or create marker
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
    } else {
      markerRef.current.setPosition(position);
    }

    // Center map on current location
    mapInstanceRef.current.panTo(position);

    // Update path polyline
    if (defaultSettings.showPath && path.length > 1) {
      updatePolyline();
    }
  };

  const updatePolyline = () => {
    if (!mapInstanceRef.current || !window.google || path.length < 2) return;

    if (polylineRef.current) {
      polylineRef.current.setPath(path);
    } else {
      polylineRef.current = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: mapInstanceRef.current,
      });
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const currentPath = locationManager.getCurrentPath();

  return (
    <div className="w-full h-full space-y-2">
      {/* Map Container */}
      <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center p-4">
              <p className="text-destructive mb-2">{error}</p>
              <button
                onClick={startLocationTracking}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
          role="application"
          aria-label="Interactive map showing walking route"
        />

        {/* Tracking Status */}
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur rounded-lg p-2 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isTracking ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-foreground">
              {isTracking ? "Tracking" : "Not Tracking"}
            </span>
          </div>
          {currentPath && (
            <div className="text-muted-foreground mt-1">
              {formatDistance(currentPath.distance)}
            </div>
          )}
        </div>
      </div>

      {/* Location Info */}
      {currentLocation && (
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Current Location
              </p>
              <p className="text-xs text-muted-foreground">
                {currentLocation.latitude.toFixed(6)},{" "}
                {currentLocation.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Accuracy: ±{Math.round(currentLocation.accuracy)}m
              </p>
            </div>
            {currentPath && (
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Distance</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistance(currentPath.distance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(currentPath.duration / 60000)}min
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
