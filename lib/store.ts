import { create } from 'zustand';

export interface SubTask {
  id: string;
  date: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  scheduled_date: string;
  scheduled_time?: string;
  startDate?: string;
  deadline?: string;
  subtasks?: SubTask[];
  xp_reward: number;
  ai_generated: boolean;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  xp: number;
  level: number;
  ai_personality: 'warm' | 'savage' | 'rational';
  daily_goal_count: number;
}

export interface DailyMood {
  id: string;
  mood: string;
  date: string;
}

interface TaskStore {
  tasks: Task[];
  user: User;
  moods: DailyMood[];

  addTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  updateUser: (updates: Partial<User>) => void;
  addXP: (amount: number) => void;

  setMood: (mood: string, date: string) => void;

  loadFromStorage: () => void;
  saveToStorage: () => void;
}

function generateSubtasks(startDate: string, deadline: string, taskTitle: string): SubTask[] {
  const start = new Date(startDate);
  const end = new Date(deadline);
  const subtasks: SubTask[] = [];

  const currentDate = new Date(start);
  let dayCount = 1;

  while (currentDate <= end) {
    subtasks.push({
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: currentDate.toISOString().split('T')[0],
      title: `Day ${dayCount} - ${taskTitle}`,
      completed: false,
    });

    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }

  return subtasks;
}

const defaultUser: User = {
  id: 'default-user',
  username: 'Anonymous User',
  xp: 0,
  level: 1,
  ai_personality: 'warm',
  daily_goal_count: 5,
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  user: defaultUser,
  moods: [],

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    set(state => ({
      tasks: [...state.tasks, newTask],
    }));

    get().saveToStorage();
  },

  updateTask: (id, updates) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));

    get().saveToStorage();
  },

  deleteTask: (id) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id),
    }));

    get().saveToStorage();
  },

  completeTask: (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (task && task.status !== 'completed') {
      get().updateTask(id, { status: 'completed' });
      get().addXP(task.xp_reward);
    }
  },

  toggleSubtask: (taskId, subtaskId) => {
    set(state => ({
      tasks: state.tasks.map(task => {
        if (task.id === taskId && task.subtasks) {
          const updatedSubtasks = task.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );

          const completedCount = updatedSubtasks.filter(s => s.completed).length;
          const totalCount = updatedSubtasks.length;
          const allCompleted = completedCount === totalCount;

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: allCompleted ? 'completed' as const : task.status,
          };
        }
        return task;
      }),
    }));

    get().saveToStorage();
  },

  updateUser: (updates) => {
    set(state => ({
      user: { ...state.user, ...updates },
    }));

    get().saveToStorage();
  },

  addXP: (amount) => {
    set(state => {
      const newXP = state.user.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;

      return {
        user: {
          ...state.user,
          xp: newXP,
          level: newLevel,
        },
      };
    });

    get().saveToStorage();
  },

  setMood: (mood, date) => {
    set(state => {
      const existingMoodIndex = state.moods.findIndex(m => m.date === date);

      if (existingMoodIndex >= 0) {
        const updatedMoods = [...state.moods];
        updatedMoods[existingMoodIndex] = { ...updatedMoods[existingMoodIndex], mood };
        return { moods: updatedMoods };
      }

      return {
        moods: [
          ...state.moods,
          {
            id: `mood-${Date.now()}`,
            mood,
            date,
          },
        ],
      };
    });

    get().saveToStorage();
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;

    const storedTasks = localStorage.getItem('p2j-tasks');
    const storedUser = localStorage.getItem('p2j-user');
    const storedMoods = localStorage.getItem('p2j-moods');

    if (storedTasks) {
      set({ tasks: JSON.parse(storedTasks) });
    }

    if (storedUser) {
      set({ user: JSON.parse(storedUser) });
    }

    if (storedMoods) {
      set({ moods: JSON.parse(storedMoods) });
    }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;

    const { tasks, user, moods } = get();
    localStorage.setItem('p2j-tasks', JSON.stringify(tasks));
    localStorage.setItem('p2j-user', JSON.stringify(user));
    localStorage.setItem('p2j-moods', JSON.stringify(moods));
  },
}));
