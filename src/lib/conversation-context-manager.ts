// 🎯 NutriRoom 会話文脈管理システム - 挨拶重複防止・セッション管理

import { SessionHistory } from './nutrition-guidance-system'

export interface ConversationSession {
  sessionId: string
  characterId: string
  userId?: string
  startTime: Date
  lastActivity: Date
  messageCount: number
  history: SessionHistory
  isActive: boolean
}

export interface ConversationManager {
  sessions: Map<string, ConversationSession>
  createSession: (characterId: string, userId?: string) => string
  getSession: (sessionId: string) => ConversationSession | null
  updateSession: (sessionId: string, updates: Partial<ConversationSession>) => boolean
  isGreetingNeeded: (sessionId: string) => boolean
  shouldAvoidTimeGreeting: (sessionId: string) => boolean
  cleanupInactiveSessions: () => void
}

// セッション管理クラス
class ConversationContextManager implements ConversationManager {
  public sessions = new Map<string, ConversationSession>()
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30分

  // 新しいセッション作成
  createSession(characterId: string, userId?: string): string {
    const sessionId = this.generateSessionId()
    const now = new Date()
    
    const session: ConversationSession = {
      sessionId,
      characterId,
      userId,
      startTime: now,
      lastActivity: now,
      messageCount: 0,
      history: this.createInitialHistory(),
      isActive: true
    }
    
    this.sessions.set(sessionId, session)
    
    console.log('🆕 New conversation session created:', {
      sessionId: sessionId.substring(0, 8) + '...',
      characterId,
      timestamp: now.toISOString()
    })
    
    return sessionId
  }

  // セッション取得
  getSession(sessionId: string): ConversationSession | null {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      console.warn('⚠️ Session not found:', sessionId.substring(0, 8) + '...')
      return null
    }
    
    // セッションのタイムアウトチェック
    if (this.isSessionExpired(session)) {
      console.log('⏰ Session expired:', sessionId.substring(0, 8) + '...')
      this.sessions.delete(sessionId)
      return null
    }
    
    return session
  }

  // セッション更新
  updateSession(sessionId: string, updates: Partial<ConversationSession>): boolean {
    const session = this.getSession(sessionId)
    
    if (!session) {
      return false
    }
    
    // lastActivityを自動更新
    const updatedSession = {
      ...session,
      ...updates,
      lastActivity: new Date()
    }
    
    this.sessions.set(sessionId, updatedSession)
    
    console.log('🔄 Session updated:', {
      sessionId: sessionId.substring(0, 8) + '...',
      messageCount: updatedSession.messageCount,
      hasGreeted: updatedSession.history.hasGreeted
    })
    
    return true
  }

  // 挨拶が必要かチェック
  isGreetingNeeded(sessionId: string): boolean {
    const session = this.getSession(sessionId)
    
    if (!session) {
      return true // 新セッションなら挨拶が必要
    }
    
    // 初回メッセージかつ未挨拶の場合
    const needsGreeting = !session.history.hasGreeted && session.messageCount === 0
    
    console.log('👋 Greeting check:', {
      sessionId: sessionId.substring(0, 8) + '...',
      needsGreeting,
      hasGreeted: session.history.hasGreeted,
      messageCount: session.messageCount
    })
    
    return needsGreeting
  }

  // 時間帯挨拶の回避が必要かチェック
  shouldAvoidTimeGreeting(sessionId: string): boolean {
    const session = this.getSession(sessionId)
    
    if (!session) {
      return false
    }
    
    // 既に挨拶済みなら時間帯挨拶は避ける
    const shouldAvoid = session.history.hasGreeted || session.messageCount > 1
    
    console.log('🕒 Time greeting check:', {
      sessionId: sessionId.substring(0, 8) + '...',
      shouldAvoid,
      hasGreeted: session.history.hasGreeted,
      messageCount: session.messageCount
    })
    
    return shouldAvoid
  }

  // 非アクティブセッションのクリーンアップ
  cleanupInactiveSessions(): void {
    const now = new Date()
    let cleaned = 0
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(sessionId)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log('🧹 Cleaned up inactive sessions:', {
        cleaned,
        remaining: this.sessions.size,
        timestamp: now.toISOString()
      })
    }
  }

  // プライベートメソッド
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  private createInitialHistory(): SessionHistory {
    return {
      messageCount: 0,
      hasGreeted: false,
      basicInfoCollected: false,
      motivationUnderstood: false,
      constraintsIdentified: false,
      personalAdviceGiven: false,
      lastTopicType: '',
      userGoals: [],
      userConstraints: [],
      userMotivation: '',
      userBasicInfo: {}
    }
  }

  private isSessionExpired(session: ConversationSession): boolean {
    const now = new Date()
    return (now.getTime() - session.lastActivity.getTime()) > this.SESSION_TIMEOUT
  }

  // デバッグ情報取得
  getDebugInfo(): object {
    return {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
      sessionTimeoutMinutes: this.SESSION_TIMEOUT / (60 * 1000),
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        sessionId: id.substring(0, 8) + '...',
        characterId: session.characterId,
        messageCount: session.messageCount,
        hasGreeted: session.history.hasGreeted,
        lastActivity: session.lastActivity.toISOString(),
        isExpired: this.isSessionExpired(session)
      }))
    }
  }
}

// グローバルセッション管理インスタンス
export const conversationManager = new ConversationContextManager()

// 便利関数：セッション作成
export function createConversationSession(characterId: string, userId?: string): string {
  return conversationManager.createSession(characterId, userId)
}

// 便利関数：セッション取得
export function getConversationSession(sessionId: string): ConversationSession | null {
  return conversationManager.getSession(sessionId)
}

// 便利関数：メッセージカウント増加
export function incrementMessageCount(sessionId: string): boolean {
  const session = conversationManager.getSession(sessionId)
  
  if (!session) {
    return false
  }
  
  return conversationManager.updateSession(sessionId, {
    messageCount: session.messageCount + 1
  })
}

// 便利関数：挨拶完了マーク
export function markGreetingCompleted(sessionId: string): boolean {
  const session = conversationManager.getSession(sessionId)
  
  if (!session) {
    return false
  }
  
  const updatedHistory = {
    ...session.history,
    hasGreeted: true
  }
  
  return conversationManager.updateSession(sessionId, {
    history: updatedHistory
  })
}

// 便利関数：栄養指導進捗更新
export function updateNutritionProgress(
  sessionId: string, 
  progressUpdate: Partial<SessionHistory>
): boolean {
  const session = conversationManager.getSession(sessionId)
  
  if (!session) {
    return false
  }
  
  const updatedHistory = {
    ...session.history,
    ...progressUpdate
  }
  
  return conversationManager.updateSession(sessionId, {
    history: updatedHistory
  })
}

// 便利関数：セッション情報の取得（安全）
export function getSessionInfo(sessionId: string): {
  exists: boolean
  needsGreeting: boolean
  shouldAvoidTimeGreeting: boolean
  messageCount: number
  guidanceStage: string
} {
  const session = conversationManager.getSession(sessionId)
  
  if (!session) {
    return {
      exists: false,
      needsGreeting: true,
      shouldAvoidTimeGreeting: false,
      messageCount: 0,
      guidanceStage: 'initial_greeting'
    }
  }
  
  // 栄養指導の段階を判定
  let guidanceStage = 'general_conversation'
  
  if (!session.history.hasGreeted) {
    guidanceStage = 'initial_greeting'
  } else if (!session.history.basicInfoCollected) {
    guidanceStage = 'initial_assessment'
  } else if (!session.history.motivationUnderstood) {
    guidanceStage = 'motivation_inquiry'
  } else if (!session.history.constraintsIdentified) {
    guidanceStage = 'constraint_identification'
  } else if (!session.history.personalAdviceGiven) {
    guidanceStage = 'personalized_advice'
  } else {
    guidanceStage = 'ongoing_support'
  }
  
  return {
    exists: true,
    needsGreeting: conversationManager.isGreetingNeeded(sessionId),
    shouldAvoidTimeGreeting: conversationManager.shouldAvoidTimeGreeting(sessionId),
    messageCount: session.messageCount,
    guidanceStage
  }
}

// 定期クリーンアップ設定
if (typeof window !== 'undefined') {
  // ブラウザ環境でのみ実行
  setInterval(() => {
    conversationManager.cleanupInactiveSessions()
  }, 5 * 60 * 1000) // 5分ごとにクリーンアップ
}

// デバッグ用関数
export function debugConversationManager(): void {
  console.log('🔍 Conversation Manager Debug:')
  console.log('=' .repeat(50))
  console.log(conversationManager.getDebugInfo())
  console.log('=' .repeat(50))
}