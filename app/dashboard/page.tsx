import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './client';

export const metadata: Metadata = {
  title: '仪表盘',
  description: '查看您的任务和进度',
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  
  // 获取用户会话
  const { data: { session } } = await supabase.auth.getSession();
  
  // 如果没有会话，重定向到登录页
  if (!session) {
    redirect('/auth/signin');
  }
  
  // 获取用户数据
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // 如果用户不存在，使用默认数据
  const user = userData || {
    id: session.user.id,
    username: session.user.email?.split('@')[0] || 'User',
    xp: 0,
    level: 1,
    ai_personality: 'warm',
    daily_goal_count: 5,
  };

  return <DashboardClient user={user} email={session.user.email || ''} />;
}