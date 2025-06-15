// 🎯 NutriRoom Phase 2.2: 自然で専門的な栄養指導システム

export interface SessionHistory {
  messageCount: number
  hasGreeted: boolean
  basicInfoCollected: boolean
  motivationUnderstood: boolean
  constraintsIdentified: boolean
  personalAdviceGiven: boolean
  lastTopicType: string
  userGoals: string[]
  userConstraints: string[]
  userMotivation: string
  userBasicInfo: {
    period?: string
    target?: string
    currentStatus?: string
  }
}

export interface ConversationContext {
  sessionHistory: SessionHistory
  userInput: string
  previousMessages: string[]
  characterId: string
  timeSlot: string
}

export interface GuidanceResponse {
  responseType: 'greeting' | 'assessment_question' | 'motivation_inquiry' | 'constraint_check' | 'personalized_advice' | 'general_conversation'
  voicePattern: 'understanding' | 'empathy' | 'support' | 'encouragement' | 'gentle' | 'cheerful'
  content: string
  shouldCollectInfo: boolean
  nextStage?: string
}

export type GuidanceStage = 
  | 'initial_greeting'
  | 'initial_assessment' 
  | 'motivation_inquiry'
  | 'constraint_identification'
  | 'personalized_advice'
  | 'ongoing_support'
  | 'general_conversation'

// 栄養指導の段階判定
export function getNutritionGuidanceStage(userInput: string, sessionHistory: SessionHistory): GuidanceStage {
  const dietKeywords = ['ダイエット', '痩せたい', '体重', '減量', '体型', 'スリム', '太った']
  const healthKeywords = ['健康', '栄養', '食事', '食べ物', 'バランス', '体調']
  const exerciseKeywords = ['運動', 'トレーニング', '筋トレ', 'ジム', '歩く', '走る']
  
  const hasDietRequest = dietKeywords.some(keyword => userInput.includes(keyword))
  const hasHealthRequest = healthKeywords.some(keyword => userInput.includes(keyword))
  const hasExerciseRequest = exerciseKeywords.some(keyword => userInput.includes(keyword))
  
  const hasNutritionTopic = hasDietRequest || hasHealthRequest || hasExerciseRequest

  // 初回挨拶が未完了の場合
  if (!sessionHistory.hasGreeted && sessionHistory.messageCount === 1) {
    return 'initial_greeting'
  }

  // 栄養・健康関連の相談がある場合
  if (hasNutritionTopic) {
    if (!sessionHistory.basicInfoCollected) {
      return 'initial_assessment'
    } else if (!sessionHistory.motivationUnderstood) {
      return 'motivation_inquiry'
    } else if (!sessionHistory.constraintsIdentified) {
      return 'constraint_identification'
    } else {
      return 'personalized_advice'
    }
  }

  // 継続的なサポートが必要な場合
  if (sessionHistory.personalAdviceGiven) {
    return 'ongoing_support'
  }

  return 'general_conversation'
}

// 専門的なアセスメント質問生成
export function generateAssessmentQuestion(userInput: string): string {
  if (userInput.includes('ダイエット') || userInput.includes('痩せたい')) {
    return [
      "ダイエットについて相談したいんですね♪",
      "まず、現在の状況を教えてもらえますか？",
      "どのくらいの期間で、どんな目標をお考えですか？"
    ].join(' ')
  }
  
  if (userInput.includes('健康') || userInput.includes('栄養')) {
    return [
      "健康について気になることがあるんですね〜",
      "もう少し詳しく教えてください♪",
      "普段の食事や生活習慣で気になることはありますか？"
    ].join(' ')
  }
  
  if (userInput.includes('運動') || userInput.includes('トレーニング')) {
    return [
      "運動についてのご相談ですね♪",
      "どんな運動をお考えですか？",
      "今の運動習慣や目標について教えてください〜"
    ].join(' ')
  }

  return [
    "なるほど〜詳しく教えてください♪",
    "どんなことが気になっているんですか？"
  ].join(' ')
}

// 動機・背景の理解質問生成
export function generateMotivationInquiry(userInput: string, basicInfo: any): string {
  const responses = [
    "なるほど〜♪",
    `ちなみに、${basicInfo.target || 'そう'}思ったきっかけは何ですか？`,
    "お体の調子や、普段のお食事についても聞かせてください♪"
  ]
  
  return responses.join(' ')
}

// 制約条件の確認質問生成
export function generateConstraintCheck(motivation: string): string {
  return [
    "お話を聞かせていただき、ありがとうございます♪",
    "より良いアドバイスをするために、いくつか確認させてください〜",
    "アレルギーや苦手な食べ物、時間的な制約などはありますか？"
  ].join(' ')
}

// 個別化されたアドバイス生成
export function generatePersonalizedAdvice(sessionHistory: SessionHistory): string {
  const { userGoals, userConstraints, userMotivation, userBasicInfo } = sessionHistory
  
  if (userGoals.includes('ダイエット')) {
    return [
      "お話を伺って、あなたに合ったアプローチを考えてみました♪",
      "無理のない範囲で、まずは食事のバランスから始めてみませんか？",
      "具体的には、1日3食をしっかり摂って、野菜を意識的に増やすことから始めるのがおすすめです〜"
    ].join(' ')
  }
  
  return [
    "あなたの状況を考慮して、おすすめのアプローチをお伝えしますね♪",
    "まずは小さな変化から始めて、徐々に理想に近づけていきましょう〜"
  ].join(' ')
}

// 継続サポートメッセージ生成
export function generateOngoingSupport(userInput: string): string {
  const encouragementPhrases = [
    "頑張っていらっしゃいますね♪",
    "その調子です〜",
    "素晴らしい取り組みですね♪"
  ]
  
  const randomEncouragement = encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)]
  
  return [
    randomEncouragement,
    "何か困ったことや気になることがあれば、いつでも聞いてくださいね〜"
  ].join(' ')
}

// メイン応答生成関数
export function generateNutritionGuidanceResponse(context: ConversationContext): GuidanceResponse {
  const { userInput, sessionHistory } = context
  const stage = getNutritionGuidanceStage(userInput, sessionHistory)
  
  console.log('🎯 Nutrition Guidance Stage:', {
    stage,
    messageCount: sessionHistory.messageCount,
    hasGreeted: sessionHistory.hasGreeted,
    basicInfoCollected: sessionHistory.basicInfoCollected
  })

  switch (stage) {
    case 'initial_greeting':
      return {
        responseType: 'greeting',
        voicePattern: 'cheerful',
        content: generateTimeBasedGreeting(context.timeSlot) + ' ' + generateAssessmentQuestion(userInput),
        shouldCollectInfo: true,
        nextStage: 'initial_assessment'
      }

    case 'initial_assessment':
      return {
        responseType: 'assessment_question',
        voicePattern: 'understanding',
        content: generateAssessmentQuestion(userInput),
        shouldCollectInfo: true,
        nextStage: 'motivation_inquiry'
      }

    case 'motivation_inquiry':
      return {
        responseType: 'motivation_inquiry',
        voicePattern: 'empathy',
        content: generateMotivationInquiry(userInput, sessionHistory.userBasicInfo),
        shouldCollectInfo: true,
        nextStage: 'constraint_identification'
      }

    case 'constraint_identification':
      return {
        responseType: 'constraint_check',
        voicePattern: 'gentle',
        content: generateConstraintCheck(sessionHistory.userMotivation),
        shouldCollectInfo: true,
        nextStage: 'personalized_advice'
      }

    case 'personalized_advice':
      return {
        responseType: 'personalized_advice',
        voicePattern: 'support',
        content: generatePersonalizedAdvice(sessionHistory),
        shouldCollectInfo: false,
        nextStage: 'ongoing_support'
      }

    case 'ongoing_support':
      return {
        responseType: 'general_conversation',
        voicePattern: 'encouragement',
        content: generateOngoingSupport(userInput),
        shouldCollectInfo: false
      }

    default:
      return {
        responseType: 'general_conversation',
        voicePattern: 'cheerful',
        content: generateGeneralResponse(userInput),
        shouldCollectInfo: false
      }
  }
}

// 時間帯に応じた挨拶生成（重複回避）
function generateTimeBasedGreeting(timeSlot: string): string {
  const greetings = {
    morning: 'おはよう♪',
    afternoon: 'こんにちは〜♪',
    evening: 'こんばんは♪',
    night: 'こんばんは〜'
  }
  
  return greetings[timeSlot as keyof typeof greetings] || 'こんにちは♪'
}

// 一般的な応答生成
function generateGeneralResponse(userInput: string): string {
  const generalResponses = [
    "そうですね〜♪ もう少し詳しく教えてください♪",
    "なるほど〜 他にも気になることはありますか？",
    "そうなんですね♪ 何かお手伝いできることがあれば教えてください〜"
  ]
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)]
}

// セッション履歴の更新
export function updateSessionHistory(
  history: SessionHistory, 
  userInput: string, 
  responseType: string
): SessionHistory {
  const updated = { ...history }
  
  updated.messageCount += 1
  
  if (responseType === 'greeting') {
    updated.hasGreeted = true
  }
  
  if (responseType === 'assessment_question') {
    // ユーザーの基本情報を解析
    if (userInput.includes('週間') || userInput.includes('ヶ月') || userInput.includes('年')) {
      updated.userBasicInfo.period = extractPeriodInfo(userInput)
    }
    if (userInput.includes('kg') || userInput.includes('キロ')) {
      updated.userBasicInfo.target = extractTargetInfo(userInput)
    }
    updated.basicInfoCollected = true
  }
  
  if (responseType === 'motivation_inquiry') {
    updated.userMotivation = userInput
    updated.motivationUnderstood = true
  }
  
  if (responseType === 'constraint_check') {
    updated.userConstraints = extractConstraints(userInput)
    updated.constraintsIdentified = true
  }
  
  if (responseType === 'personalized_advice') {
    updated.personalAdviceGiven = true
  }
  
  return updated
}

// ヘルパー関数
function extractPeriodInfo(input: string): string {
  const periodMatch = input.match(/(\d+)\s*(週間|ヶ月|年)/)
  return periodMatch ? periodMatch[0] : ''
}

function extractTargetInfo(input: string): string {
  const targetMatch = input.match(/(\d+)\s*kg/)
  return targetMatch ? targetMatch[0] : ''
}

function extractConstraints(input: string): string[] {
  const constraints: string[] = []
  
  if (input.includes('アレルギー')) constraints.push('アレルギー有り')
  if (input.includes('時間がない') || input.includes('忙しい')) constraints.push('時間制約')
  if (input.includes('嫌い') || input.includes('苦手')) constraints.push('食べ物制約')
  
  return constraints
}

// デバッグ用関数
export function debugNutritionGuidance(context: ConversationContext): void {
  console.log('🔍 Nutrition Guidance Debug:')
  console.log('=' .repeat(50))
  console.log('User Input:', context.userInput)
  console.log('Message Count:', context.sessionHistory.messageCount)
  console.log('Has Greeted:', context.sessionHistory.hasGreeted)
  console.log('Basic Info Collected:', context.sessionHistory.basicInfoCollected)
  console.log('Motivation Understood:', context.sessionHistory.motivationUnderstood)
  console.log('Constraints Identified:', context.sessionHistory.constraintsIdentified)
  console.log('Personal Advice Given:', context.sessionHistory.personalAdviceGiven)
  
  const stage = getNutritionGuidanceStage(context.userInput, context.sessionHistory)
  console.log('Current Stage:', stage)
  
  const response = generateNutritionGuidanceResponse(context)
  console.log('Response Type:', response.responseType)
  console.log('Voice Pattern:', response.voicePattern)
  console.log('Response Content:', response.content.substring(0, 100) + '...')
  console.log('=' .repeat(50))
}