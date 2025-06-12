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
    pitch: -3.5,      // より低めでクールに
    speakingRate: 0.92, // やや遅めで落ち着いた感じ
    volumeGainDb: 3.0,
    personality: 'ツンデレ・スパルタ'
  },

  // あかり - 元気系応援栄養士（女性）
  akari: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-B', // 明るい女性の声
    gender: 'FEMALE',
    pitch: 4.5,       // より高めで弾んだ声
    speakingRate: 1.15,  // 元気よく早め
    volumeGainDb: 4.5,
    personality: '元気・応援'
  },

  // ゆき - 癒し系おっとり栄養士（女性）
  yuki: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-D', // 優しい女性の声
    gender: 'FEMALE',
    pitch: 1.5,       // 優しく穏やかに
    speakingRate: 0.75,  // よりゆっくりと癒し系
    volumeGainDb: 2.0,
    personality: '癒し・おっとり'
  },

  // りく - クール系理論派栄養士（男性）
  riku: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-C', // 落ち着いた男性の声
    gender: 'MALE',
    pitch: -2.5,      // より低めで威厳のある声
    speakingRate: 0.85,  // ゆっくり丁寧に
    volumeGainDb: 1.5,
    personality: 'クール・理論派'
  },

  // まお - 天然系うっかり栄養士（女性）
  mao: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-A', // 可愛らしい女性の声
    gender: 'FEMALE',
    pitch: 5.0,       // 高めで可愛らしく
    speakingRate: 0.95,  // 少しふわふわした感じ
    volumeGainDb: 3.5,
    personality: '天然・うっかり'
  },

  // さつき - 毒舌系リアリスト栄養士（女性）
  satsuki: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-D', // しっかりした女性の声
    gender: 'FEMALE',
    pitch: -1.0,      // 低めでシャープに
    speakingRate: 1.08, // きびきびとはっきり
    volumeGainDb: 2.5,
    personality: '毒舌・リアリスト'
  },

  // そら - 中性的フリースタイル栄養士（性別不詳）
  sora: {
    languageCode: 'ja-JP',
    name: 'ja-JP-Neural2-C', // 中性的な声
    gender: 'NEUTRAL',
    pitch: 0.5,       // 自然な中間
    speakingRate: 0.88, // ゆったりと哲学的に
    volumeGainDb: 2.0,
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

// 段階的音声生成システムの文字数制限設定（全キャラクター統一）
export const VOICE_LIMITS = {
  ALWAYS_GENERATE: 100,     // 0-100文字: 必ず音声生成（短文）
  NORMAL_GENERATE: 200,     // 101-200文字: 音声生成（通常）
  SUMMARY_GENERATE: 300,    // 201-300文字: 音声生成（要約版）
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
      return VoiceGenerationType.ALWAYS // 0-100文字: 必ず音声生成
    } else if (textLength <= VOICE_LIMITS.NORMAL_GENERATE) {
      return VoiceGenerationType.NORMAL // 101-200文字: 音声生成（通常）
    } else if (textLength <= VOICE_LIMITS.SUMMARY_GENERATE) {
      return VoiceGenerationType.SUMMARY // 201-300文字: 音声生成（要約版）
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
        return `short_text_${textLength}chars_limit_${VOICE_LIMITS.ALWAYS_GENERATE}`
      case VoiceGenerationType.NORMAL:
        return `normal_length_${textLength}chars_limit_${VOICE_LIMITS.NORMAL_GENERATE}`
      case VoiceGenerationType.SUMMARY:
        return `long_text_summary_${textLength}chars_limit_${VOICE_LIMITS.SUMMARY_GENERATE}`
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
      normal: `${VOICE_LIMITS.ALWAYS_GENERATE + 1}-${VOICE_LIMITS.NORMAL_GENERATE}`,
      summary: `${VOICE_LIMITS.NORMAL_GENERATE + 1}-${VOICE_LIMITS.SUMMARY_GENERATE}`,
      skip: `>${VOICE_LIMITS.SUMMARY_GENERATE}`
    }
  })

  return shouldGenerate
}

// キャラクター別感情表現パターン
export const emotionalExpressions: Record<string, {
  emphasis: string[]  // 強調表現
  pauses: string[]    // 間の取り方
  interjections: string[] // 感嘆詞
}> = {
  minato: {
    emphasis: ['別に', 'はぁ？', 'ダメだ', 'しょうがない'],
    pauses: ['...', '、', '。'],
    interjections: ['はぁ？', 'ちっ', 'まあ']
  },
  akari: {
    emphasis: ['わぁ〜', 'すごい', 'ファイト', '頑張り'],
    pauses: ['♪', '〜', '！'],
    interjections: ['わぁ', 'きゃー', 'えへへ']
  },
  yuki: {
    emphasis: ['あら', 'ゆっくり', '大丈夫', '無理しない'],
    pauses: ['...', 'ね', 'よ'],
    interjections: ['あら', 'ふふ', 'そうですね']
  },
  riku: {
    emphasis: ['データ', '科学的', '論理的', 'エビデンス'],
    pauses: ['。', '、', 'つまり'],
    interjections: ['なるほど', 'そうですね', 'では']
  },
  mao: {
    emphasis: ['えーっと', 'あ！', 'うっかり', 'わかります'],
    pauses: ['〜', 'あ、', 'えーっと'],
    interjections: ['あ！', 'えー', 'うーん']
  },
  satsuki: {
    emphasis: ['はっきり', '現実', '甘え', '結果'],
    pauses: ['よ', 'わ', 'の'],
    interjections: ['はい', 'で？', 'それで？']
  },
  sora: {
    emphasis: ['面白い', '人生', '多角的', 'あなたらしい'],
    pauses: ['...', 'ね', 'でしょう'],
    interjections: ['そうですね', 'なるほど', 'ふむ']
  }
}

// 感情表現を強化したテキスト加工
export const enhanceTextWithEmotion = (text: string, characterId: string): string => {
  const expressions = emotionalExpressions[characterId]
  if (!expressions) return text

  let enhancedText = text

  // 強調する単語を<emphasis>タグで囲む
  expressions.emphasis.forEach(word => {
    const regex = new RegExp(`(${word})`, 'g')
    enhancedText = enhancedText.replace(regex, `<emphasis level="strong">$1</emphasis>`)
  })

  // 句読点に適切な間を追加
  enhancedText = enhancedText.replace(/。/g, '。<break time="0.5s"/>')
  enhancedText = enhancedText.replace(/、/g, '、<break time="0.3s"/>')
  enhancedText = enhancedText.replace(/！/g, '！<break time="0.4s"/>')
  enhancedText = enhancedText.replace(/？/g, '？<break time="0.4s"/>')

  // キャラクター別の特殊な間の取り方
  switch (characterId) {
    case 'minato':
      enhancedText = enhancedText.replace(/\.\.\./g, '<break time="0.8s"/>')
      break
    case 'akari':
      enhancedText = enhancedText.replace(/〜/g, '<prosody rate="fast">〜</prosody>')
      break
    case 'yuki':
      enhancedText = enhancedText.replace(/ね/g, '<prosody pitch="+10%">ね</prosody>')
      break
    case 'riku':
      enhancedText = enhancedText.replace(/(データ|科学的|論理的)/g, '<emphasis level="moderate">$1</emphasis>')
      break
    case 'mao':
      enhancedText = enhancedText.replace(/あ！/g, '<prosody pitch="+20%" rate="fast">あ！</prosody>')
      break
    case 'satsuki':
      enhancedText = enhancedText.replace(/(はっきり|現実)/g, '<emphasis level="strong">$1</emphasis>')
      break
    case 'sora':
      enhancedText = enhancedText.replace(/\.\.\./g, '<break time="0.6s"/>')
      break
  }

  console.log('🎭 Enhanced text with emotion:', {
    characterId,
    original: text.substring(0, 30) + '...',
    enhanced: enhancedText.substring(0, 50) + '...',
    hasEmphasis: enhancedText.includes('<emphasis'),
    hasBreaks: enhancedText.includes('<break'),
    hasProsody: enhancedText.includes('<prosody')
  })

  return enhancedText
}

// 長文テキストの要約処理（音声生成用）
export const getSummarizedTextForVoice = (text: string, characterId: string): string => {
  const textLength = text.length
  
  // 短文・中文の場合は感情表現を強化して返す
  if (textLength <= VOICE_LIMITS.NORMAL_GENERATE) {
    console.log('📝 Text processing: enhancing emotion for short/medium text', { textLength, limit: VOICE_LIMITS.NORMAL_GENERATE })
    return enhanceTextWithEmotion(text, characterId)
  }
  
  // 長文の場合は要約処理 + 感情表現強化
  if (textLength <= VOICE_LIMITS.SUMMARY_GENERATE) {
    // 最初の100文字 + キャラクター性格に応じた締めの言葉
    const summary = text.substring(0, 100)
    const characterLines = characterVoiceLines[characterId] || []
    const endingLine = characterLines[Math.floor(Math.random() * characterLines.length)] || '...以上です'
    
    const summarizedText = `${summary}... ${endingLine}`
    const enhancedText = enhanceTextWithEmotion(summarizedText, characterId)
    
    console.log('📝 Text summarized and enhanced for voice:', {
      originalLength: textLength,
      summarizedLength: summarizedText.length,
      enhancedLength: enhancedText.length,
      characterId,
      summary: enhancedText.substring(0, 50) + '...'
    })
    
    return enhancedText
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
      text: '今日の食事についてアドバイスをお願いします。栄養バランスを考えた献立を教えてください。特にタンパク質と野菜を中心としたメニューが知りたいです。',
      description: '中文テスト（60文字）',
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

// キャラクター音声設定一覧表示（デバッグ用）
export const showAllCharacterVoiceConfigs = () => {
  console.log('🎭 All Character Voice Configurations:')
  console.log('=' .repeat(60))
  
  Object.entries(characterVoiceConfigs).forEach(([characterId, config]) => {
    console.log(`\n🎵 ${characterId.toUpperCase()}:`)
    console.log(`  名前: ${config.name}`)
    console.log(`  性別: ${config.gender}`)
    console.log(`  ピッチ: ${config.pitch}`)
    console.log(`  速度: ${config.speakingRate}`)
    console.log(`  音量: ${config.volumeGainDb}dB`)
    console.log(`  個性: ${config.personality}`)
    console.log('-'.repeat(40))
  })
  
  console.log(`\n📊 統計:`)
  console.log(`  総キャラクター数: ${Object.keys(characterVoiceConfigs).length}`)
  console.log(`  男性: ${Object.values(characterVoiceConfigs).filter(c => c.gender === 'MALE').length}`)
  console.log(`  女性: ${Object.values(characterVoiceConfigs).filter(c => c.gender === 'FEMALE').length}`)
  console.log(`  中性: ${Object.values(characterVoiceConfigs).filter(c => c.gender === 'NEUTRAL').length}`)
  
  console.log(`\n🎯 音声生成制限:`)
  console.log(`  必ず生成: 0-${VOICE_LIMITS.ALWAYS_GENERATE}文字`)
  console.log(`  通常生成: ${VOICE_LIMITS.ALWAYS_GENERATE + 1}-${VOICE_LIMITS.NORMAL_GENERATE}文字`)
  console.log(`  要約生成: ${VOICE_LIMITS.NORMAL_GENERATE + 1}-${VOICE_LIMITS.SUMMARY_GENERATE}文字`)
  console.log(`  スキップ: ${VOICE_LIMITS.SUMMARY_GENERATE + 1}文字以上`)
  
  console.log('\n🏁 Character voice config listing completed')
}