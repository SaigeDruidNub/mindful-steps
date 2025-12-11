import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    // Simple health check endpoint
    return new Response(JSON.stringify({ 
      status: 'ok', 
      message: 'Mindful Steps API is running' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}