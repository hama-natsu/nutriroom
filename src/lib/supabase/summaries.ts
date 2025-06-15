// 🎯 日次サマリー管理CRUD操作
// NutriRoom Phase 2.3: 「今日のお手紙」システム基盤

import { supabase, getCurrentUserId } from './client'
import { 
  DailySummary, 
  DailySummaryInsert, 
  DailySummaryUpdate,
  ConversationLog 
} from '@/types/database'
import { getTodayConversationLogs } from './sessions'

// ===============================
// 日次サマリー管理機能
// ===============================

/**
 * 今日のサマリー取得または作成
 */
export const getTodaySummary = async (characterId: string): Promise<DailySummary | null> => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const today = new Date().toISOString().split('T')[0]

    // 既存のサマリーを検索
    const { data: existingSummary, error: fetchError } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .eq('date', today)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Failed to fetch daily summary:', fetchError)
      return null
    }

    // 既存のサマリーがあれば返す
    if (existingSummary) {
      return existingSummary
    }

    // 新しいサマリーを作成
    const newSummary: DailySummaryInsert = {
      user_id: userId,
      character_id: characterId,
      date: today,
      session_count: 0,
      total_messages: 0,
      main_topics: [],
      emotions_detected: []
    }

    const { data: createdSummary, error: createError } = await supabase
      .from('daily_summaries')
      .insert(newSummary)
      .select()
      .single()

    if (createError) {
      console.error('Failed to create daily summary:', createError)
      return null
    }

    console.log('✅ Daily summary created:', {
      date: today,
      characterId,
      userId: userId.substring(0, 8) + '...'
    })

    return createdSummary
  } catch (error) {
    console.error('Error getting today summary:', error)
    return null
  }
}

/**
 * 日次サマリー更新
 */
export const updateDailySummary = async (
  summaryId: string,
  updates: DailySummaryUpdate
): Promise<DailySummary | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_summaries')
      .update(updates)
      .eq('id', summaryId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update daily summary:', error)
      return null
    }

    console.log('✅ Daily summary updated:', {
      summaryId: summaryId.substring(0, 8) + '...',
      updatedFields: Object.keys(updates)
    })

    return data
  } catch (error) {
    console.error('Error updating daily summary:', error)
    return null
  }
}

/**
 * 会話ログから統計を生成してサマリー更新
 */
export const updateSummaryFromConversations = async (
  characterId: string
): Promise<DailySummary | null> => {
  try {
    // 今日のサマリー取得
    const summary = await getTodaySummary(characterId)
    if (!summary) return null

    // 今日の会話ログ取得
    const conversations = await getTodayConversationLogs(characterId)
    
    // 統計計算（メッセージ総数は conversations.length で取得）
    
    // 感情分析
    const emotions = conversations
      .filter(c => c.emotion_detected)
      .map(c => c.emotion_detected!)
    
    const uniqueEmotions = [...new Set(emotions)]
    
    // トピック抽出（簡易版）
    const topics = extractTopicsFromConversations(conversations)
    
    // セッション数計算（ユニークセッションID）
    const sessionIds = [...new Set(conversations.map(c => c.session_id))]
    
    // サマリー更新データ
    const updates: DailySummaryUpdate = {
      session_count: sessionIds.length,
      total_messages: conversations.length,
      emotions_detected: uniqueEmotions,
      main_topics: topics
    }

    const updatedSummary = await updateDailySummary(summary.id, updates)

    console.log('📊 Summary updated from conversations:', {
      characterId,
      sessionCount: sessionIds.length,
      totalMessages: conversations.length,
      emotions: uniqueEmotions.length,
      topics: topics.length
    })

    return updatedSummary
  } catch (error) {
    console.error('Error updating summary from conversations:', error)
    return null
  }
}

/**
 * お手紙コンテンツを設定
 */
export const setLetterContent = async (
  summaryId: string,
  letterContent: string
): Promise<DailySummary | null> => {
  try {
    const updates: DailySummaryUpdate = {
      letter_content: letterContent
    }

    const updatedSummary = await updateDailySummary(summaryId, updates)

    console.log('💌 Letter content set:', {
      summaryId: summaryId.substring(0, 8) + '...',
      contentLength: letterContent.length
    })

    return updatedSummary
  } catch (error) {
    console.error('Error setting letter content:', error)
    return null
  }
}

/**
 * ユーザーの日次サマリー履歴取得
 */
export const getUserDailySummaries = async (
  characterId?: string,
  limit: number = 7
): Promise<DailySummary[]> => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    let query = supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (characterId) {
      query = query.eq('character_id', characterId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to get user daily summaries:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting user daily summaries:', error)
    return []
  }
}

// ===============================
// ヘルパー関数
// ===============================

/**
 * 会話ログからトピックを抽出（簡易版）
 */
function extractTopicsFromConversations(conversations: ConversationLog[]): string[] {
  const topics: string[] = []
  
  // 栄養・食事関連キーワード
  const nutritionKeywords = ['栄養', '食事', '野菜', '果物', '肉', '魚', 'カロリー', 'ビタミン']
  // 健康関連キーワード
  const healthKeywords = ['健康', '運動', '睡眠', '体重', 'ダイエット', '病気']
  // 感情関連キーワード
  const emotionKeywords = ['嬉しい', '悲しい', '不安', '楽しい', 'ストレス', '疲れ']
  
  const allContent = conversations
    .map(c => c.message_content)
    .join(' ')
    .toLowerCase()
  
  if (nutritionKeywords.some(keyword => allContent.includes(keyword))) {
    topics.push('栄養・食事')
  }
  
  if (healthKeywords.some(keyword => allContent.includes(keyword))) {
    topics.push('健康管理')
  }
  
  if (emotionKeywords.some(keyword => allContent.includes(keyword))) {
    topics.push('感情・気持ち')
  }
  
  // 会話の長さから判定
  if (conversations.length > 10) {
    topics.push('深い会話')
  }
  
  return topics.length > 0 ? topics : ['日常会話']
}

/**
 * デバッグ用サマリー情報表示
 */
export const debugDailySummary = async (characterId: string): Promise<void> => {
  try {
    const summary = await getTodaySummary(characterId)
    const conversations = await getTodayConversationLogs(characterId)
    
    console.log('📊 Daily Summary Debug:', {
      characterId,
      summary: summary ? {
        id: summary.id.substring(0, 8) + '...',
        date: summary.date,
        sessionCount: summary.session_count,
        totalMessages: summary.total_messages,
        hasLetter: !!summary.letter_content,
        topics: summary.main_topics,
        emotions: summary.emotions_detected
      } : null,
      conversationsToday: conversations.length,
      uniqueSessions: [...new Set(conversations.map(c => c.session_id))].length
    })
  } catch (error) {
    console.error('Error debugging daily summary:', error)
  }
}