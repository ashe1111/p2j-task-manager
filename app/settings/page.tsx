'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Brain, Target, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/lib/store';

const personalities = [
  {
    value: 'warm' as const,
    label: '🧸 Warm-hearted Mentor',
    description: 'Gentle and considerate, encouraging you like a mentor to complete tasks',
    example: '"You did great today! Keep up the momentum—tomorrow will be even better!"',
  },
  {
    value: 'savage' as const,
    label: '😈 The Sarcastic One',
    description: 'Urging you forward with sharp humor for outstanding results',
    example: '"Procrastinating again? Looks like you\'re stuck in P-role forever, huh?"',
  },
  {
    value: 'rational' as const,
    label: '🧙‍♂️ Rational Planner',
    description: 'Focuses on logic and efficiency, offering professional time management advice',
    example: '"Based on task priority analysis, I recommend completing high-priority task A first."',
  },
];

export default function SettingsPage() {
  const { user, updateUser } = useTaskStore();
  const [username, setUsername] = useState('');
  const [dailyGoal, setDailyGoal] = useState(5);
  const [selectedPersonality, setSelectedPersonality] = useState<'warm' | 'savage' | 'rational'>('warm');

  useEffect(() => {
    setUsername(user.username);
    setDailyGoal(user.daily_goal_count);
    setSelectedPersonality(user.ai_personality);
  }, [user]);

  const handleSave = () => {
    updateUser({
      username,
      daily_goal_count: dailyGoal,
      ai_personality: selectedPersonality,
    });

    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-[#FFE4E8]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFB3D1] via-[#FFA59E] to-[#FFD966]"></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <SettingsIcon className="w-10 h-10" />
            Settings
          </h1>
          <p className="text-gray-700">
            Personalize your P2J experience
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#FFFBEA] p-8 rounded-3xl shadow-lg border-3 border-black">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#FFB366]" />
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name..."
                  className="rounded-xl border-3 border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Daily Goal Task Count
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseInt(e.target.value) || 5)}
                  className="rounded-xl border-3 border-gray-300"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Recommended 3-7 tasks per day
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#FFA59E] p-8 rounded-3xl shadow-lg border-3 border-black">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-gray-900">
                AI Personality Selection
              </h2>
            </div>

            <p className="text-gray-800 mb-6">
              Choose an AI assistant style you like, which will affect the tone of task planning and reminders
            </p>

            <div className="space-y-4">
              {personalities.map((personality) => (
                <button
                  key={personality.value}
                  onClick={() => setSelectedPersonality(personality.value)}
                  className={`w-full text-left p-6 rounded-2xl border-3 transition-all ${
                    selectedPersonality === personality.value
                      ? 'border-black bg-white'
                      : 'border-black bg-[#FFE4A0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {personality.label}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {personality.description}
                      </p>
                    </div>

                    {selectedPersonality === personality.value && (
                      <div className="w-6 h-6 rounded-full bg-[#62D5E1] flex items-center justify-center flex-shrink-0 border-2 border-black">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-3 rounded-xl border-2 border-gray-300">
                    <p className="text-sm italic text-gray-800">
                      {personality.example}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSave}
              className="bg-[#FFD966] hover:bg-[#FFC733] text-gray-900 rounded-2xl px-8 h-12 text-lg font-semibold border-3 border-black"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
