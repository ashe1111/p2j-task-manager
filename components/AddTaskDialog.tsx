'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/lib/store';
import { generateAISchedule } from '@/lib/ai';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddTaskDialog({ open, onClose }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [autoGenerateSubtasks, setAutoGenerateSubtasks] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { addTask, user } = useTaskStore();

  const handleSubmit = () => {
    if (!title.trim()) return;

    const hasDateRange = startDate && deadline && startDate !== deadline;
    let subtasks = undefined;

    if (hasDateRange && autoGenerateSubtasks) {
      const start = new Date(startDate);
      const end = new Date(deadline);
      const taskSubtasks = [];
      const currentDate = new Date(start);
      let dayCount = 1;

      while (currentDate <= end) {
        taskSubtasks.push({
          id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${dayCount}`,
          date: currentDate.toISOString().split('T')[0],
          title: `Day ${dayCount} - ${title.trim()}`,
          completed: false,
        });
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
      }

      subtasks = taskSubtasks;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'pending',
      scheduled_date: date,
      scheduled_time: time || undefined,
      startDate: hasDateRange ? startDate : undefined,
      deadline: hasDateRange ? deadline : undefined,
      subtasks,
      xp_reward: 10,
      ai_generated: false,
    });

    resetForm();
    onClose();
  };

  const handleAIGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    try {
      const tasks = await generateAISchedule(description, user.ai_personality);
      tasks.forEach(task => addTask(task));
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('AI generation failed, please try again');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDeadline('');
    setAutoGenerateSubtasks(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="For example: Complete the project report"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detailed Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task details, or let AI help you plan..."
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suggested Time (Optional)
            </label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="For example: 9-11 AM"
              className="rounded-xl"
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Task Time Range (Optional)
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date (Deadline)
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={startDate}
                  className="rounded-xl"
                />
              </div>
            </div>

            {startDate && deadline && startDate !== deadline && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="autoSubtasks"
                  checked={autoGenerateSubtasks}
                  onChange={(e) => setAutoGenerateSubtasks(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="autoSubtasks" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Create subtasks for each day automatically
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl h-11"
            >
              Add Task
            </Button>

            <Button
              onClick={handleAIGenerate}
              disabled={!description.trim() || isGenerating}
              variant="outline"
              className="flex-1 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl h-11"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'AI is generating...' : 'AI Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
