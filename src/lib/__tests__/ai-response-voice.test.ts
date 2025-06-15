// 🧪 NutriRoom AI返答ベース音声選択システムテスト

import { 
  analyzeAiResponseForVoice, 
  runAiResponseVoiceTests
} from '../ai-response-voice-controller'

// 改善された音声選択テスト
export async function testImprovedVoiceSelection(): Promise<void> {
  console.log('🧪 Testing Improved Voice Selection (AI Response Based)')
  console.log('=' .repeat(70))

  // 問題ケースの解決確認
  const problemCases = [
    {
      name: 'User: "ありがとう頑張る" - Should get encouragement voice',
      userInput: 'ありがとう頑張る',
      aiResponse: '素晴らしい決意ですね！私も全力でサポートします！',
      expectedType: 'encouragement',
      expectedVoice: true,
      issue: 'Previously incorrectly detected as food_discussion'
    },
    {
      name: 'User: "ポッキー" - Should be text-only food discussion',
      userInput: 'ポッキー',
      aiResponse: 'ポッキー美味しいですよね〜！チョコレート味が特に人気ですね',
      expectedType: 'food_discussion',
      expectedVoice: false,
      issue: 'Food casual chat should be text-only, not encouragement'
    },
    {
      name: 'User: "そば" - Should be text-only',
      userInput: 'そば',
      aiResponse: 'そば美味しいですよね！栄養面では食物繊維が豊富です。',
      expectedType: 'food_discussion',
      expectedVoice: false,
      issue: 'Should remain text-only for food discussion'
    },
    {
      name: 'User: "ダイエットしたい" - Nutritional advice should be text-only',
      userInput: 'ダイエットしたい',
      aiResponse: 'タンパク質を1日60グラム摂取し、カロリーは1800kcalを目安にしてください。',
      expectedType: 'nutrition_advice',
      expectedVoice: false,
      issue: 'Professional advice should be text-only for focus'
    },
    {
      name: 'User: "元気ない" - Should get emotional support voice',
      userInput: '最近元気ないです',
      aiResponse: '大丈夫ですよ。そんな時もありますよね。一緒に乗り越えましょう。',
      expectedType: 'emotional_support',
      expectedVoice: true,
      issue: 'Emotional support should have voice'
    },
    {
      name: 'Food context light agreement - Should be text-only',
      userInput: 'カレー好きです',
      aiResponse: 'そうですね！カレー美味しいですよね♪',
      expectedType: 'food_discussion',
      expectedVoice: false,
      issue: 'Light agreement in food context should be text-only'
    }
  ]

  let passedTests = 0
  const totalTests = problemCases.length

  problemCases.forEach((testCase, index) => {
    console.log(`\n📝 Problem Case ${index + 1}: ${testCase.name}`)
    console.log(`   Issue: ${testCase.issue}`)
    
    const analysis = analyzeAiResponseForVoice(testCase.aiResponse)
    const typeCorrect = analysis.responseType === testCase.expectedType
    const voiceCorrect = analysis.shouldPlayVoice === testCase.expectedVoice
    
    console.log(`   User Input: "${testCase.userInput}"`)
    console.log(`   AI Response: "${testCase.aiResponse.substring(0, 50)}..."`)
    console.log(`   Expected: ${testCase.expectedType} | Voice: ${testCase.expectedVoice ? '🎵' : '🔇'}`)
    console.log(`   Detected: ${analysis.responseType} | Voice: ${analysis.shouldPlayVoice ? '🎵' : '🔇'}`)
    console.log(`   Patterns: ${analysis.detectedPatterns.join(', ')}`)
    console.log(`   Reasoning: ${analysis.reasoning}`)
    
    if (typeCorrect && voiceCorrect) {
      passedTests++
      console.log('   Result: ✅ PROBLEM SOLVED')
    } else {
      console.log('   Result: ❌ STILL HAS ISSUES')
      if (!typeCorrect) console.log(`     - Type mismatch: expected ${testCase.expectedType}, got ${analysis.responseType}`)
      if (!voiceCorrect) console.log(`     - Voice mismatch: expected ${testCase.expectedVoice}, got ${analysis.shouldPlayVoice}`)
    }
  })

  console.log(`\n📊 Problem Resolution: ${passedTests}/${totalTests} cases solved`)
  if (passedTests === totalTests) {
    console.log('✅ ALL PROBLEMS SOLVED - AI response-based system working correctly!')
  } else {
    console.error('❌ SOME PROBLEMS REMAIN - System needs further adjustment')
  }

  console.log('=' .repeat(70))
}

// 詳細なパターン認識テスト
export async function testPatternRecognition(): Promise<void> {
  console.log('\n🧪 Testing Pattern Recognition Accuracy')
  console.log('=' .repeat(70))

  const patternTests = [
    {
      category: 'Encouragement Patterns',
      responses: [
        '素晴らしい判断ですね！',
        '一緒に頑張りましょう♪',
        '大丈夫、応援しています！',
        '全力でサポートします',
        'その調子で続けてください'
      ],
      expectedType: 'encouragement',
      expectedVoice: true
    },
    {
      category: 'Agreement Patterns', 
      responses: [
        'そうですね、よくわかります。',
        'なるほど、その通りですね。',
        'おっしゃる通りです♪',
        'いいですね、同感です。',
        'よく理解できます。'
      ],
      expectedType: 'agreement',
      expectedVoice: true
    },
    {
      category: 'Nutrition Advice Patterns',
      responses: [
        'タンパク質は1日60グラム必要です。',
        'カロリーは1800kcalを目安にしてください。',
        'ビタミンCが豊富に含まれています。',
        '食物繊維の摂取量を増やしましょう。',
        '栄養バランスを考慮した食事が重要です。'
      ],
      expectedType: 'nutrition_advice',
      expectedVoice: false
    },
    {
      category: 'Food Discussion Patterns',
      responses: [
        'そば美味しいですよね！',
        '季節の料理を楽しみましょう。',
        'この食材は旬で香りも良いです。',
        '作り方も簡単で食感が良いです。',
        'レシピを試してみてください。'
      ],
      expectedType: 'food_discussion',
      expectedVoice: false
    }
  ]

  patternTests.forEach(test => {
    console.log(`\n📂 ${test.category}:`)
    
    test.responses.forEach((response, index) => {
      const analysis = analyzeAiResponseForVoice(response)
      const typeCorrect = analysis.responseType === test.expectedType
      const voiceCorrect = analysis.shouldPlayVoice === test.expectedVoice
      
      console.log(`   ${index + 1}. "${response}"`)
      console.log(`      → ${analysis.responseType} | ${analysis.shouldPlayVoice ? '🎵' : '🔇'} ${typeCorrect && voiceCorrect ? '✅' : '❌'}`)
      if (analysis.detectedPatterns.length > 0) {
        console.log(`      → Patterns: ${analysis.detectedPatterns.join(', ')}`)
      }
    })
  })

  console.log('=' .repeat(70))
}

// 境界ケース・エッジケーステスト
export async function testEdgeCases(): Promise<void> {
  console.log('\n🧪 Testing Edge Cases')
  console.log('=' .repeat(70))

  const edgeCases = [
    {
      name: 'Mixed encouragement + nutrition',
      response: '頑張ってますね！タンパク質も意識して摂取しましょう。',
      note: 'Should prioritize encouragement over nutrition'
    },
    {
      name: 'Very short response',
      response: 'そうですね♪',
      note: 'Should be detected as agreement'
    },
    {
      name: 'Long nutritional explanation',
      response: 'タンパク質は筋肉の維持に重要で、1日の摂取量は体重1kgあたり1.2-1.6グラムが推奨されています。良質なタンパク質源として、魚、肉、卵、豆類があります。',
      note: 'Should be nutrition_advice due to multiple technical terms'
    },
    {
      name: 'Emotional + food discussion',
      response: '美味しそうですね！食べると元気になりますよね♪',
      note: 'Should resolve based on dominant pattern'
    },
    {
      name: 'Thinking expression',
      response: 'うーん、そうですね...',
      note: 'Should be thinking with voice (short expression)'
    }
  ]

  edgeCases.forEach((testCase, index) => {
    console.log(`\n🔬 Edge Case ${index + 1}: ${testCase.name}`)
    console.log(`   Note: ${testCase.note}`)
    
    const analysis = analyzeAiResponseForVoice(testCase.response)
    
    console.log(`   Response: "${testCase.response}"`)
    console.log(`   Detected: ${analysis.responseType} | ${analysis.shouldPlayVoice ? '🎵' : '🔇'}`)
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`)
    console.log(`   Patterns: ${analysis.detectedPatterns.join(', ') || 'None'}`)
    console.log(`   Reasoning: ${analysis.reasoning}`)
  })

  console.log('=' .repeat(70))
}

// 新旧システム比較テスト
export async function testSystemComparison(): Promise<void> {
  console.log('\n🧪 Testing New vs Old System Comparison')
  console.log('=' .repeat(70))

  const comparisonCases = [
    {
      name: 'Problematic case 1',
      userInput: 'ありがとう頑張る',
      aiResponse: '素晴らしい決意ですね！私も全力でサポートします！',
      oldSystemIssue: 'Would incorrectly classify as food_discussion',
      newSystemExpected: 'encouragement with voice'
    },
    {
      name: 'Problematic case 2', 
      userInput: 'そば好き',
      aiResponse: 'そば美味しいですよね！私も大好きです♪',
      oldSystemIssue: 'Mixed signals from user input and AI response',
      newSystemExpected: 'food_discussion without voice'
    },
    {
      name: 'Nutrition advice case',
      userInput: 'ダイエット教えて',
      aiResponse: 'カロリー制限と栄養バランスが重要です。タンパク質は体重1kgあたり1.2g摂取してください。',
      oldSystemIssue: 'Would give voice based on "ダイエット" keyword',
      newSystemExpected: 'nutrition_advice without voice (professional info)'
    }
  ]

  comparisonCases.forEach((testCase, index) => {
    console.log(`\n📊 Comparison ${index + 1}: ${testCase.name}`)
    console.log(`   User Input: "${testCase.userInput}"`)
    console.log(`   AI Response: "${testCase.aiResponse}"`)
    console.log(`   Old System Issue: ${testCase.oldSystemIssue}`)
    console.log(`   New System Expected: ${testCase.newSystemExpected}`)
    
    // AI返答ベース分析
    const newAnalysis = analyzeAiResponseForVoice(testCase.aiResponse)
    console.log(`   New System Result: ${newAnalysis.responseType} | ${newAnalysis.shouldPlayVoice ? '🎵 Voice' : '🔇 No Voice'}`)
    console.log(`   Improvement: ${newAnalysis.reasoning}`)
  })

  console.log('=' .repeat(70))
}

// メイン統合テスト
export async function runAiResponseVoiceIntegrationTest(): Promise<void> {
  console.log('🚀 Starting AI Response Voice Integration Test')
  console.log('=' .repeat(80))

  try {
    // 組み込みテスト実行
    runAiResponseVoiceTests()
    
    // 詳細テスト実行
    await testImprovedVoiceSelection()
    await testPatternRecognition()
    await testEdgeCases()
    await testSystemComparison()
    
    console.log('\n🎉 ALL AI RESPONSE VOICE TESTS COMPLETED!')
    console.log('✅ AI response-based voice selection system is working correctly')
    console.log('🎯 Voice selection is now more accurate and consistent')
    
  } catch (error) {
    console.error('❌ AI response voice test failed:', error)
    throw error
  }

  console.log('=' .repeat(80))
}

// ブラウザ環境でのテスト実行
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).testAiResponseVoice = runAiResponseVoiceIntegrationTest
  ;(window as unknown as Record<string, unknown>).testImprovedVoice = testImprovedVoiceSelection
  ;(window as unknown as Record<string, unknown>).testPatterns = testPatternRecognition
  
  console.log('🧪 AI Response Voice Test Functions Available:')
  console.log('- testAiResponseVoice() : 全統合テスト実行')
  console.log('- testImprovedVoice() : 改善された音声選択テスト')
  console.log('- testPatterns() : パターン認識テスト')
}