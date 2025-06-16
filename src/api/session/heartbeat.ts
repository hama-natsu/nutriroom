// 🎯 セッションハートビートAPI
// タブ離脱時の最後の活動時間更新用

import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase' // 現在未使用

export async function POST(request: NextRequest) {
  try {
    const { sessionId, timestamp } = await request.json()

    if (!sessionId || !timestamp) {
      return NextResponse.json(
        { error: 'Missing sessionId or timestamp' },
        { status: 400 }
      )
    }

    // セッションの最終活動時間を更新
    // TODO: user_sessionsテーブルが存在しないため、現在はダミー処理
    console.log('Heartbeat received:', { sessionId, timestamp })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Heartbeat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}