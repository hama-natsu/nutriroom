// 🎯 NutriRoom Phase 2.2: 応答パターン制御システムの型定義

export type ResponseType = 'voice_only' | 'text_only' | 'voice_and_text'
export type ResponseCategory = 'greeting' | 'acknowledgment' | 'explanation' | 'advice' | 'encouragement' | 'question' | 'goodbye'
export type ResponsePriority = 'low' | 'medium' | 'high' | 'critical'

// 応答パターン判定の結果
export interface ResponsePattern {
  type: ResponseType
  category: ResponseCategory
  priority: ResponsePriority
  reason: string
  confidence: number
}

// 応答コンテンツ
export interface ResponseContent {
  text?: string
  voiceRequired: boolean
  textRequired: boolean
  urgency: ResponsePriority
}

// キャラクター別応答設定
export interface CharacterResponseProfile {
  characterId: string
  personalityType: string
  voicePreference: number // 0-1の範囲（0=テキスト重視, 1=音声重視）
  categoryPreferences: {
    [key in ResponseCategory]: ResponseType
  }
  lengthThresholds: {
    shortResponse: number  // この文字数以下は音声のみ
    longResponse: number   // この文字数以上はテキストのみ
  }
  specialPatterns: {
    excitement: ResponseType      // 興奮時
    concern: ResponseType        // 心配時
    encouragement: ResponseType  // 励まし時
  }
}

// 応答制御リクエスト
export interface ResponseControlRequest {
  characterId: string
  responseText: string
  userMessage: string
  conversationHistory: string[]
  context?: {
    isFirstInteraction?: boolean
    userEmotionState?: string
    topicComplexity?: 'simple' | 'medium' | 'complex'
    urgency?: ResponsePriority
  }
}

// 応答制御結果
export interface ResponseControlResult {
  pattern: ResponsePattern
  content: ResponseContent
  timing: {
    voiceDelay: number    // 音声再生開始までの遅延(ms)
    textDelay: number     // テキスト表示開始までの遅延(ms)
    voiceDuration?: number // 推定音声再生時間(ms)
  }
  fallbackOptions: ResponseType[]
}

// 応答実行状態
export interface ResponseExecutionState {
  isVoicePlaying: boolean
  isTextDisplaying: boolean
  voiceStarted: boolean
  textStarted: boolean
  completed: boolean
  error?: string
}