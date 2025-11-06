'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabaseClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const authFormSchema = z.object({
  email: z.string().email({
    message: '请输入有效的电子邮箱地址',
  }),
  password: z.string().min(6, {
    message: '密码至少需要6个字符',
  }),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps {
  type: 'signin' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    setErrorMessage('');
    
    console.log(`尝试${type === 'signup' ? '注册' : '登录'}:`, values.email);

    try {
      if (type === 'signup') {
        console.log('调用 Supabase signUp API...');
        // 修改重定向 URL 为本地地址
        const redirectUrl = `http://localhost:3000/auth/callback`;
        console.log('重定向 URL:', redirectUrl);
        
        const { data, error } = await supabaseClient.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: values.email.split('@')[0],
              xp: 0,
              level: 1,
              ai_personality: 'warm',
              daily_goal_count: 5
            }
          },
        });

        console.log('Supabase 响应:', { data, error });

        if (error) {
          setErrorMessage(error.message);
          console.error('注册错误:', error);
          toast.error(error.message || '注册失败，请重试');
          return;
        }

        console.log('注册成功:', data);
        toast.success('注册成功！请检查您的邮箱进行验证。');
        router.push('/auth/signin');
      } else {
        // 登录前先检查用户是否已经验证了邮箱
        console.log('调用 Supabase signInWithPassword API...');
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        console.log('Supabase 登录响应:', { data, error });

        if (error) {
          // 处理特定的错误消息
          if (error.message.includes('Email not confirmed')) {
            setErrorMessage('请先验证您的邮箱，然后再登录。');
            toast.error('请先验证您的邮箱，然后再登录。');
          } else if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('邮箱或密码不正确，请重试。');
            toast.error('邮箱或密码不正确，请重试。');
          } else {
            setErrorMessage(error.message);
            toast.error(error.message || '登录失败，请重试');
          }
          return;
        }

        console.log('登录成功:', data);
        toast.success('登录成功！');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      console.error(`${type === 'signup' ? '注册' : '登录'}过程中出现异常:`, error);
      setErrorMessage(error.message || '认证过程中出现错误');
      toast.error(error.message || '认证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mb-4">
            {errorMessage}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>电子邮箱</FormLabel>
              <FormControl>
                <Input
                  placeholder="your.email@example.com"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={type === 'signup' ? 'new-password' : 'current-password'}
                    disabled={isLoading}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? '隐藏密码' : '显示密码'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {type === 'signin' ? '登录中...' : '注册中...'}
            </>
          ) : (
            <>{type === 'signin' ? '登录' : '注册'}</>
          )}
        </Button>
      </form>
    </Form>
  );
}