export interface Photo {
  id: string;
  imageUrl: string;
  promptId: string;
  promptTitle: string;
  promptType: 'photo' | 'sensory' | 'breathing' | 'reflection';
  timestamp: number;
  note?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    fileSize: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export interface GalleryFilter {
  type?: 'all' | 'photo' | 'sensory' | 'breathing' | 'reflection';
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface GalleryStats {
  totalPhotos: number;
  photosThisWeek: number;
  photosThisMonth: number;
  favoritePrompts: Array<{
    promptId: string;
    promptTitle: string;
    count: number;
  }>;
}