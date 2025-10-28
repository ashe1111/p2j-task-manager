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
    const { completionRate, totalTasks, completedTasks, personality = 'warm' } = await request.json();
    
    if (completionRate === undefined || totalTasks === undefined || completedTasks === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { systemPrompt, tone } = PERSONALITIES[personality as keyof typeof PERSONALITIES];

    const prompt = `${systemPrompt}

This week's data:
- Completion rate: ${Number(completionRate).toFixed(1)}%
- Total tasks: ${totalTasks}
- Completed: ${completedTasks}

Please generate a summary report in ${tone} tone (30-50 words), evaluate this week's performance and give suggestions for next week.`;

    // 使用环境变量获取 API URL 和模型
    const apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    const model = process.env.DEFAULT_MODEL || 'deepseek/deepseek-chat-v3.1';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'X-Title': 'P2J Weekly Summary',
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
    const summary = data.choices[0].message.content.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return NextResponse.json({ 
      summary: 'This week went well! Keep up the momentum, next week will be even better!' 
    });
  }
}