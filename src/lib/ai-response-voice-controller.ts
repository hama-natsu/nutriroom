// 🎯 NutriRoom AI返答ベース音声判定システム - より正確で一貫した音声選択

export type AIResponseType = 
  | 'encouragement'          // 励まし・サポート
  | 'agreement'              // 共感・あいづち
  | 'emotional_support'      // 感情サポート
  | 'nutrition_advice'       // 栄養アドバイス（専門的）
  | 'food_discussion'        // 食べ物雑談
  | 'general_conversation'   // 一般会話
  | 'initial_greeting'       // 初期挨拶
  | 'thinking'               // 考えている表現

export interface AIResponseAnalysis {
  responseType: AIResponseType
  shouldPlayVoice: boolean
  voiceFile?: string
  confidence: number
  reasoning: string
  detectedPatterns: string[]
}

// 【核心機能】AI返答解析による音声判定 - 精度向上版
export function analyzeAiResponseForVoice(aiResponse: string): AIResponseAnalysis {
  console.log(`🎯 Analyzing AI response for voice: "${aiResponse.substring(0, 50)}..."`)
  
  const response = aiResponse.toLowerCase()
  const detectedPatterns: string[] = []
  
  // 【優先度1】本物の励まし・感情サポート（厳格判定）
  const genuineEncouragementPatterns = [
    '素晴らしい決意', '全力でサポート', '一緒に頑張り', '応援します',
    '大丈夫です', '安心してください', 'きっとできます', '負けないで',
    'ファイト', 'あなたなら', '私が支えます', '励まし', '頑張って',
    '応援し', '支援し', 'サポートし', '寄り添い', '一緒に乗り越え'
  ]
  
  const foundGenuineEncouragement = genuineEncouragementPatterns.filter(pattern => response.includes(pattern))
  if (foundGenuineEncouragement.length > 0) {
    detectedPatterns.push(...foundGenuineEncouragement)
    console.log('✅ AI response type: genuine_encouragement (voice enabled)')
    return createAnalysis('encouragement', true, 'akari_encouragement.wav', 0.95, 
      'AI response contains genuine encouragement/emotional support', detectedPatterns)
  }
  
  // 【優先度2】食べ物についての雑談・共感（音声不要）
  const foodDiscussionPatterns = [
    '美味しい', '好き', '食べ', '料理', '味', '香り', 'ですよね',
    'レシピ', '作り方', '食感', '旬', '季節', 'おすすめ',
    'いいですね', 'そうですね', '知ってます', '人気', '定番',
    '調理', '材料', '食材', '風味', '食べ方', 'チョコレート',
    '温かい', '冷たい', '甘い', '辛い', '酸っぱい', 'ポッキー'
  ]
  
  const foundFood = foodDiscussionPatterns.filter(pattern => response.includes(pattern))
  if (foundFood.length > 0) {
    detectedPatterns.push(...foundFood)
    console.log('❌ AI response type: food_discussion (text-only - casual food talk)')
    return createAnalysis('food_discussion', false, undefined, 0.9,
      'AI response is casual food discussion - text-only appropriate', detectedPatterns)
  }
  
  // 【優先度3】重要な共感・理解（食べ物文脈以外での深い理解）
  const deepAgreementPatterns = [
    'よく理解', '気持ち', 'よくわかり', 'そうなんです',
    'わかる', '理解でき', '共感', 'その気持ち', 'おっしゃる通り'
  ]
  
  const foundDeepAgreement = deepAgreementPatterns.filter(pattern => response.includes(pattern))
  if (foundDeepAgreement.length > 0) {
    detectedPatterns.push(...foundDeepAgreement)
    console.log('✅ AI response type: deep_agreement (voice enabled)')
    return createAnalysis('agreement', true, 'akari_agreement.wav', 0.85,
      'AI response shows deep understanding/empathy', detectedPatterns)
  }
  
  // 【優先度4】軽い共感・あいづち（食べ物文脈チェック）
  const lightAgreementPatterns = [
    'そうですね', 'なるほど', 'いいですね', 'わかります', '分かります', '同感', 'その通り'
  ]
  
  const foundLightAgreement = lightAgreementPatterns.filter(pattern => response.includes(pattern))
  if (foundLightAgreement.length > 0) {
    // 食べ物文脈での軽い共感は food_discussion として扱う
    const isFoodContext = response.includes('美味しい') || 
                         response.includes('食べ') || 
                         response.includes('料理') ||
                         response.includes('味') ||
                         response.includes('好き')
    
    if (isFoodContext) {
      detectedPatterns.push(...foundLightAgreement, 'food_context')
      console.log('❌ AI response type: food_discussion (light agreement in food context)')
      return createAnalysis('food_discussion', false, undefined, 0.8,
        'Light agreement in food context - text-only appropriate', detectedPatterns)
    } else {
      detectedPatterns.push(...foundLightAgreement)
      console.log('✅ AI response type: light_agreement (voice enabled)')
      return createAnalysis('agreement', true, 'akari_agreement.wav', 0.75,
        'AI response shows light agreement/acknowledgment', detectedPatterns)
    }
  }
  
  // 【優先度5】深刻な感情的サポート（重要な感情状況での支援）
  const emotionalSupportPatterns = [
    '元気出して', '楽しい気持ち', '嬉しい気持ち', '喜び', '幸せ',
    '落ち込んで', '悲しい', '辛い', '大変', '困難',
    '乗り越え', '克服', '前向き', 'ポジティブ',
    '寄り添', '側にい', '理解します', '心配しないで'
  ]
  
  const foundEmotional = emotionalSupportPatterns.filter(pattern => response.includes(pattern))
  if (foundEmotional.length > 0) {
    detectedPatterns.push(...foundEmotional)
    console.log('✅ AI response type: emotional_support (voice enabled)')
    return createAnalysis('emotional_support', true, 'akari_support.wav', 0.8,
      'AI response provides important emotional support', detectedPatterns)
  }
  
  // 【優先度6】栄養・健康アドバイス系（専門的な説明 - 音声なし）
  const nutritionAdvicePatterns = [
    'タンパク質', 'ビタミン', 'カロリー', '栄養素', 'ミネラル',
    '食物繊維', '炭水化物', '脂質', 'バランス', '摂取',
    '効果', '成分', '含まれ', '豊富', '推奨',
    '1日', 'グラム', '目安', '必要量', '不足',
    '過剰', '適量', '代謝', '消化', '吸収'
  ]
  
  const foundNutrition = nutritionAdvicePatterns.filter(pattern => response.includes(pattern))
  if (foundNutrition.length >= 2) { // 複数の専門用語が含まれる場合
    detectedPatterns.push(...foundNutrition)
    console.log('❌ AI response type: nutrition_advice (text-only - professional info)')
    return createAnalysis('nutrition_advice', false, undefined, 0.85,
      'AI response contains detailed nutritional information', detectedPatterns)
  }
  
  // 考えている表現（短いあいづち的な音声）
  const thinkingPatterns = [
    'うーん', 'そうですね...', '考えて', 'どうでしょう',
    'ちょっと', '少し', 'まあ', 'うん'
  ]
  
  const foundThinking = thinkingPatterns.filter(pattern => response.includes(pattern))
  if (foundThinking.length > 0 && aiResponse.length < 30) {
    detectedPatterns.push(...foundThinking)
    console.log('✅ AI response type: thinking (voice enabled - short)')
    return createAnalysis('thinking', true, 'akari_thinking.wav', 0.7,
      'AI response is short thinking expression', detectedPatterns)
  }
  
  // デフォルト：一般会話（音声なし）
  console.log('❌ AI response type: general_conversation (text-only)')
  return createAnalysis('general_conversation', false, undefined, 0.6,
    'AI response is general conversation', detectedPatterns)
}

// 分析結果作成ヘルパー
function createAnalysis(
  type: AIResponseType, 
  shouldPlay: boolean, 
  voiceFile: string | undefined,
  confidence: number,
  reasoning: string,
  patterns: string[]
): AIResponseAnalysis {
  return {
    responseType: type,
    shouldPlayVoice: shouldPlay,
    voiceFile,
    confidence,
    reasoning,
    detectedPatterns: patterns
  }
}

// 【改善版】音声再生判定（AI返答ベース）
export function shouldPlayVoiceForResponse(
  responseType: AIResponseType, 
  isInitialGreeting: boolean
): boolean {
  console.log(`=== Voice Decision (AI Response Based) ===`)
  console.log(`Response type: ${responseType}`)
  console.log(`Is initial greeting: ${isInitialGreeting}`)
  
  if (isInitialGreeting) {
    console.log('✅ Voice enabled: Initial greeting')
    return true
  }
  
  switch (responseType) {
    case 'encouragement':        // 励まし・サポート
    case 'agreement':           // 共感・あいづち
    case 'emotional_support':   // 感情サポート
    case 'thinking':            // 考えている（短い）
      console.log(`✅ Voice enabled: ${responseType} (emotional connection)`)
      return true
      
    case 'nutrition_advice':    // 栄養アドバイス
    case 'food_discussion':     // 食べ物雑談
    case 'general_conversation': // 一般会話
      console.log(`❌ Voice disabled: ${responseType} (text-only appropriate)`)
      return false
      
    default:
      console.log(`❌ Voice disabled: Unknown type ${responseType}`)
      return false
  }
}

// 適切な音声ファイル選択
export function selectAppropriateVoice(responseType: AIResponseType): string | null {
  if (!shouldPlayVoiceForResponse(responseType, false)) {
    return null // 音声再生なし
  }
  
  switch (responseType) {
    case 'encouragement':
      return 'akari_encouragement.wav'
    case 'agreement':  
      return 'akari_agreement.wav'
    case 'emotional_support':
      return 'akari_support.wav'
    case 'thinking':
      return 'akari_thinking.wav'
    default:
      return null // No fallback to default.wav - system should handle gracefully
  }
}

// 包括的な分析（初期挨拶対応）
export function analyzeAiResponseComprehensive(
  aiResponse: string,
  isInitialGreeting: boolean = false
): AIResponseAnalysis {
  if (isInitialGreeting) {
    return createAnalysis('initial_greeting', true, 'akari_greeting.wav', 1.0,
      'Initial greeting always has voice', ['greeting'])
  }
  
  return analyzeAiResponseForVoice(aiResponse)
}

// デバッグ機能
export function debugAiResponseVoice(aiResponse: string): void {
  console.log('🎯 AI Response Voice Analysis Debug')
  console.log('=' .repeat(60))
  
  const analysis = analyzeAiResponseForVoice(aiResponse)
  
  console.log('AI Response:', `"${aiResponse}"`)
  console.log('Detected Type:', analysis.responseType)
  console.log('Should Play Voice:', analysis.shouldPlayVoice ? '✅ YES' : '❌ NO')
  console.log('Voice File:', analysis.voiceFile || 'None')
  console.log('Confidence:', (analysis.confidence * 100).toFixed(1) + '%')
  console.log('Reasoning:', analysis.reasoning)
  console.log('Detected Patterns:', analysis.detectedPatterns.join(', ') || 'None')
  
  console.log('\n📋 All Response Types:')
  const allTypes: AIResponseType[] = [
    'encouragement', 'agreement', 'emotional_support', 'thinking',
    'nutrition_advice', 'food_discussion', 'general_conversation'
  ]
  
  allTypes.forEach(type => {
    const shouldPlay = shouldPlayVoiceForResponse(type, false)
    const voiceFile = selectAppropriateVoice(type)
    console.log(`  ${type}: ${shouldPlay ? '🎵' : '🔇'} ${voiceFile || 'No voice'}`)
  })
  
  console.log('=' .repeat(60))
}

// テストケース実行
export function runAiResponseVoiceTests(): void {
  console.log('🧪 Running AI Response Voice Tests')
  console.log('=' .repeat(60))

  const testCases = [
    {
      response: '素晴らしい決意ですね！私も全力でサポートします！',
      expected: 'encouragement',
      expectVoice: true,
      scenario: 'User says "ありがとう頑張る"'
    },
    {
      response: 'そば美味しいですよね！栄養面では食物繊維が豊富で...',
      expected: 'food_discussion',
      expectVoice: false,
      scenario: 'User says "そば"'
    },
    {
      response: 'タンパク質を1日60グラム摂取し、カロリーは1800kcalを目安に...',
      expected: 'nutrition_advice', 
      expectVoice: false,
      scenario: 'User asks "ダイエットしたい"'
    },
    {
      response: 'そうですね♪ その気持ちよくわかります。',
      expected: 'agreement',
      expectVoice: true,
      scenario: 'User shares feelings'
    },
    {
      response: 'うーん、そうですね...',
      expected: 'thinking',
      expectVoice: true,
      scenario: 'AI is thinking'
    }
  ]

  let passedTests = 0

  testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}: ${testCase.scenario}`)
    const analysis = analyzeAiResponseForVoice(testCase.response)
    
    const typeCorrect = analysis.responseType === testCase.expected
    const voiceCorrect = analysis.shouldPlayVoice === testCase.expectVoice
    
    console.log(`  AI Response: "${testCase.response.substring(0, 40)}..."`)
    console.log(`  Expected: ${testCase.expected} | Voice: ${testCase.expectVoice ? '🎵' : '🔇'}`)
    console.log(`  Detected: ${analysis.responseType} | Voice: ${analysis.shouldPlayVoice ? '🎵' : '🔇'}`)
    console.log(`  Type: ${typeCorrect ? '✅' : '❌'} | Voice: ${voiceCorrect ? '✅' : '❌'}`)
    
    if (typeCorrect && voiceCorrect) {
      passedTests++
      console.log('  Result: ✅ PASS')
    } else {
      console.log('  Result: ❌ FAIL')
    }
  })

  console.log(`\n📊 Test Results: ${passedTests}/${testCases.length} tests passed`)
  if (passedTests === testCases.length) {
    console.log('✅ ALL TESTS PASSED - AI response voice system working correctly!')
  } else {
    console.error('❌ SOME TESTS FAILED - AI response voice system needs adjustment')
  }

  console.log('=' .repeat(60))
}

// ===============================================
// 🎯 NutriRoom 音声システム完全再構築
// 一文目判定システムへの完全移行
// ===============================================

// 【完全新システム】ResponseType定義
export type ResponseType = 
  | 'food_chat'      // 食べ物雑談（音声不要）
  | 'encouragement'  // 本当の励まし（音声必要）
  | 'agreement'      // あいづち（短い音声）
  | 'general'        // 一般会話（音声不要）
  | 'initial_greeting' // 初回挨拶（音声必要）

// 【完全新システム】一文目専用判定
export const analyzeFirstSentenceOnly = (aiResponse: string): ResponseType => {
  // 一文目のみ抽出（句読点・絵文字で区切り）
  const firstSentence = aiResponse.split(/[！。？♪♡😊～]/)[0];
  
  console.log(`=== First Sentence Analysis ===`);
  console.log(`Full response: "${aiResponse}"`);
  console.log(`First sentence only: "${firstSentence}"`);
  
  // 食べ物雑談を最優先判定（音声不要）
  if (firstSentence.includes('チョコ') || 
      firstSentence.includes('ポッキー') || 
      firstSentence.includes('美味しい') ||
      firstSentence.includes('大好き') ||
      firstSentence.includes('お菓子')) {
    console.log('First sentence type: FOOD_CHAT (text-only)');
    return 'food_chat';
  }
  
  // 本当の励まし（音声必要）
  if (firstSentence.includes('素晴らしい') || 
      firstSentence.includes('頑張って') ||
      firstSentence.includes('応援') ||
      firstSentence.includes('サポート')) {
    console.log('First sentence type: ENCOURAGEMENT (voice enabled)');
    return 'encouragement';
  }
  
  // あいづち（短い音声）
  if (firstSentence.includes('そうですね') || 
      firstSentence.includes('なるほど') ||
      firstSentence.includes('わかります')) {
    console.log('First sentence type: AGREEMENT (short voice)');
    return 'agreement';
  }
  
  console.log('First sentence type: GENERAL (text-only)');
  return 'general';
};

// 【完全新システム】時間ベース音声ファイル取得
function getTimeBasedVoice(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'akari_morning.wav';
  if (hour >= 12 && hour < 18) return 'akari_afternoon.wav';
  if (hour >= 18 && hour < 22) return 'akari_evening.wav';
  return 'akari_late.wav';
}

// 【完全新システム】シンプルな音声制御
const handleVoiceForResponse = (aiResponse: string, isInitialGreeting: boolean = false) => {
  console.log(`=== Simple Voice Control ===`);
  
  if (isInitialGreeting) {
    console.log('✅ Initial greeting - Voice ENABLED');
    return { shouldPlay: true, voiceFile: getTimeBasedVoice() };
  }
  
  const firstSentenceType = analyzeFirstSentenceOnly(aiResponse);
  
  switch (firstSentenceType) {
    case 'encouragement':
      console.log('✅ Encouragement - Voice ENABLED');
      return { shouldPlay: true, voiceFile: 'akari_encouragement.wav' };
      
    case 'agreement':
      console.log('✅ Agreement - Voice ENABLED');
      return { shouldPlay: true, voiceFile: 'akari_agreement.wav' };
      
    case 'food_chat':
    case 'general':
    default:
      console.log('❌ Regular chat - Voice DISABLED');
      return { shouldPlay: false, voiceFile: null };
  }
};

// 【完全新システム】メイン関数
export const determineVoiceFromAiResponse = (aiResponse: string, isInitialGreeting: boolean = false) => {
  return handleVoiceForResponse(aiResponse, isInitialGreeting);
};

// 【完全新システム】テスト関数
export function runCompleteSystemTests(): void {
  console.log('🧪 Running Complete System Tests');
  console.log('=' .repeat(60));

  const testCases = [
    {
      response: 'チョコ大好き〜♡わかる！',
      expectedType: 'food_chat',
      expectVoice: false,
      scenario: 'Food chat (problematic case)'
    },
    {
      response: 'ポッキーね！😊 わかる〜！私も大好き♡...',
      expectedType: 'food_chat',
      expectVoice: false,
      scenario: 'Casual food chat'
    },
    {
      response: '素晴らしい決意ですね！私も応援します...',
      expectedType: 'encouragement',
      expectVoice: true,
      scenario: 'Genuine encouragement'
    },
    {
      response: 'そうですね〜♪とても良いと思います...',
      expectedType: 'agreement',
      expectVoice: true,
      scenario: 'Agreement response'
    },
    {
      response: '美味しいですよね！栄養価も高くて...',
      expectedType: 'food_chat',
      expectVoice: false,
      scenario: 'Food discussion'
    }
  ];

  let passedTests = 0;

  testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}: ${testCase.scenario}`);
    const result = determineVoiceFromAiResponse(testCase.response, false);
    
    // Extract the detected type from the first sentence analysis
    const firstSentence = testCase.response.split(/[！。？♪♡😊～]/)[0];
    const detectedType = analyzeFirstSentenceOnly(testCase.response);
    
    const typeCorrect = detectedType === testCase.expectedType;
    const voiceCorrect = result.shouldPlay === testCase.expectVoice;
    
    console.log(`  AI Response: "${testCase.response.substring(0, 40)}..."`);
    console.log(`  First sentence: "${firstSentence}"`);
    console.log(`  Expected: ${testCase.expectedType} | Voice: ${testCase.expectVoice ? '🎵' : '🔇'}`);
    console.log(`  Detected: ${detectedType} | Voice: ${result.shouldPlay ? '🎵' : '🔇'}`);
    console.log(`  Type: ${typeCorrect ? '✅' : '❌'} | Voice: ${voiceCorrect ? '✅' : '❌'}`);
    
    if (typeCorrect && voiceCorrect) {
      passedTests++;
      console.log('  Result: ✅ PASS');
    } else {
      console.log('  Result: ❌ FAIL');
      console.log(`  Debug: shouldPlay=${result.shouldPlay}, voiceFile=${result.voiceFile}`);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${testCases.length} tests passed`);
  if (passedTests === testCases.length) {
    console.log('✅ ALL TESTS PASSED - First-sentence system working correctly!');
  } else {
    console.error('❌ SOME TESTS FAILED - First-sentence system needs adjustment');
  }

  console.log('=' .repeat(60));
}

// ブラウザ環境でのデバッグ関数公開
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).debugAiResponseVoice = debugAiResponseVoice
  ;(window as unknown as Record<string, unknown>).runAiVoiceTests = runAiResponseVoiceTests
  ;(window as unknown as Record<string, unknown>).analyzeAiResponse = analyzeAiResponseForVoice
  ;(window as unknown as Record<string, unknown>).determineVoiceFromAiResponse = determineVoiceFromAiResponse
  ;(window as unknown as Record<string, unknown>).runCompleteSystemTests = runCompleteSystemTests
  ;(window as unknown as Record<string, unknown>).analyzeFirstSentenceOnly = analyzeFirstSentenceOnly
  
  console.log('🎯 NutriRoom Voice System - First Sentence Analysis:')
  console.log('- determineVoiceFromAiResponse(aiResponse) : 完全新システム音声判定')
  console.log('- runCompleteSystemTests() : 完全システムテスト')
  console.log('- analyzeFirstSentenceOnly(aiResponse) : 一文目分析')
  console.log('')
  console.log('🔧 Legacy Debug Functions (for comparison):')
  console.log('- debugAiResponseVoice(aiResponse) : レガシー音声分析')
  console.log('- runAiVoiceTests() : レガシーテスト')
  console.log('- analyzeAiResponse(aiResponse) : レガシー詳細分析')
}