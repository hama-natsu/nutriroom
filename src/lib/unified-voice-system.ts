// 🎯 NutriRoom 統一音声システム - 7キャラクター完全対応
// あかり成功パターンを全キャラクターに拡張

export type CharacterId = 'akari' | 'minato' | 'yuki' | 'riku' | 'mao' | 'satsuki' | 'sora';

export type UnifiedTimeSlot = 
  | 'very_late'     // 1:00-4:59
  | 'morning_early' // 5:00-6:59
  | 'morning'       // 7:00-8:59
  | 'morning_late'  // 9:00-10:59
  | 'lunch'         // 11:00-12:59
  | 'afternoon'     // 13:00-14:59
  | 'snack'         // 15:00-16:59
  | 'evening'       // 17:00-18:59
  | 'dinner'        // 19:00-20:59
  | 'night'         // 21:00-22:59
  | 'late';         // 23:00-0:59

export type EmotionPattern = 
  | 'agreement'      // 同意・共感
  | 'understanding'  // 理解・納得
  | 'surprise'       // 驚き・興味
  | 'thinking'       // 考え込み
  | 'great'          // 称賛・素晴らしい
  | 'nice'           // 肯定評価
  | 'effort'         // 努力認知
  | 'empathy'        // 気持ち共感
  | 'thanks'         // 感謝
  | 'welcome'        // どういたしまして
  | 'sorry'          // 謝罪
  | 'no_problem'     // 安心・問題なし
  | 'encouragement'  // 励まし・応援
  | 'cheer'          // 応援・ファイト
  | 'support'        // サポート宣言
  | 'care';          // 気遣い・ケア

export type SeasonPattern = 'spring' | 'summer' | 'autumn' | 'winter';

// 統一音声パターン定義（全キャラクター共通）
export const VOICE_PATTERNS = {
  // 時間帯別（11パターン）
  timeSlots: [
    'very_late', 'morning_early', 'morning', 'morning_late', 
    'lunch', 'afternoon', 'snack', 'evening', 
    'dinner', 'night', 'late'
  ] as UnifiedTimeSlot[],
  
  // 感情別（16パターン）
  emotions: [
    'agreement', 'understanding', 'surprise', 'thinking',
    'great', 'nice', 'effort', 'empathy', 'thanks', 
    'welcome', 'sorry', 'no_problem', 'encouragement',
    'cheer', 'support', 'care'
  ] as EmotionPattern[],
  
  // 季節別（4パターン）
  seasons: ['spring', 'summer', 'autumn', 'winter'] as SeasonPattern[]
};

// 統一ファイル命名規則
export const getVoiceFile = (characterId: CharacterId, pattern: string): string => {
  return `${characterId}_${pattern}.wav`;
};

// 時間帯判定（統一システム）
export function getUnifiedTimeSlot(): UnifiedTimeSlot {
  const hour = new Date().getHours();
  
  if (hour >= 1 && hour < 5) return 'very_late';
  if (hour >= 5 && hour < 7) return 'morning_early';
  if (hour >= 7 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 11) return 'morning_late';
  if (hour >= 11 && hour < 13) return 'lunch';
  if (hour >= 13 && hour < 15) return 'afternoon';
  if (hour >= 15 && hour < 17) return 'snack';
  if (hour >= 17 && hour < 19) return 'evening';
  if (hour >= 19 && hour < 21) return 'dinner';
  if (hour >= 21 && hour < 23) return 'night';
  return 'late';
}

// 感情パターン解析（AI応答ベース）
export function analyzeEmotionPattern(aiResponse: string): EmotionPattern | null {
  const response = aiResponse.toLowerCase();
  
  // 食べ物雑談検出（音声無効化）
  const foodKeywords = ['美味しい', '大好き', 'お菓子', '食べ物', '料理', 'チョコ', 'ポッキー'];
  const firstSentence = aiResponse.split(/[！。？♪♡😊～]/)[0];
  if (foodKeywords.some(keyword => firstSentence.includes(keyword))) {
    console.log('🍕 Food chat detected - no voice needed');
    return null;
  }
  
  // 1. 称賛・素晴らしい系
  if (response.includes('すごい') || response.includes('素晴らしい') || 
      response.includes('本当に') || response.includes('完璧')) {
    return 'great';
  }
  
  // 2. 同意・共感系
  if (response.includes('そうですね') || response.includes('私もそう思') || 
      response.includes('同感') || response.includes('おっしゃる通り')) {
    return 'agreement';
  }
  
  // 3. 気持ち共感系
  if (response.includes('その気持ち') || response.includes('気持ち') ||
      (response.includes('分かります') && response.includes('気持ち'))) {
    return 'empathy';
  }
  
  // 4. 理解・納得系
  if (response.includes('なるほど') || response.includes('勉強になり') || 
      response.includes('よく分かり') || response.includes('理解') ||
      response.includes('分かります')) {
    return 'understanding';
  }
  
  // 5. 驚き・興味系
  if (response.includes('えー') || response.includes('びっくり') || 
      response.includes('そうなんですか') || response.includes('知らなかった')) {
    return 'surprise';
  }
  
  // 6. 努力認知系
  if (response.includes('頑張って') || response.includes('その調子') || 
      response.includes('よくやって') || response.includes('努力')) {
    return 'effort';
  }
  
  // 7. 肯定評価系
  if (response.includes('いいですね') || response.includes('良いと思') || 
      response.includes('素敵') || response.includes('ナイス')) {
    return 'nice';
  }
  
  // 8. 応援・励まし系
  if (response.includes('一緒に頑張り') || response.includes('ファイト') || 
      response.includes('応援') || response.includes('負けないで')) {
    return 'cheer';
  }
  
  // 9. サポート宣言系
  if (response.includes('サポート') || response.includes('相談') || 
      response.includes('いつでも') || response.includes('支えます')) {
    return 'support';
  }
  
  // 10. 感謝系
  if (response.includes('ありがとう') || response.includes('嬉しい') || 
      response.includes('感謝') || response.includes('助かり')) {
    return 'thanks';
  }
  
  // 11. どういたしまして系
  if (response.includes('どういたしまして') || response.includes('当然') || 
      response.includes('いえいえ') || response.includes('頼って')) {
    return 'welcome';
  }
  
  // 12. 安心・問題なし系
  if (response.includes('問題ありません') || response.includes('心配') || 
      response.includes('安心') || response.includes('全然大丈夫')) {
    return 'no_problem';
  }
  
  // 13. 考え込み系
  if (response.includes('う〜ん') || response.includes('一緒に考え') || 
      response.includes('どうでしょう') || response.includes('検討')) {
    return 'thinking';
  }
  
  // 14. 謝罪系
  if (response.includes('すみません') || response.includes('ごめん') || 
      response.includes('申し訳') || response.includes('気をつけ')) {
    return 'sorry';
  }
  
  // 15. 励まし系（一般的）
  if (response.includes('頑張る') || response.includes('大丈夫') || 
      response.includes('きっと') || response.includes('前向き')) {
    return 'encouragement';
  }
  
  // 16. 気遣い系
  if (response.includes('お疲れ') || response.includes('体調') || 
      response.includes('無理しない') || response.includes('休んで')) {
    return 'care';
  }
  
  return null; // 感情パターンなし（一般会話）
}

// キャラクター音声選択（統一システム）
export function selectCharacterVoice(
  characterId: CharacterId, 
  responseType: 'greeting' | 'emotion' | 'season',
  pattern: string
): string {
  switch (responseType) {
    case 'greeting':
      // 時間帯ベース選択
      return getVoiceFile(characterId, pattern);
    case 'emotion':
      // 感情ベース選択
      return getVoiceFile(characterId, pattern);
    case 'season':
      // 季節ベース選択
      return getVoiceFile(characterId, pattern);
    default:
      return getVoiceFile(characterId, 'morning');
  }
}

// メイン音声選択関数
export function selectUnifiedVoice(
  characterId: CharacterId,
  aiResponse?: string,
  isGreeting: boolean = false
): { voiceFile: string | null; shouldPlay: boolean; reason: string } {
  console.log(`🎯 Unified Voice Selection: ${characterId}`);
  
  // 1. 初期挨拶の場合は時間帯ベース
  if (isGreeting) {
    const timeSlot = getUnifiedTimeSlot();
    const voiceFile = selectCharacterVoice(characterId, 'greeting', timeSlot);
    console.log(`⏰ Greeting voice: ${voiceFile} (${timeSlot})`);
    return {
      voiceFile,
      shouldPlay: true,
      reason: `Time-based greeting for ${timeSlot}`
    };
  }
  
  // 2. AI応答がある場合は感情分析
  if (aiResponse) {
    const emotionPattern = analyzeEmotionPattern(aiResponse);
    if (emotionPattern) {
      const voiceFile = selectCharacterVoice(characterId, 'emotion', emotionPattern);
      console.log(`💭 Emotion voice: ${voiceFile} (${emotionPattern})`);
      return {
        voiceFile,
        shouldPlay: true,
        reason: `Emotion-based response: ${emotionPattern}`
      };
    }
    
    console.log('🔇 No emotion pattern matched - text only');
    return {
      voiceFile: null,
      shouldPlay: false,
      reason: 'General conversation - no voice needed'
    };
  }
  
  // 3. デフォルト：音声なし
  return {
    voiceFile: null,
    shouldPlay: false,
    reason: 'No specific pattern matched'
  };
}

// 音声ファイル再生（統一システム）
export async function playUnifiedVoice(
  characterId: CharacterId,
  voiceFile: string
): Promise<boolean> {
  console.log(`🎵 Playing unified voice: ${voiceFile} for ${characterId}`);
  
  try {
    const audioPath = `/audio/recorded/${characterId}/${voiceFile}`;
    
    if (typeof window !== 'undefined' && window.Audio) {
      const audio = new Audio(audioPath);
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log(`⚠️ Voice timeout: ${voiceFile}`);
          resolve(false);
        }, 3000);
        
        audio.oncanplay = async () => {
          clearTimeout(timeout);
          try {
            await audio.play();
            console.log(`✅ Successfully played: ${voiceFile}`);
            resolve(true);
          } catch (error) {
            console.log(`❌ Play failed: ${voiceFile}`, error);
            resolve(false);
          }
        };
        
        audio.onerror = () => {
          clearTimeout(timeout);
          console.log(`❌ File not found: ${voiceFile}`);
          resolve(false);
        };
        
        audio.load();
      });
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Critical error: ${voiceFile}`, error);
    return false;
  }
}

// 完全統一音声システム（メイン関数）
export async function handleUnifiedVoiceResponse(
  characterId: CharacterId,
  aiResponse?: string,
  isGreeting: boolean = false
): Promise<boolean> {
  console.log(`=== 統一音声システム ===`);
  console.log(`キャラクター: ${characterId}`);
  console.log(`初回挨拶: ${isGreeting}`);
  console.log(`AI応答: ${aiResponse ? `"${aiResponse.substring(0, 50)}..."` : 'なし'}`);
  
  const selection = selectUnifiedVoice(characterId, aiResponse, isGreeting);
  
  if (selection.shouldPlay && selection.voiceFile) {
    console.log(`🎯 統一システム決定: ${selection.voiceFile}`);
    console.log(`🔄 理由: ${selection.reason}`);
    return await playUnifiedVoice(characterId, selection.voiceFile);
  }
  
  console.log(`🔇 音声なし: ${selection.reason}`);
  return false;
}

// デバッグ・テスト機能
export function testUnifiedVoiceSystem(): void {
  console.log('🧪 統一音声システム テスト開始');
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      character: 'minato' as CharacterId,
      response: 'すごいですね！本当に素晴らしいです♪',
      expected: 'minato_great.wav',
      scenario: 'みなと - 称賛'
    },
    {
      character: 'yuki' as CharacterId,
      response: 'そうですね〜♪私もそう思います！',
      expected: 'yuki_agreement.wav',
      scenario: 'ゆき - 同意'
    },
    {
      character: 'riku' as CharacterId,
      response: undefined,
      isGreeting: true,
      expected: `riku_${getUnifiedTimeSlot()}.wav`,
      scenario: 'りく - 時間挨拶'
    },
    {
      character: 'akari' as CharacterId,
      response: 'チョコレート美味しいですよね♪',
      expected: null,
      scenario: 'あかり - 食べ物雑談（音声なし）'
    }
  ];
  
  let passedTests = 0;
  
  testCases.forEach((testCase, index) => {
    console.log(`\nテスト ${index + 1}: ${testCase.scenario}`);
    
    const result = selectUnifiedVoice(
      testCase.character,
      testCase.response,
      testCase.isGreeting || false
    );
    
    const success = result.voiceFile === testCase.expected;
    
    console.log(`  期待値: ${testCase.expected || 'なし'}`);
    console.log(`  結果: ${result.voiceFile || 'なし'}`);
    console.log(`  理由: ${result.reason}`);
    console.log(`  判定: ${success ? '✅ 成功' : '❌ 失敗'}`);
    
    if (success) passedTests++;
  });
  
  console.log(`\n📊 テスト結果: ${passedTests}/${testCases.length} 成功`);
  if (passedTests === testCases.length) {
    console.log('✅ 統一音声システム 完全動作確認！');
  } else {
    console.log('❌ 統一音声システム 調整が必要');
  }
  
  console.log('=' .repeat(60));
}

// 統一音声システム情報表示
export function showUnifiedSystemInfo(): void {
  console.log('🎯 統一音声システム情報');
  console.log('=' .repeat(50));
  console.log('📋 対応キャラクター:');
  console.log('  akari, minato, yuki, riku, mao, satsuki, sora');
  console.log('');
  console.log('⏰ 時間帯パターン (11種類):');
  VOICE_PATTERNS.timeSlots.forEach(slot => {
    console.log(`  ${slot} - 例: minato_${slot}.wav`);
  });
  console.log('');
  console.log('💭 感情パターン (16種類):');
  VOICE_PATTERNS.emotions.forEach(emotion => {
    console.log(`  ${emotion} - 例: yuki_${emotion}.wav`);
  });
  console.log('');
  console.log('🌸 季節パターン (4種類):');
  VOICE_PATTERNS.seasons.forEach(season => {
    console.log(`  ${season} - 例: sora_${season}.wav`);
  });
  console.log('');
  console.log('🎯 使用例:');
  console.log('  10:40時点 → minato_morning_late.wav');
  console.log('  励まし検出 → yuki_encouragement.wav');
  console.log('  食べ物雑談 → 音声なし（テキストのみ）');
  console.log('=' .repeat(50));
}

// ブラウザ環境での関数公開
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).handleUnifiedVoiceResponse = handleUnifiedVoiceResponse;
  (window as unknown as Record<string, unknown>).testUnifiedVoiceSystem = testUnifiedVoiceSystem;
  (window as unknown as Record<string, unknown>).showUnifiedSystemInfo = showUnifiedSystemInfo;
  (window as unknown as Record<string, unknown>).selectUnifiedVoice = selectUnifiedVoice;
  (window as unknown as Record<string, unknown>).getUnifiedTimeSlot = getUnifiedTimeSlot;
  
  console.log('🎯 統一音声システム デバッグ関数公開:');
  console.log('- handleUnifiedVoiceResponse(characterId, aiResponse, isGreeting)');
  console.log('- testUnifiedVoiceSystem() : システムテスト実行');
  console.log('- showUnifiedSystemInfo() : システム情報表示');
  console.log('- selectUnifiedVoice(characterId, aiResponse, isGreeting)');
  console.log('- getUnifiedTimeSlot() : 現在の時間帯取得');
}