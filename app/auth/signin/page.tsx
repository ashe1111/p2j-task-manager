'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>
            输入您的电子邮箱和密码登录账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="signin" />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/auth/forgot-password" className="text-primary underline-offset-4 hover:underline">
              忘记密码？
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            还没有账户？{' '}
            <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
              注册
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}