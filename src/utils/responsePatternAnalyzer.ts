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
 * 応答カテゴリを判定（無限ループ防止・即座終了）
 */
export function analyzeResponseCategory(responseText: string): ResponseCategory {
  // 空の応答やループ防止 - 即座にデフォルト返却
  if (!responseText || responseText.trim().length === 0) {
    return 'explanation'
  }
  
  // 異常に短いまたは長いテキストは即座にデフォルト
  if (responseText.length < 2 || responseText.length > 2000) {
    return 'explanation'
  }
  
  try {
    const lowerResponse = responseText.toLowerCase()
    
    // 即座に判定 - 最初にマッチしたものを返す
    if (lowerResponse.includes('こんにちは') || lowerResponse.includes('おはよう') || lowerResponse.includes('こんばんは')) {
      return 'greeting'
    }
    
    if (lowerResponse.includes('さようなら') || lowerResponse.includes('またね') || lowerResponse.includes('ありがとう')) {
      return 'goodbye'
    }
    
    if (lowerResponse.includes('頑張って') || lowerResponse.includes('応援') || lowerResponse.includes('大丈夫')) {
      return 'encouragement'
    }
    
    if (lowerResponse.includes('そうですね') || lowerResponse.includes('はい') || lowerResponse.includes('なるほど')) {
      return 'acknowledgment'
    }
    
    // デフォルトで即座に終了
    return 'explanation'
    
  } catch (error) {
    console.error('Category analysis error:', error)
    return 'explanation'
  }
}

/**
 * 応答の優先度を判定（即座終了）
 */
export function analyzeResponsePriority(
  responseText: string, 
  userMessage: string,
  category: ResponseCategory
): ResponsePriority {
  // 早期終了パターン
  if (!responseText || !userMessage) {
    return 'low'
  }
  
  try {
    // カテゴリベースの即座判定
    if (category === 'acknowledgment' || category === 'greeting') {
      return 'low'
    }
    
    if (category === 'encouragement') {
      return 'high'
    }
    
    // デフォルト
    return 'medium'
    
  } catch (error) {
    console.error('Priority analysis error:', error)
    return 'low'
  }
}

/**
 * テキストの複雑さを判定（即座終了）
 */
export function analyzeTextComplexity(text: string): 'simple' | 'medium' | 'complex' {
  // 早期終了
  if (!text || text.length === 0) {
    return 'simple'
  }
  
  try {
    const length = text.length
    
    // 即座判定
    if (length < 50) {
      return 'simple'
    }
    
    if (length > 200) {
      return 'complex'
    }
    
    return 'medium'
    
  } catch (error) {
    console.error('Complexity analysis error:', error)
    return 'simple'
  }
}

/**
 * メイン応答パターン分析エンジン（緊急ループ防止版）
 */
export function analyzeResponsePattern(request: ResponseControlRequest): ResponsePattern {
  // 即座にsafeなデフォルトを返す（ループ防止の最優先）
  try {
    // 空のリクエストは即座にsafeパターン
    if (!request.responseText || request.responseText.trim().length === 0) {
      return {
        type: 'text_only',
        category: 'explanation',
        priority: 'low',
        reason: 'Empty request - safe default to prevent loops',
        confidence: 1.0
      }
    }

    // 全ての応答をtext_onlyで強制的に統一（ループ完全防止）
    return {
      type: 'text_only',
      category: 'explanation',
      priority: 'medium',
      reason: 'Emergency safe mode - all responses text only',
      confidence: 1.0
    }
    
  } catch (error) {
    console.error('Critical error in pattern analysis:', error)
    // エラー時も絶対安全なパターン
    return {
      type: 'text_only',
      category: 'explanation',
      priority: 'low',
      reason: 'Error fallback - emergency safe mode',
      confidence: 1.0
    }
  }
  
  // この下のコードは一時的にコメントアウト（ループ原因可能性）
  /*
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
  */
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