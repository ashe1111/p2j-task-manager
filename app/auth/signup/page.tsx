'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/utils/supabaseBrowser'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string|null>(null)
  const [err, setErr] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createSupabaseBrowser()
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    setMsg(null)
    
    console.log('尝试注册:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email, 
      password, 
      options: { 
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          username: email.split('@')[0],
          xp: 0,
          level: 1,
          ai_personality: 'warm',
          daily_goal_count: 5
        }
      }
    })
    
    console.log('注册结果:', { data, error })
    
    setLoading(false)
    
    if (error) {
      console.error('注册错误:', error.message)
      setErr(error.message)
    } else {
      console.log('注册成功')
      setMsg('注册成功，请到邮箱验证')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

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
          {msg ? (
            <div className="p-4 rounded-md bg-green-50 text-green-600 text-center">
              <p className="font-medium">{msg}</p>
              <Link href="/auth/signin" className="mt-4 inline-block text-sm text-green-700 underline">
                返回登录页面
              </Link>
            </div>
          ) : (
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
                    注册中...
                  </>
                ) : (
                  '注册'
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-sm text-center text-muted-foreground">
          已有账户？{' '}
          <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
            登录
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}