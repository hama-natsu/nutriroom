// 🎯 NutriRoom Phase 2.1: スマート音声選択エンジンの型定義

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night'
export type EmotionState = 'energetic' | 'normal' | 'tired' | 'excited' | 'calm' | 'worried'
export type InteractionContext = 'greeting' | 'response' | 'encouragement' | 'explanation' | 'goodbye'
export type VoicePattern = 'early' | 'normal' | 'late' | 'cheerful' | 'calm' | 'energetic' | 'gentle'

// キャラクター音声設定
export interface CharacterVoiceProfile {
  characterId: string
  preferredPatterns: VoicePattern[]
  timeSlotPreferences: {
    [key in TimeSlot]: VoicePattern[]
  }
  emotionMappings: {
    [key in EmotionState]: VoicePattern[]
  }
  contextMappings: {
    [key in InteractionContext]: VoicePattern[]
  }
}

// 音声選択リクエスト
export interface VoiceSelectionRequest {
  characterId: string
  timeSlot?: TimeSlot
  emotionState?: EmotionState
  interactionContext?: InteractionContext
  userMessage?: string
  conversationHistory?: string[]
}

// 音声選択結果
export interface VoiceSelectionResult {
  fileName: string
  filePath: string
  pattern: VoicePattern
  confidence: number
  fallbackOptions: string[]
  selectionReason: string
}

// 音声ファイル情報
export interface VoiceFileInfo {
  fileName: string
  exists: boolean
  size?: number
  lastModified?: number
}

// スマート音声エンジン設定
export interface SmartVoiceConfig {
  baseAudioPath: string
  supportedFormats: string[]
  fallbackEnabled: boolean
  cacheEnabled: boolean
  debugMode: boolean
}