import { Task } from './store';

const PERSONALITIES = {
  warm: {
    systemPrompt: 'You are a warm and considerate time planning assistant, encouraging the user like a mentor. Use a warm tone to give suggestions.',
    tone: 'Warm and encouraging',
  },
  savage: {
    systemPrompt: 'You are a sarcastic but effective time planning assistant, encouraging the user with sharp humor. Don\'t be too mean, keep it friendly.',
    tone: 'Sarcastic and humorous',
  },
  rational: {
    systemPrompt: 'You are a rational and efficient time planning assistant, focused on logic and efficiency, providing professional time management advice.',
    tone: 'Rational and professional',
  },
};

export async function generateAISchedule(
  userInput: string,
  personality: 'warm' | 'savage' | 'rational' = 'warm'
): Promise<Omit<Task, 'id' | 'created_at'>[]> {
  try {
    const response = await fetch('/api/generate-schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput,
        personality,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.tasks;
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    throw error;
  }
}

export async function generateWeeklySummary(
  completionRate: number,
  totalTasks: number,
  completedTasks: number,
  personality: 'warm' | 'savage' | 'rational' = 'warm'
): Promise<string> {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completionRate,
        totalTasks,
        completedTasks,
        personality,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return 'This week went well! Keep up the momentum, next week will be even better!';
  }
}