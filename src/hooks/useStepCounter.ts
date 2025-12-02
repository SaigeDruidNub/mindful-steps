import { useState, useEffect, useCallback } from 'react';
import { StepCounter } from '@/lib/stepCounter';
import { PedometerData } from '@/types';

export function useStepCounter() {
  const [stepCounter] = useState(() => new StepCounter());
  const [stepData, setStepData] = useState<PedometerData>({
    steps: 0,
    distance: 0
  });
  const [isCounting, setIsCounting] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const handleStepUpdate = useCallback((data: PedometerData) => {
    setStepData(data);
  }, []);

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
  }, [stepCounter]);

  const stopCounting = useCallback(() => {
    stepCounter.stopCounting();
    setIsCounting(false);
  }, [stepCounter]);

  const reset = useCallback(() => {
    stepCounter.reset();
    setStepData({ steps: 0, distance: 0 });
  }, [stepCounter]);

  return {
    stepData,
    isCounting,
    isSupported,
    startCounting,
    stopCounting,
    reset
  };
}