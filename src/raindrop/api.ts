import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from '../api/raindrop.gen';

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers for frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handlers
      if (url.pathname === '/api/walk-logs' && request.method === 'GET') {
        return this.getWalkLogs(request, corsHeaders);
      }
      
      if (url.pathname === '/api/walk-logs' && request.method === 'POST') {
        return this.saveWalkLog(request, corsHeaders);
      }

      if (url.pathname === '/api/user-stats' && request.method === 'GET') {
        return this.getUserStats(request, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async getWalkLogs(request: Request, headers: Record<string, string>): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const result = await this.env.APP_DATA.prepare(`
      SELECT * FROM walk_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).bind(userId).all();

    return new Response(JSON.stringify({ logs: result }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }

  private async saveWalkLog(request: Request, headers: Record<string, string>): Promise<Response> {
    const walkData = await request.json();
    
    const result = await this.env.APP_DATA.prepare(`
      INSERT INTO walk_logs (user_id, steps, distance, duration, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      walkData.userId,
      walkData.steps,
      walkData.distance || 0,
      walkData.duration || 0,
      new Date().toISOString()
    ).run();

    // Queue for async processing
    await this.env.WALK_PROCESSOR.send({
      type: 'walk_completed',
      walkId: result.meta.last_row_id,
      userId: walkData.userId,
      steps: walkData.steps
    });

    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }

  private async getUserStats(request: Request, headers: Record<string, string>): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const stats = await this.env.APP_DATA.prepare(`
      SELECT 
        COUNT(*) as total_walks,
        SUM(steps) as total_steps,
        AVG(steps) as avg_steps,
        MAX(steps) as best_steps
      FROM walk_logs 
      WHERE user_id = ?
    `).bind(userId).first();

    return new Response(JSON.stringify({ stats }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}