// Simple photo processor for Raindrop
export default class {
  env: any;

  constructor() {
    this.env = {};
  }

  async bucket(event: any): Promise<void> {
    if (event.type === 'object-created') {
      // Process uploaded photo
      const photoKey = event.object.key;
      const userId = this.extractUserIdFromKey(photoKey);
      
      // Store photo metadata in database
      await this.env.APP_DATA.prepare(`
        INSERT INTO user_photos (user_id, storage_key, uploaded_at)
        VALUES (?, ?, ?)
      `).bind(userId, photoKey, new Date().toISOString()).run();
      
      console.log(`Processed photo upload: ${photoKey} for user ${userId}`);
    }
  }

  private extractUserIdFromKey(key: string): string {
    // Assuming key format: "photos/{userId}/{timestamp}.jpg"
    const parts = key.split('/');
    return parts[1] || 'anonymous';
  }
}