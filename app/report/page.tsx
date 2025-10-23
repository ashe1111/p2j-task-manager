'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Sparkles, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/lib/store';
import { generateWeeklySummary } from '@/lib/ai';

export default function ReportPage() {
  const { tasks, user, moods } = useTaskStore();
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    calculateWeeklyData();
  }, [tasks]);

  const calculateWeeklyData = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.scheduled_date);
      return taskDate >= weekAgo && taskDate <= now;
    });

    const completedTasks = weekTasks.filter(t => t.status === 'completed');
    const completionRate = weekTasks.length > 0
      ? (completedTasks.length / weekTasks.length) * 100
      : 0;

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayTasks = weekTasks.filter(
        t => t.scheduled_date === dateStr
      );
      const dayCompleted = dayTasks.filter(t => t.status === 'completed');

      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: dayTasks.length,
        completed: dayCompleted.length,
        rate: dayTasks.length > 0 ? (dayCompleted.length / dayTasks.length) * 100 : 0,
      });
    }

    setWeeklyData({
      totalTasks: weekTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      dailyData,
    });
  };

  const handleGenerateSummary = async () => {
    if (!weeklyData) return;

    setIsGenerating(true);
    try {
      const summary = await generateWeeklySummary(
        weeklyData.completionRate,
        weeklyData.totalTasks,
        weeklyData.completedTasks,
        user.ai_personality
      );
      setAiSummary(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setAiSummary('Great work this week! Keep up the momentum—next week will be even better.！');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!weeklyData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute top-0 left-0 w-full h-16 bg-[#62D5E1]"></div>

      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Weekly Summary
          </h1>
          <p className="text-gray-700">
            Completion status for the past 7 days
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white p-6 rounded-3xl shadow-lg border-3 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#62D5E1] flex items-center justify-center border-3 border-black">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">
                  {weeklyData.totalTasks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 rounded-3xl shadow-lg border-3 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFA59E] flex items-center justify-center border-3 border-black">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {weeklyData.completedTasks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 rounded-3xl shadow-lg border-3 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#62D5E1] flex items-center justify-center border-3 border-black">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {weeklyData.completionRate.toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white p-8 rounded-3xl shadow-lg border-3 border-black mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Daily Completion
          </h2>

          <div className="space-y-4">
            {weeklyData.dailyData.map((day: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-700">
                  {day.date}
                </div>

                <div className="flex-1">
                  <div className="h-10 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-300">
                    <div
                      className="h-full bg-gradient-to-r from-[#62D5E1] to-[#4AC4D4] flex items-center justify-end px-4 transition-all duration-500"
                      style={{ width: `${day.rate}%` }}
                    >
                      {day.rate > 0 && (
                        <span className="text-sm font-semibold text-white">
                          {day.completed}/{day.total}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-16 text-right text-sm font-semibold text-gray-800">
                  {day.rate.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#FFA59E] p-8 rounded-3xl shadow-lg border-3 border-black">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-white" />
              AI Weekly Summary
            </h2>

            {!aiSummary && (
              <Button
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="bg-[#62D5E1] hover:bg-[#4AC4D4] text-white rounded-2xl border-3 border-black"
              >
                {isGenerating ? 'Generating...' : 'Generate Summary'}
              </Button>
            )}
          </div>

          {aiSummary ? (
            <div className="bg-white p-6 rounded-2xl border-2 border-black">
              <p className="text-lg text-gray-800 leading-relaxed">
                {aiSummary}
              </p>
            </div>
          ) : (
            <p className="text-gray-800">
              Click "Generate Summary" to let AI summarize your weekly performance
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
