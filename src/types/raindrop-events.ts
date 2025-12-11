// Raindrop Event Types
// These types complement the generated raindrop.gen.ts

export interface BucketEvent {
  type: 'object-created' | 'object-deleted';
  object: {
    key: string;
    size?: number;
    etag?: string;
  };
}

export interface QueueEvent {
  body: string;
  id: string;
  timestamp: Date;
  attempts: number;
  ack: () => void;
  retry: () => void;
}

export interface D1Database {
  prepare(query: string): {
    bind(...args: any[]): {
      all(): Promise<any[]>;
      first(): Promise<any>;
      run(): Promise<{ success: boolean; meta: { last_row_id: number } }>;
    };
  };
}

export interface Queue<T = any> {
  send(message: T): Promise<void>;
}

export interface Bucket {
  // Bucket operations
}