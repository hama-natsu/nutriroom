// 🎯 セッション管理CRUD操作
// NutriRoom Phase 2.3: ユーザーセッションの作成・管理

import { supabase, getCurrentUserId } from './client'
import { 
  UserSession, 
  UserSessionInsert,
  ConversationLog,
  ConversationLogInsert 
} from '@/types/database'

// Types for joined queries
interface ConversationLogWithSession extends ConversationLog {
  user_sessions: {
    id: string
    user_id: string
    character_id: string
    created_at: string
  }
}


// Type for debug function all logs query
interface ConversationLogDebugAll {
  id: string
  message_type: 'user' | 'ai'
  message_content: string
  timestamp: string
  user_sessions: {
    character_id: string
    user_id: string
  }
}

// ===============================
// セッション管理機能
// ===============================

/**
 * 新しいセッションを開始（認証なしでも動作）
 */
export const startSession = async (characterId: string): Promise<UserSession | null> => {
  try {
    const userId = await getCurrentUserId()
    
    // 緊急修正: 認証なしでも動作するように、匿名ユーザーIDを生成
    const effectiveUserId = userId || 'anonymous-' + Date.now()
    
    console.log('🚀 Starting session:', {
      characterId,
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
      effectiveUserId: effectiveUserId.substring(0, 12) + '...'
    })

    // 既存のアクティブセッションを終了（認証済みユーザーのみ）
    if (userId) {
      await endActiveSessionsForUser(userId, characterId)
    }

    const sessionData: UserSessionInsert = {
      user_id: effectiveUserId,
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
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous'
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
 * 現在のアクティブセッション取得（認証なしでも動作）
 */
export const getCurrentActiveSession = async (characterId: string): Promise<UserSession | null> => {
  try {
    const userId = await getCurrentUserId()
    
    // 認証なしの場合は、最新のアクティブセッションを取得
    let query = supabase
      .from('user_sessions')
      .select('*')
      .eq('character_id', characterId)
      .eq('session_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
    
    // 認証済みユーザーの場合は、そのユーザーのセッションのみ
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.single()

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
 * 今日の会話ログ取得（セッションなし対応版）
 */
export const getTodayConversationLogs = async (characterId: string): Promise<ConversationLogWithSession[]> => {
  try {
    console.log('🔍 getTodayConversationLogs called with:', { characterId })
    
    const userId = await getCurrentUserId()
    console.log('👤 User ID:', userId ? userId.substring(0, 8) + '...' : 'anonymous')

    // 直近24時間の会話を取得（今日だけでなく）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const now = new Date()
    
    console.log('📅 Fetching conversations between:', {
      from: oneDayAgo.toISOString(),
      to: now.toISOString(),
      characterId
    })

    // まずセッション結合ありで試す
    let query = supabase
      .from('conversation_logs')
      .select(`
        id,
        session_id,
        message_type,
        message_content,
        voice_file_used,
        emotion_detected,
        timestamp,
        created_at,
        user_sessions!inner (
          id,
          user_id,
          character_id,
          created_at
        )
      `)
      .eq('user_sessions.character_id', characterId)
      .gte('timestamp', oneDayAgo.toISOString())
      .lte('timestamp', now.toISOString())
      .order('timestamp', { ascending: false })
      .limit(50) // 最新50件
    
    // 認証済みユーザーの場合は、そのユーザーのログのみ
    if (userId) {
      query = query.eq('user_sessions.user_id', userId)
    }
    
    const { data, error } = await query

    // セッション結合が失敗した場合、セッションなしのログを取得
    if (error || !data || data.length === 0) {
      console.log('⚠️ Session-joined query failed or returned no results, trying session-less query...')
      console.log('Session query error:', error?.message || 'No error, but no data')
      
      // セッションなしで直接ログを取得
      const { data: sessionlessData, error: sessionlessError } = await supabase
        .from('conversation_logs')
        .select('*')
        .gte('timestamp', oneDayAgo.toISOString())
        .lte('timestamp', now.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50)
      
      if (sessionlessError) {
        console.error('❌ Sessionless query also failed:', sessionlessError)
        return []
      }
      
      if (sessionlessData && sessionlessData.length > 0) {
        console.log('✅ Found', sessionlessData.length, 'sessionless logs')
        
        // セッションなしログを擬似的にConversationLogWithSession形式に変換
        const pseudoSessionLogs: ConversationLogWithSession[] = sessionlessData.map(log => ({
          ...log,
          created_at: log.timestamp, // created_atがない場合はtimestampを使用
          user_sessions: {
            id: 'sessionless',
            user_id: userId || 'anonymous',
            character_id: characterId,
            created_at: log.timestamp
          }
        }))
        
        console.log('📊 Converted sessionless logs to pseudo-session format:', pseudoSessionLogs.length, 'logs')
        return pseudoSessionLogs
      }
    }
    
    console.log('🔍 Database query result (session-joined):', {
      error: error?.message || 'none',
      dataLength: data?.length || 0,
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
      characterId
    })

    if (error) {
      console.error('❌ Failed to get today conversation logs:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return []
    }

    if (!data || data.length === 0) {
      console.log('📭 No session-joined conversation logs found')
      return []
    }

    console.log('✅ Found session-joined conversation logs:', {
      count: data.length,
      characterId,
      firstLogTime: data[data.length - 1]?.timestamp,
      lastLogTime: data[0]?.timestamp,
      sampleContent: data.slice(0, 3).map(log => ({
        type: log.message_type,
        content: log.message_content.substring(0, 50) + '...',
        timestamp: log.timestamp
      }))
    })

    return (data as unknown as ConversationLogWithSession[]) || []
  } catch (error) {
    console.error('❌ Error getting today conversation logs:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return []
  }
}

/**
 * 会話ログのデバッグ確認（緊急デバッグ用）
 */
export const debugConversationLogs = async (characterId: string): Promise<void> => {
  try {
    console.log('🔍 === Conversation Logs Debug ===')
    
    const userId = await getCurrentUserId()
    console.log('👤 Current User ID:', userId?.substring(0, 8) + '...')
    
    if (!userId) {
      console.log('❌ No user ID - user not authenticated')
      return
    }

    // 1. 全ての会話ログを確認
    console.log('📋 1. Checking all conversation logs for user...')
    const { data: allLogs, error: allError } = await supabase
      .from('conversation_logs')
      .select(`
        id,
        message_type,
        message_content,
        timestamp,
        user_sessions!inner (
          character_id,
          user_id
        )
      `)
      .eq('user_sessions.user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(20)
    
    if (allError) {
      console.error('❌ Error fetching all logs:', allError)
    } else {
      console.log('📊 Total recent logs found:', allLogs?.length || 0)
      ;(allLogs as unknown as ConversationLogDebugAll[])?.forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.user_sessions?.character_id}] ${log.message_type}: ${log.message_content.substring(0, 50)}... (${log.timestamp})`)
      })
    }

    // 2. 特定キャラクターの会話ログを確認
    console.log(`📋 2. Checking logs for character: ${characterId}`)
    const characterLogs = await getTodayConversationLogs(characterId)
    console.log('📊 Character-specific logs found:', characterLogs.length)

    // 3. アクティブセッション確認
    console.log('📋 3. Checking active sessions...')
    const activeSession = await getCurrentActiveSession(characterId)
    console.log('🎯 Active session:', activeSession ? {
      id: activeSession.id.substring(0, 8) + '...',
      character_id: activeSession.character_id,
      status: activeSession.session_status,
      created_at: activeSession.created_at
    } : 'NONE')

    console.log('✅ Debug complete')
  } catch (error) {
    console.error('❌ Debug function error:', error)
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
      characters_used: Array.from(new Set(data.map(s => s.character_id)))
    }

    console.log('📊 Session Stats:', stats)
    return stats
  } catch (error) {
    console.error('Error getting session stats:', error)
    return null
  }
}

// ブラウザ環境でのデバッグ関数公開
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugConversationLogs = debugConversationLogs;
  (window as unknown as Record<string, unknown>).getTodayConversationLogs = getTodayConversationLogs;
  
  console.log('🔍 Conversation debug functions available:');
  console.log('- debugConversationLogs(characterId) : 会話ログ詳細デバッグ');
  console.log('- getTodayConversationLogs(characterId) : 今日の会話ログ取得');
}