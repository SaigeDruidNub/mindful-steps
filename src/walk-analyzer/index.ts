// Simple export for Raindrop walk analyzer
export interface Body {
  type: string;
  [key: string]: any;
}

export default class {
  env: any;

  constructor() {
    this.env = {};
  }

  async queue(event: any): Promise<void> {
    const message = JSON.parse(event.body);
    console.log(`Processing queue event:`, message);
  }
}