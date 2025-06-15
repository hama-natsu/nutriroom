// 🎯 NutriRoom Phase 2.2: 自然な応答パターン制御システム統合

import { 
  generateNutritionGuidanceResponse, 
  ConversationContext, 
  GuidanceResponse,
  SessionHistory,
  updateSessionHistory
} from './nutrition-guidance-system'

import {
  conversationManager,
  getSessionInfo,
  updateNutritionProgress,
  markGreetingCompleted,
  incrementMessageCount
} from './conversation-context-manager'

import {
  selectNextQuestion,
  generateNaturalQuestion,
  updateHearingFlow,
  initializeHearingFlow,
  HearingFlow,
  HearingQuestion
} from './professional-hearing-templates'

export interface NaturalResponseRequest {
  sessionId: string
  userMessage: string
  characterId: string
  timeSlot?: string
}

export interface NaturalResponseResult {
  response: string
  voicePattern: string
  responseType: string
  sessionUpdated: boolean
  nextStage?: string
  hearingQuestion?: HearingQuestion
  guidance: {
    stage: string
    shouldCollectInfo: boolean
    confidence: number
  }
}

// セッション内のヒアリングフロー管理
const sessionHearingFlows = new Map<string, HearingFlow>()

// メイン統合制御関数
export async function generateNaturalResponse(
  request: NaturalResponseRequest
): Promise<NaturalResponseResult> {
  const { sessionId, userMessage, characterId, timeSlot = getCurrentTimeSlot() } = request

  // 1. セッション情報取得・初期化
  let sessionInfo = getSessionInfo(sessionId)
  
  if (!sessionInfo.exists) {
    // 新しいセッションを作成
    const newSessionId = conversationManager.createSession(characterId)
    sessionInfo = getSessionInfo(newSessionId)
  }

  // 2. ヒアリングフロー初期化（初回のみ）
  if (!sessionHearingFlows.has(sessionId)) {
    sessionHearingFlows.set(sessionId, initializeHearingFlow())
  }

  const hearingFlow = sessionHearingFlows.get(sessionId)!
  const session = conversationManager.getSession(sessionId)!

  // 3. 会話文脈の構築
  const conversationContext: ConversationContext = {
    sessionHistory: session.history,
    userInput: userMessage,
    previousMessages: [], // 必要に応じて実装
    characterId,
    timeSlot
  }

  // 4. 栄養指導応答生成
  const guidanceResponse = generateNutritionGuidanceResponse(conversationContext)

  // 5. 専門的ヒアリング質問の選択
  let hearingQuestion: HearingQuestion | null = null
  if (guidanceResponse.shouldCollectInfo) {
    hearingQuestion = selectNextQuestion(
      userMessage, 
      session.history, 
      hearingFlow
    )
  }

  // 6. 自然な応答文の生成
  let finalResponse = guidanceResponse.content

  if (hearingQuestion) {
    // ヒアリング質問を自然に組み込み
    const naturalQuestion = generateNaturalQuestion(
      hearingQuestion,
      session.history,
      userMessage
    )
    
    // 既存の応答と質問を自然に結合
    if (guidanceResponse.responseType === 'greeting') {
      finalResponse = guidanceResponse.content + ' ' + naturalQuestion
    } else {
      finalResponse = naturalQuestion
    }
  }

  // 7. セッション履歴の更新
  const updatedHistory = updateSessionHistory(
    session.history,
    userMessage,
    guidanceResponse.responseType
  )

  // 8. 会話管理システムの更新
  let sessionUpdated = true

  // メッセージカウント増加
  incrementMessageCount(sessionId)

  // 挨拶完了マーク
  if (guidanceResponse.responseType === 'greeting') {
    markGreetingCompleted(sessionId)
  }

  // 栄養指導進捗更新
  updateNutritionProgress(sessionId, updatedHistory)

  // 9. ヒアリングフロー更新
  if (hearingQuestion) {
    const updatedFlow = updateHearingFlow(
      hearingFlow,
      hearingQuestion.id,
      userMessage
    )
    sessionHearingFlows.set(sessionId, updatedFlow)
  }

  // 10. 結果返却
  return {
    response: finalResponse,
    voicePattern: guidanceResponse.voicePattern,
    responseType: guidanceResponse.responseType,
    sessionUpdated,
    nextStage: guidanceResponse.nextStage,
    hearingQuestion: hearingQuestion || undefined,
    guidance: {
      stage: sessionInfo.guidanceStage,
      shouldCollectInfo: guidanceResponse.shouldCollectInfo,
      confidence: guidanceResponse.confidence || 0.8
    }
  }
}

// 時間帯取得ヘルパー
function getCurrentTimeSlot(): string {
  const hour = new Date().getHours()
  
  if (hour >= 1 && hour < 5) return 'very_late'
  if (hour >= 5 && hour < 7) return 'morning_early'
  if (hour >= 7 && hour < 9) return 'morning'
  if (hour >= 9 && hour < 11) return 'morning_late'
  if (hour >= 11 && hour < 13) return 'lunch'
  if (hour >= 13 && hour < 15) return 'afternoon'
  if (hour >= 15 && hour < 17) return 'snack'
  if (hour >= 17 && hour < 19) return 'evening'
  if (hour >= 19 && hour < 21) return 'dinner'
  if (hour >= 21 && hour < 23) return 'night'
  return 'late'
}

// 応答品質の評価
export function evaluateResponseQuality(
  userMessage: string,
  response: string,
  sessionHistory: SessionHistory
): {
  naturalness: number
  relevance: number
  progression: number
  overall: number
} {
  // 自然さの評価（長すぎず短すぎず、適切な敬語・口調）
  const naturalness = evaluateNaturalness(response)
  
  // 関連性の評価（ユーザーメッセージに対する適切性）
  const relevance = evaluateRelevance(userMessage, response)
  
  // 進行の評価（栄養指導の段階的進行）
  const progression = evaluateProgression(sessionHistory)

  const overall = (naturalness + relevance + progression) / 3

  return {
    naturalness,
    relevance,
    progression,
    overall
  }
}

// 自然さ評価
function evaluateNaturalness(response: string): number {
  let score = 1.0

  // 長さチェック（50-200文字が理想）
  if (response.length < 30 || response.length > 300) {
    score -= 0.2
  }

  // 口調チェック（♪や〜などの自然な表現）
  if (response.includes('♪') || response.includes('〜')) {
    score += 0.1
  }

  // 機械的すぎる表現をチェック
  const mechanicalPhrases = ['システム', 'データ', 'プログラム', 'エラー']
  if (mechanicalPhrases.some(phrase => response.includes(phrase))) {
    score -= 0.3
  }

  return Math.max(0, Math.min(1, score))
}

// 関連性評価
function evaluateRelevance(userMessage: string, response: string): number {
  let score = 0.7 // ベースライン

  // キーワード一致度
  const userKeywords = extractKeywords(userMessage)
  const responseKeywords = extractKeywords(response)
  
  const matchingKeywords = userKeywords.filter(keyword => 
    responseKeywords.some(rKeyword => rKeyword.includes(keyword))
  )

  score += (matchingKeywords.length / Math.max(userKeywords.length, 1)) * 0.3

  return Math.max(0, Math.min(1, score))
}

// 進行評価
function evaluateProgression(sessionHistory: SessionHistory): number {
  let score = 0.5

  // 段階的進行の確認
  if (sessionHistory.hasGreeted) score += 0.1
  if (sessionHistory.basicInfoCollected) score += 0.1
  if (sessionHistory.motivationUnderstood) score += 0.1
  if (sessionHistory.constraintsIdentified) score += 0.1
  if (sessionHistory.personalAdviceGiven) score += 0.2

  return Math.max(0, Math.min(1, score))
}

// キーワード抽出
function extractKeywords(text: string): string[] {
  const keywords = []
  
  // 栄養・健康関連キーワード
  const nutritionKeywords = ['ダイエット', '健康', '栄養', '食事', '運動', '体重', '痩せる']
  nutritionKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword)
    }
  })

  return keywords
}

// セッションクリーンアップ
export function cleanupSessionHearingFlows(): void {
  const activeSessionIds = Array.from(conversationManager.sessions.keys())
  
  for (const sessionId of sessionHearingFlows.keys()) {
    if (!activeSessionIds.includes(sessionId)) {
      sessionHearingFlows.delete(sessionId)
    }
  }

  console.log('🧹 Cleaned up hearing flows:', {
    remaining: sessionHearingFlows.size,
    removed: sessionHearingFlows.size - activeSessionIds.length
  })
}

// デバッグ機能
export function debugNaturalResponseController(sessionId?: string): void {
  console.log('🎯 Natural Response Controller Debug:')
  console.log('=' .repeat(60))
  
  if (sessionId) {
    const sessionInfo = getSessionInfo(sessionId)
    const hearingFlow = sessionHearingFlows.get(sessionId)
    
    console.log('Session Info:', {
      exists: sessionInfo.exists,
      messageCount: sessionInfo.messageCount,
      guidanceStage: sessionInfo.guidanceStage,
      needsGreeting: sessionInfo.needsGreeting
    })
    
    console.log('Hearing Flow:', {
      completedQuestions: hearingFlow?.completedQuestions.length || 0,
      pendingQuestions: hearingFlow?.pendingQuestions.length || 0,
      currentQuestion: hearingFlow?.currentQuestionId || 'none'
    })
  } else {
    console.log('Active Sessions:', conversationManager.sessions.size)
    console.log('Active Hearing Flows:', sessionHearingFlows.size)
    console.log('Current Time Slot:', getCurrentTimeSlot())
  }
  
  console.log('=' .repeat(60))
}

// 定期クリーンアップの設定
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupSessionHearingFlows()
  }, 10 * 60 * 1000) // 10分ごと
}