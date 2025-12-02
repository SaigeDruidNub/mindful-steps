import { WalkLog, StepGoal, WalkStreak } from "@/types";

export class WalkLogStorage {
  private static readonly STORAGE_KEY = "mindful-steps-walk-logs";
  private static readonly GOAL_KEY = "mindful-steps-goals";
  private static readonly STREAK_KEY = "mindful-steps-streak";

  // Walk Logs Management
  static getAllLogs(): WalkLog[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load walk logs:", error);
      return [];
    }
  }

  static saveLog(log: WalkLog): void {
    try {
      const logs = this.getAllLogs();
      const existingIndex = logs.findIndex((l) => l.id === log.id);

      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }

      // Sort by date (newest first)
      logs.sort((a, b) => b.startTime - a.startTime);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to save walk log:", error);
    }
  }

  static deleteLog(id: string): void {
    try {
      const logs = this.getAllLogs();
      const filtered = logs.filter((log) => log.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete walk log:", error);
    }
  }

  static getLogsByDate(date: string): WalkLog[] {
    const logs = this.getAllLogs();
    return logs.filter((log) => log.date === date);
  }

  static getLogsByDateRange(startDate: string, endDate: string): WalkLog[] {
    const logs = this.getAllLogs();
    return logs.filter((log) => {
      const logDate = new Date(log.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return logDate >= start && logDate <= end;
    });
  }

  static getTodaysLogs(): WalkLog[] {
    const today = new Date().toISOString().split("T")[0];
    return this.getLogsByDate(today);
  }

  static getActiveWalk(): WalkLog | null {
    const logs = this.getAllLogs();
    return logs.find((log) => !log.endTime) || null;
  }

  // Goals Management
  static getGoals(): StepGoal {
    try {
      const data = localStorage.getItem(this.GOAL_KEY);
      return data
        ? JSON.parse(data)
        : {
            daily: 5000,
            weekly: 35000,
            monthly: 150000,
          };
    } catch (error) {
      console.error("Failed to load goals:", error);
      return {
        daily: 5000,
        weekly: 35000,
        monthly: 150000,
      };
    }
  }

  static saveGoals(goals: StepGoal): void {
    try {
      localStorage.setItem(this.GOAL_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error("Failed to save goals:", error);
    }
  }

  // Streak Management
  static getStreak(): WalkStreak {
    try {
      const data = localStorage.getItem(this.STREAK_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to load streak:", error);
    }

    return {
      current: 0,
      longest: 0,
      lastWalkDate: "",
    };
  }

  static updateStreak(walkDate: string): WalkStreak {
    const streak = this.getStreak();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (walkDate === streak.lastWalkDate) {
      // Same day, no change
      return streak;
    } else if (walkDate === yesterday || walkDate === today) {
      // Consecutive day
      streak.current++;
      if (streak.current > streak.longest) {
        streak.longest = streak.current;
      }
    } else {
      // Streak broken
      streak.current = 1;
    }

    streak.lastWalkDate = walkDate;

    try {
      localStorage.setItem(this.STREAK_KEY, JSON.stringify(streak));
    } catch (error) {
      console.error("Failed to save streak:", error);
    }

    return streak;
  }

  // Statistics
  static getTodayStats(): {
    totalSteps: number;
    totalDistance: number;
    totalDuration: number;
    walksCompleted: number;
    goalProgress: number;
  } {
    const todayLogs = this.getTodaysLogs();
    const goals = this.getGoals();

    const stats = todayLogs.reduce(
      (acc, log) => ({
        totalSteps: acc.totalSteps + log.steps,
        totalDistance: acc.totalDistance + log.distance,
        totalDuration: acc.totalDuration + log.duration,
        walksCompleted: acc.walksCompleted + (log.endTime ? 1 : 0),
        goalProgress: acc.goalProgress, // carry forward, will set after
      }),
      {
        totalSteps: 0,
        totalDistance: 0,
        totalDuration: 0,
        walksCompleted: 0,
        goalProgress: 0,
      }
    );
    stats.goalProgress = (stats.totalSteps / goals.daily) * 100;
    return stats;
  }

  static getWeeklyStats(): {
    totalSteps: number;
    totalDistance: number;
    totalDuration: number;
    walksCompleted: number;
    goalProgress: number;
  } {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const logs = this.getLogsByDateRange(
      weekStart.toISOString().split("T")[0],
      weekEnd.toISOString().split("T")[0]
    );

    const goals = this.getGoals();

    const stats = logs.reduce(
      (acc, log) => ({
        totalSteps: acc.totalSteps + log.steps,
        totalDistance: acc.totalDistance + log.distance,
        totalDuration: acc.totalDuration + log.duration,
        walksCompleted: acc.walksCompleted + (log.endTime ? 1 : 0),
        goalProgress: acc.goalProgress, // carry forward, will set after
      }),
      {
        totalSteps: 0,
        totalDistance: 0,
        totalDuration: 0,
        walksCompleted: 0,
        goalProgress: 0,
      }
    );
    stats.goalProgress = (stats.totalSteps / goals.weekly) * 100;
    return stats;
  }

  static getMonthlyStats(): {
    totalSteps: number;
    totalDistance: number;
    totalDuration: number;
    walksCompleted: number;
    goalProgress: number;
  } {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const logs = this.getLogsByDateRange(
      monthStart.toISOString().split("T")[0],
      monthEnd.toISOString().split("T")[0]
    );

    const goals = this.getGoals();

    const stats = logs.reduce(
      (acc, log) => ({
        totalSteps: acc.totalSteps + log.steps,
        totalDistance: acc.totalDistance + log.distance,
        totalDuration: acc.totalDuration + log.duration,
        walksCompleted: acc.walksCompleted + (log.endTime ? 1 : 0),
        goalProgress: acc.goalProgress, // carry forward, will set after
      }),
      {
        totalSteps: 0,
        totalDistance: 0,
        totalDuration: 0,
        walksCompleted: 0,
        goalProgress: 0,
      }
    );
    stats.goalProgress = (stats.totalSteps / goals.monthly) * 100;
    return stats;
  }
}
