'use client';

import { useState, useEffect } from 'react';
import { Plus, Sparkles, Crown, Calendar, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { MoodSelector } from '@/components/MoodSelector';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { LevelBadge } from '@/components/LevelBadge';
import { CalendarTimeline } from '@/components/CalendarTimeline';
import { useTaskStore } from '@/lib/store';
import { generateAISchedule } from '@/lib/ai';

export default function Dashboard() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const { tasks, addTask, user, loadFromStorage, updateTask } = useTaskStore();

  useEffect(() => {
    loadFromStorage();

    const initialTask = localStorage.getItem('initialTask');
    if (initialTask) {
      handleGenerateSchedule(initialTask);
      localStorage.removeItem('initialTask');
    }
  }, []);

  const handleGenerateSchedule = async (taskDescription: string) => {
    setIsGeneratingSchedule(true);
    try {
      const aiTasks = await generateAISchedule(taskDescription, user.ai_personality);
      aiTasks.forEach(task => addTask(task));
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.scheduled_date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const completionRate = todayTasks.length > 0 ? (completedToday / todayTasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#C8F2E8]">
      <div className="absolute top-0 left-0 w-full h-16 bg-[#9B8BD9]"></div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-700">
              Today is {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>

          <LevelBadge xp={user.xp} level={user.level} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {viewMode === 'list' ? 'Task List' : 'Timeline Schedule'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border-3 border-black">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      viewMode === 'list'
                        ? 'bg-[#FF8989] text-white shadow-sm'
                        : 'text-gray-600 hover:text-[#FF8989]'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:inline">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      viewMode === 'timeline'
                        ? 'bg-[#FF8989] text-white shadow-sm'
                        : 'text-gray-600 hover:text-[#FF8989]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:inline">Timeline</span>
                  </button>
                </div>
                <Button
                  onClick={() => setShowAddTask(true)}
                  className="bg-[#FF8989] hover:bg-[#FF6B6B] text-white rounded-2xl border-3 border-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Add Task</span>
                  <span className="md:hidden">Add</span>
                </Button>
              </div>
            </div>

            {viewMode === 'timeline' ? (
              <CalendarTimeline
                tasks={tasks}
                onTaskClick={(task) => {
                  console.log('Task clicked:', task);
                }}
                onTaskUpdate={(taskId, updates) => {
                  updateTask(taskId, updates);
                }}
              />
            ) : (
              <div className="bg-white rounded-3xl shadow-lg p-6 border-3 border-black">
                {viewMode === 'list' && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">
                        Today's Completion Rate: {completedToday}/{todayTasks.length}
                      </span>
                      <span className="text-sm font-semibold text-[#FF8989]">
                        {completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-3" />
                  </div>

                  <div className="space-y-3">
                    {todayTasks.length === 0 ? (
                      <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          No tasks for today yet, let AI help you plan!
                        </p>
                        <Button
                          onClick={() => setShowAddTask(true)}
                          variant="outline"
                          className="rounded-2xl border-3 border-black"
                        >
                          Start Adding Tasks
                        </Button>
                      </div>
                    ) : (
                      todayTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    )}
                  </div>

                  {todayTasks.length > 0 && (
                    <div className="mt-6 pt-6 border-t-3 border-gray-300">
                      <Button
                        onClick={() => {
                          const description = "Re-plan my tasks for today";
                          handleGenerateSchedule(description);
                        }}
                        disabled={isGeneratingSchedule}
                        variant="outline"
                        className="w-full rounded-2xl border-3 border-black"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isGeneratingSchedule ? 'AI is planning...' : 'AI Re-plan'}
                      </Button>
                    </div>
                  )}
                </>
              )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <MoodSelector />
            <PomodoroTimer />

            <div className="bg-[#FFE4A0] rounded-3xl shadow-lg p-6 border-3 border-black">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-[#FF8989]" />
                <h3 className="text-lg font-bold text-gray-900">P → J Progress</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Experience</span>
                    <span className="text-sm font-semibold text-[#FF8989]">
                      {user.xp} / {user.level * 100} XP
                    </span>
                  </div>
                  <Progress
                    value={(user.xp % (user.level * 100)) / (user.level * 100) * 100}
                    className="h-3"
                  />
                </div>

                <div className="text-center pt-4 border-t-3 border-gray-300">
                  <p className="text-xs text-gray-600 mb-2">
                    +10 XP per completed task
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    Keep going, you need {(user.level * 100) - (user.xp % (user.level * 100))} more XP to level up
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddTaskDialog
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
      />
    </div>
  );
}
