'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Callback() {
  const router = useRouter()
  const [status, setStatus] = useState('正在验证登录中...')

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
  }, [router])

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
