'use client';

import { Crown, Award, Medal } from 'lucide-react';

interface LevelBadgeProps {
  xp: number;
  level: number;
}

const levelTiers = [
  { min: 1, max: 3, title: 'Dreamer', color: 'from-amber-600 to-amber-800', icon: Medal },
  { min: 4, max: 7, title: 'Builder', color: 'from-gray-400 to-gray-600', icon: Award },
  { min: 8, max: Infinity, title: 'Master', color: 'from-yellow-400 to-yellow-600', icon: Crown },
];

export function LevelBadge({ xp, level }: LevelBadgeProps) {
  const tier = levelTiers.find(t => level >= t.min && level <= t.max) || levelTiers[0];
  const Icon = tier.icon;

  return (
    <div className="flex items-center gap-4">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{tier.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">Lv.{level} • {xp} XP</p>
      </div>
    </div>
  );
}
