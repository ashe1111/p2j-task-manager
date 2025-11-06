'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/utils/supabaseBrowser'
import { AuthError } from '@supabase/supabase-js'

export default function CallbackPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [text, setText] = useState('正在为你登录…')
  
  useEffect(() => {
    console.log('📩 正在执行 exchangeCodeForSession...')
    
    supabase.auth.exchangeCodeForSession(window.location.href)
      .then(({ data, error }: { data: any, error: AuthError | null }) => {
        if (error) {
          console.error('❌ exchange 错误:', error.message)
          setText(`登录失败：${error.message}`)
        } else {
          console.log('✅ 登录成功:', data)
          setText('登录成功！正在跳转...')
          setTimeout(() => router.replace('/dashboard'), 1000)
        }
      })
      .catch((err: Error) => {
        console.error('⚠️ 异常:', err)
        setText(`异常: ${String(err)}`)
      })
  }, [])
  
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
      <h3>{text}</h3>
    </div>
  )
}