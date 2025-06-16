// 🎯 セッション管理CRUD操作
// NutriRoom Phase 2.3: ユーザーセッションの作成・管理

import { supabase, getCurrentUserId } from './client'
import { 
  UserSession, 
  UserSessionInsert,
  ConversationLog,
  ConversationLogInsert 
} from '@/types/database'

// ===============================
// セッション管理機能
// ===============================

/**
 * 新しいセッションを開始
 */
export const startSession = async (characterId: string): Promise<UserSession | null> => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      console.error('User not authenticated')
      return null
    }

    // 既存のアクティブセッションを終了
    await endActiveSessionsForUser(userId, characterId)

    const sessionData: UserSessionInsert = {
      user_id: userId,
      character_id: characterId,
      session_status: 'active'
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Failed to start session:', error)
      return null
    }

    console.log('✅ Session started:', {
      sessionId: data.id,
      characterId,
      userId: userId.substring(0, 8) + '...'
    })

    return data
  } catch (error) {
    console.error('Error starting session:', error)
    return null
  }
}

/**
 * セッション終了
 */
export const endSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        session_status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Failed to end session:', error)
      return false
    }

    console.log('✅ Session ended:', sessionId)
    return true
  } catch (error) {
    console.error('Error ending session:', error)
    return false
  }
}

/**
 * ユーザーのアクティブセッションを全て終了
 */
export const endActiveSessionsForUser = async (userId: string, characterId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('user_sessions')
      .update({
        session_status: 'interrupted',
        end_time: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('session_status', 'active')

    if (characterId) {
      query = query.eq('character_id', characterId)
    }

    const { error } = await query

    if (error) {
      console.error('Failed to end active sessions:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error ending active sessions:', error)
    return false
  }
}

/**
 * 現在のアクティブセッション取得
 */
export const getCurrentActiveSession = async (characterId: string): Promise<UserSession | null> => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .eq('session_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Failed to get active session:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error getting active session:', error)
    return null
  }
}

/**
 * ユーザーのセッション履歴取得
 */
export const getUserSessions = async (limit: number = 10): Promise<UserSession[]> => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to get user sessions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting user sessions:', error)
    return []
  }
}

// ===============================
// 会話ログ機能
// ===============================

/**
 * 会話ログを追加
 */
export const addConversationLog = async (
  sessionId: string,
  messageType: 'user' | 'ai',
  messageContent: string,
  voiceFileUsed?: string,
  emotionDetected?: string
): Promise<ConversationLog | null> => {
  try {
    console.log('🔄 addConversationLog called with:', {
      sessionId: sessionId.substring(0, 8) + '...',
      messageType,
      messageLength: messageContent.length,
      voiceFileUsed,
      emotionDetected
    })

    const logData: ConversationLogInsert = {
      session_id: sessionId,
      message_type: messageType,
      message_content: messageContent,
      voice_file_used: voiceFileUsed || null,
      emotion_detected: emotionDetected || null
    }

    console.log('📤 Attempting to insert into conversation_logs table with data:', logData)

    const { data, error } = await supabase
      .from('conversation_logs')
      .insert(logData)
      .select()
      .single()

    if (error) {
      console.error('❌ Database insert error:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return null
    }

    console.log('✅ Database insert successful:', data)

    console.log('📝 Conversation logged:', {
      sessionId: sessionId.substring(0, 8) + '...',
      type: messageType,
      contentLength: messageContent.length,
      voiceFile: voiceFileUsed,
      emotion: emotionDetected
    })

    return data
  } catch (error) {
    console.error('Error adding conversation log:', error)
    return null
  }
}

/**
 * セッションの会話ログ取得
 */
export const getSessionConversationLogs = async (sessionId: string): Promise<ConversationLog[]> => {
  try {
    const { data, error } = await supabase
      .from('conversation_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Failed to get conversation logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting conversation logs:', error)
    return []
  }
}

/**
 * 今日の会話ログ取得
 */
export const getTodayConversationLogs = async (characterId: string): Promise<ConversationLog[]> => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('conversation_logs')
      .select(`
        *,
        user_sessions!inner (
          user_id,
          character_id
        )
      `)
      .eq('user_sessions.user_id', userId)
      .eq('user_sessions.character_id', characterId)
      .gte('timestamp', today + 'T00:00:00.000Z')
      .lt('timestamp', today + 'T23:59:59.999Z')
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Failed to get today conversation logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting today conversation logs:', error)
    return []
  }
}

// ===============================
// デバッグ・統計機能
// ===============================

/**
 * セッション統計取得
 */
export const getSessionStats = async (): Promise<{
  total_sessions: number
  active_sessions: number
  completed_sessions: number
  interrupted_sessions: number
  characters_used: string[]
} | null> => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to get session stats:', error)
      return null
    }

    const stats = {
      total_sessions: data.length,
      active_sessions: data.filter(s => s.session_status === 'active').length,
      completed_sessions: data.filter(s => s.session_status === 'completed').length,
      interrupted_sessions: data.filter(s => s.session_status === 'interrupted').length,
      characters_used: [...new Set(data.map(s => s.character_id))]
    }

    console.log('📊 Session Stats:', stats)
    return stats
  } catch (error) {
    console.error('Error getting session stats:', error)
    return null
  }
}