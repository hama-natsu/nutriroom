// 🔧 診断専用API：Supabase接続とRLS設定の検証

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  console.log('🔧 診断API開始')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('環境変数確認:', {
      supabaseUrl: !!supabaseUrl,
      serviceKey: !!serviceKey,
      anonKey: !!anonKey
    })
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        checks: {
          supabaseUrl: !!supabaseUrl,
          serviceKey: !!serviceKey,
          anonKey: !!anonKey
        }
      })
    }
    
    // Service Key使用でSupabaseクライアント作成
    const supabase = createClient(supabaseUrl, serviceKey)
    
    console.log('Supabaseクライアント作成完了')
    
    // シンプルなテストクエリ実行
    console.log('テストクエリ開始...')
    const { data, error } = await supabase
      .from('conversation_logs')
      .select('id')
      .limit(1)
    
    console.log('テストクエリ結果:', { 
      success: !error, 
      error: error?.message,
      dataLength: data?.length 
    })
    
    return NextResponse.json({
      success: true,
      message: 'Diagnostic complete',
      results: {
        environment: {
          supabaseUrl: !!supabaseUrl,
          serviceKey: !!serviceKey,
          anonKey: !!anonKey
        },
        database: {
          connectionSuccess: !error,
          error: error?.message || null,
          testDataFound: (data?.length || 0) > 0
        },
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('診断API エラー:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { testUserId = 'test-user-diagnostic' } = body
  
  console.log('🔧 POST診断API開始:', { testUserId })
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceKey)
    
    // ユーザーフィルタテスト
    console.log('ユーザーフィルタテスト開始...')
    const { data: userFilterTest, error: userFilterError } = await supabase
      .from('conversation_logs')
      .select('id, session_id, user_sessions!inner(user_id)')
      .eq('user_sessions.user_id', testUserId)
      .limit(5)
    
    console.log('ユーザーフィルタテスト結果:', {
      success: !userFilterError,
      error: userFilterError?.message,
      dataLength: userFilterTest?.length
    })
    
    return NextResponse.json({
      success: true,
      message: 'POST Diagnostic complete',
      results: {
        userFilterTest: {
          success: !userFilterError,
          error: userFilterError?.message || null,
          dataCount: userFilterTest?.length || 0,
          sampleData: userFilterTest?.slice(0, 2)
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('POST診断API エラー:', error)
    
    return NextResponse.json({
      success: false,
      error: 'POST Diagnostic failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}