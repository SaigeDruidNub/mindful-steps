'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Flame, 
  Camera, 
  Heart, 
  Mountain, 
  Star, 
  Zap,
  Footprints,
  Sun,
  Moon,
  Target,
  Award
} from 'lucide-react';
import { Achievement, DailyStats } from '@/types';
import { RecentAchievements } from '@/components/RecentAchievements';

interface BadgeSystemProps {
  dailyStats?: DailyStats;
  totalStats?: {
    totalSteps: number;
    totalPhotos: number;
    totalMindfulBreaks: number;
    totalWalks: number;
    currentStreak: number;
  };
}

// Badge definitions with different tiers and categories
const BADGE_DEFINITIONS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // Step Badges
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Take your first 100 steps',
    icon: '👟',
    maxProgress: 100,
  },
  {
    id: 'step_journeyman',
    title: 'Step Journeyman',
    description: 'Walk 1,000 steps in a day',
    icon: '🚶',
    maxProgress: 1000,
  },
  {
    id: 'step_expert',
    title: 'Step Expert',
    description: 'Walk 5,000 steps in a day',
    icon: '🏃',
    maxProgress: 5000,
  },
  {
    id: 'step_master',
    title: 'Step Master',
    description: 'Walk 10,000 steps in a day',
    icon: '🏆',
    maxProgress: 10000,
  },
  {
    id: 'step_legend',
    title: 'Step Legend',
    description: 'Walk 15,000 steps in a day',
    icon: '🌟',
    maxProgress: 15000,
  },

  // Photo Badges
  {
    id: 'first_photo',
    title: 'First Capture',
    description: 'Take your first mindful photo',
    icon: '📸',
    maxProgress: 1,
  },
  {
    id: 'photo_collector',
    title: 'Photo Collector',
    description: 'Take 10 mindful photos',
    icon: '🖼️',
    maxProgress: 10,
  },
  {
    id: 'photographer',
    title: 'Photographer',
    description: 'Take 25 mindful photos',
    icon: '📷',
    maxProgress: 25,
  },
  {
    id: 'visual_storyteller',
    title: 'Visual Storyteller',
    description: 'Take 50 mindful photos',
    icon: '🎨',
    maxProgress: 50,
  },

  // Mindful Break Badges
  {
    id: 'first_break',
    title: 'First Pause',
    description: 'Complete your first mindful break',
    icon: '🧘',
    maxProgress: 1,
  },
  {
    id: 'mindful_beginner',
    title: 'Mindful Beginner',
    description: 'Complete 5 mindful breaks',
    icon: '🌱',
    maxProgress: 5,
  },
  {
    id: 'mindful_practitioner',
    title: 'Mindful Practitioner',
    description: 'Complete 15 mindful breaks',
    icon: '🌿',
    maxProgress: 15,
  },
  {
    id: 'mindfulness_master',
    title: 'Mindfulness Master',
    description: 'Complete 30 mindful breaks',
    icon: '🌳',
    maxProgress: 30,
  },

  // Streak Badges
  {
    id: 'first_week',
    title: 'Week Warrior',
    description: 'Maintain a 7-day walking streak',
    icon: '📅',
    maxProgress: 7,
  },
  {
    id: 'two_weeks',
    title: 'Fortnight Walker',
    description: 'Maintain a 14-day walking streak',
    icon: '🗓️',
    maxProgress: 14,
  },
  {
    id: 'monthly_master',
    title: 'Monthly Master',
    description: 'Maintain a 30-day walking streak',
    icon: '📆',
    maxProgress: 30,
  },

  // Distance Badges
  {
    id: 'first_km',
    title: 'First Kilometer',
    description: 'Walk 1km in a single session',
    icon: '📍',
    maxProgress: 1000,
  },
  {
    id: 'distance_champion',
    title: 'Distance Champion',
    description: 'Walk 5km in a single session',
    icon: '🏃‍♂️',
    maxProgress: 5000,
  },
  {
    id: 'marathon_walker',
    title: 'Marathon Walker',
    description: 'Walk 10km in a single session',
    icon: '🏅',
    maxProgress: 10000,
  },

  // Special Combo Badges
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'Complete 10,000 steps, 3 photos, and 3 mindful breaks in one day',
    icon: '✨',
    maxProgress: 1,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Walk before 8 AM for 5 consecutive days',
    icon: '🌅',
    maxProgress: 5,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Walk after 8 PM for 5 consecutive days',
    icon: '🌙',
    maxProgress: 5,
  },
];

export function BadgeSystem({ dailyStats, totalStats }: BadgeSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Calculate progress for each badge
  useEffect(() => {
    const updatedAchievements = BADGE_DEFINITIONS.map(def => {
      let progress = 0;
      let isUnlocked = false;

      // Calculate progress based on badge type
      switch (def.id) {
        // Daily step badges
        case 'first_steps':
        case 'step_journeyman':
        case 'step_expert':
        case 'step_master':
        case 'step_legend':
          progress = Math.min(dailyStats?.steps || 0, def.maxProgress);
          break;

        // Photo badges (use total photos)
        case 'first_photo':
        case 'photo_collector':
        case 'photographer':
        case 'visual_storyteller':
          progress = Math.min(totalStats?.totalPhotos || 0, def.maxProgress);
          break;

        // Mindful break badges (use total)
        case 'first_break':
        case 'mindful_beginner':
        case 'mindful_practitioner':
        case 'mindfulness_master':
          progress = Math.min(totalStats?.totalMindfulBreaks || 0, def.maxProgress);
          break;

        // Streak badges
        case 'first_week':
        case 'two_weeks':
        case 'monthly_master':
          progress = Math.min(totalStats?.currentStreak || 0, def.maxProgress);
          break;

        // Distance badges (use daily distance)
        case 'first_km':
        case 'distance_champion':
        case 'marathon_walker':
          progress = Math.min((dailyStats?.distance || 0) * 1000, def.maxProgress); // Convert km to m
          break;

        // Perfect day (special logic)
        case 'perfect_day':
          const hasSteps = (dailyStats?.steps || 0) >= 10000;
          const hasPhotos = (dailyStats?.photosTaken || 0) >= 3;
          const hasBreaks = (dailyStats?.breaksCompleted || 0) >= 3;
          progress = (hasSteps && hasPhotos && hasBreaks) ? 1 : 0;
          break;

        // Early bird/Night owl (would need time data - simplified)
        case 'early_bird':
        case 'night_owl':
          progress = 0; // Would need implementation with time tracking
          break;

        default:
          progress = 0;
      }

      isUnlocked = progress >= def.maxProgress;

      return {
        ...def,
        progress,
        unlockedAt: isUnlocked ? Date.now() : undefined,
      };
    });

    setAchievements(updatedAchievements);
  }, [dailyStats, totalStats]);

  // Group badges by category
  const stepBadges = achievements.filter(b => 
    ['first_steps', 'step_journeyman', 'step_expert', 'step_master', 'step_legend'].includes(b.id)
  );
  const photoBadges = achievements.filter(b => 
    ['first_photo', 'photo_collector', 'photographer', 'visual_storyteller'].includes(b.id)
  );
  const mindfulBadges = achievements.filter(b => 
    ['first_break', 'mindful_beginner', 'mindful_practitioner', 'mindfulness_master'].includes(b.id)
  );
  const streakBadges = achievements.filter(b => 
    ['first_week', 'two_weeks', 'monthly_master'].includes(b.id)
  );
  const distanceBadges = achievements.filter(b => 
    ['first_km', 'distance_champion', 'marathon_walker'].includes(b.id)
  );
  const specialBadges = achievements.filter(b => 
    ['perfect_day', 'early_bird', 'night_owl'].includes(b.id)
  );

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Recent Achievements */}
      <RecentAchievements achievements={achievements} />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold">
              {unlockedCount} / {totalCount}
            </div>
            <Badge variant="secondary">
              {Math.round((unlockedCount / totalCount) * 100)}% Complete
            </Badge>
          </div>
          <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Badge Categories */}
      <BadgeCategory 
        title="Step Achievements" 
        icon={<Footprints className="w-5 h-5" />}
        badges={stepBadges} 
      />
      
      <BadgeCategory 
        title="Photo Achievements" 
        icon={<Camera className="w-5 h-5" />}
        badges={photoBadges} 
      />
      
      <BadgeCategory 
        title="Mindfulness Achievements" 
        icon={<Heart className="w-5 h-5" />}
        badges={mindfulBadges} 
      />
      
      <BadgeCategory 
        title="Streak Achievements" 
        icon={<Flame className="w-5 h-5" />}
        badges={streakBadges} 
      />
      
      <BadgeCategory 
        title="Distance Achievements" 
        icon={<Mountain className="w-5 h-5" />}
        badges={distanceBadges} 
      />
      
      <BadgeCategory 
        title="Special Achievements" 
        icon={<Star className="w-5 h-5" />}
        badges={specialBadges} 
      />
    </div>
  );
}

interface BadgeCategoryProps {
  title: string;
  icon: React.ReactNode;
  badges: Achievement[];
}

function BadgeCategory({ title, icon, badges }: BadgeCategoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ badge }: { badge: Achievement }) {
  const isUnlocked = badge.unlockedAt !== undefined;
  const progressPercentage = (badge.progress / badge.maxProgress) * 100;

  return (
    <div className={`p-4 rounded-lg border ${isUnlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {badge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${isUnlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
              {badge.title}
            </h4>
            {isUnlocked && (
              <Badge variant="secondary" className="text-xs">
                ✓
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
          {!isUnlocked && badge.maxProgress > 1 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{badge.progress} / {badge.maxProgress}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}