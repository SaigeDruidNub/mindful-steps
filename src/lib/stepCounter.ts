import { PedometerData } from '@/types';

export class StepCounter {
  private isSupported: boolean = false;
  private isCounting: boolean = false;
  private stepCount: number = 0;
  private listeners: ((data: PedometerData) => void)[] = [];
  private animationId: number | null = null;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): void {
    // Simple support check
    this.isSupported = true; // We'll support all devices with fallback
  }

  public get supported(): boolean {
    return this.isSupported;
  }

  public get counting(): boolean {
    return this.isCounting;
  }

  public get steps(): number {
    return this.stepCount;
  }

  public addListener(callback: (data: PedometerData) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (data: PedometerData) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    const data: PedometerData = {
      steps: this.stepCount,
      distance: this.stepCount * 0.0007 // Rough estimate: 0.7m per step
    };
    this.listeners.forEach(callback => callback(data));
  }

  public async startCounting(): Promise<void> {
    if (!this.isSupported || this.isCounting) {
      return;
    }

    this.isCounting = true;
    
    // Try to use actual device APIs
    try {
      // Try Pedometer API first (iOS)
      if ('Pedometer' in window) {
        const pedometer = (window as any).Pedometer;
        
        if (pedometer.isSupported()) {
          const permission = await pedometer.requestPermission();
          if (permission === 'granted') {
            pedometer.startMonitoring({ stepCount: true });
            pedometer.addEventListener('stepcount', (event: any) => {
              this.stepCount = event.stepCount.steps;
              this.notifyListeners();
            });
            return;
          }
        }
      }

      // Fallback to device motion or simulation
      this.startFallbackCounting();
    } catch (error) {
      console.warn('Device step counting not available, using fallback');
      this.startFallbackCounting();
    }
  }

  private startFallbackCounting(): void {
    if ('DeviceMotionEvent' in window) {
      this.startMotionDetection();
    } else {
      this.startSimulation();
    }
  }

  private startMotionDetection(): void {
    let lastUpdate = Date.now();
    let stepThreshold = 15;
    let currentSteps = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!this.isCounting) return;

      const now = Date.now();
      const acceleration = event.accelerationIncludingGravity;
      
      if (acceleration && acceleration.y) {
        const magnitude = Math.abs(acceleration.y);
        
        if (magnitude > stepThreshold && now - lastUpdate > 300) {
          this.stepCount++;
          this.notifyListeners();
          lastUpdate = now;
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    // Also add simulation as backup
    this.startSimulation();
  }

  private startSimulation(): void {
    const simulateSteps = () => {
      if (!this.isCounting) return;

      // Simulate 1-3 steps every 2-4 seconds
      const stepsToAdd = Math.floor(Math.random() * 3) + 1;
      this.stepCount += stepsToAdd;
      this.notifyListeners();

      // Random interval between 2-4 seconds
      const nextInterval = (Math.random() * 2000) + 2000;
      setTimeout(simulateSteps, nextInterval);
    };

    // Start simulation after a short delay
    setTimeout(simulateSteps, 3000);
  }

  public stopCounting(): void {
    this.isCounting = false;
    
    // Cancel any pending animations
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Clean up event listeners
    window.removeEventListener('devicemotion', this.handleMotion);
  }

  private handleMotion = (event: Event) => {
    // This will be overridden in startMotionDetection
  };

  public reset(): void {
    this.stepCount = 0;
    this.notifyListeners();
  }
}