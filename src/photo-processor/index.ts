// Simple export for Raindrop photo processor
export default class {
  env: any;

  constructor() {
    this.env = {};
  }

  async bucket(event: any): Promise<void> {
    if (event.type === 'object-created') {
      console.log(`Photo uploaded: ${event.object.key}`);
    }
  }
}