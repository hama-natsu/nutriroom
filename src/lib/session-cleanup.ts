// 🎯 緩やかなセッション管理システム
// NutriRoom Phase 2.3-実用版: 自然な日次区切り + バックグラウンド整理

// import { supabase } from '@/lib/supabase' // 現在未使用

// セッション管理設定
export const SESSION_CONFIG = {
  TIMEOUT_HOURS: 6,                    // 6時間無応答で休眠
  DAILY_CUTOFF_HOUR: 0,               // 毎日0時で前日完了扱い
  CLEANUP_INTERVAL_MINUTES: 30,       // 30分ごとにクリーンアップ
  DORMANT_DAYS_THRESHOLD: 7           // 7日間休眠で自動アーカイブ
} as const

export interface SessionCleanupStats {
  dormantSessions: number
  completedSessions: number
  archivedSessions: number
  processedAt: Date
}

/**
 * 緩やかなセッション状態管理
 * 厳密な境界ではなく、自然な時間ベース整理
 */
export class FlexibleSessionManager {
  
  /**
   * 無応答セッションを休眠状態に移行
   */
  static async markDormantSessions(): Promise<number> {
    try {
      const timeoutThreshold = new Date()
      timeoutThreshold.setHours(timeoutThreshold.getHours() - SESSION_CONFIG.TIMEOUT_HOURS)

      // TODO: user_sessionsテーブルが存在しないため、現在はダミー処理
      console.log('Session cleanup: timeout threshold', timeoutThreshold.toISOString())
      const data = [] // ダミー

      const count = data?.length || 0
      if (count > 0 && process.env.NODE_ENV === 'development') {
        console.log(`😴 Marked ${count} sessions as dormant (6+ hours inactive)`)
      }

      return count
    } catch (error) {
      console.error('❌ Error marking dormant sessions:', error)
      return 0
    }
  }

  /**
   * 翌日0時で前日セッションを完了扱い
   */
  static async completePreviousDaySessions(): Promise<number> {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(23, 59, 59, 999)

      // TODO: user_sessionsテーブルが存在しないため、現在はダミー処理
      console.log('Session cleanup: finalizing old sessions before', yesterday.toISOString())
      const data = [] // ダミー

      // エラーハンドリング（現在はダミー処理のため不要）

      const count = data?.length || 0
      if (count > 0 && process.env.NODE_ENV === 'development') {
        console.log(`📅 Completed ${count} sessions from previous days`)
      }

      return count
    } catch (error) {
      console.error('❌ Error completing previous day sessions:', error)
      return 0
    }
  }

  /**
   * 古い休眠セッションをアーカイブ
   */
  static async archiveOldSessions(): Promise<number> {
    try {
      const archiveThreshold = new Date()
      archiveThreshold.setDate(archiveThreshold.getDate() - SESSION_CONFIG.DORMANT_DAYS_THRESHOLD)

      // TODO: user_sessionsテーブルが存在しないため、現在はダミー処理
      console.log('Session cleanup: archiving sessions older than', archiveThreshold.toISOString())
      const data = [] // ダミー

      const count = data?.length || 0
      if (count > 0 && process.env.NODE_ENV === 'development') {
        console.log(`📦 Archived ${count} old dormant sessions (7+ days)`)
      }

      return count
    } catch (error) {
      console.error('❌ Error archiving old sessions:', error)
      return 0
    }
  }

  /**
   * 包括的なセッションクリーンアップ実行
   */
  static async performCleanup(): Promise<SessionCleanupStats> {
    const startTime = new Date()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Starting session cleanup...')
    }

    const [dormantSessions, completedSessions, archivedSessions] = await Promise.all([
      this.markDormantSessions(),
      this.completePreviousDaySessions(),
      this.archiveOldSessions()
    ])

    const stats: SessionCleanupStats = {
      dormantSessions,
      completedSessions,
      archivedSessions,
      processedAt: new Date()
    }

    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - startTime.getTime()
      console.log('✅ Session cleanup completed:', {
        ...stats,
        durationMs: duration
      })
    }

    return stats
  }

  /**
   * 日次境界での自動処理（毎日0時実行想定）
   */
  static async performDailyCutoff(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌅 Performing daily cutoff (00:00 JST)')
      }

      // 1. 前日のセッションを完了
      await this.completePreviousDaySessions()

      // 2. 日次サマリー最終更新
      await this.updateAllDailySummaries()

      // 3. お手紙生成準備（22:00実行想定のフラグ設定）
      await this.markLetterGenerationReady()

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Daily cutoff completed')
      }
    } catch (error) {
      console.error('❌ Error in daily cutoff:', error)
    }
  }

  /**
   * 全ユーザーの日次サマリー更新
   */
  private static async updateAllDailySummaries(): Promise<void> {
    try {
      // 昨日完了したセッションの日次サマリーを更新
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // TODO: user_sessionsテーブルが存在しないため、現在はダミー処理
      console.log('Updating daily summaries for', yesterdayStr)
      const sessionsToUpdate = [
        { user_id: 'dummy-user-1', character_id: 'akari' }
      ] // ダミーデータ

      if (!sessionsToUpdate) return

      // ユニークなユーザー・キャラクター組み合わせ
      const uniqueCombinations = Array.from(
        new Set(sessionsToUpdate.map(s => `${s.user_id}:${s.character_id}`))
      ).map(combo => {
        const [user_id, character_id] = combo.split(':')
        return { user_id, character_id }
      })

      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Updating ${uniqueCombinations.length} daily summaries`)
      }

      // 各組み合わせの日次サマリーを更新（非並列で負荷軽減）
      for (const { user_id, character_id } of uniqueCombinations) {
        try {
          const { updateSummaryFromConversations } = await import('@/lib/supabase/summaries')
          await updateSummaryFromConversations(character_id)
        } catch (error) {
          console.warn(`⚠️ Failed to update summary for ${user_id}:${character_id}`, error)
        }
      }
    } catch (error) {
      console.error('❌ Error updating daily summaries:', error)
    }
  }

  /**
   * お手紙生成準備フラグ設定
   */
  private static async markLetterGenerationReady(): Promise<void> {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // TODO: daily_summariesテーブルが存在しないため、現在はダミー処理
      console.log('Marking letter generation ready for', yesterdayStr)
    } catch (error) {
      console.error('❌ Error marking letter generation ready:', error)
    }
  }
}

/**
 * バックグラウンドクリーンアップの開始
 * 実本番環境ではcronジョブやVercel Functionsで実行推奨
 */
export const startBackgroundCleanup = (): NodeJS.Timeout | null => {
  if (typeof window === 'undefined') {
    // サーバーサイドでのみ実行
    return setInterval(async () => {
      await FlexibleSessionManager.performCleanup()
    }, SESSION_CONFIG.CLEANUP_INTERVAL_MINUTES * 60 * 1000)
  }
  
  return null
}

/**
 * デバッグ用セッション状態確認
 */
export const debugSessionState = async (): Promise<void> => {
  try {
    // TODO: user_sessionsテーブルが存在しないため、現在はダミー処理
    const sessions = [
      { session_status: 'active', count: 0 },
      { session_status: 'completed', count: 0 },
      { session_status: 'interrupted', count: 0 }
    ]

    console.log('📊 Current Session State:', sessions)
  } catch (error) {
    console.error('❌ Error debugging session state:', error)
  }
}