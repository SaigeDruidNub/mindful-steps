import { Photo, GalleryFilter } from "@/types/gallery";
import { StorageManager } from "@/lib/storage";

export class GalleryManager {
  private static readonly STORAGE_KEY = "gallery-photos";

  static savePhoto(photo: Omit<Photo, "id" | "timestamp">): Photo {
    const newPhoto: Photo = {
      ...photo,
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const existingPhotos = this.getPhotos();
    const updatedPhotos = [...existingPhotos, newPhoto];
    StorageManager.setItem(this.STORAGE_KEY, updatedPhotos);

    return newPhoto;
  }

  static getPhotos(filter?: GalleryFilter): Photo[] {
    const photos = StorageManager.getItem<Photo[]>(this.STORAGE_KEY, []) || [];
    if (!filter) return photos.sort((a, b) => b.timestamp - a.timestamp);

    let filteredPhotos = [...photos];

    // Filter by type
    if (filter.type && filter.type !== "all") {
      filteredPhotos = filteredPhotos.filter(
        (photo) => photo.promptType === filter.type
      );
    }

    // Filter by date range
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filteredPhotos = filteredPhotos.filter((photo) => {
        const photoDate = new Date(photo.timestamp);
        return photoDate >= start && photoDate <= end;
      });
    }

    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filteredPhotos = filteredPhotos.filter(
        (photo) =>
          photo.promptTitle.toLowerCase().includes(searchLower) ||
          (photo.note && photo.note.toLowerCase().includes(searchLower))
      );
    }

    return filteredPhotos.sort((a, b) => b.timestamp - a.timestamp);
  }

  static getPhotoById(id: string): Photo | null {
    const photos = this.getPhotos();
    return photos.find((photo) => photo.id === id) || null;
  }

  static updatePhoto(id: string, updates: Partial<Photo>): Photo | null {
    const photos = this.getPhotos();
    const photoIndex = photos.findIndex((photo) => photo.id === id);

    if (photoIndex === -1) return null;

    const updatedPhoto = { ...photos[photoIndex], ...updates };
    photos[photoIndex] = updatedPhoto;

    StorageManager.setItem(this.STORAGE_KEY, photos);
    return updatedPhoto;
  }

  static deletePhoto(id: string): boolean {
    const photos = this.getPhotos();
    const filteredPhotos = photos.filter((photo) => photo.id !== id);

    if (filteredPhotos.length === photos.length) return false;

    StorageManager.setItem(this.STORAGE_KEY, filteredPhotos);
    return true;
  }

  static getGalleryStats() {
    const photos = this.getPhotos();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const photosThisWeek = photos.filter(
      (photo) => photo.timestamp >= oneWeekAgo.getTime()
    ).length;
    const photosThisMonth = photos.filter(
      (photo) => photo.timestamp >= oneMonthAgo.getTime()
    ).length;

    // Calculate favorite prompts
    const promptCounts = photos.reduce((acc, photo) => {
      const key = `${photo.promptId}|${photo.promptTitle}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoritePrompts = Object.entries(promptCounts)
      .map(([key, count]) => {
        const [promptId, promptTitle] = key.split("|");
        return { promptId, promptTitle, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalPhotos: photos.length,
      photosThisWeek,
      photosThisMonth,
      favoritePrompts,
    };
  }

  static exportPhotos(): string {
    const photos = this.getPhotos();
    return JSON.stringify(photos, null, 2);
  }

  static importPhotos(jsonData: string): Photo[] {
    try {
      const photos = JSON.parse(jsonData) as Photo[];
      StorageManager.setItem(this.STORAGE_KEY, photos);
      return photos;
    } catch (error) {
      console.error("Failed to import photos:", error);
      return [];
    }
  }

  static clearGallery(): void {
    StorageManager.removeItem(this.STORAGE_KEY);
  }
}
