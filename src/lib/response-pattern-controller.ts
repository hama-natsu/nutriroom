// 🎯 NutriRoom 応答パターン制御システム - 適切な音声再生判定

export type ResponseType = 
  | 'initial_greeting'       // 時間帯挨拶
  | 'encouragement'          // 励まし・応援
  | 'agreement'              // あいづち
  | 'emotional_support'      // 感情的サポート
  | 'general_conversation'   // 通常会話
  | 'information_response'   // 情報提供
  | 'food_discussion'        // 食べ物についての話
  | 'thinking'               // 考えている表現
  | 'surprise'               // 驚き

export type InteractionContext = 
  | 'greeting'               // 挨拶
  | 'response'               // 通常応答
  | 'encouragement'          // 励まし
  | 'support'                // サポート

export interface ResponseAnalysis {
  responseType: ResponseType
  shouldPlayVoice: boolean
  voiceEmotion?: string
  confidence: number
  reasoning: string
}

// 【核心機能】音声再生要否判定
export function shouldPlayVoice(responseType: ResponseType, isInitialGreeting: boolean): boolean {
  // 初回挨拶は必ず音声再生
  if (isInitialGreeting) {
    console.log('🎵 Voice enabled: Initial greeting detected')
    return true
  }
  
  // 応答タイプ別判定
  switch (responseType) {
    case 'initial_greeting':     // 時間帯挨拶
    case 'encouragement':        // 励まし
    case 'agreement':           // あいづち
    case 'emotional_support':   // 感情サポート
      console.log(`🎵 Voice enabled: ${responseType} response`)
      return true
      
    case 'general_conversation': // 通常会話
    case 'information_response': // 情報提供
    case 'food_discussion':     // 食べ物について
    case 'thinking':            // 考えている
      console.log(`🔇 Voice disabled: ${responseType} response (text-only)`)
      return false
      
    default:
      console.log(`🔇 Voice disabled: Unknown response type "${responseType}"`)
      return false
  }
}

// 会話タイプの自動判定
export function detectResponseType(userInput: string, aiResponse: string): ResponseType {
  const userLower = userInput.toLowerCase()
  const responseLower = aiResponse.toLowerCase()
  
  // 食べ物についての質問・返答
  const foodKeywords = ['そば', 'うどん', '食事', '料理', '美味しい', '食べ', '味', 'レシピ', '材料', '栄養', 'カロリー']
  if (foodKeywords.some(keyword => userLower.includes(keyword) || responseLower.includes(keyword))) {
    return 'food_discussion'
  }
  
  // 励ましが必要な文脈
  const encouragementKeywords = ['頑張る', 'ダイエット', '挫折', '辛い', '大変', 'しんどい', '疲れ', '応援']
  if (encouragementKeywords.some(keyword => userLower.includes(keyword) || responseLower.includes(keyword))) {
    return 'encouragement'
  }
  
  // あいづち的な短い応答
  if (aiResponse.length < 20 && (aiResponse.includes('そうですね') || aiResponse.includes('なるほど'))) {
    return 'agreement'
  }
  
  // 感情的サポートが必要な文脈
  const emotionalKeywords = ['悲しい', '嬉しい', '困っ', '心配', '不安', '元気']
  if (emotionalKeywords.some(keyword => userLower.includes(keyword) || responseLower.includes(keyword))) {
    return 'emotional_support'
  }
  
  // 考えている表現
  if (aiResponse.includes('うーん') || aiResponse.includes('そうですね...') || aiResponse.includes('考えて')) {
    return 'thinking'
  }
  
  // デフォルトは通常会話
  return 'general_conversation'
}

// 包括的な応答分析
export function analyzeResponse(
  userInput: string, 
  aiResponse: string, 
  isInitialGreeting: boolean = false
): ResponseAnalysis {
  const responseType = detectResponseType(userInput, aiResponse)
  const shouldPlay = shouldPlayVoice(responseType, isInitialGreeting)
  
  // 音声感情の推定
  let voiceEmotion: string | undefined
  if (shouldPlay) {
    switch (responseType) {
      case 'encouragement':
        voiceEmotion = 'encouragement'
        break
      case 'agreement':
        voiceEmotion = 'agreement'
        break
      case 'emotional_support':
        voiceEmotion = 'support'
        break
      case 'initial_greeting':
        voiceEmotion = 'default' // 時間帯音声を使用
        break
      default:
        voiceEmotion = 'default'
    }
  }
  
  // 判定理由
  const reasoning = shouldPlay 
    ? `Voice enabled for ${responseType}: Requires emotional/interactive audio`
    : `Voice disabled for ${responseType}: Text-only communication appropriate`
  
  return {
    responseType,
    shouldPlayVoice: shouldPlay,
    voiceEmotion,
    confidence: calculateConfidence(userInput, aiResponse, responseType),
    reasoning
  }
}

// 判定の信頼度計算
function calculateConfidence(userInput: string, aiResponse: string, responseType: ResponseType): number {
  let confidence = 0.7 // ベースライン
  
  // キーワード一致度で信頼度調整
  const keywordMatches = getKeywordMatches(userInput, aiResponse, responseType)
  confidence += keywordMatches * 0.1
  
  // 応答長で調整
  if (responseType === 'agreement' && aiResponse.length < 30) {
    confidence += 0.2
  }
  
  return Math.min(1.0, confidence)
}

// キーワード一致数の計算
function getKeywordMatches(userInput: string, aiResponse: string, responseType: ResponseType): number {
  const keywords = getKeywordsForType(responseType)
  const text = (userInput + ' ' + aiResponse).toLowerCase()
  
  return keywords.filter(keyword => text.includes(keyword)).length
}

// 応答タイプ別キーワード
function getKeywordsForType(responseType: ResponseType): string[] {
  const keywordMap: Record<ResponseType, string[]> = {
    initial_greeting: ['おはよう', 'こんにちは', 'こんばんは'],
    encouragement: ['頑張', 'ダイエット', '応援', '挫折'],
    agreement: ['そうですね', 'なるほど', 'はい'],
    emotional_support: ['悲しい', '嬉しい', '心配', '元気'],
    general_conversation: ['どう', 'なぜ', 'いつ', 'どこ'],
    information_response: ['について', 'とは', '方法', 'やり方'],
    food_discussion: ['そば', 'うどん', '食事', '料理', '美味しい'],
    thinking: ['うーん', '考えて', 'そうですね...'],
    surprise: ['えっ', 'びっくり', '驚き', 'すごい']
  }
  
  return keywordMap[responseType] || []
}

// デバッグ機能
export function debugResponsePattern(userInput: string, aiResponse: string): void {
  console.log('🎯 Response Pattern Analysis Debug')
  console.log('=' .repeat(60))
  
  const analysis = analyzeResponse(userInput, aiResponse)
  
  console.log('Input:', userInput)
  console.log('Response:', aiResponse.substring(0, 50) + '...')
  console.log('Detected Type:', analysis.responseType)
  console.log('Should Play Voice:', analysis.shouldPlayVoice ? '✅ YES' : '❌ NO')
  console.log('Voice Emotion:', analysis.voiceEmotion || 'None')
  console.log('Confidence:', (analysis.confidence * 100).toFixed(1) + '%')
  console.log('Reasoning:', analysis.reasoning)
  
  console.log('\n📋 All Response Types:')
  const allTypes: ResponseType[] = [
    'initial_greeting', 'encouragement', 'agreement', 'emotional_support',
    'general_conversation', 'information_response', 'food_discussion', 'thinking', 'surprise'
  ]
  
  allTypes.forEach(type => {
    const shouldPlay = shouldPlayVoice(type, false)
    console.log(`  ${type}: ${shouldPlay ? '🎵 Voice' : '🔇 Text Only'}`)
  })
  
  console.log('=' .repeat(60))
}

// テスト用サンプル分析
export function runResponsePatternTests(): void {
  console.log('🧪 Running Response Pattern Tests')
  console.log('=' .repeat(60))

  const testCases = [
    {
      user: 'そばって美味しいですね',
      ai: 'そうですね！そばは栄養バランスも良くて、ダイエットにもおすすめですよ♪',
      expected: 'food_discussion'
    },
    {
      user: 'ダイエット頑張りたいです',
      ai: '素晴らしいですね！一緒に頑張りましょう♪ 応援しています！',
      expected: 'encouragement'
    },
    {
      user: 'おはようございます',
      ai: 'おはよう！今日も元気に頑張りましょう♪',
      expected: 'initial_greeting'
    },
    {
      user: '今日の天気はどうですか？',
      ai: 'お天気については詳しくわかりませんが、今日も良い一日になりそうですね。',
      expected: 'general_conversation'
    }
  ]

  testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}:`)
    const analysis = analyzeResponse(testCase.user, testCase.ai)
    const isCorrect = analysis.responseType === testCase.expected
    
    console.log(`  User: "${testCase.user}"`)
    console.log(`  AI: "${testCase.ai.substring(0, 40)}..."`)
    console.log(`  Expected: ${testCase.expected}`)
    console.log(`  Detected: ${analysis.responseType} ${isCorrect ? '✅' : '❌'}`)
    console.log(`  Voice: ${analysis.shouldPlayVoice ? '🎵 Enabled' : '🔇 Disabled'}`)
  })

  console.log('=' .repeat(60))
}

// ブラウザ環境でのデバッグ関数公開
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).debugResponsePattern = debugResponsePattern
  ;(window as unknown as Record<string, unknown>).runResponsePatternTests = runResponsePatternTests
  ;(window as unknown as Record<string, unknown>).analyzeResponse = analyzeResponse
  
  console.log('🎯 Response Pattern Controller Debug Functions Available:')
  console.log('- debugResponsePattern(userInput, aiResponse) : 応答パターン分析')
  console.log('- runResponsePatternTests() : パターン判定テスト')
  console.log('- analyzeResponse(userInput, aiResponse) : 詳細分析')
}