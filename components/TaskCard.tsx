'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Flame, Zap, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTaskStore, Task } from '@/lib/store';

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  high: 'from-red-500 to-orange-500',
  medium: 'from-yellow-500 to-amber-500',
  low: 'from-blue-500 to-cyan-500',
};

const priorityIcons = {
  high: Flame,
  medium: Zap,
  low: Clock,
};

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask, completeTask, toggleSubtask } = useTaskStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const Icon = priorityIcons[task.priority];
  const isCompleted = task.status === 'completed';

  const handleToggleComplete = () => {
    if (isCompleted) {
      updateTask(task.id, { status: 'pending' });
    } else {
      completeTask(task.id);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task？')) {
      deleteTask(task.id);
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    toggleSubtask(task.id, subtaskId);
  };

  const getTaskProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(s => s.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  const formatDateRange = () => {
    if (!task.startDate || !task.deadline) return null;
    const start = new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const progress = getTaskProgress();

  return (
    <Card
      className={`p-4 transition-all duration-300 hover:shadow-lg border-2 ${
        isCompleted
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400 hover:text-emerald-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`font-semibold text-lg ${
                isCompleted
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`px-3 py-1 rounded-full bg-gradient-to-r ${priorityColors[task.priority]} text-white text-xs font-semibold flex items-center gap-1`}
              >
                <Icon className="w-3 h-3" />
                {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}

              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            {task.scheduled_time && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {task.scheduled_time}
              </p>
            )}

            {formatDateRange() && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDateRange()}
              </p>
            )}
          </div>

          {task.description && (
            <div>
              <p
                className={`text-sm ${
                  isCompleted ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'
                } ${!isExpanded && 'line-clamp-2'}`}
              >
                {task.description}
              </p>
              {task.description.length > 100 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              )}
            </div>
          )}

          {hasSubtasks && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Overall Progress</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="ml-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {showSubtasks ? (
                    <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>

              {showSubtasks && task.subtasks && (
                <div className="mt-3 space-y-1.5 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 transition-colors"
                    >
                      <button
                        onClick={() => handleSubtaskToggle(subtask.id)}
                        className="flex-shrink-0"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 hover:text-emerald-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            subtask.completed
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {subtask.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(subtask.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {task.ai_generated && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <span className="text-xs text-purple-700 dark:text-purple-300">✨ AI Generated</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
