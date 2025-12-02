import { useState, useEffect, useCallback } from 'react';
import { MindfulBreak, MindfulPrompt, UserSettings } from '@/types';
import { getRandomPrompt, getRandomStepsInterval } from '@/lib/prompts';

export function useMindfulBreaks(stepCount: number, settings: UserSettings) {
  const [breaks, setBreaks] = useState<MindfulBreak[]>([]);
  const [currentBreak, setCurrentBreak] = useState<MindfulBreak | null>(null);
  const [nextBreakAt, setNextBreakAt] = useState<number>(0);
  const [lastBreakStep, setLastBreakStep] = useState<number>(0);

  const generateBreak = useCallback((): MindfulBreak => {
    const prompt = getRandomPrompt({
      photoPrompts: settings.photoPrompts,
      sensoryExercises: settings.sensoryExercises,
      breathingExercises: settings.breathingExercises ?? false,
      reflectionExercises: settings.reflectionExercises ?? false
    });

    return {
      id: `break-${Date.now()}`,
      stepsTriggered: stepCount,
      timestamp: Date.now(),
      prompt,
      completed: false
    };
  }, [stepCount, settings]);

  const scheduleNextBreak = useCallback(() => {
    const interval = getRandomStepsInterval(
      settings.minStepsBetweenBreaks,
      settings.maxStepsBetweenBreaks
    );
    setNextBreakAt(stepCount + interval);
    setLastBreakStep(stepCount);
  }, [stepCount, settings]);

  useEffect(() => {
    if (stepCount > 0 && nextBreakAt > 0 && stepCount >= nextBreakAt) {
      const newBreak = generateBreak();
      setCurrentBreak(newBreak);
      setBreaks(prev => [...prev, newBreak]);
      scheduleNextBreak();
    }
  }, [stepCount, nextBreakAt, generateBreak, scheduleNextBreak]);

  const startBreakSystem = useCallback(() => {
    scheduleNextBreak();
  }, [scheduleNextBreak]);

  const completeBreak = useCallback((breakId: string, photo?: string, note?: string) => {
    setBreaks(prev => prev.map(breakItem => 
      breakItem.id === breakId 
        ? { ...breakItem, completed: true, photo, note }
        : breakItem
    ));
    
    if (currentBreak?.id === breakId) {
      setCurrentBreak(null);
    }
  }, [currentBreak]);

  const skipBreak = useCallback((breakId: string) => {
    setBreaks(prev => prev.map(breakItem => 
      breakItem.id === breakId 
        ? { ...breakItem, completed: true }
        : breakItem
    ));
    
    if (currentBreak?.id === breakId) {
      setCurrentBreak(null);
    }
  }, [currentBreak]);

  const reset = useCallback(() => {
    setBreaks([]);
    setCurrentBreak(null);
    setNextBreakAt(0);
    setLastBreakStep(0);
  }, []);

  return {
    breaks,
    currentBreak,
    nextBreakAt,
    stepsUntilNextBreak: Math.max(0, nextBreakAt - stepCount),
    startBreakSystem,
    completeBreak,
    skipBreak,
    reset
  };
}