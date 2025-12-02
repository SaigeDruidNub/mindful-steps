import { LocationData, WalkingPath } from '@/types/location';

export class LocationManager {
  private watchId: number | null = null;
  private currentPath: WalkingPath | null = null;
  private listeners: ((location: LocationData) => void)[] = [];
  private lastLocation: LocationData | null = null;

  constructor() {
    this.checkGeolocationSupport();
  }

  private checkGeolocationSupport(): boolean {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return false;
    }
    return true;
  }

  public get supported(): boolean {
    return this.checkGeolocationSupport();
  }

  public addListener(callback: (location: LocationData) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (location: LocationData) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(location: LocationData): void {
    this.listeners.forEach(callback => callback(location));
  }

  public async getCurrentPosition(): Promise<LocationData | null> {
    if (!this.supported) return null;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(locationData);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  public startTracking(): Promise<void> {
    if (!this.supported) {
      throw new Error('Geolocation is not supported');
    }

    return new Promise((resolve, reject) => {
      if (this.watchId !== null) {
        resolve(); // Already tracking
        return;
      }

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const initialLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          this.currentPath = {
            points: [initialLocation],
            distance: 0,
            duration: 0,
            startTime: Date.now(),
          };

          this.lastLocation = initialLocation;
          this.notifyListeners(initialLocation);

          // Start watching for position changes
          this.watchId = navigator.geolocation.watchPosition(
            (position) => {
              const newLocation: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
              };

              this.updatePath(newLocation);
              this.notifyListeners(newLocation);
            },
            (error) => {
              console.error('Error watching position:', error);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000,
            }
          );

          resolve();
        },
        (error) => {
          console.error('Error getting initial position:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.currentPath) {
      this.currentPath.endTime = Date.now();
    }
  }

  private updatePath(newLocation: LocationData): void {
    if (!this.currentPath || !this.lastLocation) return;

    // Add new point to path
    this.currentPath.points.push(newLocation);

    // Calculate distance from last point
    const distance = this.calculateDistance(
      this.lastLocation.latitude,
      this.lastLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    this.currentPath.distance += distance;
    this.currentPath.duration = Date.now() - this.currentPath.startTime;
    this.lastLocation = newLocation;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  public getCurrentPath(): WalkingPath | null {
    return this.currentPath ? { ...this.currentPath } : null;
  }

  public getPathCoordinates(): Array<{ lat: number; lng: number }> {
    if (!this.currentPath) return [];

    return this.currentPath.points.map(point => ({
      lat: point.latitude,
      lng: point.longitude,
    }));
  }

  public getDistance(): number {
    return this.currentPath?.distance || 0;
  }

  public isTracking(): boolean {
    return this.watchId !== null;
  }

  public getLastLocation(): LocationData | null {
    return this.lastLocation;
  }

  public calculateTotalDistance(points: LocationData[]): number {
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += this.calculateDistance(
        points[i - 1].latitude,
        points[i - 1].longitude,
        points[i].latitude,
        points[i].longitude
      );
    }
    return totalDistance;
  }
}