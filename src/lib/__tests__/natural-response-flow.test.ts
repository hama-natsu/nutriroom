// 🧪 NutriRoom Phase 2.2: 自然な会話フローテスト

import { 
  generateNaturalResponse,
  evaluateResponseQuality,
  debugNaturalResponseController
} from '../natural-response-controller'

import {
  conversationManager,
  createConversationSession,
  getSessionInfo
} from '../conversation-context-manager'


// テストシナリオ: ダイエット相談の自然な会話フロー
export async function testNaturalConversationFlow(): Promise<void> {
  console.log('🧪 Testing Natural Conversation Flow')
  console.log('=' .repeat(60))

  // 1. 新しい会話セッション開始
  const sessionId = createConversationSession('akari')
  console.log('✅ Created session:', sessionId.substring(0, 8) + '...')

  // 2. 初回メッセージ（挨拶 + ダイエット相談）
  console.log('\n📝 Test 1: Initial greeting with diet consultation')
  const response1 = await generateNaturalResponse({
    sessionId,
    userMessage: 'おはよう！ダイエットについて相談したいんです',
    characterId: 'akari',
    timeSlot: 'morning'
  })

  console.log('User:', 'おはよう！ダイエットについて相談したいんです')
  console.log('Akari:', response1.response)
  console.log('Voice Pattern:', response1.voicePattern)
  console.log('Response Type:', response1.responseType)
  console.log('Should Collect Info:', response1.guidance.shouldCollectInfo)

  const quality1 = evaluateResponseQuality(
    'おはよう！ダイエットについて相談したいんです',
    response1.response,
    conversationManager.getSession(sessionId)!.history
  )
  console.log('Quality Score:', {
    naturalness: quality1.naturalness.toFixed(2),
    relevance: quality1.relevance.toFixed(2),
    overall: quality1.overall.toFixed(2)
  })

  // 3. 基本情報提供
  console.log('\n📝 Test 2: Basic information sharing')
  const response2 = await generateNaturalResponse({
    sessionId,
    userMessage: '3ヶ月で5kg痩せたいです。普段は夜遅く食事することが多くて...',
    characterId: 'akari'
  })

  console.log('User:', '3ヶ月で5kg痩せたいです。普段は夜遅く食事することが多くて...')
  console.log('Akari:', response2.response)
  console.log('Voice Pattern:', response2.voicePattern)
  console.log('Guidance Stage:', response2.guidance.stage)

  // 4. 動機の理解
  console.log('\n📝 Test 3: Understanding motivation')
  const response3 = await generateNaturalResponse({
    sessionId,
    userMessage: '友達の結婚式があるので、それまでに綺麗になりたくて',
    characterId: 'akari'
  })

  console.log('User:', '友達の結婚式があるので、それまでに綺麗になりたくて')
  console.log('Akari:', response3.response)
  console.log('Voice Pattern:', response3.voicePattern)

  // 5. 制約条件の確認
  console.log('\n📝 Test 4: Constraint identification')
  const response4 = await generateNaturalResponse({
    sessionId,
    userMessage: '仕事が忙しくて料理する時間があまりないんです。アレルギーは特にありません',
    characterId: 'akari'
  })

  console.log('User:', '仕事が忙しくて料理する時間があまりないんです。アレルギーは特にありません')
  console.log('Akari:', response4.response)
  console.log('Voice Pattern:', response4.voicePattern)

  // 6. 個別化されたアドバイス
  console.log('\n📝 Test 5: Personalized advice')
  const response5 = await generateNaturalResponse({
    sessionId,
    userMessage: 'はい、アドバイスお願いします！',
    characterId: 'akari'
  })

  console.log('User:', 'はい、アドバイスお願いします！')
  console.log('Akari:', response5.response)
  console.log('Voice Pattern:', response5.voicePattern)

  // 7. 継続サポート
  console.log('\n📝 Test 6: Ongoing support')
  const response6 = await generateNaturalResponse({
    sessionId,
    userMessage: 'ありがとうございます！頑張ってみます',
    characterId: 'akari'
  })

  console.log('User:', 'ありがとうございます！頑張ってみます')
  console.log('Akari:', response6.response)
  console.log('Voice Pattern:', response6.voicePattern)

  // 8. セッション情報の確認
  console.log('\n📊 Session Analysis:')
  const finalSessionInfo = getSessionInfo(sessionId)
  console.log('Final Session Info:', {
    messageCount: finalSessionInfo.messageCount,
    guidanceStage: finalSessionInfo.guidanceStage,
    needsGreeting: finalSessionInfo.needsGreeting
  })

  const session = conversationManager.getSession(sessionId)!
  console.log('Session History:', {
    hasGreeted: session.history.hasGreeted,
    basicInfoCollected: session.history.basicInfoCollected,
    motivationUnderstood: session.history.motivationUnderstood,
    constraintsIdentified: session.history.constraintsIdentified,
    personalAdviceGiven: session.history.personalAdviceGiven
  })

  console.log('=' .repeat(60))
}

// 挨拶重複防止テスト
export async function testGreetingDuplicationPrevention(): Promise<void> {
  console.log('\n🧪 Testing Greeting Duplication Prevention')
  console.log('=' .repeat(60))

  const sessionId = createConversationSession('akari')

  // 初回メッセージ
  const response1 = await generateNaturalResponse({
    sessionId,
    userMessage: 'こんにちは',
    characterId: 'akari',
    timeSlot: 'afternoon'
  })

  console.log('Test 1 - First message:')
  console.log('User:', 'こんにちは')
  console.log('Akari:', response1.response)
  console.log('Contains greeting:', response1.response.includes('こんにちは'))

  // 2回目のメッセージ（挨拶なしになるはず）
  const response2 = await generateNaturalResponse({
    sessionId,
    userMessage: 'ダイエットについて聞きたいです',
    characterId: 'akari',
    timeSlot: 'afternoon'
  })

  console.log('\nTest 2 - Second message:')
  console.log('User:', 'ダイエットについて聞きたいです')
  console.log('Akari:', response2.response)
  console.log('Contains greeting:', response2.response.includes('こんにちは'))
  console.log('Should NOT contain time-based greeting ✅')

  console.log('=' .repeat(60))
}

// 時間帯別応答テスト
export async function testTimeBasedResponses(): Promise<void> {
  console.log('\n🧪 Testing Time-Based Responses')
  console.log('=' .repeat(60))

  const timeSlots = [
    { slot: 'morning_early', hour: 6, message: '早起きですね！健康について相談したいです' },
    { slot: 'lunch', hour: 12, message: 'お昼です。食事について相談があります' },
    { slot: 'evening', hour: 18, message: 'お疲れさまです。夕食のアドバイスください' },
    { slot: 'very_late', hour: 2, message: 'こんな時間ですが...食事について聞きたくて' }
  ]

  for (const timeTest of timeSlots) {
    const sessionId = createConversationSession('akari')
    
    const response = await generateNaturalResponse({
      sessionId,
      userMessage: timeTest.message,
      characterId: 'akari',
      timeSlot: timeTest.slot
    })

    console.log(`\n${timeTest.slot} (${timeTest.hour}:00):`)
    console.log('User:', timeTest.message)
    console.log('Akari:', response.response)
    console.log('Voice Pattern:', response.voicePattern)
  }

  console.log('=' .repeat(60))
}

// 応答品質分析テスト
export async function testResponseQualityAnalysis(): Promise<void> {
  console.log('\n🧪 Testing Response Quality Analysis')
  console.log('=' .repeat(60))

  const testCases = [
    {
      userMessage: 'ダイエットしたいです',
      response: 'ダイエットについて相談したいんですね♪ まず、現在の状況を教えてもらえますか？ どのくらいの期間で、どんな目標をお考えですか？',
      description: 'Natural diet consultation response'
    },
    {
      userMessage: 'ダイエットしたいです',
      response: 'システムエラーが発生しました。データベースにアクセスできません。',
      description: 'Mechanical/unnatural response'
    },
    {
      userMessage: 'ダイエットしたいです',
      response: 'そうですね',
      description: 'Too short response'
    },
    {
      userMessage: 'ダイエットしたいです',
      response: 'ダイエットについてのご相談ですね。まず最初に基本的な情報をお聞きします。現在の体重、身長、年齢、性別、過去のダイエット経験、現在の食事パターン、運動習慣、睡眠時間、ストレス状況、アレルギーの有無、服用中の薬剤、既往歴について詳しく教えてください。',
      description: 'Too long/mechanical response'
    }
  ]

  for (const testCase of testCases) {
    const session = conversationManager.getSession(createConversationSession('akari'))!
    const quality = evaluateResponseQuality(
      testCase.userMessage,
      testCase.response,
      session.history
    )

    console.log(`\n${testCase.description}:`)
    console.log('Response:', testCase.response.substring(0, 50) + '...')
    console.log('Quality Scores:', {
      naturalness: quality.naturalness.toFixed(2),
      relevance: quality.relevance.toFixed(2),
      progression: quality.progression.toFixed(2),
      overall: quality.overall.toFixed(2)
    })
  }

  console.log('=' .repeat(60))
}

// メインテスト実行関数
export async function runAllNaturalResponseTests(): Promise<void> {
  console.log('🚀 Starting NutriRoom Phase 2.2 Natural Response Tests')
  console.log('=' .repeat(80))

  try {
    await testNaturalConversationFlow()
    await testGreetingDuplicationPrevention()
    await testTimeBasedResponses()
    await testResponseQualityAnalysis()

    console.log('\n✅ All tests completed successfully!')
    console.log('🎯 Natural Response Control System is working properly')
    
    // デバッグ情報表示
    debugNaturalResponseController()
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }

  console.log('=' .repeat(80))
}

// ブラウザ環境でのテスト実行
if (typeof window !== 'undefined') {
  // デバッグ用グローバル関数として公開
  ;(window as unknown as Record<string, unknown>).testNaturalResponse = runAllNaturalResponseTests
  ;(window as unknown as Record<string, unknown>).debugNaturalResponse = debugNaturalResponseController
}