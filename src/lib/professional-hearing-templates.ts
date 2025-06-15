// 🎯 NutriRoom Phase 2.2: 専門的ヒアリング質問テンプレートシステム

import { SessionHistory } from './nutrition-guidance-system'

export interface HearingQuestion {
  id: string
  stage: string
  category: 'basic_info' | 'motivation' | 'constraints' | 'lifestyle' | 'goals'
  question: string
  followUpQuestions?: string[]
  keywords: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface HearingFlow {
  currentQuestionId: string
  completedQuestions: string[]
  pendingQuestions: string[]
  userResponses: Record<string, string>
}

// 基本情報収集質問テンプレート
const BASIC_INFO_QUESTIONS: HearingQuestion[] = [
  {
    id: 'period_goal',
    stage: 'initial_assessment',
    category: 'basic_info',
    question: 'どのくらいの期間で、どんな目標をお考えですか？',
    followUpQuestions: [
      '具体的な数値目標はありますか？',
      '以前にも同じような取り組みをされたことはありますか？'
    ],
    keywords: ['期間', '目標', '週間', 'ヶ月', 'kg', 'キロ'],
    priority: 'high'
  },
  {
    id: 'current_status',
    stage: 'initial_assessment',
    category: 'basic_info',
    question: '現在の食事や生活リズムについて教えてください♪',
    followUpQuestions: [
      '普段は何時頃にお食事を摂られますか？',
      '外食の頻度はどのくらいですか？'
    ],
    keywords: ['食事', '生活', 'リズム', '時間', '外食'],
    priority: 'high'
  },
  {
    id: 'health_status',
    stage: 'initial_assessment',
    category: 'basic_info',
    question: 'お体の調子や気になることはありますか？',
    followUpQuestions: [
      '睡眠時間は十分取れていますか？',
      '運動習慣はありますか？'
    ],
    keywords: ['体調', '健康', '睡眠', '運動', '疲れ'],
    priority: 'medium'
  }
]

// 動機・背景理解質問テンプレート
const MOTIVATION_QUESTIONS: HearingQuestion[] = [
  {
    id: 'motivation_trigger',
    stage: 'motivation_inquiry',
    category: 'motivation',
    question: 'そう思ったきっかけや理由は何ですか？',
    followUpQuestions: [
      'いつ頃からそう感じるようになりましたか？',
      '特に気になるタイミングはありますか？'
    ],
    keywords: ['きっかけ', '理由', 'いつから', 'タイミング'],
    priority: 'high'
  },
  {
    id: 'past_experience',
    stage: 'motivation_inquiry',
    category: 'motivation',
    question: '過去に似たような取り組みをされた経験はありますか？',
    followUpQuestions: [
      'その時はどんな方法を試されましたか？',
      'うまくいった部分、難しかった部分はありますか？'
    ],
    keywords: ['経験', '過去', '方法', 'うまくいった', '難しい'],
    priority: 'medium'
  },
  {
    id: 'support_system',
    stage: 'motivation_inquiry',
    category: 'motivation',
    question: 'ご家族や周りの方はどのように感じていらっしゃいますか？',
    followUpQuestions: [
      '一緒に取り組んでくれる人はいますか？',
      '応援してもらえる環境はありますか？'
    ],
    keywords: ['家族', '周り', '一緒', '応援', '環境'],
    priority: 'low'
  }
]

// 制約条件確認質問テンプレート
const CONSTRAINT_QUESTIONS: HearingQuestion[] = [
  {
    id: 'dietary_restrictions',
    stage: 'constraint_identification',
    category: 'constraints',
    question: 'アレルギーや苦手な食べ物はありますか？',
    followUpQuestions: [
      '医師から食事制限を受けていることはありますか？',
      '宗教的な理由で避けている食材はありますか？'
    ],
    keywords: ['アレルギー', '苦手', '制限', '避ける', '医師'],
    priority: 'high'
  },
  {
    id: 'time_constraints',
    stage: 'constraint_identification',
    category: 'constraints',
    question: '時間的な制約や忙しさはいかがですか？',
    followUpQuestions: [
      '食事の準備にかけられる時間はどのくらいですか？',
      'お仕事や家事で特に忙しい時間帯はありますか？'
    ],
    keywords: ['時間', '忙しい', '準備', '仕事', '家事'],
    priority: 'high'
  },
  {
    id: 'budget_constraints',
    stage: 'constraint_identification',
    category: 'constraints',
    question: '食費や予算についてはいかがですか？',
    followUpQuestions: [
      '月の食費の目安はありますか？',
      '特別な食材や商品の購入は可能ですか？'
    ],
    keywords: ['予算', '食費', '月', '購入', '食材'],
    priority: 'medium'
  }
]

// ライフスタイル質問テンプレート
const LIFESTYLE_QUESTIONS: HearingQuestion[] = [
  {
    id: 'daily_routine',
    stage: 'constraint_identification',
    category: 'lifestyle',
    question: '普段の生活パターンを教えてください♪',
    followUpQuestions: [
      '起床時間と就寝時間は決まっていますか？',
      '土日と平日で生活リズムは変わりますか？'
    ],
    keywords: ['生活', 'パターン', '起床', '就寝', '土日', '平日'],
    priority: 'medium'
  },
  {
    id: 'stress_factors',
    stage: 'motivation_inquiry',
    category: 'lifestyle',
    question: 'ストレスを感じるときはどんな時ですか？',
    followUpQuestions: [
      'ストレス発散方法はありますか？',
      '食事がストレス解消になることはありますか？'
    ],
    keywords: ['ストレス', '発散', '解消', '食事'],
    priority: 'low'
  }
]

// 全質問テンプレート
const ALL_HEARING_QUESTIONS = [
  ...BASIC_INFO_QUESTIONS,
  ...MOTIVATION_QUESTIONS,
  ...CONSTRAINT_QUESTIONS,
  ...LIFESTYLE_QUESTIONS
]

// 質問選択エンジン
export function selectNextQuestion(
  userInput: string,
  sessionHistory: SessionHistory,
  hearingFlow: HearingFlow
): HearingQuestion | null {
  // 現在のステージに適した質問を取得
  const currentStage = determineCurrentStage(sessionHistory)
  const availableQuestions = ALL_HEARING_QUESTIONS.filter(q => 
    q.stage === currentStage && 
    !hearingFlow.completedQuestions.includes(q.id)
  )

  if (availableQuestions.length === 0) {
    return null // すべての質問が完了
  }

  // ユーザー入力から関連する質問を選択
  const relevantQuestions = availableQuestions.filter(q =>
    q.keywords.some(keyword => userInput.includes(keyword))
  )

  // 関連する質問がある場合は優先度順に選択
  if (relevantQuestions.length > 0) {
    return relevantQuestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })[0]
  }

  // 関連する質問がない場合は優先度が高い質問を選択
  return availableQuestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })[0]
}

// フォローアップ質問の選択
export function selectFollowUpQuestion(
  questionId: string,
  userResponse: string
): string | null {
  const question = ALL_HEARING_QUESTIONS.find(q => q.id === questionId)
  
  if (!question || !question.followUpQuestions) {
    return null
  }

  // ユーザーの回答が短い場合はフォローアップを提案
  if (userResponse.length < 10) {
    return question.followUpQuestions[0]
  }

  // キーワードに基づいてフォローアップを選択
  if (userResponse.includes('わからない') || userResponse.includes('考え中')) {
    return question.followUpQuestions[question.followUpQuestions.length - 1]
  }

  return question.followUpQuestions[0]
}

// 自然な質問文の生成
export function generateNaturalQuestion(
  question: HearingQuestion
): string {
  const baseQuestion = question.question

  // 相槌や繋ぎ言葉を追加
  const connectors = [
    'なるほど〜♪ ',
    'そうですね♪ ',
    'ありがとうございます♪ ',
    ''
  ]

  const connector = connectors[Math.floor(Math.random() * connectors.length)]

  // 質問カテゴリに応じた導入を追加
  if (question.category === 'basic_info') {
    return `${connector}もう少し詳しく教えてください♪ ${baseQuestion}`
  } else if (question.category === 'motivation') {
    return `${connector}${baseQuestion} 教えていただけますか？`
  } else if (question.category === 'constraints') {
    return `${connector}より良いアドバイスをするために確認させてください〜 ${baseQuestion}`
  }

  return `${connector}${baseQuestion}`
}

// ヒアリングフローの初期化
export function initializeHearingFlow(): HearingFlow {
  return {
    currentQuestionId: '',
    completedQuestions: [],
    pendingQuestions: ALL_HEARING_QUESTIONS.map(q => q.id),
    userResponses: {}
  }
}

// ヒアリング進捗の更新
export function updateHearingFlow(
  flow: HearingFlow,
  questionId: string,
  userResponse: string
): HearingFlow {
  return {
    ...flow,
    completedQuestions: [...flow.completedQuestions, questionId],
    pendingQuestions: flow.pendingQuestions.filter(id => id !== questionId),
    userResponses: {
      ...flow.userResponses,
      [questionId]: userResponse
    }
  }
}

// 現在のステージ判定
function determineCurrentStage(sessionHistory: SessionHistory): string {
  if (!sessionHistory.basicInfoCollected) {
    return 'initial_assessment'
  } else if (!sessionHistory.motivationUnderstood) {
    return 'motivation_inquiry'
  } else if (!sessionHistory.constraintsIdentified) {
    return 'constraint_identification'
  }
  return 'personalized_advice'
}

// ヒアリング完了チェック
export function isHearingComplete(hearingFlow: HearingFlow): boolean {
  const highPriorityQuestions = ALL_HEARING_QUESTIONS.filter(q => q.priority === 'high')
  const completedHighPriority = highPriorityQuestions.filter(q => 
    hearingFlow.completedQuestions.includes(q.id)
  )
  
  return completedHighPriority.length >= highPriorityQuestions.length * 0.8 // 80%以上完了
}

// デバッグ用関数
export function debugHearingSystem(hearingFlow: HearingFlow): void {
  console.log('🎙️ Professional Hearing System Debug:')
  console.log('=' .repeat(50))
  console.log('Total Questions:', ALL_HEARING_QUESTIONS.length)
  console.log('Completed Questions:', hearingFlow.completedQuestions.length)
  console.log('Pending Questions:', hearingFlow.pendingQuestions.length)
  console.log('Current Question ID:', hearingFlow.currentQuestionId)
  console.log('Hearing Complete:', isHearingComplete(hearingFlow))
  
  console.log('\n📋 Questions by Category:')
  const categories = ['basic_info', 'motivation', 'constraints', 'lifestyle']
  categories.forEach(category => {
    const categoryQuestions = ALL_HEARING_QUESTIONS.filter(q => q.category === category)
    const completed = categoryQuestions.filter(q => hearingFlow.completedQuestions.includes(q.id))
    console.log(`  ${category}: ${completed.length}/${categoryQuestions.length} completed`)
  })
  
  console.log('\n🎯 High Priority Questions:')
  const highPriorityQuestions = ALL_HEARING_QUESTIONS.filter(q => q.priority === 'high')
  highPriorityQuestions.forEach(q => {
    const status = hearingFlow.completedQuestions.includes(q.id) ? '✅' : '⏳'
    console.log(`  ${status} ${q.question}`)
  })
  console.log('=' .repeat(50))
}