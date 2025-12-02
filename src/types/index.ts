export interface StepData {
  count: number;
  timestamp: number;
  distance?: number;
  calories?: number;
}

export interface MindfulBreak {
  id: string;
  stepsTriggered: number;
  timestamp: number;
  prompt: MindfulPrompt;
  completed: boolean;
  photo?: string;
  note?: string;
}

export interface MindfulPrompt {
  id: string;
  type: 'photo' | 'sensory' | 'breathing' | 'reflection';
  title: string;
  description: string;
  instruction: string;
}

export interface UserSettings {
  minStepsBetweenBreaks: number;
  maxStepsBetweenBreaks: number;
  breakNotifications: boolean;
  photoPrompts: boolean;
  sensoryExercises: boolean;
  breathingExercises?: boolean;
  reflectionExercises?: boolean;
  dailyStepGoal: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface DailyStats {
  date: string;
  steps: number;
  breaksCompleted: number;
  photosTaken: number;
  activeMinutes: number;
  distance: number;
  calories: number;
}

export interface WalkLog {
  id: string;
  date: string; // ISO date string
  startTime: number; // Unix timestamp
  endTime?: number; // Unix timestamp, null if active
  steps: number;
  distance: number; // in kilometers
  duration: number; // in minutes
  averagePace?: number; // minutes per km
  startLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  endLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  photos?: string[]; // Array of photo URLs from this walk
  mood?: {
    before: number; // 1-5 scale
    after: number; // 1-5 scale
  };
  weather?: {
    condition: string;
    temperature: number; // celsius
    humidity?: number;
  };
  notes?: string;
  mindfulBreaksCompleted: number;
}

export interface StepGoal {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface WalkStreak {
  current: number; // consecutive days
  longest: number; // best streak
  lastWalkDate: string; // ISO date string
}

export interface PedometerData {
  steps: number;
  distance: number;
  floorsAscended?: number;
  floorsDescended?: number;
}