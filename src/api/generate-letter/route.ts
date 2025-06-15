// 🎯 NutriRoom Phase 2.4: 毎晩22:00自動お手紙生成API
// Vercel Cron Jobs対応エンドポイント

import { NextRequest, NextResponse } from 'next/server'
import { DailyLetterGenerator } from '@/lib/letter-generator'
import { getUserSessions, getCurrentUserId } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Cron Job認証（本番環境では適切な認証トークンを使用）
    const authHeader = request.headers.get('authorization')
    const cronToken = process.env.CRON_SECRET_TOKEN || 'development-token'
    
    if (authHeader !== `Bearer ${cronToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🌙 Starting evening letter generation job...')
    
    const stats = {
      totalUsers: 0,
      lettersGenerated: 0,
      errors: 0,
      startTime: new Date()
    }

    // すべてのアクティブユーザーのお手紙を生成
    const result = await generateAllUserLetters(stats)

    console.log('✅ Evening letter generation completed:', {
      ...result,
      duration: Date.now() - stats.startTime.getTime() + 'ms'
    })

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Letter generation job failed:', error)
    return NextResponse.json(
      { 
        error: 'Letter generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * 全ユーザーのお手紙生成
 */
async function generateAllUserLetters(stats: any) {
  try {
    // 昨日のアクティブセッションを持つユーザーを取得
    const { data: activeSessions, error } = await (await import('@/lib/supabase')).supabase
      .from('user_sessions')
      .select('user_id, character_id')
      .eq('session_status', 'completed')
      .gte('end_time', getYesterdayStart())
      .lt('end_time', getTodayStart())

    if (error) {
      console.error('❌ Failed to fetch active sessions:', error)
      return { ...stats, errors: stats.errors + 1 }
    }

    if (!activeSessions || activeSessions.length === 0) {
      console.log('📭 No active sessions found for yesterday')
      return stats
    }

    // ユニークなユーザー・キャラクター組み合わせ
    const uniqueCombinations = Array.from(
      new Set(activeSessions.map(s => `${s.user_id}:${s.character_id}`))
    ).map(combo => {
      const [user_id, character_id] = combo.split(':')
      return { user_id, character_id }
    })

    stats.totalUsers = uniqueCombinations.length
    console.log(`📮 Generating letters for ${stats.totalUsers} user-character combinations`)

    // 各組み合わせのお手紙を生成（並列処理で効率化）
    const letterPromises = uniqueCombinations.map(async ({ user_id, character_id }) => {
      try {
        // ユーザー名取得（オプション）
        const userName = await getUserDisplayName(user_id)
        
        // お手紙生成
        const letter = await DailyLetterGenerator.generateDailyLetter(
          character_id,
          userName
        )

        if (letter) {
          stats.lettersGenerated++
          console.log(`✅ Letter generated for user ${user_id.substring(0, 8)}... with ${character_id}`)
          return { success: true, user_id, character_id }
        } else {
          console.log(`📭 No letter generated for user ${user_id.substring(0, 8)}... (no conversations)`)
          return { success: false, user_id, character_id, reason: 'no_conversations' }
        }
      } catch (error) {
        stats.errors++
        console.error(`❌ Failed to generate letter for user ${user_id.substring(0, 8)}...`, error)
        return { success: false, user_id, character_id, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })

    // 並列実行（ただし負荷制限のため5件ずつ）
    const results = []
    for (let i = 0; i < letterPromises.length; i += 5) {
      const batch = letterPromises.slice(i, i + 5)
      const batchResults = await Promise.all(batch)
      results.push(...batchResults)
      
      // バッチ間に短い停止（API負荷軽減）
      if (i + 5 < letterPromises.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return {
      ...stats,
      results: results.filter(r => !r.success), // エラーのみ記録
      successCount: results.filter(r => r.success).length
    }

  } catch (error) {
    console.error('❌ Error in generateAllUserLetters:', error)
    return { ...stats, errors: stats.errors + 1 }
  }
}

/**
 * ユーザー表示名取得（実装は認証システムに依存）
 */
async function getUserDisplayName(userId: string): Promise<string | undefined> {
  try {
    // 実際の実装では auth.users テーブルや user_profiles テーブルから取得
    // 現在は簡略化してunefined
    return undefined
  } catch (error) {
    console.warn('⚠️ Failed to get user display name:', error)
    return undefined
  }
}

/**
 * 日付ヘルパー関数
 */
function getYesterdayStart(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  return yesterday.toISOString()
}

function getTodayStart(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
}

// 手動テスト用（開発環境のみ）
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    console.log('🧪 Manual letter generation test...')
    
    // テスト用のお手紙生成
    const letter = await DailyLetterGenerator.generateDailyLetter('akari', 'テストユーザー')
    
    return NextResponse.json({
      success: true,
      letter,
      message: 'Test letter generated successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}