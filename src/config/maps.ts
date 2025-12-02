// Configuration file to bypass environment variable issues
export const CONFIG = {
  // Add your Google Maps API key here directly
  GOOGLE_MAPS_API_KEY: 'AIzaSyCw40dfjE_jvBe8hQ-OWookgNdGmLLa1vo',
  
  // Map settings
  DEFAULT_ZOOM: 16,
  DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 }, // NYC
};

export function getGoogleMapsApiKey(): string {
  // Try multiple sources
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }
  
  if (typeof window !== 'undefined' && (window as any).MAPS_API_KEY) {
    return (window as any).MAPS_API_KEY;
  }
  
  return CONFIG.GOOGLE_MAPS_API_KEY;
}