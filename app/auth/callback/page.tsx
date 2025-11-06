'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export default function Callback() {
  const router = useRouter()
  const [status, setStatus] = useState('正在验证登录中...')
  
  // 使用 createClientComponentClient 替代直接创建客户端
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const exchange = async () => {
      try {
        console.log('📩 正在执行 exchangeCodeForSession...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (error) {
          console.error('❌ exchange 错误:', error.message)
          setStatus('登录失败: ' + error.message)
        } else {
          console.log('✅ 登录成功:', data)
          setStatus('登录成功！正在跳转...')
          setTimeout(() => router.push('/dashboard'), 1000)
        }
      } catch (err) {
        console.error('⚠️ 异常:', err)
        setStatus('异常: ' + String(err))
      }
    }

    exchange()
  }, [router, supabase])

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h3>{status}</h3>
    </div>
  )
}