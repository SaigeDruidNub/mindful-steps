'use client';

import { useState, useEffect } from 'react';
import { useStepCounter } from '@/hooks/useStepCounter';
import { StepCounterDisplay } from '@/components/StepCounterDisplay';
import { WalkTracker } from '@/components/WalkTracker';
import { GoogleAuth } from '@/components/GoogleAuth';
import { BadgeSystem } from '@/components/BadgeSystem';
import { useBadgeSystem } from '@/hooks/useBadgeSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, BarChart3, Trophy } from 'lucide-react';

export default function Home() {
  const [useAdvancedTracker, setUseAdvancedTracker] = useState(true);
  const [showBadges, setShowBadges] = useState(false);
  
  const badgeSystem = useBadgeSystem();
  
  const {
    stepData,
    isCounting,
    isSupported,
    startCounting,
    stopCounting,
    reset
  } = useStepCounter();
  
  // Update badge system when step data changes
  useEffect(() => {
    if (stepData?.steps) {
      badgeSystem.updateSteps(stepData.steps);
    }
  }, [stepData?.steps, badgeSystem]);
  
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
          <Button
            variant="outline"
            onClick={() => setShowBadges(!showBadges)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            {showBadges ? 'Hide' : 'Show'} Badges
          </Button>
        </div>

        {/* Badge System */}
        {showBadges && (
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeSystem 
                dailyStats={badgeSystem.todayStats}
                totalStats={badgeSystem.totalStats}
              />
            </CardContent>
          </Card>
        )}

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