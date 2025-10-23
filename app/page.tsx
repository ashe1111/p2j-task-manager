'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Brain, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [task, setTask] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (task.trim()) {
      localStorage.setItem('initialTask', task);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEA]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFB366] via-[#FFA347] to-[#FF9028]"></div>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border-3 border-black">
              <Sparkles className="w-5 h-5 text-[#FF9028]" />
              <span className="text-sm font-medium text-gray-800">AI-Powered Task Planning</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            Lazy to Legend
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
            Turn Your Procrastination into Productivity
          </p>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Transform from procrastinator to high achiever with one AI assistant. Let AI help you plan time, break down tasks, and gently motivate you.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-3 border-black">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-3">
                Tell me what you want to accomplish ✨
              </label>
              <Input
                type="text"
                placeholder="Example: Complete my thesis within 3 days..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                className="h-14 text-lg rounded-2xl border-3 border-gray-300 focus:border-[#FF9028] bg-white text-[#B3A07F]"
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={!task.trim()}
              className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-[#FFB366] to-[#FF9028] hover:from-[#FFA347] hover:to-[#FF8500] text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-3 border-black"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start Planning My Schedule
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-3 border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#62D5E1] flex items-center justify-center mb-6 shadow-lg border-3 border-black">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">AI Smart Planning</h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically break down tasks, allocate time, and set priorities. Let AI become your personal time management coach.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-3 border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFA59E] flex items-center justify-center mb-6 shadow-lg border-3 border-black">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Gamified Motivation</h3>
            <p className="text-gray-600 leading-relaxed">
              Earn experience points by completing tasks. Level up from "Bronze Procrastinator" to "Gold Achiever" and make self-discipline fun.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-3 border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFD966] flex items-center justify-center mb-6 shadow-lg border-3 border-black">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Weekly Reports</h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically generate completion reports every week. Visualize your growth curve and witness your transformation.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block bg-white rounded-3xl px-8 py-6 border-3 border-black shadow-lg">
            <p className="text-sm text-gray-700 mb-2">✨ Completely Free • No Registration • Local Data Storage</p>
            <p className="text-xs text-gray-600">Powered by AI • Built for Procrastinators</p>
          </div>
        </div>
      </div>
    </div>
  );
}
