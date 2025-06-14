// 🎯 NutriRoom Phase 2.2: 応答パターン分析エンジン

import {
  ResponseType,
  ResponseCategory,
  ResponsePriority,
  ResponsePattern,
  ResponseContent,
  CharacterResponseProfile,
  ResponseControlRequest,
  ResponseControlResult
} from '@/types/responseTypes'

// あかりキャラクターの応答プロファイル（元気系）
const AKARI_RESPONSE_PROFILE: CharacterResponseProfile = {
  characterId: 'akari',
  personalityType: 'energetic_supportive',
  voicePreference: 0.8, // 音声重視
  categoryPreferences: {
    greeting: 'voice_only',
    acknowledgment: 'voice_only',
    explanation: 'text_only',
    advice: 'voice_and_text',
    encouragement: 'voice_only',
    question: 'text_only',
    goodbye: 'voice_only'
  },
  lengthThresholds: {
    shortResponse: 30,   // 30文字以下は音声のみ
    longResponse: 150    // 150文字以上はテキストのみ
  },
  specialPatterns: {
    excitement: 'voice_only',
    concern: 'voice_and_text',
    encouragement: 'voice_only'
  }
}

// みなとキャラクターの応答プロファイル（ツンデレ系・理論派）
const MINATO_RESPONSE_PROFILE: CharacterResponseProfile = {
  characterId: 'minato',
  personalityType: 'analytical_tsundere',
  voicePreference: 0.4, // テキスト重視
  categoryPreferences: {
    greeting: 'text_only',
    acknowledgment: 'text_only',
    explanation: 'text_only',
    advice: 'voice_and_text',
    encouragement: 'text_only',
    question: 'text_only',
    goodbye: 'voice_only'
  },
  lengthThresholds: {
    shortResponse: 20,   // 20文字以下は音声のみ
    longResponse: 200    // 200文字以上はテキストのみ
  },
  specialPatterns: {
    excitement: 'text_only',
    concern: 'voice_and_text',
    encouragement: 'voice_only'
  }
}

// キャラクター応答プロファイル管理
const CHARACTER_RESPONSE_PROFILES: Record<string, CharacterResponseProfile> = {
  akari: AKARI_RESPONSE_PROFILE,
  minato: MINATO_RESPONSE_PROFILE
}

/**
 * 応答カテゴリを判定
 */
export function analyzeResponseCategory(responseText: string, userMessage?: string): ResponseCategory {
  // 空の応答やループ防止
  if (!responseText || responseText.trim().length === 0) {
    return 'explanation'
  }
  
  const lowerResponse = responseText.toLowerCase()
  
  // デバッグログは開発環境のみ
  if (process.env.NODE_ENV === 'development') {
    console.log('Analyzing response category for length:', responseText.length, userMessage ? 'with context' : 'no context')
  }
  
  // 挨拶パターン
  if (['こんにちは', 'おはよう', 'こんばんは', 'はじめまして', 'よろしく'].some(greeting => 
      lowerResponse.includes(greeting))) {
    return 'greeting'
  }
  
  // 別れの挨拶
  if (['さようなら', 'またね', 'バイバイ', 'お疲れ様', 'ありがとうございました'].some(farewell => 
      lowerResponse.includes(farewell))) {
    return 'goodbye'
  }
  
  // 励ましパターン
  if (['頑張って', '応援', '大丈夫', 'きっとできる', 'ファイト', '素晴らしい', 'すごい'].some(encouragement => 
      lowerResponse.includes(encouragement))) {
    return 'encouragement'
  }
  
  // あいづち・同意パターン
  if (['そうですね', 'はい', 'なるほど', 'そうなんです', 'わかります', 'いいですね'].some(ack => 
      lowerResponse.includes(ack)) && responseText.length < 50) {
    return 'acknowledgment'
  }
  
  // 質問パターン
  if (['どう', 'なぜ', '何', 'いつ', 'どこ', 'どの', '？', '?'].some(question => 
      lowerResponse.includes(question))) {
    return 'question'
  }
  
  // アドバイスパターン
  if (['おすすめ', '提案', '改善', '工夫', '方法', 'コツ', 'ポイント'].some(advice => 
      lowerResponse.includes(advice))) {
    return 'advice'
  }
  
  // デフォルトは説明（voice_onlyを避ける）
  return 'explanation'
}

/**
 * 応答の優先度を判定
 */
export function analyzeResponsePriority(
  responseText: string, 
  userMessage: string,
  category: ResponseCategory
): ResponsePriority {
  const lowerResponse = responseText.toLowerCase()
  const lowerUser = userMessage.toLowerCase()
  
  // 緊急パターン
  if (['緊急', '危険', '注意', '警告', '重要'].some(urgent => 
      lowerResponse.includes(urgent) || lowerUser.includes(urgent))) {
    return 'critical'
  }
  
  // 高優先度パターン
  if (category === 'encouragement' || 
      ['素晴らしい', 'すごい', '感動', '最高'].some(high => lowerResponse.includes(high))) {
    return 'high'
  }
  
  // あいづちや挨拶は低優先度
  if (category === 'acknowledgment' || category === 'greeting') {
    return 'low'
  }
  
  return 'medium'
}

/**
 * テキストの複雑さを判定
 */
export function analyzeTextComplexity(text: string): 'simple' | 'medium' | 'complex' {
  const length = text.length
  const sentenceCount = text.split(/[。！？]/).length - 1
  const technicalTerms = ['栄養素', 'カロリー', 'ビタミン', 'ミネラル', 'タンパク質', '炭水化物', '脂質']
  const technicalCount = technicalTerms.filter(term => text.includes(term)).length
  
  if (length < 50 && sentenceCount <= 2 && technicalCount === 0) {
    return 'simple'
  }
  
  if (length > 200 || sentenceCount > 5 || technicalCount > 2) {
    return 'complex'
  }
  
  return 'medium'
}

/**
 * メイン応答パターン分析エンジン
 */
export function analyzeResponsePattern(request: ResponseControlRequest): ResponsePattern {
  const profile = CHARACTER_RESPONSE_PROFILES[request.characterId]
  
  if (!profile) {
    return {
      type: 'text_only',
      category: 'explanation',
      priority: 'medium',
      reason: 'Unknown character, using default pattern',
      confidence: 0.3
    }
  }
  
  const category = analyzeResponseCategory(request.responseText, request.userMessage)
  const priority = analyzeResponsePriority(request.responseText, request.userMessage, category)
  const complexity = request.context?.topicComplexity || analyzeTextComplexity(request.responseText)
  const textLength = request.responseText.length
  
  let selectedType: ResponseType
  let confidence = 0.8
  let reason = ''
  
  // 1. 文字数による判定（voice_onlyを制限）
  if (textLength <= profile.lengthThresholds.shortResponse) {
    // 短い応答でもテキスト表示を優先（安全性重視）
    selectedType = 'voice_and_text'
    reason = `Short response (${textLength} chars) - voice and text for safety`
  } else if (textLength >= profile.lengthThresholds.longResponse) {
    selectedType = 'text_only'
    reason = `Long response (${textLength} chars) - text only`
  }
  // 2. カテゴリー別設定（voice_onlyを制限）
  else if (profile.categoryPreferences[category]) {
    const preferredType = profile.categoryPreferences[category]
    // voice_onlyを voice_and_text に変更（安全性重視）
    selectedType = preferredType === 'voice_only' ? 'voice_and_text' : preferredType
    reason = `Category preference: ${category} -> ${selectedType}${preferredType === 'voice_only' ? ' (upgraded for safety)' : ''}`
  }
  // 3. 優先度による調整
  else if (priority === 'critical' || priority === 'high') {
    selectedType = 'voice_and_text'
    reason = `High priority (${priority}) - voice and text`
  }
  // 4. 複雑さによる調整
  else if (complexity === 'complex') {
    selectedType = 'text_only'
    reason = `Complex content - text only`
  } else if (complexity === 'simple') {
    selectedType = 'voice_and_text'
    reason = `Simple content - voice and text for safety`
  }
  // 5. キャラクターの音声傾向（voice_onlyを制限）
  else if (profile.voicePreference > 0.7) {
    selectedType = 'voice_and_text'
    reason = `Character voice preference (${profile.voicePreference}) - upgraded for safety`
  } else if (profile.voicePreference < 0.3) {
    selectedType = 'text_only'
    reason = `Character text preference (${profile.voicePreference})`
  }
  // 6. デフォルト
  else {
    selectedType = 'voice_and_text'
    reason = 'Default balanced approach'
    confidence = 0.5
  }
  
  // 特殊パターンのオーバーライド（voice_onlyを制限）
  if (request.context?.userEmotionState) {
    const emotionState = request.context.userEmotionState as keyof typeof profile.specialPatterns
    if (profile.specialPatterns[emotionState]) {
      const specialType = profile.specialPatterns[emotionState]
      selectedType = specialType === 'voice_only' ? 'voice_and_text' : specialType
      reason = `Emotion override: ${emotionState} -> ${selectedType}${specialType === 'voice_only' ? ' (upgraded for safety)' : ''}`
      confidence = 0.9
    }
  }
  
  return {
    type: selectedType,
    category,
    priority,
    reason,
    confidence
  }
}

/**
 * 応答コンテンツを生成
 */
export function generateResponseContent(
  responseText: string,
  pattern: ResponsePattern
): ResponseContent {
  return {
    text: pattern.type !== 'voice_only' ? responseText : undefined,
    voiceRequired: pattern.type === 'voice_only' || pattern.type === 'voice_and_text',
    textRequired: pattern.type === 'text_only' || pattern.type === 'voice_and_text',
    urgency: pattern.priority
  }
}

/**
 * タイミング制御設定を生成
 */
export function generateTimingControl(
  pattern: ResponsePattern,
  textLength: number
): { voiceDelay: number; textDelay: number; voiceDuration?: number } {
  const estimatedVoiceDuration = textLength * 100 // 1文字100ms程度の想定
  
  switch (pattern.type) {
    case 'voice_only':
      return {
        voiceDelay: 200,
        textDelay: 0,
        voiceDuration: estimatedVoiceDuration
      }
    
    case 'text_only':
      return {
        voiceDelay: 0,
        textDelay: 100
      }
    
    case 'voice_and_text':
      // 優先度によってタイミングを調整
      if (pattern.priority === 'critical' || pattern.priority === 'high') {
        // 同時開始
        return {
          voiceDelay: 200,
          textDelay: 0,
          voiceDuration: estimatedVoiceDuration
        }
      } else {
        // 音声を少し先行
        return {
          voiceDelay: 200,
          textDelay: 800,
          voiceDuration: estimatedVoiceDuration
        }
      }
    
    default:
      return {
        voiceDelay: 200,
        textDelay: 0,
        voiceDuration: estimatedVoiceDuration
      }
  }
}

/**
 * フォールバックオプションを生成
 */
export function generateFallbackOptions(pattern: ResponsePattern): ResponseType[] {
  const options: ResponseType[] = []
  
  switch (pattern.type) {
    case 'voice_only':
      options.push('voice_and_text', 'text_only')
      break
    case 'text_only':
      options.push('voice_and_text', 'voice_only')
      break
    case 'voice_and_text':
      options.push('voice_only', 'text_only')
      break
  }
  
  return options
}

/**
 * メイン応答制御エンジン
 */
export function controlChatResponse(request: ResponseControlRequest): ResponseControlResult {
  // 空の応答やエラー状態の早期終了
  if (!request.responseText || request.responseText.trim().length === 0) {
    return {
      pattern: {
        type: 'text_only',
        category: 'explanation',
        priority: 'low',
        reason: 'Empty response - fallback to text only',
        confidence: 1.0
      },
      content: {
        text: request.responseText || '',
        voiceRequired: false,
        textRequired: true,
        urgency: 'low'
      },
      timing: {
        voiceDelay: 0,
        textDelay: 100
      },
      fallbackOptions: []
    }
  }

  try {
    const pattern = analyzeResponsePattern(request)
    const content = generateResponseContent(request.responseText, pattern)
    const timing = generateTimingControl(pattern, request.responseText.length)
    const fallbackOptions = generateFallbackOptions(pattern)
    
    // デバッグログは開発環境のみ
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Response Control Result:', {
        category: pattern.category,
        type: pattern.type,
        priority: pattern.priority,
        confidence: pattern.confidence
      })
    }
    
    return {
      pattern,
      content,
      timing,
      fallbackOptions
    }
  } catch (error) {
    console.error('❌ Response control analysis failed:', error)
    
    // エラー時のフォールバック
    return {
      pattern: {
        type: 'text_only',
        category: 'explanation',
        priority: 'low',
        reason: 'Analysis error - fallback to safe mode',
        confidence: 0.1
      },
      content: {
        text: request.responseText,
        voiceRequired: false,
        textRequired: true,
        urgency: 'low'
      },
      timing: {
        voiceDelay: 0,
        textDelay: 100
      },
      fallbackOptions: ['voice_only', 'voice_and_text']
    }
  }
}

/**
 * デバッグ用関数
 */
export const debugResponseControl = () => {
  console.log('🎭 Response Pattern Control System Debug:')
  console.log('=' .repeat(50))
  console.log('Supported Characters:', Object.keys(CHARACTER_RESPONSE_PROFILES))
  console.log('Response Types:', ['voice_only', 'text_only', 'voice_and_text'])
  console.log('Categories:', ['greeting', 'acknowledgment', 'explanation', 'advice', 'encouragement', 'question', 'goodbye'])
  console.log('Priorities:', ['low', 'medium', 'high', 'critical'])
  console.log('Character Profiles:')
  Object.values(CHARACTER_RESPONSE_PROFILES).forEach(profile => {
    console.log(`  ${profile.characterId}: ${profile.personalityType} (voice pref: ${profile.voicePreference})`)
  })
  console.log('=' .repeat(50))
}