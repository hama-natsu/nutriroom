// 🎯 NutriRoom AI返答ベース音声判定システム - 統一システム対応版
// レガシーシステム完全除去、7キャラクター統一対応

import { 
  CharacterId,
  handleUnifiedVoiceResponse,
  selectUnifiedVoice
} from '@/lib/unified-voice-system'

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
// 🎯 NutriRoom 多様音声選択システム
// スプレッドシート準拠16パターン音声活用
// ===============================================

// 【多様音声システム】ResponseType定義
export type ResponseType = 
  | 'food_chat'      // 食べ物雑談（音声不要）
  | 'emotional_response'  // 感情的反応（詳細パターン選択）
  | 'general'        // 一般会話（音声不要）
  | 'initial_greeting' // 初回挨拶（音声必要）

// 【新】詳細感情音声マッピングシステム
export const selectDetailedVoicePattern = (aiResponse: string): string | null => {
  console.log(`=== Detailed Voice Pattern Selection ===`);
  console.log(`Analyzing: "${aiResponse}"`);
  
  // 0. 食べ物雑談の最優先チェック（音声無効化）
  const firstSentence = aiResponse.split(/[！。？♪♡😊～]/)[0];
  if (firstSentence.includes('チョコ') || 
      firstSentence.includes('ポッキー') || 
      firstSentence.includes('美味しい') ||
      firstSentence.includes('大好き') ||
      firstSentence.includes('お菓子') ||
      firstSentence.includes('食べ物') ||
      firstSentence.includes('料理')) {
    console.log('Food chat detected - returning null (no voice)');
    return null;
  }
  
  // 1. 称賛・素晴らしい系
  if (aiResponse.includes('すごい') || aiResponse.includes('素晴らしい') || 
      aiResponse.includes('本当に') || aiResponse.includes('完璧')) {
    console.log('Selected: akari_great.wav (称賛)');
    return 'akari_great.wav';
  }
  
  // 2. 同意・共感系
  if (aiResponse.includes('そうですね') || aiResponse.includes('私もそう思') || 
      aiResponse.includes('同感') || aiResponse.includes('おっしゃる通り')) {
    console.log('Selected: akari_agreement.wav (同意・共感)');
    return 'akari_agreement.wav';
  }
  
  // 3. 気持ち共感系（理解より優先）
  if (aiResponse.includes('その気持ち') || aiResponse.includes('気持ち') ||
      (aiResponse.includes('分かります') && aiResponse.includes('気持ち'))) {
    console.log('Selected: akari_empathy.wav (気持ち共感)');
    return 'akari_empathy.wav';
  }
  
  // 4. 理解・納得系
  if (aiResponse.includes('なるほど') || aiResponse.includes('勉強になり') || 
      aiResponse.includes('よく分かり') || aiResponse.includes('理解') ||
      aiResponse.includes('分かります')) {
    console.log('Selected: akari_understanding.wav (理解・納得)');
    return 'akari_understanding.wav';
  }
  
  // 5. 驚き・興味系
  if (aiResponse.includes('えー') || aiResponse.includes('びっくり') || 
      aiResponse.includes('そうなんですか') || aiResponse.includes('知らなかった')) {
    console.log('Selected: akari_surprise.wav (驚き・興味)');
    return 'akari_surprise.wav';
  }
  
  // 6. 努力認知系
  if (aiResponse.includes('頑張って') || aiResponse.includes('その調子') || 
      aiResponse.includes('よくやって') || aiResponse.includes('努力')) {
    console.log('Selected: akari_effort.wav (努力認知)');
    return 'akari_effort.wav';
  }
  
  // 7. 肯定評価系
  if (aiResponse.includes('いいですね') || aiResponse.includes('良いと思') || 
      aiResponse.includes('素敵') || aiResponse.includes('ナイス')) {
    console.log('Selected: akari_nice.wav (肯定評価)');
    return 'akari_nice.wav';
  }
  
  // 8. 応援・励まし系
  if (aiResponse.includes('一緒に頑張り') || aiResponse.includes('ファイト') || 
      aiResponse.includes('応援') || aiResponse.includes('負けないで')) {
    console.log('Selected: akari_cheer.wav (応援)');
    return 'akari_cheer.wav';
  }
  
  // 9. サポート宣言系
  if (aiResponse.includes('サポート') || aiResponse.includes('相談') || 
      aiResponse.includes('いつでも') || aiResponse.includes('支えます')) {
    console.log('Selected: akari_support.wav (サポート宣言)');
    return 'akari_support.wav';
  }
  
  // 10. ポジティブ系
  if (aiResponse.includes('大丈夫') || aiResponse.includes('前向き') || 
      aiResponse.includes('きっと') || aiResponse.includes('明るく')) {
    console.log('Selected: akari_positive.wav (ポジティブ)');
    return 'akari_positive.wav';
  }
  
  // 11. 感謝系
  if (aiResponse.includes('ありがとう') || aiResponse.includes('嬉しい') || 
      aiResponse.includes('感謝') || aiResponse.includes('助かり')) {
    console.log('Selected: akari_thanks.wav (感謝)');
    return 'akari_thanks.wav';
  }
  
  // 12. どういたしまして系
  if (aiResponse.includes('どういたしまして') || aiResponse.includes('当然') || 
      aiResponse.includes('いえいえ') || aiResponse.includes('頼って')) {
    console.log('Selected: akari_welcome.wav (どういたしまして)');
    return 'akari_welcome.wav';
  }
  
  // 13. 安心・問題なし系
  if (aiResponse.includes('問題ありません') || aiResponse.includes('心配') || 
      aiResponse.includes('安心') || aiResponse.includes('全然大丈夫')) {
    console.log('Selected: akari_no_problem.wav (安心・問題なし)');
    return 'akari_no_problem.wav';
  }
  
  // 14. 考え込み系
  if (aiResponse.includes('う〜ん') || aiResponse.includes('一緒に考え') || 
      aiResponse.includes('どうでしょう') || aiResponse.includes('検討')) {
    console.log('Selected: akari_thinking.wav (考え込み)');
    return 'akari_thinking.wav';
  }
  
  // 15. 謝罪系
  if (aiResponse.includes('すみません') || aiResponse.includes('ごめん') || 
      aiResponse.includes('申し訳') || aiResponse.includes('気をつけ')) {
    console.log('Selected: akari_sorry.wav (謝罪)');
    return 'akari_sorry.wav';
  }
  
  console.log('No specific voice pattern matched - using general encouragement');
  return 'akari_encouragement.wav'; // デフォルト
};

// 【多様音声システム】強力キーワード判定
const hasStrongEncouragementKeywords = (aiResponse: string): boolean => {
  const strongKeywords = [
    '素晴らしい', 'すごい', '頑張って', '応援', 'サポート',
    '本当に', '完璧', '感謝', 'ありがとう', '大丈夫'
  ];
  
  return strongKeywords.some(keyword => aiResponse.includes(keyword));
};

// 【多様音声システム】感情的音声必要判定
const shouldHaveEmotionalVoice = (response: string): boolean => {
  const emotionalKeywords = [
    'そうですね', 'なるほど', 'すごい', 'いいですね', 'わかります',
    'ありがとう', 'びっくり', '頑張って', 'サポート', '大丈夫',
    '私もそう思', '同感', '理解', '共感', '安心', '気持ち',
    '分かります', '一緒に頑張り', 'ファイト', '応援', '相談',
    'その気持ち', '前向き', 'きっと', '嬉しい', '感謝'
  ];
  
  return emotionalKeywords.some(keyword => response.includes(keyword));
};

// 【多様音声システム】ハイブリッド判定システム
export const analyzeFirstSentenceOnly = (aiResponse: string): ResponseType => {
  const firstSentence = aiResponse.split(/[！。？♪♡😊～]/)[0];
  
  console.log(`=== Hybrid Voice Analysis ===`);
  console.log(`Full response: "${aiResponse}"`);
  console.log(`First sentence: "${firstSentence}"`);
  
  // 食べ物雑談を最優先判定（音声不要）
  if (firstSentence.includes('チョコ') || 
      firstSentence.includes('ポッキー') || 
      firstSentence.includes('美味しい') ||
      firstSentence.includes('大好き') ||
      firstSentence.includes('お菓子') ||
      firstSentence.includes('食べ物') ||
      firstSentence.includes('料理')) {
    console.log('Food chat detected - Voice DISABLED');
    return 'food_chat';
  }
  
  // 強力キーワードまたは感情的反応がある場合
  const hasStrongEncouragement = hasStrongEncouragementKeywords(aiResponse);
  const hasEmotionalContent = shouldHaveEmotionalVoice(aiResponse);
  
  if (hasStrongEncouragement || hasEmotionalContent) {
    console.log('Emotional response detected - Detailed voice pattern selection');
    return 'emotional_response';
  }
  
  console.log('General conversation - Voice DISABLED');
  return 'general';
};

// 【完全新システム】時間ベース音声ファイル取得（キャラクター対応・11段階）
function getTimeBasedVoice(characterId: string = 'akari'): string {
  const hour = new Date().getHours();
  
  if (characterId === 'minato') {
    // みなと専用11段階時間帯音声
    if (hour >= 1 && hour < 5) return 'minato_very_late.wav';
    if (hour >= 5 && hour < 7) return 'minato_morning_early.wav';
    if (hour >= 7 && hour < 9) return 'minato_morning.wav';
    if (hour >= 9 && hour < 11) return 'minato_morning_late.wav';
    if (hour >= 11 && hour < 13) return 'minato_lunch.wav';
    if (hour >= 13 && hour < 15) return 'minato_afternoon.wav';
    if (hour >= 15 && hour < 17) return 'minato_snack.wav';
    if (hour >= 17 && hour < 19) return 'minato_evening.wav';
    if (hour >= 19 && hour < 21) return 'minato_dinner.wav';
    if (hour >= 21 && hour < 23) return 'minato_night.wav';
    return 'minato_late.wav'; // 23:00-0:59
  }
  
  // あかりのデフォルト
  if (hour >= 6 && hour < 12) return 'akari_morning.wav';
  if (hour >= 12 && hour < 18) return 'akari_afternoon.wav';
  if (hour >= 18 && hour < 22) return 'akari_evening.wav';
  return 'akari_late.wav';
}

// 【多様音声システム】最適音声判定（キャラクター対応）
const determineOptimalVoice = (aiResponse: string, isInitialGreeting: boolean = false, characterId: string = 'akari') => {
  console.log(`=== Optimal Voice Determination ===`);
  console.log(`Character: ${characterId}, Initial: ${isInitialGreeting}`);
  
  if (isInitialGreeting) {
    console.log('✅ Initial greeting - Time-based voice');
    return { shouldPlay: true, voiceFile: getTimeBasedVoice(characterId) };
  }
  
  // みなとの場合は専用の感情音声パターンを使用
  if (characterId === 'minato') {
    const minatoVoice = selectMinatoEmotionalVoice(aiResponse);
    if (minatoVoice) {
      console.log(`✅ Minato emotional voice selected: ${minatoVoice}`);
      return { shouldPlay: true, voiceFile: minatoVoice };
    }
    console.log('❌ Minato voice - no emotional pattern matched');
    return { shouldPlay: false, voiceFile: null };
  }
  
  const responseType = analyzeFirstSentenceOnly(aiResponse);
  
  switch (responseType) {
    case 'emotional_response':
      // 詳細パターン選択で豊かな感情表現
      const detailedVoice = selectDetailedVoicePattern(aiResponse);
      console.log(`✅ Emotional voice selected: ${detailedVoice}`);
      return { shouldPlay: true, voiceFile: detailedVoice };
      
    case 'food_chat':
    case 'general':
    default:
      console.log('❌ Regular conversation - Voice DISABLED');
      return { shouldPlay: false, voiceFile: null };
  }
};

// 【みなと専用】感情音声選択システム（35パターン対応）
function selectMinatoEmotionalVoice(aiResponse: string): string | null {
  console.log(`🎭 Minato emotional voice analysis: "${aiResponse.substring(0, 50)}..."`);
  
  const response = aiResponse.toLowerCase();
  
  // 1. 季節対応音声（特別パターン）
  const currentMonth = new Date().getMonth() + 1;
  if (response.includes('季節') || response.includes('時期') || response.includes('頃')) {
    if (currentMonth >= 3 && currentMonth <= 5) return 'minato_spring.wav';
    if (currentMonth >= 6 && currentMonth <= 8) return 'minato_summer.wav';
    if (currentMonth >= 9 && currentMonth <= 11) return 'minato_autumn.wav';
    return 'minato_winter.wav';
  }
  
  // 2. 決まり文句・キャッチフレーズ（ツンデレ特有）
  if (response.includes('べつに') || response.includes('別に') || 
      response.includes('勘違い') || response.includes('そんなつもり')) {
    const phrases = ['minato_catchphrase_1.wav', 'minato_catchphrase_2.wav', 
                    'minato_catchphrase_3.wav', 'minato_catchphrase_4.wav'];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  // 3. 励まし・応援系
  if (response.includes('頑張') || response.includes('応援') || 
      response.includes('ファイト') || response.includes('負けない')) {
    return Math.random() > 0.5 ? 'minato_cheer.wav' : 'minato_encouragement.wav';
  }
  
  // 4. 同意・共感系
  if (response.includes('そうですね') || response.includes('同感') || 
      response.includes('おっしゃる通り') || response.includes('その通り')) {
    return 'minato_agreement.wav';
  }
  
  // 5. 理解・納得系
  if (response.includes('なるほど') || response.includes('理解') || 
      response.includes('分かり') || response.includes('わかり')) {
    return 'minato_understanding.wav';
  }
  
  // 6. 驚き・興味系
  if (response.includes('えー') || response.includes('びっくり') || 
      response.includes('驚') || response.includes('へえ')) {
    return 'minato_surprise.wav';
  }
  
  // 7. 考え込み・思案系
  if (response.includes('う〜ん') || response.includes('考え') || 
      response.includes('どうでしょう') || response.includes('検討')) {
    return 'minato_thinking.wav';
  }
  
  // 8. 称賛・素晴らしい系
  if (response.includes('素晴らしい') || response.includes('すごい') || 
      response.includes('よくでき') || response.includes('上手')) {
    return Math.random() > 0.5 ? 'minato_great.wav' : 'minato_nice.wav';
  }
  
  // 9. 感謝系
  if (response.includes('ありがと') || response.includes('感謝') || 
      response.includes('お礼') || response.includes('助かり')) {
    return 'minato_thanks.wav';
  }
  
  // 10. 謝罪系
  if (response.includes('ごめん') || response.includes('すみません') || 
      response.includes('申し訳') || response.includes('失礼')) {
    return 'minato_sorry.wav';
  }
  
  // 11. 歓迎・挨拶系
  if (response.includes('いらっしゃい') || response.includes('ようこそ') || 
      response.includes('お疲れ') || response.includes('こんにち')) {
    return 'minato_welcome.wav';
  }
  
  // 12. 支援・サポート系
  if (response.includes('サポート') || response.includes('支援') || 
      response.includes('手伝') || response.includes('一緒に')) {
    return Math.random() > 0.5 ? 'minato_support.wav' : 'minato_care.wav';
  }
  
  // 13. 努力・頑張り認知系
  if (response.includes('努力') || response.includes('一生懸命') || 
      response.includes('真面目') || response.includes('取り組')) {
    return 'minato_effort.wav';
  }
  
  // 14. 共感・気持ち理解系
  if (response.includes('気持ち') || response.includes('心境') || 
      response.includes('お察し') || response.includes('よく分か')) {
    return 'minato_empathy.wav';
  }
  
  // 15. 問題なし・大丈夫系
  if (response.includes('大丈夫') || response.includes('問題ない') || 
      response.includes('心配') || response.includes('安心')) {
    return 'minato_no_problem.wav';
  }
  
  console.log('❌ No emotional pattern matched for Minato');
  return null;
}

// 【多様音声システム】メイン関数（キャラクター対応）
export const determineVoiceFromAiResponse = (aiResponse: string, isInitialGreeting: boolean = false, characterId: string = 'akari') => {
  return determineOptimalVoice(aiResponse, isInitialGreeting, characterId);
};

// 【多様音声システム】豊かな感情テスト
export function runDiverseVoiceTests(): void {
  console.log('🎵 Running Diverse Voice System Tests - 16 Patterns');
  console.log('=' .repeat(60));

  const emotionalTestCases = [
    // 食べ物雑談（音声なし）
    {
      response: 'チョコ大好き〜♡わかる！',
      expectedType: 'food_chat',
      expectedVoice: null,
      scenario: '食べ物雑談 (問題ケース)'
    },
    {
      response: 'ポッキーね！😊 美味しいですよね...',
      expectedType: 'food_chat',
      expectedVoice: null,
      scenario: '食べ物雑談'
    },
    
    // 称賛・素晴らしい系
    {
      response: 'すごいですね〜！本当に素晴らしいです♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_great.wav',
      scenario: '称賛・素晴らしい系'
    },
    
    // 同意・共感系
    {
      response: 'そうですね〜♪私もそう思います！',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_agreement.wav',
      scenario: '同意・共感系'
    },
    
    // 理解・納得系
    {
      response: 'なるほど！とても勉強になりました〜',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_understanding.wav',
      scenario: '理解・納得系'
    },
    
    // 驚き・興味系
    {
      response: 'えー！そうなんですか？びっくりです〜！',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_surprise.wav',
      scenario: '驚き・興味系'
    },
    
    // 気持ち共感系
    {
      response: 'その気持ち、よく分かります〜♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_empathy.wav',
      scenario: '気持ち共感系'
    },
    
    // 努力認知系
    {
      response: '頑張っていますね！その調子です〜♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_effort.wav',
      scenario: '努力認知系'
    },
    
    // 肯定評価系
    {
      response: 'いいですね〜！とても良いと思います♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_nice.wav',
      scenario: '肯定評価系'
    },
    
    // 応援・励まし系
    {
      response: '一緒に頑張りましょう！ファイト♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_cheer.wav',
      scenario: '応援・励まし系'
    },
    
    // サポート宣言系
    {
      response: 'いつでもサポートします〜！相談してくださいね♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_support.wav',
      scenario: 'サポート宣言系'
    },
    
    // ポジティブ系
    {
      response: '大丈夫ですよ！きっと前向きにいけます♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_positive.wav',
      scenario: 'ポジティブ系'
    },
    
    // 感謝系
    {
      response: 'ありがとうございます！とても嬉しいです♪',
      expectedType: 'emotional_response',
      expectedVoice: 'akari_thanks.wav',
      scenario: '感謝系'
    }
  ];

  let passedTests = 0;

  emotionalTestCases.forEach((testCase, index) => {
    console.log(`\n🎭 Test ${index + 1}: ${testCase.scenario}`);
    const result = determineVoiceFromAiResponse(testCase.response, false);
    const detectedType = analyzeFirstSentenceOnly(testCase.response);
    
    const typeCorrect = detectedType === testCase.expectedType;
    const voiceCorrect = result.voiceFile === testCase.expectedVoice;
    const playCorrect = result.shouldPlay === (testCase.expectedVoice !== null);
    
    console.log(`  🎤 AI Response: "${testCase.response.substring(0, 50)}..."`);
    console.log(`  🎯 Expected: ${testCase.expectedType} | Voice: ${testCase.expectedVoice || 'None'}`);
    console.log(`  🔍 Detected: ${detectedType} | Voice: ${result.voiceFile || 'None'}`);
    console.log(`  📊 Type: ${typeCorrect ? '✅' : '❌'} | Voice: ${voiceCorrect ? '✅' : '❌'} | Play: ${playCorrect ? '✅' : '❌'}`);
    
    if (typeCorrect && voiceCorrect && playCorrect) {
      passedTests++;
      console.log('  ✨ Result: ✅ PASS - Rich emotional voice experience!');
    } else {
      console.log('  ⚠️ Result: ❌ FAIL');
      console.log(`  📝 Debug: shouldPlay=${result.shouldPlay}, voiceFile=${result.voiceFile}`);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${emotionalTestCases.length} tests passed`);
  if (passedTests === emotionalTestCases.length) {
    console.log('✨ ALL TESTS PASSED - Diverse voice system with 16 patterns working perfectly!');
    console.log('🎵 Rich emotional voice experience achieved!');
  } else {
    console.error('❌ SOME TESTS FAILED - Diverse voice system needs adjustment');
  }

  console.log('=' .repeat(60));
}

// ===============================================
// 🚫 レガシーシステム競合解決: 完全バイパス制御
// ===============================================

// 音声再生の最終制御（レガシーシステムを完全無効化）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const playSelectedVoice = async (selectedVoice: string | null, isInitialGreeting: boolean = false): Promise<boolean> => {
  console.log(`=== Final Voice Playback Control ===`);
  console.log(`Selected voice: ${selectedVoice}`);
  console.log(`Is initial greeting: ${isInitialGreeting}`);
  
  // 新システムで音声が選択されている場合、レガシーシステムを完全無視
  if (selectedVoice) {
    console.log(`🎵 Playing NEW SYSTEM voice: ${selectedVoice}`);
    console.log(`❌ BYPASSING legacy system completely`);
    
    try {
      const audioPath = `/audio/recorded/akari/${selectedVoice}`;
      console.log(`Loading: ${audioPath}`);
      
      // 直接音声再生（レガシーシステムを経由しない）
      if (typeof window !== 'undefined' && window.Audio) {
        const audio = new Audio(audioPath);
        await audio.play();
        console.log(`✅ Successfully played: ${selectedVoice}`);
        return true;
      } else {
        console.log(`⚠️ Audio not available in current environment`);
        return false;
      }
      
    } catch (error) {
      console.log(`❌ Failed to play ${selectedVoice}:`, error);
      // フォールバックもレガシーシステムを使わない
      return false;
    }
  }
  
  // 初回挨拶の場合のみ時間帯音声
  if (isInitialGreeting) {
    console.log(`🕐 Playing time-based greeting for initial contact`);
    const timeVoice = getTimeBasedVoice();
    console.log(`🎵 Time-based voice: ${timeVoice}`);
    
    try {
      const audioPath = `/audio/recorded/akari/${timeVoice}`;
      console.log(`Loading: ${audioPath}`);
      
      if (typeof window !== 'undefined' && window.Audio) {
        const audio = new Audio(audioPath);
        await audio.play();
        console.log(`✅ Successfully played time-based voice: ${timeVoice}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Failed to play time-based voice:`, error);
      return false;
    }
  } else {
    console.log(`❌ No voice selected - silent response`);
  }
  
  return false;
};

// 【完全新システム】レガシー除去済み音声ハンドラー（みなと専用）
export const handleAiResponseVoice = async (
  aiResponse: string, 
  isInitialGreeting: boolean = false,
  characterId: string = 'akari'
): Promise<boolean> => {
  console.log(`=== 完全新システム Voice Response Handler ===`);
  console.log(`Character: ${characterId}, Initial: ${isInitialGreeting}`);
  console.log(`Response: "${aiResponse.substring(0, 50)}..."`);
  console.log(`🗑️ LEGACY SYSTEM: 完全除去済み`);
  
  if (isInitialGreeting) {
    // 初回挨拶は時間帯音声（キャラクター別）
    console.log(`🎯 Initial greeting - using time-based voice`);
    const timeVoice = getTimeBasedVoice(characterId);
    return await playDirectVoice(timeVoice, characterId);
  }
  
  // みなとの場合は専用感情音声システム
  if (characterId === 'minato') {
    console.log(`🎭 Minato character - using dedicated emotional voice system`);
    const minatoVoice = selectMinatoEmotionalVoice(aiResponse);
    if (minatoVoice) {
      console.log(`🎵 Selected Minato voice: ${minatoVoice}`);
      return await playDirectVoice(minatoVoice, characterId);
    }
    console.log(`🔇 No emotional pattern matched for Minato`);
    return false;
  }
  
  // あかりの場合は既存システム
  const akariVoice = selectDetailedVoicePattern(aiResponse);
  if (akariVoice) {
    console.log(`🎵 Selected Akari voice: ${akariVoice}`);
    return await playDirectVoice(akariVoice, characterId);
  }
  
  console.log(`🔇 No voice needed for this response`);
  return false;
};

// 【みなと専用】音声再生システム（フォールバック・ループ防止）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function playMinatoVoiceWithFallback(voiceFile: string, characterId: string): Promise<boolean> {
  console.log(`=== Minato Voice Playback System ===`);
  console.log(`Attempting to play: ${voiceFile}`);
  
  if (characterId !== 'minato') {
    console.log('⚠️ Non-Minato character - using fallback system');
    return await playSelectedVoiceWithFallback(voiceFile, false, characterId);
  }
  
  try {
    const audioPath = `/audio/recorded/minato/${voiceFile}`;
    console.log(`🎵 Loading Minato voice: ${audioPath}`);
    
    if (typeof window !== 'undefined' && window.Audio) {
      const audio = new Audio(audioPath);
      
      // ファイル存在確認のため、loadイベントでタイムアウト処理
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log(`⚠️ Minato voice file timeout: ${voiceFile}`);
          resolve(false);
        }, 3000);
        
        audio.oncanplay = async () => {
          clearTimeout(timeout);
          try {
            await audio.play();
            console.log(`✅ Successfully played Minato voice: ${voiceFile}`);
            resolve(true);
          } catch (playError) {
            console.log(`❌ Failed to play Minato voice: ${voiceFile}`, playError);
            resolve(false);
          }
        };
        
        audio.onerror = () => {
          clearTimeout(timeout);
          console.log(`❌ Minato voice file not found: ${voiceFile}`);
          resolve(false);
        };
        
        audio.load();
      });
    } else {
      console.log('⚠️ Audio not available in current environment');
      return false;
    }
  } catch (error) {
    console.log(`❌ Critical error loading Minato voice: ${voiceFile}`, error);
    return false;
  }
}

// 【直接音声再生】レガシーシステム完全除去版
async function playDirectVoice(voiceFile: string, characterId: string): Promise<boolean> {
  console.log(`=== Direct Voice Playback System ===`);
  console.log(`Playing: ${voiceFile} for ${characterId}`);
  
  try {
    const audioPath = characterId === 'minato' 
      ? `/audio/recorded/minato/${voiceFile}`
      : `/audio/recorded/akari/${voiceFile}`;
    
    console.log(`🎵 Loading voice file: ${audioPath}`);
    
    if (typeof window !== 'undefined' && window.Audio) {
      const audio = new Audio(audioPath);
      
      // ファイル存在確認とタイムアウト処理
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log(`⚠️ Voice file timeout: ${voiceFile}`);
          resolve(false);
        }, 3000);
        
        audio.oncanplay = async () => {
          clearTimeout(timeout);
          try {
            await audio.play();
            console.log(`✅ Successfully played voice: ${voiceFile}`);
            resolve(true);
          } catch (playError) {
            console.log(`❌ Failed to play voice: ${voiceFile}`, playError);
            resolve(false);
          }
        };
        
        audio.onerror = () => {
          clearTimeout(timeout);
          console.log(`❌ Voice file not found: ${voiceFile}`);
          resolve(false);
        };
        
        audio.load();
      });
    } else {
      console.log('⚠️ Audio not available in current environment');
      return false;
    }
  } catch (error) {
    console.log(`❌ Critical error loading voice: ${voiceFile}`, error);
    return false;
  }
}

// キャラクター別音声パターン選択（あかり専用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectDetailedVoicePatternForCharacter = (aiResponse: string, characterId: string): string | null => {
  console.log(`=== Character Voice Pattern Selection ===`);
  console.log(`Character: ${characterId}, Analyzing: "${aiResponse}"`);
  
  // みなとの場合は専用システムを使用（この関数は使用しない）
  if (characterId === 'minato') {
    console.log('🎭 Minato character - using dedicated emotional voice system');
    return null;
  }
  
  // あかりの場合は既存のパターン選択を使用
  return selectDetailedVoicePattern(aiResponse);
};

// フォールバック付き音声再生（あかり専用）
const playSelectedVoiceWithFallback = async (
  selectedVoice: string | null, 
  isInitialGreeting: boolean = false,
  characterId: string = 'akari'
): Promise<boolean> => {
  console.log(`=== Voice Playback with Fallback ===`);
  console.log(`Character: ${characterId}, Voice: ${selectedVoice}, Initial: ${isInitialGreeting}`);
  
  // みなとの場合は専用システムを使用
  if (characterId === 'minato') {
    console.log('🎭 Minato character detected - redirecting to dedicated system');
    return false;
  }
  
  // あかりの既存処理
  if (selectedVoice) {
    try {
      const audioPath = `/audio/recorded/akari/${selectedVoice}`;
      if (typeof window !== 'undefined' && window.Audio) {
        const audio = new Audio(audioPath);
        await audio.play();
        console.log(`✅ Akari voice played: ${selectedVoice}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Failed to play Akari voice: ${selectedVoice}`, error);
      return false;
    }
  }
  
  if (isInitialGreeting) {
    const timeVoice = getTimeBasedVoice('akari');
    try {
      const audioPath = `/audio/recorded/akari/${timeVoice}`;
      if (typeof window !== 'undefined' && window.Audio) {
        const audio = new Audio(audioPath);
        await audio.play();
        console.log(`✅ Akari time-based voice played: ${timeVoice}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Failed to play Akari time-based voice: ${timeVoice}`, error);
    }
  }
  
  return false;
};

// 【互換性維持】旧関数名でのエイリアス（デバッグ関数参照前に宣言）
export const runCompleteSystemTests = runDiverseVoiceTests;

// ブラウザ環境でのデバッグ関数公開
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).debugAiResponseVoice = debugAiResponseVoice
  ;(window as unknown as Record<string, unknown>).runAiVoiceTests = runAiResponseVoiceTests
  ;(window as unknown as Record<string, unknown>).analyzeAiResponse = analyzeAiResponseForVoice
  ;(window as unknown as Record<string, unknown>).determineVoiceFromAiResponse = determineVoiceFromAiResponse
  ;(window as unknown as Record<string, unknown>).runDiverseVoiceTests = runDiverseVoiceTests
  ;(window as unknown as Record<string, unknown>).runCompleteSystemTests = runCompleteSystemTests
  ;(window as unknown as Record<string, unknown>).analyzeFirstSentenceOnly = analyzeFirstSentenceOnly
  ;(window as unknown as Record<string, unknown>).selectDetailedVoicePattern = selectDetailedVoicePattern
  ;(window as unknown as Record<string, unknown>).handleAiResponseVoice = handleAiResponseVoice
  
  console.log('🎵 NutriRoom Diverse Voice System - 16 Emotional Patterns:')
  console.log('- handleAiResponseVoice(aiResponse) : 🚫レガシー競合解決版音声制御')
  console.log('- determineVoiceFromAiResponse(aiResponse) : 多様音声システム音声判定')
  console.log('- runDiverseVoiceTests() : 多様音声システムテスト')
  console.log('- selectDetailedVoicePattern(aiResponse) : 16パターン詳細選択')
  console.log('- analyzeFirstSentenceOnly(aiResponse) : ハイブリッド分析')
  console.log('')
  console.log('✨ Rich Voice Patterns Available:')
  console.log('akari_great.wav, akari_agreement.wav, akari_understanding.wav,')
  console.log('akari_surprise.wav, akari_empathy.wav, akari_effort.wav,')
  console.log('akari_nice.wav, akari_cheer.wav, akari_support.wav,')
  console.log('akari_positive.wav, akari_thanks.wav, akari_welcome.wav,')
  console.log('akari_no_problem.wav, akari_thinking.wav, akari_sorry.wav + time-based voices')
  console.log('')
  console.log('🔧 Legacy Debug Functions (for comparison):')
  console.log('- debugAiResponseVoice(aiResponse) : レガシー音声分析')
  console.log('- runAiVoiceTests() : レガシーテスト')
  console.log('- analyzeAiResponse(aiResponse) : レガシー詳細分析')
}

// ===============================================
// 🎯 統一システム統合ハンドラー（推奨）
// ===============================================

/**
 * 統一音声システム対応版メインハンドラー
 * 全7キャラクター対応、レガシーシステム完全除去
 */
export async function handleUnifiedAiResponseVoice(
  characterId: string,
  aiResponse: string,
  isInitialGreeting: boolean = false
): Promise<boolean> {
  console.log(`=== 統一AI応答音声ハンドラー ===`);
  console.log(`キャラクター: ${characterId}`);
  console.log(`初回挨拶: ${isInitialGreeting}`);
  console.log(`応答: "${aiResponse.substring(0, 50)}..."`);
  console.log(`🗑️ レガシーシステム: 完全除去済み`);
  
  // 統一システムを使用
  const validCharacters = ['akari', 'minato', 'yuki', 'riku', 'mao', 'satsuki', 'sora'];
  if (!validCharacters.includes(characterId)) {
    console.log(`❌ 未対応キャラクター: ${characterId}`);
    return false;
  }
  
  return await handleUnifiedVoiceResponse(
    characterId as CharacterId,
    aiResponse,
    isInitialGreeting
  );
}

/**
 * 統一システム音声選択のみ（再生なし）
 */
export function selectUnifiedAiResponseVoice(
  characterId: string,
  aiResponse: string,
  isInitialGreeting: boolean = false
): { voiceFile: string | null; shouldPlay: boolean; reason: string } {
  console.log(`=== 統一AI応答音声選択 ===`);
  console.log(`キャラクター: ${characterId}`);
  
  const validCharacters = ['akari', 'minato', 'yuki', 'riku', 'mao', 'satsuki', 'sora'];
  if (!validCharacters.includes(characterId)) {
    console.log(`❌ 未対応キャラクター: ${characterId}`);
    return { voiceFile: null, shouldPlay: false, reason: 'Unsupported character' };
  }
  
  return selectUnifiedVoice(
    characterId as CharacterId,
    aiResponse,
    isInitialGreeting
  );
}

// ブラウザ環境での統一システム関数公開
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).handleUnifiedAiResponseVoice = handleUnifiedAiResponseVoice;
  (window as unknown as Record<string, unknown>).selectUnifiedAiResponseVoice = selectUnifiedAiResponseVoice;
  
  console.log('🎯 統一システム関数公開:');
  console.log('- handleUnifiedAiResponseVoice(characterId, aiResponse, isInitialGreeting)');
  console.log('- selectUnifiedAiResponseVoice(characterId, aiResponse, isInitialGreeting)');
  console.log('');
  console.log('✅ 全7キャラクター対応: akari, minato, yuki, riku, mao, satsuki, sora');
  console.log('✅ 統一ファイル命名: character_pattern.wav');
  console.log('✅ レガシーシステム完全除去');
}