// 🎯 セッションハートビートAPI
// タブ離脱時の最後の活動時間更新用

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const { error } = await supabase
      .from('user_sessions')
      .update({ 
        updated_at: timestamp 
      })
      .eq('id', sessionId)
      .eq('session_status', 'active')

    if (error) {
      console.error('Failed to update session heartbeat:', error)
      return NextResponse.json(
        { error: 'Failed to update heartbeat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Heartbeat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}