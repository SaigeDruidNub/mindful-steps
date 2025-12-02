import { WalkLog, StepGoal, WalkStreak } from "@/types";
import { API_CONFIG, getUserId, getUserToken } from "@/config/api";

// Interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: number;
}

// Interface for Vultr Object Storage metadata
interface StorageMetadata {
  deviceId: string;
  userId?: string;
  lastModified: number;
  version: string;
}

export class VultrStorageService {
  private static readonly VERSION = "1.0";
  private static readonly DATA_PREFIX = "data/";
  private static readonly PHOTOS_PREFIX = "photos/";
  private static readonly BACKUP_PREFIX = "backup/";

  // Check if API is available
  static async isApiAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.warn("API not available, using localStorage fallback");
      return false;
    }
  }

  // Get authorization headers
  private static getAuthHeaders(): Record<string, string> {
    const token = getUserToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Device-ID": getUserId(),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic API request wrapper
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Walk Logs Management
  static async getAllLogs(): Promise<WalkLog[]> {
    // Try API first
    if (await this.isApiAvailable()) {
      const result = await this.makeRequest<WalkLog[]>("/walk-logs");
      if (result.success && result.data) {
        return result.data;
      }
    }

    // Fallback to localStorage
    return this.getFromLocalStorage<WalkLog[]>("mindful-steps-walk-logs") || [];
  }

  static async saveLog(log: WalkLog): Promise<boolean> {
    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest("/walk-logs", {
          method: "POST",
          body: JSON.stringify(log),
        });

        if (result.success) {
          return true;
        }
      }

      // Fallback to localStorage
      const logs = await this.getAllLogs();
      const existingIndex = logs.findIndex((l) => l.id === log.id);

      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }

      logs.sort((a, b) => b.startTime - a.startTime);
      this.saveToLocalStorage("mindful-steps-walk-logs", logs);

      // Queue for later sync if API was unavailable
      if (!(await this.isApiAvailable())) {
        this.queueForSync("walk-logs", log);
      }

      return true;
    } catch (error) {
      console.error("Failed to save walk log:", error);
      return false;
    }
  }

  static async deleteLog(id: string): Promise<boolean> {
    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest(`/walk-logs/${id}`, {
          method: "DELETE",
        });

        if (result.success) {
          return true;
        }
      }

      // Fallback to localStorage
      const logs = await this.getAllLogs();
      const filtered = logs.filter((log) => log.id !== id);
      this.saveToLocalStorage("mindful-steps-walk-logs", filtered);
      return true;
    } catch (error) {
      console.error("Failed to delete walk log:", error);
      return false;
    }
  }

  // Goals Management
  static async getGoals(): Promise<StepGoal> {
    const defaultGoals: StepGoal = {
      daily: 5000,
      weekly: 35000,
      monthly: 150000,
    };

    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest<StepGoal>("/goals");
        if (result.success && result.data) {
          return result.data;
        }
      }

      // Fallback to localStorage
      return (
        this.getFromLocalStorage<StepGoal>("mindful-steps-goals") ||
        defaultGoals
      );
    } catch (error) {
      console.error("Failed to load goals:", error);
      return defaultGoals;
    }
  }

  static async saveGoals(goals: StepGoal): Promise<boolean> {
    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest("/goals", {
          method: "PUT",
          body: JSON.stringify(goals),
        });

        if (result.success) {
          return true;
        }
      }

      // Fallback to localStorage
      this.saveToLocalStorage("mindful-steps-goals", goals);
      return true;
    } catch (error) {
      console.error("Failed to save goals:", error);
      return false;
    }
  }

  // Streak Management
  static async getStreak(): Promise<WalkStreak> {
    const defaultStreak: WalkStreak = {
      current: 0,
      longest: 0,
      lastWalkDate: "",
    };

    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest<WalkStreak>("/streak");
        if (result.success && result.data) {
          return result.data;
        }
      }

      // Fallback to localStorage
      return (
        this.getFromLocalStorage<WalkStreak>("mindful-steps-streak") ||
        defaultStreak
      );
    } catch (error) {
      console.error("Failed to load streak:", error);
      return defaultStreak;
    }
  }

  static async updateStreak(walkDate: string): Promise<WalkStreak> {
    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest<WalkStreak>("/streak", {
          method: "POST",
          body: JSON.stringify({ walkDate }),
        });

        if (result.success && result.data) {
          return result.data;
        }
      }

      // Fallback to localStorage (logic copied from original)
      const streak = await this.getStreak();
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      if (walkDate === streak.lastWalkDate) {
        return streak;
      } else if (walkDate === yesterday || walkDate === today) {
        streak.current++;
        if (streak.current > streak.longest) {
          streak.longest = streak.current;
        }
      } else {
        streak.current = 1;
      }

      streak.lastWalkDate = walkDate;
      this.saveToLocalStorage("mindful-steps-streak", streak);

      return streak;
    } catch (error) {
      console.error("Failed to update streak:", error);
      return { current: 0, longest: 0, lastWalkDate: "" };
    }
  }

  // Photo Management
  static async savePhoto(photo: any): Promise<boolean> {
    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest("/photos", {
          method: "POST",
          body: JSON.stringify(photo),
        });

        if (result.success) {
          return true;
        }
      }

      // Fallback to localStorage (existing functionality)
      const photos =
        this.getFromLocalStorage<any[]>("mindful-steps-photos") || [];
      const existingIndex = photos.findIndex((p: any) => p.id === photo.id);

      if (existingIndex >= 0) {
        photos[existingIndex] = photo;
      } else {
        photos.push(photo);
      }

      this.saveToLocalStorage("mindful-steps-photos", photos);
      return true;
    } catch (error) {
      console.error("Failed to save photo:", error);
      return false;
    }
  }

  static async getAllPhotos(): Promise<any[]> {
    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest<any[]>("/photos");
        if (result.success && result.data) {
          return result.data;
        }
      }

      // Fallback to localStorage
      return this.getFromLocalStorage<any[]>("mindful-steps-photos") || [];
    } catch (error) {
      console.error("Failed to get photos:", error);
      return [];
    }
  }

  static async deletePhoto(photoId: string): Promise<boolean> {
    try {
      // Try API first
      if (await this.isApiAvailable()) {
        const result = await this.makeRequest(`/photos/${photoId}`, {
          method: "DELETE",
        });

        if (result.success) {
          return true;
        }
      }

      // Fallback to localStorage
      const photos =
        this.getFromLocalStorage<any[]>("mindful-steps-photos") || [];
      const filtered = photos.filter((p: any) => p.id !== photoId);
      this.saveToLocalStorage("mindful-steps-photos", filtered);
      return true;
    } catch (error) {
      console.error("Failed to delete photo:", error);
      return false;
    }
  }
  static async uploadPhoto(file: File, walkId: string): Promise<string | null> {
    try {
      if (await this.isApiAvailable()) {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("walkId", walkId);

        const result = await this.makeRequest<{ url: string }>(
          "/photos/upload",
          {
            method: "POST",
            body: formData,
            headers: {}, // Let browser set Content-Type for FormData
          }
        );

        if (result.success && result.data?.url) {
          return result.data.url;
        }
      }

      // Fallback: Convert to base64 and store in localStorage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          resolve(base64);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Failed to upload photo:", error);
      return null;
    }
  }

  // Data Migration from localStorage
  static async migrateFromLocalStorage(): Promise<boolean> {
    try {
      if (!(await this.isApiAvailable())) {
        console.warn("API not available, skipping migration");
        return false;
      }

      const token = getUserToken();
      if (!token) {
        console.warn("User not authenticated, skipping migration");
        return false;
      }

      // Get all localStorage data
      const walkLogs =
        this.getFromLocalStorage<WalkLog[]>("mindful-steps-walk-logs") || [];
      const goals = this.getFromLocalStorage<StepGoal>("mindful-steps-goals");
      const streak = this.getFromLocalStorage<WalkStreak>(
        "mindful-steps-streak"
      );

      // Create backup before migration
      const backupData = {
        walkLogs,
        goals,
        streak,
        timestamp: Date.now(),
        deviceId: getUserId(),
      };

      await this.makeRequest("/migration/backup", {
        method: "POST",
        body: JSON.stringify(backupData),
      });

      // Migrate data
      let success = true;

      // Migrate walk logs
      for (const log of walkLogs) {
        const result = await this.saveLog(log);
        if (!result) success = false;
      }

      // Migrate goals
      if (goals) {
        const result = await this.saveGoals(goals);
        if (!result) success = false;
      }

      // Migrate streak
      if (streak) {
        const result = await this.updateStreak(streak.lastWalkDate);
        if (!result.current) success = false;
      }

      if (success) {
        // Clear localStorage after successful migration
        localStorage.removeItem("mindful-steps-walk-logs");
        localStorage.removeItem("mindful-steps-goals");
        localStorage.removeItem("mindful-steps-streak");
        console.log("Successfully migrated data from localStorage to Vultr");
      }

      return success;
    } catch (error) {
      console.error("Migration failed:", error);
      return false;
    }
  }

  // Sync queued data
  static async syncQueuedData(): Promise<void> {
    try {
      if (!(await this.isApiAvailable())) return;

      const queued =
        this.getFromLocalStorage<any[]>("mindful-steps-sync-queue") || [];

      for (const item of queued) {
        try {
          if (item.type === "walk-logs") {
            await this.saveLog(item.data);
          } else if (item.type === "goals") {
            await this.saveGoals(item.data);
          }
        } catch (error) {
          console.error("Failed to sync queued item:", error);
        }
      }

      // Clear queue after sync
      localStorage.removeItem("mindful-steps-sync-queue");
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }

  // Helper methods for localStorage
  private static getFromLocalStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  private static queueForSync(type: string, data: any): void {
    try {
      const queue =
        this.getFromLocalStorage<any[]>("mindful-steps-sync-queue") || [];
      queue.push({
        type,
        data,
        timestamp: Date.now(),
      });
      this.saveToLocalStorage("mindful-steps-sync-queue", queue);
    } catch (error) {
      console.error("Failed to queue for sync:", error);
    }
  }

  // Object Storage Photo Upload
  static async uploadPhotoToStorage(
    file: File,
    metadata: any
  ): Promise<string | null> {
    try {
      if (await this.isApiAvailable()) {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("metadata", JSON.stringify(metadata));

        const result = await this.makeRequest<{ url: string }>(
          "/storage/upload",
          {
            method: "POST",
            body: formData,
            headers: {}, // Let browser set Content-Type for FormData
          }
        );

        if (result.success && result.data?.url) {
          return result.data.url;
        }
      }

      // Fallback: Convert to base64 and store in localStorage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          resolve(base64);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Failed to upload photo to storage:", error);
      return null;
    }
  }
}
