'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">注册</CardTitle>
          <CardDescription>
            创建一个新账户以开始使用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="signup" />
        </CardContent>
        <CardFooter className="text-sm text-center text-muted-foreground">
          已有账户？{' '}
          <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
            登录
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}