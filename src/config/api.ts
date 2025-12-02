// API Configuration for OAuth and Storage
export const API_CONFIG = {
  // OAuth settings (Google only)
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",

  // API endpoints
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",

  // Fallback to localStorage if API is not available
  USE_LOCALSTORAGE_FALLBACK: true,
};

// Device/user identification
export const DEVICE_ID_KEY = "mindful-steps-device-id";
export const USER_TOKEN_KEY = "mindful-steps-user-token";
export const USER_DATA_KEY = "mindful-steps-user";

export function getUserId(): string {
  if (typeof window === "undefined") return "";

  // Try to get Google user ID first
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      if (user.id) {
        return `user_${user.id}`; // Prefix with 'user_' to distinguish from device IDs
      }
    }
  } catch (error) {
    console.warn("Failed to get user ID from stored data");
  }

  // Fallback to device ID
  return getDeviceId();
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function generateDeviceId(): string {
  return "device_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
}

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setUserToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_TOKEN_KEY, token);
}

export function clearUserToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_TOKEN_KEY);
}
