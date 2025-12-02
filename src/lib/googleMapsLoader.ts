// Enhanced Google Maps loader with comprehensive error handling
export class GoogleMapsLoader {
  private static isLoaded = false;
  private static isLoading = false;
  private static loadPromise: Promise<void> | null = null;
  private static callbacks: (() => void)[] = [];

  static loadMapScript(apiKey: string): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.isLoading) {
      return this.loadPromise || Promise.resolve();
    }

    this.isLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('🗺️ Google Maps script already exists');
        this.checkIfLoaded().then(resolve).catch(reject);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      
      // Build URL with parameters
      const params = new URLSearchParams({
        key: apiKey,
        callback: 'googleMapsCallback',
        libraries: 'places',
        v: 'weekly'
      });
      
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      
      // Set up global callback
      window.googleMapsCallback = () => {
        console.log('✅ Google Maps loaded successfully');
        this.isLoaded = true;
        this.isLoading = false;
        this.callbacks.forEach(cb => cb());
        this.callbacks = [];
        resolve();
      };

      // Handle errors
      script.onerror = (error) => {
        console.error('❌ Failed to load Google Maps:', error);
        this.isLoading = false;
        reject(new Error('Failed to load Google Maps script'));
      };

      // Handle load
      script.onload = () => {
        console.log('📦 Google Maps script loaded, checking if API is available...');
        setTimeout(() => {
          if (!window.google || !window.google.maps) {
            console.error('❌ Script loaded but Google Maps API not available');
            reject(new Error('Google Maps API not available after script load'));
          }
        }, 1000);
      };

      // Add to document
      document.head.appendChild(script);
      
      console.log('📦 Google Maps script added to document:', script.src);
    });

    return this.loadPromise;
  }

  private static checkIfLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve();
      } else {
        reject(new Error('Google Maps not loaded'));
      }
    });
  }

  static isMapLoaded(): boolean {
    return this.isLoaded && !!(window.google && window.google.maps);
  }

  static addCallback(callback: () => void) {
    if (this.isLoaded) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }
}

// Add to global window type
declare global {
  interface Window {
    googleMapsCallback?: () => void;
  }
}