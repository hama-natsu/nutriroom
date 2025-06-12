'use client'

import { 
  elevenLabsVoiceConfigs, 
  shouldUseElevenLabs, 
  generateNameGreeting,
  ELEVENLABS_CONFIG
} from './elevenlabs-config'
import { voiceService } from './voice-service'
import { VoicePriority } from './voice-config'

// ElevenLabs音声キャッシュシステム
class ElevenLabsVoiceCache {
  private cache = new Map<string, string>()
  private maxSize = 30 // 名前読み上げ用なのでキャッシュサイズは小さめ

  getCacheKey(text: string, characterId: string): string {
    return `elevenlabs:${characterId}:${text}`
  }

  get(key: string): string | undefined {
    return this.cache.get(key)
  }

  set(key: string, audioUrl: string): void {
    if (this.cache.size >= this.maxSize) {
      // 古いキャッシュを削除
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        const oldUrl = this.cache.get(firstKey)
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl)
        }
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, audioUrl)
  }

  clear(): void {
    this.cache.forEach(url => URL.revokeObjectURL(url))
    this.cache.clear()
  }
}

export class ElevenLabsVoiceService {
  private cache = new ElevenLabsVoiceCache()
  private isInitialized = false

  constructor() {
    // ブラウザ環境でのみ初期化
    if (typeof window !== 'undefined') {
      this.isInitialized = true
    }
  }

  // ElevenLabsを使用した音声生成
  async generateElevenLabsVoice(
    text: string, 
    characterId: string
  ): Promise<string | null> {
    if (!this.isInitialized) {
      console.warn('ElevenLabsVoiceService not initialized (server-side)')
      return null
    }

    // ElevenLabs使用可否判定
    if (!shouldUseElevenLabs(text, characterId)) {
      console.log('⏭️ ElevenLabs generation skipped, fallback to Google TTS')
      return null
    }

    // キャッシュチェック
    const cacheKey = this.cache.getCacheKey(text, characterId)
    const cachedAudio = this.cache.get(cacheKey)
    if (cachedAudio) {
      console.log('🎵 Using cached ElevenLabs voice:', {
        characterId,
        text: text.substring(0, 20) + '...',
        cacheKey
      })
      return cachedAudio
    }

    try {
      console.log('🎙️ Generating ElevenLabs voice:', {
        characterId,
        text: text.substring(0, 30) + '...',
        textLength: text.length,
        timestamp: new Date().toISOString()
      })
      
      const voiceConfig = elevenLabsVoiceConfigs[characterId]
      if (!voiceConfig) {
        console.error('❌ ElevenLabs voice config not found for character:', characterId)
        return null
      }

      console.log('🎵 Using ElevenLabs voice config:', {
        characterId,
        voiceId: voiceConfig.voiceId,
        voiceName: voiceConfig.voiceName,
        stability: voiceConfig.stability,
        similarityBoost: voiceConfig.similarityBoost
      })

      // ElevenLabs APIを呼び出し
      console.log('📡 Sending ElevenLabs TTS API request...')
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          characterId,
          voiceConfig
        })
      })

      console.log('📡 ElevenLabs API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ ElevenLabs TTS API failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          characterId
        })
        // ElevenLabsが失敗した場合はGoogle TTSにフォールバック
        console.log('🔄 Falling back to Google TTS...')
        return null
      }

      // 音声データをBlobとして取得
      console.log('📦 Processing ElevenLabs audio response...')
      const audioBlob = await response.blob()
      console.log('📦 ElevenLabs audio blob size:', audioBlob.size, 'bytes')
      
      const audioUrl = URL.createObjectURL(audioBlob)
      console.log('🔗 ElevenLabs audio URL created:', audioUrl.substring(0, 50) + '...')

      // キャッシュに保存
      this.cache.set(cacheKey, audioUrl)
      console.log('💾 ElevenLabs audio cached with key:', cacheKey)

      console.log('✅ ElevenLabs voice generated successfully:', {
        characterId,
        text: text.substring(0, 30),
        audioSize: audioBlob.size,
        voiceId: voiceConfig.voiceId
      })
      return audioUrl

    } catch (error) {
      console.error('❌ ElevenLabs voice generation failed:', {
        characterId,
        text: text.substring(0, 30),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined
      })
      return null
    }
  }

  // 統合音声生成（ElevenLabs優先、Google TTSフォールバック）
  async generateAndPlay(
    text: string, 
    characterId: string, 
    priority: VoicePriority = VoicePriority.GENERAL_CHAT,
    userName?: string
  ): Promise<boolean> {
    const startTime = Date.now()
    console.log('🎬 Starting integrated voice generation workflow:', {
      characterId,
      text: text.substring(0, 30),
      priority,
      userName,
      timestamp: new Date().toISOString()
    })

    try {
      // 名前読み上げの場合はElevenLabsを優先
      const isNameCall = priority === VoicePriority.USER_NAME_CALLING
      let audioUrl: string | null = null

      if (isNameCall && userName) {
        // 名前読み上げ用テキストを生成
        const nameCallText = generateNameGreeting(userName, characterId)
        console.log('👤 Generating name call with ElevenLabs:', {
          characterId,
          userName,
          nameCallText
        })
        
        audioUrl = await this.generateElevenLabsVoice(nameCallText, characterId)
      } else if (shouldUseElevenLabs(text, characterId)) {
        // 短いテキストの場合はElevenLabsを試す
        console.log('🎙️ Trying ElevenLabs for short text:', {
          characterId,
          textLength: text.length
        })
        
        audioUrl = await this.generateElevenLabsVoice(text, characterId)
      }

      // ElevenLabsが失敗またはスキップされた場合はGoogle TTSにフォールバック
      if (!audioUrl) {
        console.log('🔄 Falling back to Google TTS:', {
          characterId,
          reason: 'ElevenLabs failed or skipped'
        })
        
        audioUrl = await voiceService.generateVoice(text, characterId, priority)
      }

      if (!audioUrl) {
        console.log('⏭️ Voice generation failed - no audio generated')
        return false
      }

      // 音声再生
      await voiceService.playVoice(audioUrl)
      
      const duration = Date.now() - startTime
      console.log('🎉 Integrated voice workflow completed successfully:', {
        characterId,
        text: text.substring(0, 30),
        duration: `${duration}ms`,
        usedElevenLabs: !audioUrl.includes('blob:'),
        success: true
      })
      return true

    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ Integrated voice generation failed:', {
        characterId,
        text: text.substring(0, 30),
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
        success: false
      })
      return false
    }
  }

  // 名前読み上げ専用メソッド（generateNameGreeting使用）
  async generateNameGreeting(userName: string, characterId: string): Promise<string | null> {
    console.log('👤 Generating name greeting:', { userName, characterId })
    
    // 名前呼びかけテキストを生成
    const greetingText = generateNameGreeting(userName, characterId)
    console.log('🎭 Generated greeting text:', greetingText)
    
    // ElevenLabsで音声生成
    return await this.generateElevenLabsVoice(greetingText, characterId)
  }

  // 名前読み上げ再生メソッド
  async playNameCall(userName: string, characterId: string): Promise<boolean> {
    console.log('👤 Playing name call:', { userName, characterId })
    
    const audioUrl = await this.generateNameGreeting(userName, characterId)
    
    if (!audioUrl) {
      console.log('⏭️ Name greeting generation failed, falling back to Google TTS')
      return await this.generateAndPlay(
        generateNameGreeting(userName, characterId),
        characterId,
        VoicePriority.USER_NAME_CALLING,
        userName
      )
    }
    
    // 音声再生
    await voiceService.playVoice(audioUrl)
    return true
  }

  // キャッシュクリア
  clearCache(): void {
    console.log('🗑️ Clearing ElevenLabs voice cache...')
    const cacheSize = this.cache['cache'].size
    this.cache.clear()
    console.log(`✅ ElevenLabs voice cache cleared (${cacheSize} items removed)`)
  }

  // ElevenLabs対応チェック（SDK対応版）
  isElevenLabsSupported(): boolean {
    const hasApiKey = !!process.env.ELEVENLABS_API_KEY
    const isValidApiKey = hasApiKey && !process.env.ELEVENLABS_API_KEY!.includes('your_elevenlabs_api_key')
    const isSupported = this.isInitialized && 
                       typeof Audio !== 'undefined' &&
                       isValidApiKey
    
    console.log('🔍 ElevenLabs SDK support check:', {
      isInitialized: this.isInitialized,
      hasAudio: typeof Audio !== 'undefined',
      hasApiKey,
      isValidApiKey,
      isSupported,
      modelId: ELEVENLABS_CONFIG.MODEL_ID,
      voiceSettings: ELEVENLABS_CONFIG.DEFAULT_VOICE_SETTINGS,
      browser: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'unknown'
    })
    
    return isSupported
  }

  // デバッグ用: 設定確認
  getVoiceConfig(characterId: string) {
    const config = elevenLabsVoiceConfigs[characterId] || null
    console.log('🎭 Getting ElevenLabs voice config for character:', {
      characterId,
      found: !!config,
      config: config ? {
        voiceId: config.voiceId,
        voiceName: config.voiceName,
        stability: config.stability
      } : null
    })
    return config
  }
}

// 基本音声生成機能のテスト
export const testBasicVoiceGeneration = async (characterId: string = 'minato') => {
  console.log('🧪 Testing basic ElevenLabs voice generation...')
  
  const service = new ElevenLabsVoiceService()
  const testText = 'こんにちは、テストです'
  
  console.log(`🎭 Testing character: ${characterId}`)
  console.log(`📝 Test text: ${testText}`)
  
  const audioUrl = await service.generateElevenLabsVoice(testText, characterId)
  
  if (audioUrl) {
    console.log('✅ Basic voice generation test passed')
    console.log(`🔗 Audio URL: ${audioUrl.substring(0, 50)}...`)
  } else {
    console.log('❌ Basic voice generation test failed')
  }
  
  return !!audioUrl
}

// 名前読み上げ機能のテスト
export const testNameGreeting = async (userName: string = 'テストユーザー', characterId: string = 'minato') => {
  console.log('🧪 Testing name greeting generation...')
  
  const service = new ElevenLabsVoiceService()
  
  console.log(`👤 User name: ${userName}`)
  console.log(`🎭 Character: ${characterId}`)
  
  const audioUrl = await service.generateNameGreeting(userName, characterId)
  
  if (audioUrl) {
    console.log('✅ Name greeting test passed')
    console.log(`🔗 Audio URL: ${audioUrl.substring(0, 50)}...`)
  } else {
    console.log('❌ Name greeting test failed')
  }
  
  return !!audioUrl
}

// シングルトンインスタンス
export const elevenLabsVoiceService = new ElevenLabsVoiceService()