import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { userInput, personality = 'warm' } = await request.json();
    
    if (!userInput) {
      return NextResponse.json({ error: 'Missing userInput' }, { status: 400 });
    }

    const { systemPrompt, tone } = PERSONALITIES[personality as keyof typeof PERSONALITIES];

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

    // 使用环境变量获取 API URL 和模型
    const apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    const model = process.env.DEFAULT_MODEL || 'deepseek/deepseek-chat-v3.1';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'X-Title': 'P2J Task Planner',
      },
      body: JSON.stringify({
        model: model,
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

    const formattedTasks = tasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: 'pending' as const,
      scheduled_date: task.scheduled_date,
      scheduled_time: task.scheduled_time,
      xp_reward: task.xp_reward || 10,
      ai_generated: true,
    }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
  }
}