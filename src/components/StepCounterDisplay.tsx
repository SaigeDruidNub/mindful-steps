'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Footprints } from 'lucide-react';

interface StepCounterDisplayProps {
  stepData: { steps: number; distance: number };
  isCounting: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function StepCounterDisplay({
  stepData,
  isCounting,
  isSupported,
  onStart,
  onStop,
  onReset
}: StepCounterDisplayProps) {
  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Step counting is not supported on this device.
          </p>
          <p className="text-sm text-muted-foreground">
            Try using a mobile device or enable motion sensors.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          {/* Step Count */}
          <div className="relative">
            <div className="text-6xl font-bold text-primary">
              {stepData.steps.toLocaleString()}
            </div>
            <div className="text-lg text-muted-foreground flex items-center justify-center gap-1 mt-2">
              <Footprints className="w-4 h-4" />
              steps
            </div>
          </div>

          {/* Distance */}
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {(stepData.distance * 1000).toFixed(0)} m
            </div>
            <div className="text-sm text-muted-foreground">
              distance
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            {!isCounting ? (
              <Button
                onClick={onStart}
                size="lg"
                className="flex items-center justify-center gap-2 px-3 sm:px-4"
              >
                <Play className="w-5 h-5" />
                <span className="hidden sm:inline">Start Walking</span>
                <span className="sm:hidden">Start</span>
              </Button>
            ) : (
              <Button
                onClick={onStop}
                size="lg"
                variant="outline"
                className="flex items-center justify-center gap-2 px-3 sm:px-4"
              >
                <Pause className="w-5 h-5" />
                <span className="hidden sm:inline">Pause</span>
                <span className="sm:hidden">Pause</span>
              </Button>
            )}
            
            <Button
              onClick={onReset}
              size="lg"
              variant="ghost"
              className="flex items-center justify-center gap-2 px-3 sm:px-4"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">Reset</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>

          {/* Status Indicator */}
          {isCounting && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Counting steps...
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}