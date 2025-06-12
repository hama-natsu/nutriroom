// ElevenLabs API 設定
export interface ElevenLabsVoiceConfig {
  voiceId: string
  voiceName: string
  characterId: string
  stability: number      // 0.0-1.0
  similarityBoost: number // 0.0-1.0
  style?: number          // 0.0-1.0 
  useSpeakerBoost?: boolean
}

// キャラクター別 ElevenLabs 音声ID設定
export const characterVoices = {
  minato: "bqpOyYNUu11tjjvRUbKn",    // Yamato
  akari: "RBnMinrYKeccY3vaUxlZ",     // Sakura Suzuki  
  yuki: "8EkOjt4xTPGMclNlh1pk",      // Morioki
  riku: "GKDaBI8TKSBJVhsCLD6n",      // Asashi
  mao: "4lOQ7A2l7HPuG7UIHiKA",       // Kyoko
  satsuki: "7t2ZyEiayA71HXxCzkln",   // Harmony
  sora: "LNzr3u01PIEDg0fRlvE7"       // Ichiro
}

// キャラクター別詳細音声設定（日本語最適化）
export const elevenLabsVoiceConfigs: Record<string, ElevenLabsVoiceConfig> = {
  minato: {
    voiceId: characterVoices.minato,
    voiceName: "Yamato",
    characterId: "minato",
    stability: 0.5,
    similarityBoost: 0.75
  },
  akari: {
    voiceId: characterVoices.akari,
    voiceName: "Sakura Suzuki",
    characterId: "akari", 
    stability: 0.5,
    similarityBoost: 0.75
  },
  yuki: {
    voiceId: characterVoices.yuki,
    voiceName: "Morioki",
    characterId: "yuki",
    stability: 0.5,
    similarityBoost: 0.75
  },
  riku: {
    voiceId: characterVoices.riku,
    voiceName: "Asashi",
    characterId: "riku",
    stability: 0.5,
    similarityBoost: 0.75
  },
  mao: {
    voiceId: characterVoices.mao,
    voiceName: "Kyoko",
    characterId: "mao",
    stability: 0.5,
    similarityBoost: 0.75
  },
  satsuki: {
    voiceId: characterVoices.satsuki,
    voiceName: "Harmony",
    characterId: "satsuki",
    stability: 0.5,
    similarityBoost: 0.75
  },
  sora: {
    voiceId: characterVoices.sora,
    voiceName: "Ichiro",
    characterId: "sora",
    stability: 0.5,
    similarityBoost: 0.75
  }
}

// ElevenLabs API設定（日本語最適化）
export const ELEVENLABS_CONFIG = {
  MODEL_ID: 'eleven_multilingual_v2', // 日本語最適モデル
  OUTPUT_FORMAT: 'mp3_44100_128',
  OPTIMIZE_STREAMING_LATENCY: 0,
  MAX_TEXT_LENGTH: 500,
  DEFAULT_VOICE_SETTINGS: {
    stability: 0.5,          // 音声安定性
    similarity_boost: 0.75   // 類似性ブースト
  }
}

// 名前読み上げ機能
export const generateNameGreeting = (userName: string, characterId: string): string => {
  // キャラクター別の名前呼びかけパターン
  const nameCallPatterns: Record<string, string[]> = {
    minato: [
      `${userName}さん`,
      `${userName}`,
      `${userName}よ`
    ],
    akari: [
      `${userName}さん！`,
      `${userName}ちゃん♪`,
      `${userName}さん〜`
    ],
    yuki: [
      `${userName}さん`,
      `${userName}さん...`,
      `あら、${userName}さん`
    ],
    riku: [
      `${userName}さん`,
      `${userName}`,
      `${userName}さん、こんにちは`
    ],
    mao: [
      `${userName}ちゃん`,
      `${userName}さん！`,
      `${userName}ちゃん〜`
    ],
    satsuki: [
      `${userName}`,
      `${userName}さん`,
      `${userName}よ`
    ],
    sora: [
      `${userName}さん`,
      `${userName}`,
      `${userName}さん...`
    ]
  }

  const patterns = nameCallPatterns[characterId] || [`${userName}さん`]
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
  
  return randomPattern
}

// ElevenLabs音声生成の可否判定
export const shouldUseElevenLabs = (text: string, characterId: string): boolean => {
  // APIキーの存在確認
  if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY.includes('your_elevenlabs_api_key')) {
    console.log('⚠️ ElevenLabs API key not configured, falling back to Google TTS')
    return false
  }

  // キャラクター音声IDの存在確認
  if (!characterVoices[characterId as keyof typeof characterVoices]) {
    console.log(`⚠️ ElevenLabs voice ID not found for character: ${characterId}`)
    return false
  }

  // テキスト長さ制限
  if (text.length > ELEVENLABS_CONFIG.MAX_TEXT_LENGTH) {
    console.log(`⚠️ Text too long for ElevenLabs (${text.length}/${ELEVENLABS_CONFIG.MAX_TEXT_LENGTH} chars)`)
    return false
  }

  // 名前呼びかけかどうかの判定
  const isNameCall = text.length <= 20 && (
    text.includes('さん') || 
    text.includes('ちゃん') || 
    text.includes('くん') ||
    !!text.match(/^[ぁ-んァ-ヶー一-龠a-zA-Z0-9\s]{1,10}[、。！？...]*$/)
  )

  console.log(`🎤 ElevenLabs usage decision:`, {
    characterId,
    textLength: text.length,
    isNameCall,
    hasApiKey: !!process.env.ELEVENLABS_API_KEY,
    hasVoiceId: !!characterVoices[characterId as keyof typeof characterVoices],
    willUseElevenLabs: isNameCall
  })

  return isNameCall
}

// デバッグ用: 全キャラクターの音声設定表示
export const showElevenLabsConfigs = () => {
  console.log('🎙️ ElevenLabs Voice Configurations:')
  console.log('=' .repeat(80))
  
  Object.entries(elevenLabsVoiceConfigs).forEach(([characterId, config]) => {
    console.log(`\n🎭 ${characterId.toUpperCase()}:`)
    console.log(`  音声ID: ${config.voiceId}`)
    console.log(`  音声名: ${config.voiceName}`)
    console.log(`  安定性: ${config.stability}`)
    console.log(`  類似性: ${config.similarityBoost}`)
    console.log(`  スタイル: ${config.style}`)
    console.log(`  スピーカーブースト: ${config.useSpeakerBoost}`)
    console.log('-'.repeat(60))
  })
  
  console.log(`\n📊 統計:`)
  console.log(`  総キャラクター数: ${Object.keys(elevenLabsVoiceConfigs).length}`)
  console.log(`  モデル: ${ELEVENLABS_CONFIG.MODEL_ID}`)
  console.log(`  出力形式: ${ELEVENLABS_CONFIG.OUTPUT_FORMAT}`)
  console.log(`  最大文字数: ${ELEVENLABS_CONFIG.MAX_TEXT_LENGTH}`)
  
  console.log('\n🏁 ElevenLabs config listing completed')
}