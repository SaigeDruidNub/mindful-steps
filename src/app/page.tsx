'use client';

import { useState, useEffect } from 'react';
import { useStepCounter } from '@/hooks/useStepCounter';
import { StepCounterDisplay } from '@/components/StepCounterDisplay';
import { WalkTracker } from '@/components/WalkTracker';
import { GoogleAuth } from '@/components/GoogleAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  const [useAdvancedTracker, setUseAdvancedTracker] = useState(true);
  
  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => console.log('✅ Google Identity Services loaded');
      script.onerror = () => console.warn('⚠️ Failed to load Google Identity Services');
      document.head.appendChild(script);
    }
  }, []);
  
  const {
    stepData,
    isCounting,
    isSupported,
    startCounting,
    stopCounting,
    reset
  } = useStepCounter();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 space-y-6">
        
        <header className="text-center space-y-2">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Mindful Steps" 
              className="h-16 w-auto max-w-xs"
            />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Walk with awareness, capture moments of beauty
          </p>
        </header>

        {/* Google Authentication */}
        <GoogleAuth 
          onUserChange={(user) => {
            console.log('🔐 User changed:', user ? `${user.name} (${user.email})` : 'Signed out');
          }}
        />

        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => setUseAdvancedTracker(!useAdvancedTracker)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {useAdvancedTracker ? <Zap className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            {useAdvancedTracker ? 'Simple' : 'Advanced'}
          </Button>
        </div>

        {/* Step Counter Display or Walk Tracker */}
        {useAdvancedTracker ? (
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Advanced Walk Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WalkTracker />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Simple Step Counter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StepCounterDisplay
                stepData={stepData}
                isCounting={isCounting}
                isSupported={isSupported}
                onStart={startCounting}
                onStop={stopCounting}
                onReset={reset}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}