// 🎯 NutriRoom Phase 2.1: スマート音声選択エンジン

import { 
  TimeSlot, 
  EmotionState, 
  InteractionContext, 
  VoicePattern, 
  CharacterVoiceProfile,
  VoiceSelectionRequest,
  VoiceSelectionResult,
  VoiceFileInfo,
  SmartVoiceConfig
} from '@/types/voiceTypes'

// デフォルト設定
const DEFAULT_CONFIG: SmartVoiceConfig = {
  baseAudioPath: '/audio/recorded',
  supportedFormats: ['.wav'], // WAVファイルのみサポート
  fallbackEnabled: true,
  cacheEnabled: true,
  debugMode: process.env.NODE_ENV === 'development'
}

// あかりキャラクターの音声プロファイル
const AKARI_VOICE_PROFILE: CharacterVoiceProfile = {
  characterId: 'akari',
  preferredPatterns: ['cheerful', 'gentle', 'normal'],
  timeSlotPreferences: {
    morning: ['cheerful', 'energetic', 'early'],
    afternoon: ['normal', 'gentle', 'cheerful'],
    evening: ['gentle', 'calm', 'normal'],
    night: ['gentle', 'calm', 'late']
  },
  emotionMappings: {
    energetic: ['cheerful', 'energetic', 'early'],
    normal: ['normal', 'gentle', 'cheerful'],
    tired: ['gentle', 'calm', 'late'],
    excited: ['cheerful', 'energetic', 'early'],
    calm: ['gentle', 'calm', 'normal'],
    worried: ['gentle', 'calm', 'normal']
  },
  contextMappings: {
    greeting: ['cheerful', 'early', 'gentle'],
    response: ['normal', 'gentle', 'cheerful'],
    encouragement: ['cheerful', 'energetic', 'early'],
    explanation: ['normal', 'gentle', 'calm'],
    goodbye: ['gentle', 'normal', 'cheerful']
  }
}

// キャラクター音声プロファイル管理
const CHARACTER_PROFILES: Record<string, CharacterVoiceProfile> = {
  akari: AKARI_VOICE_PROFILE
}

/**
 * 現在の時間帯を判定
 */
export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/**
 * ユーザーメッセージから感情状態を推定
 */
export function analyzeEmotionFromMessage(message: string): EmotionState {
  const energeticKeywords = ['元気', '頑張', 'やる気', '楽しい', '嬉しい', '最高']
  const tiredKeywords = ['疲れ', '眠い', 'だるい', '辛い', '大変']
  const excitedKeywords = ['すごい', '最高', 'やった', '感動', '興奮']
  const worriedKeywords = ['心配', '不安', '困った', 'どうしよう', '悩み']
  const calmKeywords = ['落ち着', '静か', '穏やか', 'リラックス']

  const lowerMessage = message.toLowerCase()
  
  if (energeticKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'energetic'
  }
  if (excitedKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'excited'
  }
  if (tiredKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'tired'
  }
  if (worriedKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'worried'
  }
  if (calmKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'calm'
  }
  
  return 'normal'
}

/**
 * インタラクションコンテキストを判定
 */
export function determineInteractionContext(
  userMessage: string, 
  conversationHistory: string[] = []
): InteractionContext {
  const lowerMessage = userMessage.toLowerCase()
  
  // 初回メッセージまたは挨拶の場合
  if (conversationHistory.length === 0 || 
      ['こんにちは', 'おはよう', 'こんばんは', 'はじめまして'].some(greeting => 
        lowerMessage.includes(greeting))) {
    return 'greeting'
  }
  
  // 別れの挨拶
  if (['さようなら', 'また', 'ありがとう', 'バイバイ'].some(farewell => 
      lowerMessage.includes(farewell))) {
    return 'goodbye'
  }
  
  // 励ましが必要な場合
  if (['頑張る', '挑戦', '目標', 'チャレンジ', '努力'].some(encouragement => 
      lowerMessage.includes(encouragement))) {
    return 'encouragement'
  }
  
  // 説明を求められている場合
  if (['なぜ', 'どうして', '理由', '説明', '教えて', 'なに'].some(question => 
      lowerMessage.includes(question))) {
    return 'explanation'
  }
  
  return 'response'
}

/**
 * 音声パターンを選択（優先度ベース）
 */
export function selectVoicePattern(
  characterId: string,
  timeSlot: TimeSlot,
  emotionState: EmotionState,
  interactionContext: InteractionContext
): { pattern: VoicePattern; confidence: number; reason: string } {
  const profile = CHARACTER_PROFILES[characterId]
  if (!profile) {
    return { 
      pattern: 'normal', 
      confidence: 0.3, 
      reason: 'Unknown character, using default pattern' 
    }
  }

  // 各要素からのパターン候補を収集
  const timePatterns = profile.timeSlotPreferences[timeSlot] || []
  const emotionPatterns = profile.emotionMappings[emotionState] || []
  const contextPatterns = profile.contextMappings[interactionContext] || []
  const preferredPatterns = profile.preferredPatterns || []

  // パターンスコア計算
  const patternScores: Record<VoicePattern, number> = {} as Record<VoicePattern, number>
  
  // 時間帯スコア (重み: 25%)
  timePatterns.forEach((pattern, index) => {
    patternScores[pattern] = (patternScores[pattern] || 0) + (0.25 * (timePatterns.length - index) / timePatterns.length)
  })
  
  // 感情スコア (重み: 35%)
  emotionPatterns.forEach((pattern, index) => {
    patternScores[pattern] = (patternScores[pattern] || 0) + (0.35 * (emotionPatterns.length - index) / emotionPatterns.length)
  })
  
  // コンテキストスコア (重み: 30%)
  contextPatterns.forEach((pattern, index) => {
    patternScores[pattern] = (patternScores[pattern] || 0) + (0.30 * (contextPatterns.length - index) / contextPatterns.length)
  })
  
  // キャラクター基本設定スコア (重み: 10%)
  preferredPatterns.forEach((pattern, index) => {
    patternScores[pattern] = (patternScores[pattern] || 0) + (0.10 * (preferredPatterns.length - index) / preferredPatterns.length)
  })

  // 最高スコアのパターンを選択
  const bestPattern = Object.entries(patternScores).reduce((best, [pattern, score]) => 
    score > best.score ? { pattern: pattern as VoicePattern, score } : best, 
    { pattern: 'normal' as VoicePattern, score: 0 }
  )

  const confidence = Math.min(bestPattern.score, 1.0)
  const reason = `Selected based on time:${timeSlot}, emotion:${emotionState}, context:${interactionContext}`

  return {
    pattern: bestPattern.pattern,
    confidence,
    reason
  }
}

/**
 * 音声ファイル名を生成
 */
export function generateVoiceFileName(
  timeSlot: TimeSlot,
  pattern: VoicePattern,
  format: string = '.wav'
): string {
  return `${timeSlot}_${pattern}${format}`
}

/**
 * 音声ファイルの存在確認（タイムアウト付き・無限ループ防止）
 */
export async function checkVoiceFileExists(
  characterId: string, 
  fileName: string, 
  config: SmartVoiceConfig = DEFAULT_CONFIG
): Promise<VoiceFileInfo> {
  const filePath = `${config.baseAudioPath}/${characterId}/${fileName}`
  const CHECK_TIMEOUT = 3000 // 3秒タイムアウト
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT)
    
    const response = await fetch(filePath, { 
      method: 'HEAD',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const fileInfo: VoiceFileInfo = {
      fileName,
      exists: response.ok,
      size: response.ok ? parseInt(response.headers.get('content-length') || '0') : undefined
    }
    
    if (config.debugMode && response.ok) {
      console.log('✅ Voice file exists:', filePath, `(${fileInfo.size} bytes)`)
    }
    
    return fileInfo
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`⏰ Voice file check timeout for ${filePath}`)
    } else {
      console.warn(`❌ Voice file check failed for ${filePath}:`, error instanceof Error ? error.message : 'Unknown error')
    }
    return {
      fileName,
      exists: false
    }
  }
}

/**
 * フォールバック音声ファイル候補を生成
 */
export function generateFallbackOptions(
  timeSlot: TimeSlot,
  originalPattern: VoicePattern,
  characterId: string
): string[] {
  const profile = CHARACTER_PROFILES[characterId]
  const fallbackPatterns = profile?.preferredPatterns || ['normal', 'gentle', 'cheerful']
  
  const options: string[] = []
  
  // 同じ時間帯で他のパターン
  fallbackPatterns.forEach(pattern => {
    if (pattern !== originalPattern) {
      options.push(generateVoiceFileName(timeSlot, pattern))
    }
  })
  
  // REMOVED: No default.wav fallback - system should handle gracefully
  // options.push('default.wav')  // DELETED: Eliminates default.wav dependency
  
  return options
}

/**
 * メイン音声選択エンジン
 */
export async function selectSmartVoice(
  request: VoiceSelectionRequest,
  config: SmartVoiceConfig = DEFAULT_CONFIG
): Promise<VoiceSelectionResult> {
  const timeSlot = request.timeSlot || getCurrentTimeSlot()
  const emotionState = request.emotionState || 
    (request.userMessage ? analyzeEmotionFromMessage(request.userMessage) : 'normal')
  const interactionContext = request.interactionContext || 
    (request.userMessage ? determineInteractionContext(request.userMessage, request.conversationHistory) : 'response')

  const { pattern, confidence, reason } = selectVoicePattern(
    request.characterId,
    timeSlot,
    emotionState,
    interactionContext
  )

  const fileName = generateVoiceFileName(timeSlot, pattern)
  const filePath = `${config.baseAudioPath}/${request.characterId}/${fileName}`
  const fallbackOptions = generateFallbackOptions(timeSlot, pattern, request.characterId)

  if (config.debugMode) {
    console.log('🤖 Smart Voice Selection:', {
      characterId: request.characterId,
      timeSlot,
      emotionState,
      interactionContext,
      selectedPattern: pattern,
      confidence,
      fileName,
      reason
    })
  }

  return {
    fileName,
    filePath,
    pattern,
    confidence,
    fallbackOptions,
    selectionReason: reason
  }
}

/**
 * デバッグ用関数
 */
export const debugSmartVoiceSystem = () => {
  console.log('🎯 Smart Voice Selection Engine Debug:')
  console.log('=' .repeat(50))
  console.log('Supported Characters:', Object.keys(CHARACTER_PROFILES))
  console.log('Current Time Slot:', getCurrentTimeSlot())
  console.log('Supported Patterns:', ['early', 'normal', 'late', 'cheerful', 'calm', 'energetic', 'gentle'])
  console.log('Audio Format: WAV')
  console.log('Fallback System: ✅')
  console.log('Emotion Analysis: ✅')
  console.log('Context Detection: ✅')
  console.log('=' .repeat(50))
}