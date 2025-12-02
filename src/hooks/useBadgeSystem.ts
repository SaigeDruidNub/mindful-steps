'use client';

import { useState, useEffect } from 'react';
import { DailyStats } from '@/types';

interface TotalStats {
  totalSteps: number;
  totalPhotos: number;
  totalMindfulBreaks: number;
  totalWalks: number;
  currentStreak: number;
}

export function useBadgeSystem() {
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalSteps: 0,
    totalPhotos: 0,
    totalMindfulBreaks: 0,
    totalWalks: 0,
    currentStreak: 0,
  });

  const [todayStats, setTodayStats] = useState<DailyStats>({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    breaksCompleted: 0,
    photosTaken: 0,
    activeMinutes: 0,
    distance: 0,
    calories: 0,
  });

  // Load stats from localStorage on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      // Load total stats
      const savedTotalStats = localStorage.getItem('mindful-steps-total-stats');
      if (savedTotalStats) {
        const parsed = JSON.parse(savedTotalStats);
        setTotalStats(parsed);
      }

      // Load today's stats or create new ones
      const today = new Date().toISOString().split('T')[0];
      const savedTodayStats = localStorage.getItem('mindful-steps-daily-stats');
      const savedStats = savedTodayStats ? JSON.parse(savedTodayStats) : {};
      
      if (savedStats[today]) {
        setTodayStats(savedStats[today]);
      } else {
        // Reset for new day
        setTodayStats({
          date: today,
          steps: 0,
          breaksCompleted: 0,
          photosTaken: 0,
          activeMinutes: 0,
          distance: 0,
          calories: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveTodayStats = (stats: DailyStats) => {
    try {
      const savedStats = localStorage.getItem('mindful-steps-daily-stats');
      const allStats = savedStats ? JSON.parse(savedStats) : {};
      allStats[stats.date] = stats;
      localStorage.setItem('mindful-steps-daily-stats', JSON.stringify(allStats));
      setTodayStats(stats);
    } catch (error) {
      console.error('Error saving today stats:', error);
    }
  };

  const saveTotalStats = (stats: TotalStats) => {
    try {
      localStorage.setItem('mindful-steps-total-stats', JSON.stringify(stats));
      setTotalStats(stats);
    } catch (error) {
      console.error('Error saving total stats:', error);
    }
  };

  // Update functions
  const updateSteps = (steps: number) => {
    const newStats = { ...todayStats, steps };
    saveTodayStats(newStats);
    
    // Also update total if it's a new high for today
    if (steps > todayStats.steps) {
      const newTotal = { ...totalStats, totalSteps: totalStats.totalSteps + (steps - todayStats.steps) };
      saveTotalStats(newTotal);
    }
  };

  const addPhoto = () => {
    const newStats = { ...todayStats, photosTaken: todayStats.photosTaken + 1 };
    saveTodayStats(newStats);
    
    const newTotal = { ...totalStats, totalPhotos: totalStats.totalPhotos + 1 };
    saveTotalStats(newTotal);
  };

  const addMindfulBreak = () => {
    const newStats = { ...todayStats, breaksCompleted: todayStats.breaksCompleted + 1 };
    saveTodayStats(newStats);
    
    const newTotal = { ...totalStats, totalMindfulBreaks: totalStats.totalMindfulBreaks + 1 };
    saveTotalStats(newTotal);
  };

  const updateDistance = (distance: number) => {
    const newStats = { ...todayStats, distance };
    saveTodayStats(newStats);
  };

  const updateActiveMinutes = (minutes: number) => {
    const newStats = { ...todayStats, activeMinutes: minutes };
    saveTodayStats(newStats);
  };

  const addWalk = () => {
    const newTotal = { ...totalStats, totalWalks: totalStats.totalWalks + 1 };
    saveTotalStats(newTotal);
  };

  const updateStreak = (streak: number) => {
    const newTotal = { ...totalStats, currentStreak: streak };
    saveTotalStats(newTotal);
  };

  // Get statistics history for streak calculation
  const getStreakData = () => {
    try {
      const savedStats = localStorage.getItem('mindful-steps-daily-stats');
      const allStats = savedStats ? JSON.parse(savedStats) : {};
      return Object.entries(allStats)
        .map(([date, stats]: [string, any]) => ({
          date,
          steps: (stats as DailyStats).steps,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting streak data:', error);
      return [];
    }
  };

  // Calculate and update streak
  const calculateAndUpdateStreak = () => {
    const streakData = getStreakData();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today has any steps
    const todayEntry = streakData.find(entry => entry.date === today);
    if (todayEntry && todayEntry.steps > 0) {
      currentStreak = 1;
      
      // Count consecutive days before today
      for (let i = 1; i < streakData.length; i++) {
        const entry = streakData[i];
        const prevEntry = streakData[i - 1];
        const entryDate = new Date(entry.date);
        const prevDate = new Date(prevEntry.date);
        
        // Check if it's the previous day and has steps
        const dayDiff = (prevDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        if (dayDiff === 1 && entry.steps > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    updateStreak(currentStreak);
    return currentStreak;
  };

  return {
    totalStats,
    todayStats,
    updateSteps,
    addPhoto,
    addMindfulBreak,
    updateDistance,
    updateActiveMinutes,
    addWalk,
    updateStreak,
    calculateAndUpdateStreak,
    getStreakData,
    loadStats,
  };
}