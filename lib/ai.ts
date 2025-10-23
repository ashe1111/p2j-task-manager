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
  const { systemPrompt, tone } = PERSONALITIES[personality];

  const prompt = `${systemPrompt}

Your task description: ${userInput}

Please break down this task into a reasonable daily plan. Requirements:

1. Analyze the complexity of the task and break it down into 3-7 sub-tasks
2. Set the priority for each sub-task (high/medium/low)
3. Allocate it to the following days reasonably
4. Append the suggested time range for each task (e.g. "9-11 AM")
5. Use ${tone} tone to give an encouraging short sentence

Return JSON format (only return JSON array, no other content):
[
  {
    "title": "Task Title",
    "description": "Detailed description and encouraging sentence in ${tone} tone",
    "priority": "high|medium|low",
    "scheduled_date": "YYYY-MM-DD",
    "scheduled_time": "Suggested time range",
    "xp_reward": 10
  }
]

Note:
- scheduled_date starts from today
- High-priority tasks should be scheduled first
- No more than 3 tasks per day
- Today's date is ${new Date().toISOString().split('T')[0]}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : '',
        'X-Title': 'P2J Task Planner',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const tasks = JSON.parse(jsonMatch[0]);

    return tasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: 'pending' as const,
      scheduled_date: task.scheduled_date,
      scheduled_time: task.scheduled_time,
      xp_reward: task.xp_reward || 10,
      ai_generated: true,
    }));
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
  const { systemPrompt, tone } = PERSONALITIES[personality];

  const prompt = `${systemPrompt}

This week's data:
- Completion rate: ${completionRate.toFixed(1)}%
- Total tasks: ${totalTasks}
- Completed: ${completedTasks}

Please generate a summary report in ${tone} tone (30-50 words), evaluate this week's performance and give suggestions for next week.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : '',
        'X-Title': 'P2J Weekly Summary',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return 'This week went well! Keep up the momentum, next week will be even better!';
  }
}
