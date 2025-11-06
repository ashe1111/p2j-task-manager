'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/utils/supabaseBrowser'
import DashboardClient from './client'
import { User } from '@/lib/store'

// 强制动态渲染
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        // 获取当前用户
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !authUser) {
          console.error('未登录或获取用户信息失败:', userError?.message)
          router.replace('/auth/signin')
          return
        }
        
        setEmail(authUser.email || '')
        
        // 获取用户数据
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (dbError) {
          console.error('获取用户数据失败:', dbError.message)
        }
        
        // 如果用户不存在，使用默认数据
        const userProfile = userData || {
          id: authUser.id,
          username: authUser.email?.split('@')[0] || 'User',
          xp: 0,
          level: 1,
          ai_personality: 'warm',
          daily_goal_count: 5,
        }
        
        setUser(userProfile as User)
      } catch (error) {
        console.error('检查用户时出错:', error)
        router.replace('/auth/signin')
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">加载中...</p>
      </div>
    )
  }
  
  if (!user) return null
  
  return <DashboardClient user={user} email={email} />
}