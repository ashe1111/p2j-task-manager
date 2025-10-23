'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ZoomIn, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/store';

interface CalendarTimelineProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

type ViewMode = 'day' | 'month';

const DAY_WIDTH = 80;
const MONTH_WIDTH = 120;
const ROW_HEIGHT = 60;

const taskColors = [
  { light: '#FFE5D9', dark: '#FFB366', name: 'orange' },
  { light: '#D4F1F4', dark: '#62D5E1', name: 'sky' },
  { light: '#FFD4D4', dark: '#FFA59E', name: 'coral' },
  { light: '#FFF6C3', dark: '#FFD966', name: 'yellow' },
  { light: '#E8D5FF', dark: '#B88BE6', name: 'purple' },
  { light: '#C8F2E8', dark: '#75E6C3', name: 'mint' },
  { light: '#FFE4A0', dark: '#FFCE4E', name: 'gold' },
];

export function CalendarTimeline({ tasks, onTaskClick, onTaskUpdate }: CalendarTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [popupTask, setPopupTask] = useState<Task | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragTask, setDragTask] = useState<Task | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'left' | 'right' | 'move' | 'vertical' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [taskOrder, setTaskOrder] = useState<string[]>([]);
  const [originalTaskIndex, setOriginalTaskIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getDaysInRange = (startDate: Date, days: number) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMonthsInRange = (startDate: Date, months: number) => {
    const monthsList = [];
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      monthsList.push(date);
    }
    return monthsList;
  };

  const dayViewStart = new Date(currentViewDate);
  dayViewStart.setDate(dayViewStart.getDate() - 3);
  const days = getDaysInRange(dayViewStart, 30);

  const monthViewStart = new Date(currentViewDate);
  monthViewStart.setMonth(monthViewStart.getMonth() - 2);
  const months = getMonthsInRange(monthViewStart, 12);

  const getTaskDateRange = (task: Task) => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date(task.scheduled_date);
    const endDate = task.deadline ? new Date(task.deadline) : new Date(task.scheduled_date);

    return { startDate, endDate };
  };

  const calculateTaskPosition = (task: Task) => {
    const { startDate, endDate } = getTaskDateRange(task);

    if (viewMode === 'day') {
      const taskStart = new Date(startDate);
      taskStart.setHours(0, 0, 0, 0);
      const taskEnd = new Date(endDate);
      taskEnd.setHours(0, 0, 0, 0);

      const viewStart = new Date(dayViewStart);
      viewStart.setHours(0, 0, 0, 0);

      const startDiff = Math.floor((taskStart.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
      const endDiff = Math.floor((taskEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));

      const left = startDiff * DAY_WIDTH;
      const durationDays = Math.max(1, endDiff - startDiff + 1);
      const width = durationDays * DAY_WIDTH;

      return { left, width, visible: left >= -DAY_WIDTH * 2 && left <= days.length * DAY_WIDTH, startDate, endDate };
    } else {
      const taskStart = new Date(startDate);
      const taskEnd = new Date(endDate);

      const taskStartMonth = taskStart.getMonth();
      const taskStartYear = taskStart.getFullYear();
      const taskEndMonth = taskEnd.getMonth();
      const taskEndYear = taskEnd.getFullYear();
      const viewStartMonth = monthViewStart.getMonth();
      const viewStartYear = monthViewStart.getFullYear();

      const startMonthsDiff = (taskStartYear - viewStartYear) * 12 + (taskStartMonth - viewStartMonth);
      const endMonthsDiff = (taskEndYear - viewStartYear) * 12 + (taskEndMonth - viewStartMonth);

      const left = startMonthsDiff * MONTH_WIDTH;
      const durationMonths = Math.max(1, endMonthsDiff - startMonthsDiff + 1);
      const width = durationMonths * MONTH_WIDTH;

      return { left, width, visible: left >= -MONTH_WIDTH * 2 && left <= months.length * MONTH_WIDTH, startDate, endDate };
    }
  };

  const getTaskProgress = (task: Task) => {
    if (task.status === 'completed') return 100;

    if (task.subtasks && task.subtasks.length > 0) {
      const completedSubtasks = task.subtasks.filter(s => s.completed).length;
      return (completedSubtasks / task.subtasks.length) * 100;
    }

    const now = new Date();
    const taskDate = new Date(task.scheduled_date);

    if (taskDate.toDateString() !== now.toDateString()) {
      if (taskDate < now) return 100;
      return 0;
    }

    const timeRange = parseTimeRange(task.scheduled_time || '');
    if (!timeRange) return 0;

    const currentHours = now.getHours() + now.getMinutes() / 60;
    const taskStart = timeRange.startHour + timeRange.startMin / 60;
    const taskEnd = timeRange.endHour + timeRange.endMin / 60;

    if (currentHours < taskStart) return 0;
    if (currentHours > taskEnd) return 100;

    return ((currentHours - taskStart) / (taskEnd - taskStart)) * 100;
  };

  const handleTaskClick = (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setPopupTask(task);
  };

  const closePopup = () => {
    setPopupTask(null);
    setIsEditMode(false);
    setEditForm({});
  };

  const startEdit = () => {
    if (popupTask) {
      setEditForm({
        title: popupTask.title,
        description: popupTask.description,
        scheduled_date: popupTask.scheduled_date,
        scheduled_time: popupTask.scheduled_time,
        deadline: popupTask.deadline,
        priority: popupTask.priority
      });
      setIsEditMode(true);
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditForm({});
  };

  const saveEdit = () => {
    if (popupTask && editForm.title && onTaskUpdate) {
      onTaskUpdate(popupTask.id, editForm);
      setIsEditMode(false);
      setEditForm({});
    }
  };

  // Drag and drop handlers
  const handleMouseDown = (task: Task, event: React.MouseEvent, type: 'left' | 'right' | 'move' | 'vertical', currentIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragging(true);
    setDragTask(task);
    setDragStart({ x: event.clientX, y: event.clientY });
    setDragType(type);
    setDragOffset({ x: 0, y: 0 });
    setOriginalTaskIndex(currentIndex);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging || !dragTask || !dragType) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    const dayWidth = viewMode === 'day' ? DAY_WIDTH : MONTH_WIDTH;
    
    // Calculate strict grid-aligned movement
    const daysDelta = Math.round(deltaX / dayWidth);
    const rowDelta = Math.round(deltaY / ROW_HEIGHT);

    // Handle vertical dragging (reordering) - always allow smooth vertical movement
    if (dragType === 'vertical') {
      setDragOffset({ x: 0, y: deltaY });
      
      // Calculate target row based on vertical offset
      const targetRow = Math.round(deltaY / ROW_HEIGHT);
      const newIndex = originalTaskIndex + targetRow;
      
      // Update task order if position changed
      if (newIndex >= 0 && newIndex < taskOrder.length && newIndex !== originalTaskIndex) {
        const newOrder = [...taskOrder];
        const draggedTaskId = newOrder[originalTaskIndex];
        newOrder.splice(originalTaskIndex, 1);
        newOrder.splice(newIndex, 0, draggedTaskId);
        setTaskOrder(newOrder);
        setOriginalTaskIndex(newIndex);
        setDragStart({ x: event.clientX, y: event.clientY });
        setDragOffset({ x: 0, y: 0 });
      }
      return;
    }

    // Handle move type - supports both horizontal and vertical movement
    if (dragType === 'move') {
      // Always show visual feedback for move type
      setDragOffset({ x: deltaX, y: deltaY });
      
      // Only update time when crossing horizontal grid boundaries
      if (daysDelta !== 0) {
        const startDate = new Date(dragTask.scheduled_date);
        const endDate = new Date(dragTask.deadline || dragTask.scheduled_date);
        
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);
        newStartDate.setDate(startDate.getDate() + daysDelta);
        newEndDate.setDate(endDate.getDate() + daysDelta);

        // Update task with new dates
        if (onTaskUpdate) {
          onTaskUpdate(dragTask.id, {
            scheduled_date: newStartDate.toISOString().split('T')[0],
            deadline: newEndDate.toISOString().split('T')[0]
          });
        }

        // Update drag start position for continuous dragging
        setDragStart({ x: event.clientX, y: event.clientY });
        setDragOffset({ x: 0, y: 0 });
      }
      return;
    }

    // Handle horizontal dragging (time adjustment) - only update when crossing grid boundaries
    if ((dragType === 'left' || dragType === 'right') && daysDelta !== 0) {
      // Calculate new dates based on drag type with strict boundary alignment
      const startDate = new Date(dragTask.scheduled_date);
      const endDate = new Date(dragTask.deadline || dragTask.scheduled_date);

      let newStartDate = new Date(startDate);
      let newEndDate = new Date(endDate);

      if (dragType === 'left') {
        newStartDate.setDate(startDate.getDate() + daysDelta);
        // Ensure start date doesn't go beyond end date and maintain minimum 1 day duration
        if (newStartDate >= endDate) {
          newStartDate = new Date(endDate);
          newStartDate.setDate(endDate.getDate() - 1);
        }
      } else if (dragType === 'right') {
        newEndDate.setDate(endDate.getDate() + daysDelta);
        // Ensure end date doesn't go before start date and maintain minimum 1 day duration
        if (newEndDate <= startDate) {
          newEndDate = new Date(startDate);
          newEndDate.setDate(startDate.getDate() + 1);
        }
      }

      // Update task with new dates
      if (onTaskUpdate) {
        onTaskUpdate(dragTask.id, {
          scheduled_date: newStartDate.toISOString().split('T')[0],
          deadline: newEndDate.toISOString().split('T')[0]
        });
      }

      // Update drag start position for continuous dragging
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    // Reset all drag states
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setDragTask(null);
    setDragType(null);
    setOriginalTaskIndex(-1);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupTask && !(event.target as Element).closest('.task-popup')) {
        closePopup();
      }
    };

    if (popupTask) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popupTask]);

  // Initialize task order when tasks change
  useEffect(() => {
    if (tasks.length > 0 && taskOrder.length === 0) {
      setTaskOrder(tasks.map(t => t.id));
    }
  }, [tasks]);

  // Mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragTask, dragType, dragStart, viewMode]);

  const parseTimeRange = (timeStr: string) => {
    if (!timeStr) return null;

    const matches = timeStr.match(/(\d+):?(\d+)?[\s-]*(?:(\d+):?(\d+)?)?/);
    if (!matches) return null;

    const startHour = parseInt(matches[1]);
    const startMin = parseInt(matches[2] || '0');
    let endHour = matches[3] ? parseInt(matches[3]) : startHour + 1;
    const endMin = matches[4] ? parseInt(matches[4]) : 0;

    if (endHour <= startHour) endHour = startHour + 1;

    return { startHour, startMin, endHour, endMin };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTodayPosition = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewMode === 'day') {
      const viewStart = new Date(dayViewStart);
      viewStart.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff * DAY_WIDTH + DAY_WIDTH / 2;
    } else {
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();
      const viewStartMonth = monthViewStart.getMonth();
      const viewStartYear = monthViewStart.getFullYear();
      const monthsDiff = (todayYear - viewStartYear) * 12 + (todayMonth - viewStartMonth);
      const dayInMonth = today.getDate();
      const daysInMonth = new Date(todayYear, todayMonth + 1, 0).getDate();
      return monthsDiff * MONTH_WIDTH + (dayInMonth / daysInMonth) * MONTH_WIDTH;
    }
  };

  const scrollToPrevious = () => {
    if (viewMode === 'day') {
      const newDate = new Date(currentViewDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentViewDate(newDate);
    } else {
      const newDate = new Date(currentViewDate);
      newDate.setMonth(newDate.getMonth() - 3);
      setCurrentViewDate(newDate);
    }
  };

  const scrollToNext = () => {
    if (viewMode === 'day') {
      const newDate = new Date(currentViewDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentViewDate(newDate);
    } else {
      const newDate = new Date(currentViewDate);
      newDate.setMonth(newDate.getMonth() + 3);
      setCurrentViewDate(newDate);
    }
  };

  const scrollToToday = () => {
    setCurrentViewDate(new Date());
    setTimeout(() => {
      if (scrollRef.current) {
        const todayPos = getTodayPosition();
        scrollRef.current.scrollLeft = todayPos - scrollRef.current.clientWidth / 2;
      }
    }, 100);
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const selectedDateTasks = selectedDate
    ? tasks.filter(t => t.scheduled_date === selectedDate)
    : [];

  useEffect(() => {
    if (scrollRef.current && viewMode === 'day') {
      const todayPos = getTodayPosition();
      scrollRef.current.scrollLeft = todayPos - scrollRef.current.clientWidth / 2;
    }
  }, [viewMode]);

  return (
    <div className="space-y-4">
      <Card className="bg-white rounded-3xl shadow-lg border-3 border-black overflow-hidden">
        <div className="p-6 border-b-3 border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-gray-900" />
              <h2 className="text-2xl font-bold text-gray-900">
                Task Timeline
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-2xl p-1 border-2 border-gray-300">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                    viewMode === 'day'
                      ? 'bg-[#62D5E1] text-white shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Daily View
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                    viewMode === 'month'
                      ? 'bg-[#62D5E1] text-white shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Monthly View
                </button>
              </div>

              <Button
                onClick={scrollToPrevious}
                variant="outline"
                size="sm"
                className="rounded-xl border-2 border-black"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                onClick={scrollToToday}
                variant="default"
                size="sm"
                className="bg-[#FFB366] hover:bg-[#FF9028] text-white rounded-xl border-2 border-black"
              >
                Today
              </Button>

              <Button
                onClick={scrollToNext}
                variant="outline"
                size="sm"
                className="rounded-xl border-2 border-black"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-700">
            {viewMode === 'day' ? 'Scroll horizontally to see more dates, click on a date to view details' : 'Scroll horizontally to see more months'}
          </p>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="relative" style={{
              width: viewMode === 'day' ? days.length * DAY_WIDTH : months.length * MONTH_WIDTH,
              minHeight: Math.max(tasks.length * ROW_HEIGHT + 100, 400)
            }}>
              {viewMode === 'day' ? (
                <div className="flex border-b-3 border-gray-300 sticky top-0 bg-white z-20">
                  {days.map((date, index) => (
                    <div
                      key={index}
                      onClick={() => handleDayClick(date)}
                      className={`flex-shrink-0 text-center py-4 border-r-2 border-gray-200 cursor-pointer transition-colors ${
                        isToday(date)
                          ? 'bg-[#FFE5D9]'
                          : 'hover:bg-gray-50'
                      } ${
                        selectedDate === date.toISOString().split('T')[0]
                          ? 'ring-2 ring-[#FFB366]'
                          : ''
                      }`}
                      style={{ width: DAY_WIDTH }}
                    >
                      <div className="text-xs text-gray-600">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday(date) ? 'text-[#FF9028]' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex border-b-3 border-gray-300 sticky top-0 bg-white z-20">
                  {months.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === new Date().getMonth() &&
                                          date.getFullYear() === new Date().getFullYear();
                    return (
                      <div
                        key={index}
                        className={`flex-shrink-0 text-center py-4 border-r-2 border-gray-200 ${
                          isCurrentMonth ? 'bg-[#FFE5D9]' : ''
                        }`}
                        style={{ width: MONTH_WIDTH }}
                      >
                        <div className={`text-lg font-bold ${
                          isCurrentMonth ? 'text-[#FF9028]' : 'text-gray-900'
                        }`}>
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xs text-gray-600">
                          {date.getFullYear()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                {(viewMode === 'day' ? days : months).map((_, index) => (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-700"
                    style={{
                      left: index * (viewMode === 'day' ? DAY_WIDTH : MONTH_WIDTH),
                      width: viewMode === 'day' ? DAY_WIDTH : MONTH_WIDTH
                    }}
                  />
                ))}
              </div>

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                style={{ left: getTodayPosition() }}
              >
                <div className="absolute -top-2 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
                <div className="absolute top-0 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Today
                </div>
              </div>

              <div className="relative pt-20">
                {(() => {
                  // Sort tasks based on taskOrder
                  const orderedTasks = taskOrder.length > 0
                    ? taskOrder.map(id => tasks.find(t => t.id === id)).filter(Boolean) as Task[]
                    : tasks;
                  
                  return orderedTasks.map((task, taskIndex) => {
                    const position = calculateTaskPosition(task);
                    if (!position.visible) return null;

                    const progress = getTaskProgress(task);
                    const colorScheme = taskColors[taskIndex % taskColors.length];

                  return (
                    <div
                      key={task.id}
                      className="absolute"
                      style={{
                        left: position.left,
                        top: taskIndex * ROW_HEIGHT,
                        width: position.width,
                        height: ROW_HEIGHT - 10
                      }}
                    >
                      <div
                        className="relative h-full rounded-xl shadow-lg hover:shadow-xl transition-all border-3 border-black overflow-hidden group hover:scale-105"
                        style={{ 
                          backgroundColor: colorScheme.light,
                          transform: isDragging && dragTask?.id === task.id 
                            ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` 
                            : 'none',
                          transition: isDragging ? 'none' : 'all 0.2s ease'
                        }}
                      >
                        {/* Left resize handle */}
                        <div
                          onMouseDown={(e) => handleMouseDown(task, e, 'left', taskIndex)}
                          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-black/40 transition-all duration-150 z-30"
                          title="Drag to resize start time"
                        />
                        
                        {/* Right resize handle */}
                        <div
                          onMouseDown={(e) => handleMouseDown(task, e, 'right', taskIndex)}
                          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-black/40 transition-all duration-150 z-30"
                          title="Drag to resize end time"
                        />

                        {/* Main task area - entire area supports dragging */}
                        <div
                          onClick={(e) => {
                            // Only trigger click if not near edges
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            if (x > 8 && x < rect.width - 8) {
                              handleTaskClick(task, e);
                            }
                          }}
                          onMouseDown={(e) => {
                            // Determine drag type based on click position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            
                            // Check if click is near left or right edges for time adjustment
                            if (x < 8) {
                              handleMouseDown(task, e, 'left', taskIndex);
                            } else if (x > rect.width - 8) {
                              handleMouseDown(task, e, 'right', taskIndex);
                            } else {
                              // Entire center area - default to vertical dragging for reordering
                              handleMouseDown(task, e, 'vertical', taskIndex);
                            }
                          }}
                          className="relative h-full cursor-grab active:cursor-grabbing"
                          title={`${task.title} - ${Math.round(progress)}% \u5b8c\u6210`}
                        >
                          <div
                            className="absolute inset-y-0 left-0 transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: colorScheme.dark
                            }}
                          />

                          <div className="relative h-full p-2 flex items-center justify-between z-10">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-xs line-clamp-1">
                                {task.title}
                              </h4>
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="text-xs text-gray-700 mt-0.5">
                                  {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} \u5929
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              {task.status === 'completed' && (
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-black">
                                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <span className="text-xs font-bold text-gray-900">
                                {Math.round(progress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {selectedDate && selectedDateTasks.length > 0 && (
        <Card className="bg-white rounded-3xl shadow-lg border-3 border-black p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ZoomIn className="w-5 h-5 text-gray-900" />
              {new Date(selectedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })} Detailed Schedule
            </h3>
            <Button
              onClick={() => setSelectedDate(null)}
              variant="ghost"
              size="sm"
              className="rounded-xl border-2 border-black"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {selectedDateTasks
              .sort((a, b) => {
                const timeA = a.scheduled_time || '00:00';
                const timeB = b.scheduled_time || '00:00';
                return timeA.localeCompare(timeB);
              })
              .map((task, index) => {
                const progress = getTaskProgress(task);
                const taskIndex = tasks.findIndex(t => t.id === task.id);
                const colorScheme = taskColors[taskIndex % taskColors.length];

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border-3 border-black"
                    style={{ backgroundColor: colorScheme.light }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg flex-1">{task.title}</h4>
                      {task.status === 'completed' && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-black">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {task.scheduled_time && (
                      <div className="flex items-center gap-2 text-gray-800 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{task.scheduled_time}</span>
                      </div>
                    )}

                    {task.description && (
                      <p className="text-sm text-gray-700 mb-3">{task.description}</p>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-800 mb-1">
                        <span>Completion Progress</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-white/60 rounded-full overflow-hidden border-2 border-gray-300">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: colorScheme.dark
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Task Popup */}
      {popupTask && (
        <div
          className="task-popup fixed z-50 bg-white rounded-2xl shadow-2xl border-3 border-black p-4 max-w-sm"
          style={{
            left: `${popupPosition.x - 150}px`,
            top: `${popupPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
              {isEditMode ? 'Edit Task' : popupTask.title}
            </h3>
            <div className="flex items-center gap-1">
              {!isEditMode && (
                <button
                  onClick={startEdit}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit task"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={closePopup}
                className="ml-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          {isEditMode ? (
            // Edit Mode
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#B2B2B2]"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#B2B2B2]"
                  placeholder="Enter task description"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editForm.scheduled_date || ''}
                    onChange={(e) => setEditForm({...editForm, scheduled_date: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#B2B2B2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={editForm.scheduled_time || ''}
                    onChange={(e) => setEditForm({...editForm, scheduled_time: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#B2B2B2]"
                    placeholder="e.g. 9-11 AM"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={editForm.deadline || ''}
                    onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#B2B2B2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editForm.priority || 'medium'}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value as 'high' | 'medium' | 'low'})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#B2B2B2]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveEdit}
                  className="flex-1 px-3 py-1 bg-purple-500 text-white text-sm rounded-xl hover:bg-purple-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-3 py-1 bg-gray-500 text-white text-sm rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {new Date(popupTask.scheduled_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              {popupTask.scheduled_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{popupTask.scheduled_time}</span>
                </div>
              )}
              
              {popupTask.deadline && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 font-medium">
                    Due: {new Date(popupTask.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Priority:</span>
                <span className={`font-medium ${
                  popupTask.priority === 'high' ? 'text-red-600' :
                  popupTask.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {popupTask.priority === 'high' ? 'High' : 
                   popupTask.priority === 'medium' ? 'Medium' : 'Low'}
                </span>
              </div>
              
              {popupTask.description && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-xs line-clamp-3">
                    {popupTask.description}
                  </p>
                </div>
              )}
              
              {popupTask.subtasks && popupTask.subtasks.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Subtasks ({popupTask.subtasks.filter(s => s.completed).length}/{popupTask.subtasks.length})
                  </div>
                  <div className="space-y-1">
                    {popupTask.subtasks.slice(0, 3).map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          subtask.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className={`line-clamp-1 ${
                          subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                    {popupTask.subtasks.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{popupTask.subtasks.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
