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

// 段階的音声生成システムの文字数制限設定
export const VOICE_LIMITS = {
  ALWAYS_GENERATE: 50,      // 0-50文字: 必ず音声生成
  NORMAL_GENERATE: 150,     // 51-150文字: 音声生成（通常）
  SUMMARY_GENERATE: 300,    // 151-300文字: 音声生成（要約版）
  TEXT_ONLY: Infinity       // 300文字以上: テキストのみ表示
} as const

// 文字数に応じた音声生成タイプ
export enum VoiceGenerationType {
  ALWAYS = 'always',        // 必ず生成
  NORMAL = 'normal',        // 通常生成
  SUMMARY = 'summary',      // 要約版生成
  SKIP = 'skip'            // スキップ
}

// 音声生成判定
export const shouldGenerateVoice = (text: string, priority: VoicePriority): boolean => {
  const textLength = text.length
  
  // 文字数制限値をコンソールに表示
  console.log('📏 Voice generation limits:', {
    ALWAYS_GENERATE: VOICE_LIMITS.ALWAYS_GENERATE,
    NORMAL_GENERATE: VOICE_LIMITS.NORMAL_GENERATE,
    SUMMARY_GENERATE: VOICE_LIMITS.SUMMARY_GENERATE,
    currentTextLength: textLength
  })

  // 段階的音声生成ロジック
  const getGenerationType = (): VoiceGenerationType => {
    if (priority === VoicePriority.USER_NAME_CALLING) {
      return VoiceGenerationType.ALWAYS // ユーザー名呼びかけは常に生成
    }
    
    if (textLength <= VOICE_LIMITS.ALWAYS_GENERATE) {
      return VoiceGenerationType.ALWAYS // 0-50文字: 必ず音声生成
    } else if (textLength <= VOICE_LIMITS.NORMAL_GENERATE) {
      return VoiceGenerationType.NORMAL // 51-150文字: 音声生成（通常）
    } else if (textLength <= VOICE_LIMITS.SUMMARY_GENERATE) {
      return VoiceGenerationType.SUMMARY // 151-300文字: 音声生成（要約版）
    } else {
      return VoiceGenerationType.SKIP // 300文字以上: テキストのみ表示
    }
  }

  const generationType = getGenerationType()
  const shouldGenerate = generationType !== VoiceGenerationType.SKIP

  // 判定理由の詳細表示
  const getReason = (): string => {
    if (priority === VoicePriority.USER_NAME_CALLING) {
      return 'user_name_calling_priority'
    }
    
    switch (generationType) {
      case VoiceGenerationType.ALWAYS:
        return `short_text_${textLength}chars`
      case VoiceGenerationType.NORMAL:
        return `normal_length_${textLength}chars`
      case VoiceGenerationType.SUMMARY:
        return `long_text_summary_${textLength}chars`
      case VoiceGenerationType.SKIP:
        return `text_too_long_${textLength}chars_limit_${VOICE_LIMITS.SUMMARY_GENERATE}`
      default:
        return 'unknown'
    }
  }

  console.log('🤔 Voice generation decision:', {
    text: text.substring(0, 30) + (textLength > 30 ? '...' : ''),
    textLength,
    priority: Object.keys(VoicePriority)[Object.values(VoicePriority).indexOf(priority)],
    generationType,
    shouldGenerate,
    reason: getReason(),
    limits: {
      current: textLength,
      always: `≤${VOICE_LIMITS.ALWAYS_GENERATE}`,
      normal: `≤${VOICE_LIMITS.NORMAL_GENERATE}`,
      summary: `≤${VOICE_LIMITS.SUMMARY_GENERATE}`,
      skip: `>${VOICE_LIMITS.SUMMARY_GENERATE}`
    }
  })

  return shouldGenerate
}

// 長文テキストの要約処理（音声生成用）
export const getSummarizedTextForVoice = (text: string, characterId: string): string => {
  const textLength = text.length
  
  // 短文・中文の場合はそのまま返す
  if (textLength <= VOICE_LIMITS.NORMAL_GENERATE) {
    console.log('📝 Text processing: no summary needed', { textLength, limit: VOICE_LIMITS.NORMAL_GENERATE })
    return text
  }
  
  // 長文の場合は要約処理
  if (textLength <= VOICE_LIMITS.SUMMARY_GENERATE) {
    // 最初の100文字 + キャラクター性格に応じた締めの言葉
    const summary = text.substring(0, 100)
    const characterLines = characterVoiceLines[characterId] || []
    const endingLine = characterLines[Math.floor(Math.random() * characterLines.length)] || '...以上です'
    
    const summarizedText = `${summary}... ${endingLine}`
    
    console.log('📝 Text summarized for voice:', {
      originalLength: textLength,
      summarizedLength: summarizedText.length,
      characterId,
      summary: summarizedText.substring(0, 50) + '...'
    })
    
    return summarizedText
  }
  
  // 300文字を超える場合は音声生成しない
  console.log('📝 Text too long for voice generation:', { textLength, limit: VOICE_LIMITS.SUMMARY_GENERATE })
  return text
}

// テストケース用の関数
export const getVoiceTestCases = () => {
  return {
    shortTest: {
      text: 'こんにちは',
      description: '短文テスト（5文字）',
      expectedGeneration: true
    },
    mediumTest: {
      text: '今日の食事についてアドバイスをお願いします。栄養バランスを考えた献立を教えてください。',
      description: '中文テスト（40文字）',
      expectedGeneration: true
    },
    longTest: {
      text: '最近、仕事が忙しくて食事の時間が不規則になっています。朝は時間がないのでコーヒーだけ、昼は忙しくてコンビニ弁当、夜は疲れてカップ麺という生活が続いています。この生活習慣を改善して、健康的な食生活を送りたいのですが、具体的にどのような点に注意すればよいでしょうか。また、忙しい中でも実践できる簡単な栄養改善方法があれば教えてください。',
      description: '長文テスト（150文字以上）',
      expectedGeneration: true
    },
    extraLongTest: {
      text: '私は最近、健康について真剣に考えるようになりました。今まで食事についてはあまり気にせず、好きなものを好きなだけ食べるという生活を送ってきました。しかし、年齢を重ねるにつれて体調の変化を感じるようになり、特に疲れやすくなったり、肌の調子が悪くなったりすることが増えました。友人からも「最近顔色が悪い」と指摘されることがあり、これは食生活に問題があるのではないかと思うようになりました。そこで、栄養士の方に相談して、自分の食生活を根本的に見直したいと考えています。まず、どこから始めればよいでしょうか。また、無理なく続けられる改善方法があれば、詳しく教えていただきたいです。特に、忙しい平日でも実践できる方法を重視したいと思います。',
      description: '超長文テスト（300文字以上）',
      expectedGeneration: false
    }
  }
}

// デバッグ用: 音声生成テスト実行
export const runVoiceGenerationTests = (characterId: string = 'minato') => {
  const testCases = getVoiceTestCases()
  
  console.log('🧪 Running voice generation tests for character:', characterId)
  console.log('=' .repeat(60))
  
  Object.entries(testCases).forEach(([testName, testCase]) => {
    console.log(`\n🔬 ${testName.toUpperCase()}:`)
    console.log(`📝 ${testCase.description}`)
    console.log(`📏 Text length: ${testCase.text.length} characters`)
    console.log(`🎯 Expected generation: ${testCase.expectedGeneration}`)
    
    const actualGeneration = shouldGenerateVoice(testCase.text, VoicePriority.GENERAL_CHAT)
    const passed = actualGeneration === testCase.expectedGeneration
    
    console.log(`✅ Actual generation: ${actualGeneration}`)
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: Test ${passed ? 'passed' : 'failed'}`)
    console.log('-'.repeat(40))
  })
  
  console.log('\n🏁 Voice generation tests completed')
}