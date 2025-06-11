// Character voice configuration - no Character import needed

// キャラクター別音声パラメータ設定
export interface VoiceConfig {
  languageCode: string
  name: string
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL'
  pitch: number    // -20.0 to 20.0
  speakingRate: number // 0.25 to 4.0
  volumeGainDb: number // -96.0 to 16.0
  personality: string
}

export const characterVoiceConfigs: Record<string, VoiceConfig> = {
  // みなと - ツンデレ系スパルタ栄養士（男性）
  minato: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-C', // 男性の声
    gender: 'MALE',
    pitch: -2.0,      // 少し低めで落ち着いた声
    speakingRate: 0.95, // やや早口
    volumeGainDb: 2.0,
    personality: 'ツンデレ・スパルタ'
  },

  // あかり - 元気系応援栄養士（女性）
  akari: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-B', // 明るい女性の声
    gender: 'FEMALE',
    pitch: 3.0,       // 高めで明るい声
    speakingRate: 1.1,  // 元気よく早め
    volumeGainDb: 4.0,
    personality: '元気・応援'
  },

  // ゆき - 癒し系おっとり栄養士（女性）
  yuki: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-D', // 優しい女性の声
    gender: 'FEMALE',
    pitch: 0.5,       // やや高め
    speakingRate: 0.8,  // ゆっくり話す
    volumeGainDb: 1.0,
    personality: '癒し・おっとり'
  },

  // りく - クール系理論派栄養士（男性）
  riku: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-C', // 落ち着いた男性の声
    gender: 'MALE',
    pitch: -1.0,      // やや低め
    speakingRate: 0.9,  // 冷静にゆっくり
    volumeGainDb: 0.0,
    personality: 'クール・理論派'
  },

  // まお - 天然系うっかり栄養士（女性）
  mao: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-A', // 可愛らしい女性の声
    gender: 'FEMALE',
    pitch: 4.0,       // 高めで可愛い声
    speakingRate: 1.0,  // 普通の速度
    volumeGainDb: 3.0,
    personality: '天然・うっかり'
  },

  // さつき - 毒舌系リアリスト栄養士（女性）
  satsuki: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-D', // しっかりした女性の声
    gender: 'FEMALE',
    pitch: -0.5,      // やや低めでクール
    speakingRate: 1.05, // はっきりと早め
    volumeGainDb: 2.0,
    personality: '毒舌・リアリスト'
  },

  // そら - 中性的フリースタイル栄養士（性別不詳）
  sora: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-C', // 中性的な声
    gender: 'NEUTRAL',
    pitch: 1.0,       // 中間的な高さ
    speakingRate: 0.95, // ゆったりと
    volumeGainDb: 1.5,
    personality: '中性的・哲学的'
  }
}

// キャラクター別定型文パターン
export const characterVoiceLines: Record<string, string[]> = {
  minato: [
    "別に君のためじゃないからな...",
    "はぁ？そんな食生活で健康になれると思ってんの？",
    "...まあ、今日は頑張ったな",
    "しょうがないな、教えてやる",
    "でも、その食事じゃダメだ！"
  ],
  akari: [
    "今日もファイト〜！",
    "一緒に頑張りましょう！",
    "わぁ〜すごいじゃん！私も嬉しい〜！",
    "きっと素敵になれますよ！",
    "大丈夫、私がサポートします！"
  ],
  yuki: [
    "あら、大丈夫ですよ...",
    "ゆっくりでいいんです...",
    "お疲れ様でした",
    "無理しないでくださいね",
    "あなたのペースで進めましょう"
  ],
  riku: [
    "データに基づいて説明しよう",
    "科学的根拠は...",
    "研究によると...",
    "論理的に考えると",
    "エビデンスを確認しましょう"
  ],
  mao: [
    "えーっと...あ！そうそう！",
    "私も同じ失敗したことあります〜",
    "あ、それわかります！",
    "うっかりしちゃった〜",
    "一緒に頑張りましょう〜"
  ],
  satsuki: [
    "で、言い訳は？",
    "現実逃避してても体重は減らないわよ",
    "はっきり言うけど...",
    "甘えは禁物よ",
    "結果を出しなさい"
  ],
  sora: [
    "面白いですね、その考え方",
    "栄養って、人生そのものだと思うんです",
    "それも一つの選択肢ですね",
    "多角的に考えてみましょう",
    "あなたらしい答えを見つけてください"
  ]
}

// 音声生成優先度システム
export enum VoicePriority {
  USER_NAME_CALLING = 1,  // ユーザー名呼びかけ
  CHARACTER_LINES = 2,    // キャラクター定型文
  GENERAL_CHAT = 3        // 一般会話
}

// ユーザー名呼びかけパターン
export const getUserNameCallingPattern = (characterId: string, userName?: string): string => {
  if (!userName) return ''
  
  const patterns: Record<string, string[]> = {
    minato: [`${userName}...`, `${userName}、聞いてるか？`],
    akari: [`${userName}さん♪`, `${userName}ちゃん！`],
    yuki: [`${userName}さん...`, `${userName}さん、お疲れさま`],
    riku: [`${userName}さん`, `${userName}、データを確認しましょう`],
    mao: [`${userName}ちゃん〜`, `${userName}さん！`],
    satsuki: [`${userName}`, `${userName}、現実を見なさい`],
    sora: [`${userName}さん`, `${userName}、興味深いですね`]
  }
  
  const characterPatterns = patterns[characterId] || [`${userName}さん`]
  return characterPatterns[Math.floor(Math.random() * characterPatterns.length)]
}

// 音声生成判定
export const shouldGenerateVoice = (text: string, priority: VoicePriority): boolean => {
  const decision = (() => {
    switch (priority) {
      case VoicePriority.USER_NAME_CALLING:
        return true // 常に音声生成
      case VoicePriority.CHARACTER_LINES:
        return text.length <= 50 // 短い定型文のみ
      case VoicePriority.GENERAL_CHAT:
        return text.length <= 100 // 100文字以下のみ音声生成（調整）
      default:
        return false
    }
  })()

  console.log('🤔 Voice generation decision:', {
    text: text.substring(0, 30),
    textLength: text.length,
    priority,
    shouldGenerate: decision,
    reason: decision 
      ? priority === VoicePriority.USER_NAME_CALLING ? 'user_name_calling'
        : priority === VoicePriority.CHARACTER_LINES ? 'character_lines'
        : priority === VoicePriority.GENERAL_CHAT ? 'general_chat_short'
        : 'unknown'
      : priority === VoicePriority.GENERAL_CHAT ? 'text_too_long'
        : priority === VoicePriority.CHARACTER_LINES ? 'text_too_long'
        : 'low_priority'
  })

  return decision
}