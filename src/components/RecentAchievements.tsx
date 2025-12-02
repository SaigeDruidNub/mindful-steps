'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types';
import { Trophy, Star, Zap, Award } from 'lucide-react';

interface RecentAchievementsProps {
  achievements: Achievement[];
  maxDisplay?: number;
}

export function RecentAchievements({ achievements, maxDisplay = 3 }: RecentAchievementsProps) {
  // Filter to only recently unlocked achievements and sort by unlock time
  const recentUnlocked = achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, maxDisplay);

  if (recentUnlocked.length === 0) {
    return null;
  }

  const getIcon = (iconString: string) => {
    switch (iconString) {
      case '🏆': return <Trophy className="w-8 h-8 text-yellow-500" />;
      case '🌟': return <Star className="w-8 h-8 text-yellow-500" />;
      case '⚡': return <Zap className="w-8 h-8 text-yellow-500" />;
      case '🎖️': return <Award className="w-8 h-8 text-yellow-500" />;
      default: return <Trophy className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentUnlocked.map((achievement, index) => (
            <div 
              key={achievement.id}
              className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-yellow-200"
            >
              {getIcon(achievement.icon)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-gray-800 truncate">
                    {achievement.title}
                  </h4>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      New!
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {achievement.description}
                </p>
                {achievement.unlockedAt && (
                  <p className="text-xs text-gray-400">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}