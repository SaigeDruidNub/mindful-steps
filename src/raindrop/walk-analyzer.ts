// Simple walk analyzer for Raindrop
export default class {
  env: any;

  constructor() {
    this.env = {};
  }

  async queue(event: any): Promise<void> {
    const message = JSON.parse(event.body);
    
    if (message.type === 'walk_completed') {
      // Process walk completion
      await this.processWalkCompletion(message);
    }
  }

  private async processWalkCompletion(walkData: any): Promise<void> {
    const { userId, steps, walkId } = walkData;
    
    // Check for achievements
    await this.checkAchievements(userId, steps);
    
    // Update user statistics
    await this.updateUserStats(userId, steps);
    
    console.log(`Processed walk completion: ${walkId} for user ${userId}`);
  }

  private async checkAchievements(userId: string, steps: number): Promise<void> {
    const achievements = [];
    
    // Check for step milestones
    if (steps >= 10000) achievements.push('ten_k_steps');
    else if (steps >= 5000) achievements.push('five_k_steps');
    else if (steps >= 1000) achievements.push('one_k_steps');
    
    // Save new achievements
    for (const achievement of achievements) {
      const existing = await this.env.APP_DATA.prepare(`
        SELECT id FROM achievements 
        WHERE user_id = ? AND achievement_type = ?
      `).bind(userId, achievement).first();
      
      if (!existing) {
        await this.env.APP_DATA.prepare(`
          INSERT INTO achievements (user_id, achievement_type, achieved_at)
          VALUES (?, ?, ?)
        `).bind(userId, achievement, new Date().toISOString()).run();
      }
    }
  }

  private async updateUserStats(userId: string, steps: number): Promise<void> {
    // Update daily step total
    const today = new Date().toISOString().split('T')[0];
    
    await this.env.APP_DATA.prepare(`
      INSERT OR REPLACE INTO daily_stats (user_id, date, steps)
      VALUES (?, ?, COALESCE((SELECT steps FROM daily_stats WHERE user_id = ? AND date = ?), 0) + ?)
    `).bind(userId, today, userId, today, steps).run();
  }
}