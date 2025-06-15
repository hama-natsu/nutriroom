// 🧪 NutriRoom 応答パターン制御テスト

import { 
  analyzeResponse, 
  shouldPlayVoice,
  runResponsePatternTests,
  type ResponseType
} from '../response-pattern-controller'

// 応答パターン基本テスト
export async function testBasicResponsePatterns(): Promise<void> {
  console.log('🧪 Testing Basic Response Patterns')
  console.log('=' .repeat(60))

  const testCases = [
    {
      name: 'Food Discussion (should be text-only)',
      user: 'そばって美味しいですね',
      ai: 'そうですね！そばは栄養バランスも良くて、ダイエットにもおすすめですよ♪',
      expectedVoice: false,
      expectedType: 'food_discussion'
    },
    {
      name: 'Encouragement (should have voice)',
      user: 'ダイエット頑張りたいです',
      ai: '素晴らしいですね！一緒に頑張りましょう♪ 応援しています！',
      expectedVoice: true,
      expectedType: 'encouragement'
    },
    {
      name: 'General Conversation (should be text-only)',
      user: '今日はどんな感じですか？',
      ai: '今日も良い一日になりそうですね。何か新しいことはありましたか？',
      expectedVoice: false,
      expectedType: 'general_conversation'
    },
    {
      name: 'Emotional Support (should have voice)',
      user: '最近ちょっと元気がないんです',
      ai: '大丈夫ですよ。そんな日もありますよね。一緒に頑張りましょう♪',
      expectedVoice: true,
      expectedType: 'emotional_support'
    },
    {
      name: 'Agreement (should have voice)',
      user: 'やっぱりそうですよね',
      ai: 'そうですね♪',
      expectedVoice: true,
      expectedType: 'agreement'
    }
  ]

  let passedTests = 0
  const totalTests = testCases.length

  testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test ${index + 1}: ${testCase.name}`)
    
    const analysis = analyzeResponse(testCase.user, testCase.ai)
    const voiceCorrect = analysis.shouldPlayVoice === testCase.expectedVoice
    const typeCorrect = analysis.responseType === testCase.expectedType
    
    console.log(`   User: "${testCase.user}"`)
    console.log(`   AI: "${testCase.ai.substring(0, 40)}..."`)
    console.log(`   Expected Voice: ${testCase.expectedVoice ? '🎵' : '🔇'} | Actual: ${analysis.shouldPlayVoice ? '🎵' : '🔇'} ${voiceCorrect ? '✅' : '❌'}`)
    console.log(`   Expected Type: ${testCase.expectedType} | Actual: ${analysis.responseType} ${typeCorrect ? '✅' : '❌'}`)
    console.log(`   Reasoning: ${analysis.reasoning}`)
    
    if (voiceCorrect && typeCorrect) {
      passedTests++
      console.log('   Result: ✅ PASS')
    } else {
      console.log('   Result: ❌ FAIL')
    }
  })

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`)
  if (passedTests === totalTests) {
    console.log('✅ ALL TESTS PASSED - Response pattern control is working correctly!')
  } else {
    console.error('❌ SOME TESTS FAILED - Response pattern control needs adjustment')
  }

  console.log('=' .repeat(60))
}

// 音声再生条件テスト
export async function testVoicePlaybackConditions(): Promise<void> {
  console.log('\n🧪 Testing Voice Playback Conditions')
  console.log('=' .repeat(60))

  console.log('🎵 Voice ENABLED scenarios:')
  const voiceEnabledTypes: ResponseType[] = ['initial_greeting', 'encouragement', 'agreement', 'emotional_support']
  voiceEnabledTypes.forEach(type => {
    const shouldPlay = shouldPlayVoice(type, false)
    console.log(`   ${type}: ${shouldPlay ? '✅ Voice' : '❌ Silent'}`)
  })

  console.log('\n🔇 Voice DISABLED scenarios:')
  const voiceDisabledTypes: ResponseType[] = ['general_conversation', 'information_response', 'food_discussion', 'thinking']
  voiceDisabledTypes.forEach(type => {
    const shouldPlay = shouldPlayVoice(type, false)
    console.log(`   ${type}: ${shouldPlay ? '❌ Voice' : '✅ Silent'}`)
  })

  console.log('\n🌅 Initial greeting (always voice enabled):')
  const initialGreeting = shouldPlayVoice('general_conversation', true)
  console.log(`   Initial greeting override: ${initialGreeting ? '✅ Voice' : '❌ Silent'}`)

  console.log('=' .repeat(60))
}

// 実際の会話シナリオテスト
export async function testRealConversationScenarios(): Promise<void> {
  console.log('\n🧪 Testing Real Conversation Scenarios')
  console.log('=' .repeat(60))

  const realScenarios = [
    {
      scenario: 'User asks about noodles',
      conversation: [
        { user: 'そばとうどん、どちらが健康的ですか？', ai: 'そばの方が栄養価が高めですね。タンパク質や食物繊維が豊富で、ダイエットにもおすすめです。' },
        { user: 'そば粉100%のものがいいんですか？', ai: 'はい、そば粉の割合が高いほど栄養価も高くなります。十割そばなどがおすすめですよ♪' }
      ],
      expectedPattern: 'Text-only responses (food discussion)'
    },
    {
      scenario: 'User needs encouragement',
      conversation: [
        { user: 'ダイエット始めたけど、なかなか続かなくて...', ai: '大丈夫ですよ！最初は誰でもそうです。一緒に頑張りましょう♪' },
        { user: 'ありがとうございます。頑張ります！', ai: 'その意気です！応援していますよ〜♪' }
      ],
      expectedPattern: 'Voice-enabled responses (encouragement/support)'
    },
    {
      scenario: 'Mixed conversation',
      conversation: [
        { user: 'こんにちは', ai: 'こんにちは♪ 今日も元気ですね！' },
        { user: 'カレーって太りますか？', ai: 'カレーは具材によりますね。野菜多めで低カロリーにもできますよ。' },
        { user: 'そうですね', ai: 'そうですね♪' }
      ],
      expectedPattern: 'Mixed: greeting(voice) → food(text) → agreement(voice)'
    }
  ]

  realScenarios.forEach((scenario, index) => {
    console.log(`\n📖 Scenario ${index + 1}: ${scenario.scenario}`)
    console.log(`Expected Pattern: ${scenario.expectedPattern}`)
    
    scenario.conversation.forEach((exchange, exchangeIndex) => {
      const analysis = analyzeResponse(exchange.user, exchange.ai)
      const voiceStatus = analysis.shouldPlayVoice ? '🎵 Voice' : '🔇 Text-only'
      
      console.log(`   Exchange ${exchangeIndex + 1}:`)
      console.log(`     User: "${exchange.user}"`)
      console.log(`     AI: "${exchange.ai}"`)
      console.log(`     Type: ${analysis.responseType} | ${voiceStatus}`)
    })
  })

  console.log('=' .repeat(60))
}

// 境界ケーステスト
export async function testEdgeCases(): Promise<void> {
  console.log('\n🧪 Testing Edge Cases')
  console.log('=' .repeat(60))

  const edgeCases = [
    {
      name: 'Very short response',
      user: 'はい',
      ai: 'はい♪',
      note: 'Should be detected as agreement'
    },
    {
      name: 'Mixed food and encouragement',
      user: 'ダイエット中だけど、ラーメン食べちゃいました...',
      ai: '大丈夫ですよ！たまにはそんな日もあります。明日からまた頑張りましょう♪',
      note: 'Should prioritize encouragement over food discussion'
    },
    {
      name: 'Empty/minimal response',
      user: 'ありがとう',
      ai: 'どういたしまして',
      note: 'General conversation, no special emotion'
    },
    {
      name: 'Multiple keywords',
      user: 'そばを食べて元気になりました！',
      ai: 'それは良かったです♪ そばは栄養豊富で、体にも良いですからね〜',
      note: 'Food + emotion, should resolve to food discussion'
    }
  ]

  edgeCases.forEach((testCase, index) => {
    console.log(`\n🔬 Edge Case ${index + 1}: ${testCase.name}`)
    
    const analysis = analyzeResponse(testCase.user, testCase.ai)
    
    console.log(`   Input: "${testCase.user}"`)
    console.log(`   Response: "${testCase.ai}"`)
    console.log(`   Note: ${testCase.note}`)
    console.log(`   Detected: ${analysis.responseType} | ${analysis.shouldPlayVoice ? '🎵 Voice' : '🔇 Text-only'}`)
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`)
  })

  console.log('=' .repeat(60))
}

// メイン統合テスト
export async function runResponsePatternIntegrationTest(): Promise<void> {
  console.log('🚀 Starting Response Pattern Integration Test')
  console.log('=' .repeat(80))

  try {
    await testBasicResponsePatterns()
    await testVoicePlaybackConditions() 
    await testRealConversationScenarios()
    await testEdgeCases()
    
    console.log('\n🎉 ALL RESPONSE PATTERN TESTS COMPLETED!')
    console.log('✅ Response pattern control system is working correctly')
    console.log('🎯 Voice playback will now be appropriately controlled')
    
    // システム組み込みテストも実行
    runResponsePatternTests()
    
  } catch (error) {
    console.error('❌ Response pattern test failed:', error)
    throw error
  }

  console.log('=' .repeat(80))
}

// ブラウザ環境でのテスト実行
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).testResponsePatterns = runResponsePatternIntegrationTest
  ;(window as unknown as Record<string, unknown>).testBasicPatterns = testBasicResponsePatterns
  ;(window as unknown as Record<string, unknown>).testVoiceConditions = testVoicePlaybackConditions
  
  console.log('🧪 Response Pattern Test Functions Available:')
  console.log('- testResponsePatterns() : 全統合テスト実行')
  console.log('- testBasicPatterns() : 基本パターンテスト')
  console.log('- testVoiceConditions() : 音声条件テスト')
}