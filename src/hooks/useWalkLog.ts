import { useState, useCallback, useEffect } from 'react';
import { WalkLog, StepGoal, WalkStreak } from '@/types';
import { WalkLogStorage } from '@/lib/walkLogStorage';

export function useWalkLog() {
  const [logs, setLogs] = useState<WalkLog[]>([]);
  const [goals, setGoals] = useState<StepGoal>({ daily: 5000, weekly: 35000, monthly: 150000 });
  const [streak, setStreak] = useState<WalkStreak>({ current: 0, longest: 0, lastWalkDate: '' });
  const [activeWalk, setActiveWalk] = useState<WalkLog | null>(null);

  // Load data on mount
  useEffect(() => {
    setLogs(WalkLogStorage.getAllLogs());
    setGoals(WalkLogStorage.getGoals());
    setStreak(WalkLogStorage.getStreak());
    setActiveWalk(WalkLogStorage.getActiveWalk());
  }, []);

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

    WalkLogStorage.saveLog(newWalk);
    setActiveWalk(newWalk);
    setLogs(WalkLogStorage.getAllLogs());
    
    return newWalk;
  }, []);

  const updateWalk = useCallback((
    walkId: string,
    updates: Partial<WalkLog>
  ) => {
    const walk = logs.find(l => l.id === walkId);
    if (!walk) return;

    const updatedWalk = { ...walk, ...updates };
    WalkLogStorage.saveLog(updatedWalk);
    
    setLogs(WalkLogStorage.getAllLogs());
    setActiveWalk(updatedWalk.id === activeWalk?.id ? updatedWalk : activeWalk);
    
    return updatedWalk;
  }, [logs, activeWalk]);

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

    WalkLogStorage.saveLog(updatedWalk);
    WalkLogStorage.updateStreak(walk.date);
    
    setLogs(WalkLogStorage.getAllLogs());
    setStreak(WalkLogStorage.getStreak());
    setActiveWalk(null);
    
    return updatedWalk;
  }, [logs]);

  const deleteWalk = useCallback((walkId: string) => {
    WalkLogStorage.deleteLog(walkId);
    setLogs(WalkLogStorage.getAllLogs());
    if (activeWalk?.id === walkId) {
      setActiveWalk(null);
    }
  }, [activeWalk]);

  const updateGoals = useCallback((newGoals: StepGoal) => {
    WalkLogStorage.saveGoals(newGoals);
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

    WalkLogStorage.saveLog(updatedWalk);
    setLogs(WalkLogStorage.getAllLogs());
    
    return updatedWalk;
  }, [logs]);

  const addMindfulBreak = useCallback((walkId: string) => {
    const walk = logs.find(l => l.id === walkId);
    if (!walk) return;

    const updatedWalk = {
      ...walk,
      mindfulBreaksCompleted: walk.mindfulBreaksCompleted + 1
    };

    WalkLogStorage.saveLog(updatedWalk);
    setLogs(WalkLogStorage.getAllLogs());
    
    return updatedWalk;
  }, [logs]);

  // Get statistics
  const getTodayStats = useCallback(() => {
    return WalkLogStorage.getTodayStats();
  }, []);

  const getWeeklyStats = useCallback(() => {
    return WalkLogStorage.getWeeklyStats();
  }, []);

  const getMonthlyStats = useCallback(() => {
    return WalkLogStorage.getMonthlyStats();
  }, []);

  return {
    logs,
    goals,
    streak,
    activeWalk,
    startWalk,
    updateWalk,
    endWalk,
    deleteWalk,
    updateGoals,
    addPhotoToWalk,
    addMindfulBreak,
    getTodayStats,
    getWeeklyStats,
    getMonthlyStats
  };
}