'use client';

import { useState, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTaskStore } from '@/lib/store';

const moods = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😩', label: 'Tired', value: 'tired' },
  { emoji: '😤', label: 'Anxious', value: 'anxious' },
  { emoji: '🔥', label: 'Motivated', value: 'motivated' },
];

export function MoodSelector() {
  const { moods: userMoods, setMood } = useTaskStore();
  const [selectedMood, setSelectedMood] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const todayMood = userMoods.find(m => m.date === today);
    if (todayMood) {
      setSelectedMood(todayMood.mood);
    }
  }, [userMoods, today]);

  const handleSelectMood = (moodValue: string) => {
    setSelectedMood(moodValue);
    setMood(moodValue, today);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Smile className="w-6 h-6 text-pink-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Mood</h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleSelectMood(mood.value)}
            className={`aspect-square rounded-2xl text-3xl transition-all hover:scale-110 ${
              selectedMood === mood.value
                ? 'bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 ring-2 ring-pink-400'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={mood.label}
          >
            {mood.emoji}
          </button>
        ))}
      </div>

      {selectedMood && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          Today's mood: {moods.find(m => m.value === selectedMood)?.label}
        </p>
      )}
    </Card>
  );
}
