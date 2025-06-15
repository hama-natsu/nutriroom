// 🎯 Supabaseクライアント設定
// NutriRoom Phase 2.3: セッション管理基盤

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアント作成（型安全）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 認証状態チェック
export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Auth check error:', error)
    return null
  }
  
  return session
}

// 現在のユーザーID取得
export const getCurrentUserId = async (): Promise<string | null> => {
  const session = await checkAuth()
  return session?.user?.id || null
}

// デバッグ用認証情報表示
export const debugAuth = async () => {
  const session = await checkAuth()
  
  console.log('🔐 Auth Debug:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null
  })
  
  return session
}