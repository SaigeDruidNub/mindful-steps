export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface WalkingPath {
  points: LocationData[];
  distance: number; // in meters
  duration: number; // in milliseconds
  startTime: number;
  endTime?: number;
}

export interface MapSettings {
  showPath: boolean;
  showCurrentLocation: boolean;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  zoomLevel: number;
}