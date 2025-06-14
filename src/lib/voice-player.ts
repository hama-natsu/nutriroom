// 🎯 VOICEVOX録音音声専用プレイヤー

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night'
export type VoicePattern = 'early' | 'normal' | 'late' | 'cheerful' | 'calm' | 'energetic' | 'gentle'
export type EmotionType = 'agreement' | 'encouragement' | 'surprise' | 'thinking' | 'concern' | 'joy' | 'default'

export interface VoiceConfig {
  characterId: string
  timeSlot?: TimeSlot
  pattern?: VoicePattern
  emotion?: EmotionType
  fallbackToDefault?: boolean
}

export class VOICEVOXPlayer {
  private baseAudioPath = '/audio/recorded'
  private cache = new Map<string, Blob>()

  // 🎵 メイン音声再生関数
  async playVoice(config: VoiceConfig): Promise<boolean> {
    try {
      const audioBlob = await this.loadVoiceFile(config)
      return await this.playAudioBlob(audioBlob)
    } catch (error) {
      console.error('❌ Voice playback failed:', error)
      
      // フォールバック再生を試行
      if (config.fallbackToDefault !== false) {
        return await this.playFallbackVoice(config.characterId)
      }
      
      return false
    }
  }

  // 🔊 音声ファイル読み込み
  private async loadVoiceFile(config: VoiceConfig): Promise<Blob> {
    const fileName = this.generateFileName(config)
    const filePath = `${this.baseAudioPath}/${config.characterId}/${fileName}`
    const cacheKey = filePath

    // キャッシュから取得
    if (this.cache.has(cacheKey)) {
      console.log('💾 Using cached audio:', filePath)
      return this.cache.get(cacheKey)!
    }

    console.log('📁 Loading audio file:', filePath)

    try {
      const response = await fetch(filePath)
      
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`)
      }
      
      const audioBlob = await response.blob()
      
      // キャッシュに保存
      this.cache.set(cacheKey, audioBlob)
      
      console.log('✅ Audio loaded successfully:', {
        path: filePath,
        size: audioBlob.size,
        type: audioBlob.type
      })
      
      return audioBlob
      
    } catch (error) {
      console.error('❌ Failed to load audio file:', filePath, error)
      throw error
    }
  }

  // 📄 ファイル名生成ロジック
  private generateFileName(config: VoiceConfig): string {
    const parts: string[] = []

    // 時間帯指定がある場合
    if (config.timeSlot) {
      parts.push(config.timeSlot)
      
      // パターン指定がある場合
      if (config.pattern) {
        parts.push(config.pattern)
      }
    }
    // 感情指定がある場合
    else if (config.emotion) {
      parts.push(config.emotion)
    }
    // デフォルトの場合
    else {
      parts.push('default')
    }

    return `${parts.join('_')}.wav`
  }

  // 🎵 音声Blob再生
  private async playAudioBlob(audioBlob: Blob): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onloadeddata = () => {
        console.log('🎵 Audio loaded for playback')
      }
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        console.log('🔇 Audio playback completed')
        resolve(true)
      }
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl)
        console.error('❌ Audio playback error:', error)
        reject(new Error('Audio playback failed'))
      }
      
      audio.play().catch(reject)
    })
  }

  // 🆘 フォールバック音声再生
  private async playFallbackVoice(characterId: string): Promise<boolean> {
    console.log('🔄 Attempting fallback voice for:', characterId)
    
    try {
      // まずdefault.wavを試行
      const fallbackConfig: VoiceConfig = {
        characterId,
        emotion: 'default',
        fallbackToDefault: false
      }
      
      return await this.playVoice(fallbackConfig)
    } catch (error) {
      console.error('❌ Fallback voice also failed:', error)
      return false
    }
  }

  // 🧹 キャッシュクリア
  clearCache(): void {
    this.cache.clear()
    console.log('🧹 Voice cache cleared')
  }

  // 📊 キャッシュ情報取得
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 🎯 便利関数：時間帯別挨拶再生
export async function playTimeGreeting(
  characterId: string, 
  timeSlot: TimeSlot, 
  pattern: VoicePattern = 'normal'
): Promise<boolean> {
  const player = new VOICEVOXPlayer()
  return await player.playVoice({
    characterId,
    timeSlot,
    pattern
  })
}

// 🎯 便利関数：感情応答再生
export async function playEmotionResponse(
  characterId: string, 
  emotion: EmotionType
): Promise<boolean> {
  const player = new VOICEVOXPlayer()
  return await player.playVoice({
    characterId,
    emotion
  })
}

// 🎯 便利関数：デフォルト音声再生
export async function playDefaultVoice(characterId: string): Promise<boolean> {
  const player = new VOICEVOXPlayer()
  return await player.playVoice({
    characterId,
    emotion: 'default'
  })
}

// 🎯 現在時刻に基づく自動時間帯判定
export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

// 🎯 スマート音声選択（時間帯・ランダムパターン）
export async function playSmartGreeting(characterId: string): Promise<boolean> {
  const timeSlot = getCurrentTimeSlot()
  const patterns: VoicePattern[] = ['normal', 'cheerful', 'calm', 'gentle']
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
  
  console.log('🤖 Smart greeting selection:', {
    characterId,
    timeSlot,
    selectedPattern: randomPattern
  })
  
  return await playTimeGreeting(characterId, timeSlot, randomPattern)
}

// デバッグ用関数
export const debugVoiceSystem = () => {
  console.log('🔍 VOICEVOX Voice System Debug:')
  console.log('=' .repeat(50))
  console.log('System: VOICEVOX Recorded Audio Only')
  console.log('No API Dependencies: ✅')
  console.log('Base Audio Path: /audio/recorded')
  console.log('Supported Time Slots:', ['morning', 'afternoon', 'evening', 'night'])
  console.log('Supported Emotions:', ['agreement', 'encouragement', 'surprise', 'thinking', 'concern', 'joy', 'default'])
  console.log('Cache Support: ✅')
  console.log('Fallback System: ✅')
  console.log('=' .repeat(50))
}