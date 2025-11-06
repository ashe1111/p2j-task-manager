'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// 确保环境变量已正确加载
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 环境变量。请确保 .env.local 文件包含必要的配置。');
}

export const supabaseClient = createClientComponentClient<Database>({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
});