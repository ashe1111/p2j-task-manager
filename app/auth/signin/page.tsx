'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/utils/supabaseBrowser'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    
    console.log('尝试登录:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    console.log('登录结果:', { data, error })
    
    setLoading(false)
    
    if (error) {
      console.error('登录错误:', error.message)
      return setErr(error.message)
    }
    
    console.log('登录成功，跳转到仪表板')
    router.replace('/dashboard')
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

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
          <form onSubmit={onSubmit} className="space-y-6">
            {err && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mb-4">
                {err}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="your.email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
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
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>
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
  )
}