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

// 動作確認済みの統一音声設定（みなと・りくと同じ設定）
const WORKING_VOICE_CONFIG = {
  languageCode: 'ja-JP',
  name: 'ja-JP-Neural2-C',  // みなと・りくで動作確認済み
  gender: 'MALE' as const,  // 動作確認済み
  pitch: -2.0,              // みなとの設定
  speakingRate: 0.9,        // みなとの設定  
  volumeGainDb: 2.0         // みなとの設定
}

export const characterVoiceConfigs: Record<string, VoiceConfig> = {
  // みなと - ツンデレ系スパルタ栄養士（男性）【動作確認済み】
  minato: {
    ...WORKING_VOICE_CONFIG,
    personality: 'ツンデレ・スパルタ'
  },

  // あかり - 元気系応援栄養士（女性）【みなとと同じ設定に統一】
  akari: {
    ...WORKING_VOICE_CONFIG,
    personality: '元気・応援'
  },

  // ゆき - 癒し系おっとり栄養士（女性）【みなとと同じ設定に統一】
  yuki: {
    ...WORKING_VOICE_CONFIG,
    personality: '癒し・おっとり'
  },

  // りく - クール系理論派栄養士（男性）【動作確認済み】
  riku: {
    ...WORKING_VOICE_CONFIG,
    personality: 'クール・理論派'
  },

  // まお - 天然系うっかり栄養士（女性）【みなとと同じ設定に統一】
  mao: {
    ...WORKING_VOICE_CONFIG,
    personality: '天然・うっかり'
  },

  // さつき - 毒舌系リアリスト栄養士（女性）【みなとと同じ設定に統一】
  satsuki: {
    ...WORKING_VOICE_CONFIG,
    personality: '毒舌・リアリスト'
  },

  // そら - 中性的フリースタイル栄養士（性別不詳）【みなとと同じ設定に統一】
  sora: {
    ...WORKING_VOICE_CONFIG,
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

// 音声生成判定（簡素化・確実化）
export const shouldGenerateVoice = (text: string, priority: VoicePriority): boolean => {
  const textLength = text.length
  
  // 空文字チェック
  if (!text || textLength === 0) {
    console.log('🚫 Voice generation skipped: empty text')
    return false
  }

  // 極端に長いテキストのみスキップ（500文字以上）
  const MAX_VOICE_LENGTH = 500
  if (textLength > MAX_VOICE_LENGTH) {
    console.log('🚫 Voice generation skipped: text too long:', {
      textLength,
      maxLength: MAX_VOICE_LENGTH,
      text: text.substring(0, 50) + '...'
    })
    return false
  }

  // それ以外は全て音声生成する
  const shouldGenerate = true
  
  console.log('✅ Voice generation approved:', {
    textLength,
    priority: Object.keys(VoicePriority)[Object.values(VoicePriority).indexOf(priority)] || 'unknown',
    text: text.substring(0, 50) + (textLength > 50 ? '...' : ''),
    shouldGenerate,
    reason: textLength <= 100 ? 'short_text' : 
            textLength <= 200 ? 'medium_text' : 
            textLength <= 300 ? 'long_text' : 'very_long_text',
    maxLength: MAX_VOICE_LENGTH
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

// 長文テキストの処理（音声生成用・簡素化）
export const getSummarizedTextForVoice = (text: string, characterId: string): string => {
  const textLength = text.length
  const MAX_VOICE_LENGTH = 200 // TTS APIの制限に合わせて200文字に制限
  
  // 200文字以下の場合はそのまま返す
  if (textLength <= MAX_VOICE_LENGTH) {
    console.log('📝 Text processing: using original text', { 
      textLength, 
      characterId,
      text: text.substring(0, 50) + '...'
    })
    return text
  }
  
  // 200文字を超える場合は最初の180文字 + キャラクター定型文
  const truncatedText = text.substring(0, 180)
  const characterLines = characterVoiceLines[characterId] || []
  const endingLine = characterLines[Math.floor(Math.random() * characterLines.length)] || ''
  
  const processedText = endingLine ? `${truncatedText}...${endingLine}` : truncatedText
  const finalText = processedText.substring(0, MAX_VOICE_LENGTH) // 最終的に200文字制限
  
  console.log('📝 Text processed for voice:', {
    originalLength: textLength,
    processedLength: finalText.length,
    characterId,
    wasProcessed: true,
    finalText: finalText.substring(0, 50) + '...'
  })
  
  return finalText
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

// デバッグ用: 音声生成テスト実行（全キャラクター対応）
export const runVoiceGenerationTests = (characterId?: string) => {
  const testCases = getVoiceTestCases()
  const charactersToTest = characterId ? [characterId] : Object.keys(characterVoiceConfigs)
  
  console.log('🧪 Running voice generation tests for characters:', charactersToTest)
  console.log('=' .repeat(80))
  
  charactersToTest.forEach(charId => {
    console.log(`\n🎭 Testing character: ${charId.toUpperCase()}`)
    console.log('-'.repeat(60))
    
    Object.entries(testCases).forEach(([testName, testCase]) => {
      console.log(`\n🔬 ${testName} (${charId}):`)
      console.log(`📝 ${testCase.description}`)
      console.log(`📏 Text length: ${testCase.text.length} characters`)
      
      const actualGeneration = shouldGenerateVoice(testCase.text, VoicePriority.GENERAL_CHAT)
      const processedText = getSummarizedTextForVoice(testCase.text, charId)
      
      console.log(`🎤 Generation result: ${actualGeneration}`)
      console.log(`📝 Processed text length: ${processedText.length}`)
      console.log(`${actualGeneration ? '✅ PASS' : '❌ FAIL'}: Voice generation ${actualGeneration ? 'approved' : 'rejected'}`)
    })
    
    console.log(`\n🎵 Voice config for ${charId}:`, characterVoiceConfigs[charId])
    console.log('='.repeat(60))
  })
  
  console.log('\n🏁 Voice generation tests completed for all characters')
}

// 音声設定バリデーション関数（統一設定用）
export const validateVoiceConfig = (characterId: string, config: VoiceConfig): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []

  // 動作確認済み設定との比較
  const isUsingWorkingConfig = (
    config.languageCode === WORKING_VOICE_CONFIG.languageCode &&
    config.name === WORKING_VOICE_CONFIG.name &&
    config.gender === WORKING_VOICE_CONFIG.gender &&
    config.pitch === WORKING_VOICE_CONFIG.pitch &&
    config.speakingRate === WORKING_VOICE_CONFIG.speakingRate &&
    config.volumeGainDb === WORKING_VOICE_CONFIG.volumeGainDb
  )

  if (!isUsingWorkingConfig) {
    warnings.push('設定が動作確認済みの統一設定と異なります')
  }

  // 必須項目チェック
  if (!config.languageCode) {
    errors.push('languageCode is required')
  }
  if (!config.name) {
    errors.push('voice name is required')
  }
  if (!config.gender) {
    errors.push('gender is required')
  }

  // 動作確認済み設定チェック
  if (config.name !== 'ja-JP-Neural2-C') {
    warnings.push(`Voice name ${config.name} may cause 400 errors. Working voice: ja-JP-Neural2-C`)
  }

  if (config.gender !== 'MALE') {
    warnings.push(`Gender ${config.gender} may cause issues. Working gender: MALE`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// 全キャラクター設定バリデーション
export const validateAllCharacterConfigs = () => {
  console.log('🔍 Validating all character voice configurations...')
  console.log('=' .repeat(80))

  const workingCharacters: string[] = []
  const problematicCharacters: string[] = []

  Object.entries(characterVoiceConfigs).forEach(([characterId, config]) => {
    const validation = validateVoiceConfig(characterId, config)
    
    console.log(`\n🎭 ${characterId.toUpperCase()}:`)
    console.log(`  音声名: ${config.name}`)
    console.log(`  性別: ${config.gender}`)
    console.log(`  ピッチ: ${config.pitch}`)
    console.log(`  速度: ${config.speakingRate}`)
    console.log(`  音量: ${config.volumeGainDb}dB`)
    
    if (validation.isValid) {
      console.log(`  ✅ 設定OK`)
      workingCharacters.push(characterId)
    } else {
      console.log(`  ❌ 設定に問題あり`)
      problematicCharacters.push(characterId)
    }

    if (validation.errors.length > 0) {
      console.log(`  🚨 エラー:`)
      validation.errors.forEach(error => console.log(`    - ${error}`))
    }

    if (validation.warnings.length > 0) {
      console.log(`  ⚠️ 警告:`)
      validation.warnings.forEach(warning => console.log(`    - ${warning}`))
    }
    
    console.log('-'.repeat(60))
  })

  console.log(`\n📊 バリデーション結果:`)
  console.log(`  ✅ 動作可能: ${workingCharacters.join(', ')} (${workingCharacters.length}キャラ)`)
  console.log(`  ❌ 要修正: ${problematicCharacters.join(', ')} (${problematicCharacters.length}キャラ)`)
  console.log(`  📈 成功率: ${((workingCharacters.length / Object.keys(characterVoiceConfigs).length) * 100).toFixed(1)}%`)

  console.log('\n🎯 動作確認済み統一設定:')
  console.log(`  音声名: ${WORKING_VOICE_CONFIG.name}`)
  console.log(`  言語: ${WORKING_VOICE_CONFIG.languageCode}`)
  console.log(`  性別: ${WORKING_VOICE_CONFIG.gender}`)
  console.log(`  ピッチ: ${WORKING_VOICE_CONFIG.pitch}`)
  console.log(`  話速: ${WORKING_VOICE_CONFIG.speakingRate}`)
  console.log(`  音量: ${WORKING_VOICE_CONFIG.volumeGainDb}dB`)

  return {
    workingCharacters,
    problematicCharacters,
    successRate: (workingCharacters.length / Object.keys(characterVoiceConfigs).length) * 100
  }
}

// キャラクター音声設定一覧表示（デバッグ用・拡張版）
export const showAllCharacterVoiceConfigs = () => {
  console.log('🎭 All Character Voice Configurations (Enhanced):')
  console.log('=' .repeat(80))
  
  // バリデーション実行
  const validationResult = validateAllCharacterConfigs()
  
  console.log('\n🏁 Character voice config analysis completed')
  return validationResult
}

// 統一設定確認用デバッグ関数
export const verifyUnifiedSettings = () => {
  console.log('🔧 Verifying unified voice settings for all characters:')
  console.log('=' .repeat(80))
  
  console.log('\n📋 統一設定内容:')
  console.log(JSON.stringify(WORKING_VOICE_CONFIG, null, 2))
  
  console.log('\n🎭 全キャラクター設定確認:')
  
  Object.entries(characterVoiceConfigs).forEach(([characterId, config]) => {
    const isIdentical = (
      config.languageCode === WORKING_VOICE_CONFIG.languageCode &&
      config.name === WORKING_VOICE_CONFIG.name &&
      config.gender === WORKING_VOICE_CONFIG.gender &&
      config.pitch === WORKING_VOICE_CONFIG.pitch &&
      config.speakingRate === WORKING_VOICE_CONFIG.speakingRate &&
      config.volumeGainDb === WORKING_VOICE_CONFIG.volumeGainDb
    )
    
    console.log(`  ${characterId}: ${isIdentical ? '✅ 統一設定' : '❌ 異なる設定'}`)
    
    if (!isIdentical) {
      console.log(`    実際の設定:`, {
        languageCode: config.languageCode,
        name: config.name,
        gender: config.gender,
        pitch: config.pitch,
        speakingRate: config.speakingRate,
        volumeGainDb: config.volumeGainDb
      })
    }
  })
  
  const allUnified = Object.values(characterVoiceConfigs).every(config => (
    config.languageCode === WORKING_VOICE_CONFIG.languageCode &&
    config.name === WORKING_VOICE_CONFIG.name &&
    config.gender === WORKING_VOICE_CONFIG.gender &&
    config.pitch === WORKING_VOICE_CONFIG.pitch &&
    config.speakingRate === WORKING_VOICE_CONFIG.speakingRate &&
    config.volumeGainDb === WORKING_VOICE_CONFIG.volumeGainDb
  ))
  
  console.log(`\n🎯 統一状況: ${allUnified ? '✅ 全キャラクター統一済み' : '❌ 統一未完了'}`)
  
  return allUnified
}