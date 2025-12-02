import { useState, useEffect, useCallback } from 'react';
import { WalkLog, StepGoal, WalkStreak } from '@/types';
import { VultrStorageService } from '@/lib/vultrStorage';

export function useWalkLogWithVultr() {
  const [logs, setLogs] = useState<WalkLog[]>([]);
  const [goals, setGoals] = useState<StepGoal>({ daily: 5000, weekly: 35000, monthly: 150000 });
  const [streak, setStreak] = useState<WalkStreak>({ current: 0, longest: 0, lastWalkDate: '' });
  const [activeWalk, setActiveWalk] = useState<WalkLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Load data on mount
  useEffect(() => {
    loadData();
    
    // Set up online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from API or localStorage
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsData, goalsData, streakData] = await Promise.all([
        VultrStorageService.getAllLogs(),
        VultrStorageService.getGoals(),
        VultrStorageService.getStreak(),
      ]);

      setLogs(logsData);
      setGoals(goalsData);
      setStreak(streakData);
      
      const active = logsData.find(log => !log.endTime);
      setActiveWalk(active || null);
      
      // Try to sync any queued data
      if (navigator.onLine) {
        await VultrStorageService.syncQueuedData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data when coming back online
  const syncData = async () => {
    if (!isOnline) return;
    
    setSyncStatus('syncing');
    try {
      await VultrStorageService.syncQueuedData();
      await loadData();
      setSyncStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('offline');
    }
  };

  const startWalk = useCallback((
    startSteps: number,
    startDistance: number,
    startLocation?: { lat: number; lng: number; address?: string }
  ) => {
    const now = Date.now();
    const newWalk: WalkLog = {
      id: `walk-${now}`,
      date: new Date().toISOString().split('T')[0],
      startTime: now,
      steps: startSteps,
      distance: startDistance,
      duration: 0,
      mindfulBreaksCompleted: 0,
      startLocation
    };

    // Save asynchronously
    VultrStorageService.saveLog(newWalk).catch(error => {
      console.error('Failed to save walk to cloud:', error);
    });

    setActiveWalk(newWalk);
    setLogs(prev => [newWalk, ...prev]);
    
    return newWalk;
  }, []);

  const updateWalk = useCallback((
    walkId: string,
    updates: Partial<WalkLog>
  ) => {
    const walk = logs.find(l => l.id === walkId);
    if (!walk) return;

    const updatedWalk = { ...walk, ...updates };
    
    // Save asynchronously
    VultrStorageService.saveLog(updatedWalk).catch(error => {
      console.error('Failed to update walk in cloud:', error);
    });

    setLogs(prev => prev.map(l => l.id === walkId ? updatedWalk : l));
    setActiveWalk(prev => prev?.id === walkId ? updatedWalk : prev);
    
    return updatedWalk;
  }, [logs]);

  const endWalk = useCallback((
    walkId: string,
    endSteps: number,
    endDistance: number,
    endLocation?: { lat: number; lng: number; address?: string },
    mood?: { before: number; after: number },
    notes?: string
  ) => {
    const walk = logs.find(l => l.id === walkId);
    if (!walk) return;

    const endTime = Date.now();
    const duration = Math.round((endTime - walk.startTime) / 60000); // minutes
    const stepsWalked = endSteps - walk.steps;
    const distanceWalked = endDistance - walk.distance;
    const averagePace = distanceWalked > 0 ? duration / distanceWalked : undefined;

    const updatedWalk: WalkLog = {
      ...walk,
      endTime,
      steps: stepsWalked,
      distance: distanceWalked,
      duration,
      averagePace,
      endLocation,
      mood,
      notes
    };

    // Save asynchronously
    Promise.all([
      VultrStorageService.saveLog(updatedWalk),
      VultrStorageService.updateStreak(walk.date)
    ]).catch(error => {
      console.error('Failed to save walk data to cloud:', error);
    });

    setLogs(prev => prev.map(l => l.id === walkId ? updatedWalk : l));
    
    // Update streak asynchronously
    VultrStorageService.updateStreak(walk.date).then(newStreak => {
      setStreak(newStreak);
    }).catch(error => {
      console.error('Failed to update streak:', error);
    });
    
    setActiveWalk(null);
    
    return updatedWalk;
  }, [logs]);

  const deleteWalk = useCallback((walkId: string) => {
    VultrStorageService.deleteLog(walkId).catch(error => {
      console.error('Failed to delete walk from cloud:', error);
    });

    setLogs(prev => prev.filter(l => l.id !== walkId));
    if (activeWalk?.id === walkId) {
      setActiveWalk(null);
    }
  }, [activeWalk]);

  const updateGoals = useCallback((newGoals: StepGoal) => {
    VultrStorageService.saveGoals(newGoals).catch(error => {
      console.error('Failed to save goals to cloud:', error);
    });
    setGoals(newGoals);
  }, []);

  const addPhotoToWalk = useCallback((walkId: string, photoUrl: string) => {
    const walk = logs.find(l => l.id === walkId);
    if (!walk) return;

    const photos = walk.photos || [];
    const updatedWalk = {
      ...walk,
      photos: [...photos, photoUrl]
    };

    VultrStorageService.saveLog(updatedWalk).catch(error => {
      console.error('Failed to add photo to walk in cloud:', error);
    });

    setLogs(prev => prev.map(l => l.id === walkId ? updatedWalk : l));
    
    return updatedWalk;
  }, [logs]);

  const addMindfulBreak = useCallback((walkId: string) => {
    const walk = logs.find(l => l.id === walkId);
    if (!walk) return;

    const updatedWalk = {
      ...walk,
      mindfulBreaksCompleted: walk.mindfulBreaksCompleted + 1
    };

    VultrStorageService.saveLog(updatedWalk).catch(error => {
      console.error('Failed to add mindful break to walk in cloud:', error);
    });

    setLogs(prev => prev.map(l => l.id === walkId ? updatedWalk : l));
    
    return updatedWalk;
  }, [logs]);

  // Get statistics
  const getTodayStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.date === today);
    
    const stats = todayLogs.reduce((acc, log) => ({
      totalSteps: acc.totalSteps + log.steps,
      totalDistance: acc.totalDistance + log.distance,
      totalDuration: acc.totalDuration + log.duration,
      walksCompleted: acc.walksCompleted + (log.endTime ? 1 : 0)
    }), {
      totalSteps: 0,
      totalDistance: 0,
      totalDuration: 0,
      walksCompleted: 0
    });
    
    stats.goalProgress = (stats.totalSteps / goals.daily) * 100;
    
    return stats;
  }, [logs, goals.daily]);

  const getWeeklyStats = useCallback(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });
    
    const stats = weekLogs.reduce((acc, log) => ({
      totalSteps: acc.totalSteps + log.steps,
      totalDistance: acc.totalDistance + log.distance,
      totalDuration: acc.totalDuration + log.duration,
      walksCompleted: acc.walksCompleted + (log.endTime ? 1 : 0)
    }), {
      totalSteps: 0,
      totalDistance: 0,
      totalDuration: 0,
      walksCompleted: 0
    });
    
    stats.goalProgress = (stats.totalSteps / goals.weekly) * 100;
    
    return stats;
  }, [logs, goals.weekly]);

  const getMonthlyStats = useCallback(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= monthStart && logDate <= monthEnd;
    });
    
    const stats = monthLogs.reduce((acc, log) => ({
      totalSteps: acc.totalSteps + log.steps,
      totalDistance: acc.totalDistance + log.distance,
      totalDuration: acc.totalDuration + log.duration,
      walksCompleted: acc.walksCompleted + (log.endTime ? 1 : 0)
    }), {
      totalSteps: 0,
      totalDistance: 0,
      totalDuration: 0,
      walksCompleted: 0
    });
    
    stats.goalProgress = (stats.totalSteps / goals.monthly) * 100;
    
    return stats;
  }, [logs, goals.monthly]);

  // Migration helper
  const migrateFromLocalStorage = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const success = await VultrStorageService.migrateFromLocalStorage();
      if (success) {
        await loadData();
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
      return success;
    } catch (error) {
      console.error('Migration failed:', error);
      setSyncStatus('offline');
      return false;
    }
  }, []);

  return {
    logs,
    goals,
    streak,
    activeWalk,
    isLoading,
    isOnline,
    syncStatus,
    startWalk,
    updateWalk,
    endWalk,
    deleteWalk,
    updateGoals,
    addPhotoToWalk,
    addMindfulBreak,
    getTodayStats,
    getWeeklyStats,
    getMonthlyStats,
    migrateFromLocalStorage,
    syncData
  };
}