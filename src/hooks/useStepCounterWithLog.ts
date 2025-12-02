import { useState, useEffect, useCallback } from 'react';
import { StepCounter } from '@/lib/stepCounter';
import { PedometerData } from '@/types';
import { useWalkLog } from './useWalkLog';
import { WalkLogStorage } from '@/lib/walkLogStorage';

export function useStepCounterWithLog() {
  const [stepCounter] = useState(() => new StepCounter());
  const [stepData, setStepData] = useState<PedometerData>({
    steps: 0,
    distance: 0
  });
  const [isCounting, setIsCounting] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [sessionStartData, setSessionStartData] = useState<PedometerData>({
    steps: 0,
    distance: 0
  });

  const {
    activeWalk,
    startWalk,
    updateWalk,
    endWalk,
    getTodayStats
  } = useWalkLog();

  const handleStepUpdate = useCallback((data: PedometerData) => {
    setStepData(data);
    
    // Update active walk if there is one
    if (activeWalk && isCounting) {
      const currentSteps = data.steps - sessionStartData.steps;
      const currentDistance = data.distance - sessionStartData.distance;
      const currentDuration = Math.round((Date.now() - activeWalk.startTime) / 60000);
      
      updateWalk(activeWalk.id, {
        steps: currentSteps,
        distance: currentDistance,
        duration: currentDuration
      });
    }
  }, [activeWalk, isCounting, sessionStartData, updateWalk]);

  useEffect(() => {
    setIsSupported(stepCounter.supported);
    
    stepCounter.addListener(handleStepUpdate);
    
    return () => {
      stepCounter.removeListener(handleStepUpdate);
    };
  }, [stepCounter, handleStepUpdate]);

  const startCounting = useCallback(async () => {
    await stepCounter.startCounting();
    setIsCounting(stepCounter.counting);
    
    // Get current step data to track session progress
    stepCounter.addListener((data) => {
      setSessionStartData({
        steps: data.steps,
        distance: data.distance
      });
    });
  }, [stepCounter]);

  const stopCounting = useCallback(() => {
    stepCounter.stopCounting();
    setIsCounting(false);
  }, [stepCounter]);

  const reset = useCallback(() => {
    stepCounter.reset();
    setStepData({ steps: 0, distance: 0 });
    setSessionStartData({ steps: 0, distance: 0 });
  }, [stepCounter]);

  const startWalking = useCallback((
    startLocation?: { lat: number; lng: number; address?: string }
  ) => {
    const walk = startWalk(stepData.steps, stepData.distance, startLocation);
    setSessionStartData({
      steps: stepData.steps,
      distance: stepData.distance
    });
    
    if (!isCounting) {
      startCounting();
    }
    
    return walk;
  }, [stepData, startWalk, isCounting, startCounting]);

  const endWalking = useCallback((
    endLocation?: { lat: number; lng: number; address?: string },
    mood?: { before: number; after: number },
    notes?: string
  ) => {
    if (!activeWalk) return null;
    
    const updatedWalk = endWalk(
      activeWalk.id,
      stepData.steps,
      stepData.distance,
      endLocation,
      mood,
      notes
    );
    
    if (updatedWalk) {
      // Optionally reset counter for next walk
      reset();
    }
    
    return updatedWalk;
  }, [activeWalk, stepData, endWalk, reset]);

  const pauseWalking = useCallback(() => {
    if (activeWalk) {
      // Update the walk with current stats
      const currentSteps = stepData.steps - sessionStartData.steps;
      const currentDistance = stepData.distance - sessionStartData.distance;
      const currentDuration = Math.round((Date.now() - activeWalk.startTime) / 60000);
      
      updateWalk(activeWalk.id, {
        steps: currentSteps,
        distance: currentDistance,
        duration: currentDuration
      });
    }
    
    stopCounting();
  }, [activeWalk, stepData, sessionStartData, updateWalk, stopCounting]);

  const resumeWalking = useCallback(() => {
    startCounting();
  }, [startCounting]);

  // Get progress relative to daily goal
  const getDailyProgress = useCallback(() => {
    const todayStats = getTodayStats();
    const totalSteps = todayStats.totalSteps + (activeWalk?.steps || 0);
    const goals = WalkLogStorage.getGoals();
    return {
      steps: totalSteps,
      goal: goals.daily,
      percentage: (totalSteps / goals.daily) * 100
    };
  }, [activeWalk, getTodayStats]);

  return {
    stepData,
    isCounting,
    isSupported,
    activeWalk,
    startCounting,
    stopCounting,
    reset,
    startWalking,
    endWalking,
    pauseWalking,
    resumeWalking,
    getDailyProgress
  };
}