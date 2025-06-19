// 🎯 リアルタイム会話データ収集システム
// NutriRoom Phase 2.3-実用版: 突然の離脱でもデータ保護

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  addConversationLog, 
  startSession, 
  getCurrentActiveSession
} from '@/lib/supabase/sessions'
import { updateSummaryFromConversations } from '@/lib/supabase/summaries'
import { supabase } from '@/lib/supabase/client'

// Supabaseクライアント型定義
interface WindowWithSupabase extends Window {
  supabase?: unknown;
}

// セッション設定
const SESSION_TIMEOUT = 6 * 60 * 60 * 1000 // 6時間無応答で休眠
const HEARTBEAT_INTERVAL = 30 * 1000 // 30秒ごとにハートビート

export interface ConversationLoggerState {
  sessionId: string | null
  isLogging: boolean
  messageCount: number
  lastActivity: Date | null
}

export interface SaveMessageParams {
  message: string
  type: 'user' | 'ai'
  voiceFile?: string
  emotionDetected?: string
}

/**
 * リアルタイム会話ログ収集Hook
 * ユーザー体験を損なわない透明な動作
 */
export const useConversationLogger = (characterId: string) => {
  const [state, setState] = useState<ConversationLoggerState>({
    sessionId: null,
    isLogging: false,
    messageCount: 0,
    lastActivity: null
  })

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const initializationRef = useRef<boolean>(false)

  // 🔥 Supabaseクライアント初期化確認
  useEffect(() => {
    // window.supabase設定（デバッグ用）
    if (typeof window !== 'undefined') {
      (window as WindowWithSupabase).supabase = supabase
      console.log('🔧 Supabase client attached to window:', !!supabase)
    }

    // Supabaseクライアント存在確認
    if (!supabase) {
      console.error('❌ CRITICAL: Supabase client not initialized!')
      return
    }

    console.log('✅ Supabase client initialized successfully')
  }, [])

  // ハートビート（セッション活性状態維持）
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }

    heartbeatRef.current = setInterval(() => {
      setState(prev => {
        if (!prev.lastActivity) return prev

        const timeSinceLastActivity = Date.now() - prev.lastActivity.getTime()
        
        // 6時間無応答でセッション休眠
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          if (process.env.NODE_ENV === 'development') {
            console.log('😴 Session going dormant due to inactivity')
          }
          return {
            ...prev,
            isLogging: false
          }
        }

        return prev
      })
    }, HEARTBEAT_INTERVAL)
  }, [])

  // セッション初期化（一度だけ実行）
  const initializeSession = useCallback(async () => {
    if (initializationRef.current) {
      console.log('🔄 Session already initialized, skipping...')
      return
    }

    try {
      console.log('🚀 Initializing conversation session for character:', characterId)
      initializationRef.current = true
      
      // 既存のアクティブセッションを検索
      console.log('🔍 Checking for existing active session...')
      let session = await getCurrentActiveSession(characterId)
      
      if (!session) {
        console.log('📝 No existing session found, creating new session...')
        // 新しいセッションを開始
        session = await startSession(characterId)
        if (session) {
          console.log('✅ New session created successfully:', session.id.substring(0, 8) + '...')
        } else {
          console.error('❌ Failed to create new session')
        }
      } else {
        console.log('🔄 Resuming existing session:', session.id.substring(0, 8) + '...')
      }

      if (session) {
        console.log('🎯 Setting session state - sessionId:', session.id.substring(0, 8) + '...', 'isLogging: true')
        setState(prev => ({
          ...prev,
          sessionId: session!.id,
          isLogging: true,
          lastActivity: new Date()
        }))

        // ハートビート開始
        startHeartbeat()
        console.log('💓 Heartbeat started for session')
      } else {
        console.error('❌ No session available - conversation logging will not work')
      }
    } catch (error) {
      console.error('❌ Failed to initialize session:', error)
      console.error('❌ Detailed error:', JSON.stringify(error, null, 2))
    }
  }, [characterId, startHeartbeat])

  // メッセージ保存（メイン機能）
  const saveMessage = useCallback(async ({
    message,
    type,
    voiceFile,
    emotionDetected
  }: SaveMessageParams): Promise<boolean> => {
    console.log('🔥 SAVE MESSAGE CALLED:', {
      message: message.substring(0, 100) + '...',
      type,
      voiceFile,
      emotionDetected,
      sessionId: state.sessionId?.substring(0, 8) + '...',
      isLogging: state.isLogging
    })

    // 🔥 Supabaseクライアント確認
    if (!supabase) {
      console.error('❌ CRITICAL: Supabase client not available for save operation!')
      return false
    }

    if (!state.sessionId || !state.isLogging) {
      console.error('🔥 SAVE MESSAGE FAILED - NO SESSION:', {
        sessionId: state.sessionId,
        isLogging: state.isLogging,
        sessionState: state
      })
      return false
    }

    try {
      console.log('📝 Saving message to database:', {
        sessionId: state.sessionId.substring(0, 8) + '...',
        type,
        messageLength: message.length,
        voiceFile,
        emotionDetected
      })

      // 栄養トピック自動タグ付け
      const nutritionTags = extractNutritionTags(message)
      const taggedEmotion = emotionDetected || (nutritionTags.length > 0 ? 'nutrition_focused' : undefined)

      // Supabaseに即座に保存
      const logEntry = await addConversationLog(
        state.sessionId,
        type,
        message,
        voiceFile || undefined,
        taggedEmotion
      )
      
      console.log('💾 Database save attempt result:', logEntry ? 'SUCCESS' : 'FAILED')

      if (logEntry) {
        setState(prev => ({
          ...prev,
          messageCount: prev.messageCount + 1,
          lastActivity: new Date()
        }))

        console.log('🔥 SAVE MESSAGE SUCCESS:', {
          logEntryId: logEntry.id,
          type,
          messageLength: message.length,
          voiceFile,
          emotion: taggedEmotion,
          nutritionTags: nutritionTags.length > 0 ? nutritionTags : undefined,
          newMessageCount: state.messageCount + 1
        })

        // 非同期で日次サマリー更新（UIブロックしない）
        setTimeout(async () => {
          try {
            await updateSummaryFromConversations(characterId)
          } catch (error) {
            console.warn('⚠️ Failed to update daily summary:', error)
          }
        }, 100)

        return true
      } else {
        console.error('🔥 SAVE MESSAGE FAILED - NO LOG ENTRY RETURNED')
        return false
      }
    } catch (error) {
      console.error('🔥 SAVE MESSAGE EXCEPTION:', error)
      console.error('🔥 Error details:', JSON.stringify(error, null, 2))
      return false
    }
  }, [state, characterId])

  // 初期化（characterIdが変更された時のみ実行）
  useEffect(() => {
    initializeSession()

    // クリーンアップ
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
      // Reset initialization flag when component unmounts or characterId changes
      initializationRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]) // Changed to depend only on characterId

  // タブ離脱時の処理
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.sessionId && state.messageCount > 0) {
        // 最後の活動時間を更新（ベストエフォート）
        navigator.sendBeacon('/api/session/heartbeat', JSON.stringify({
          sessionId: state.sessionId,
          timestamp: new Date().toISOString()
        }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.sessionId, state.messageCount])

  return {
    saveMessage,
    sessionState: state,
    isReady: !!state.sessionId && state.isLogging
  }
}

// ===============================
// ヘルパー関数
// ===============================

/**
 * 栄養関連トピック自動抽出
 */
function extractNutritionTags(message: string): string[] {
  const tags: string[] = []
  const lowerMessage = message.toLowerCase()

  // 栄養素関連
  const nutrients = ['タンパク質', 'ビタミン', 'ミネラル', 'カルシウム', '鉄分', '食物繊維']
  if (nutrients.some(nutrient => lowerMessage.includes(nutrient.toLowerCase()))) {
    tags.push('栄養素')
  }

  // 食材関連
  const foods = ['野菜', '果物', '肉', '魚', '穀物', '乳製品', '豆類']
  if (foods.some(food => lowerMessage.includes(food))) {
    tags.push('食材')
  }

  // 食事パターン関連
  const mealPatterns = ['朝食', '昼食', '夕食', 'おやつ', 'ダイエット', '減量', '増量']
  if (mealPatterns.some(pattern => lowerMessage.includes(pattern))) {
    tags.push('食事パターン')
  }

  // 健康関連
  const health = ['健康', '病気', 'アレルギー', '体重', '血圧', '血糖値']
  if (health.some(h => lowerMessage.includes(h))) {
    tags.push('健康管理')
  }

  // 調理関連
  const cooking = ['料理', '調理', 'レシピ', '作り方', '調味料']
  if (cooking.some(c => lowerMessage.includes(c))) {
    tags.push('調理')
  }

  return tags
}

/**
 * デバッグ用ログ状態表示
 */
export const debugConversationLogger = (state: ConversationLoggerState): void => {
  console.log('📊 Conversation Logger Debug:', {
    sessionId: state.sessionId?.substring(0, 8) + '...',
    isLogging: state.isLogging,
    messageCount: state.messageCount,
    lastActivity: state.lastActivity?.toLocaleString('ja-JP'),
    timeSinceLastActivity: state.lastActivity 
      ? Math.round((Date.now() - state.lastActivity.getTime()) / 1000 / 60) + ' minutes'
      : 'N/A'
  })
}