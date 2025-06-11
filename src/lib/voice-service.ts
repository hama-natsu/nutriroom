'use client'

import { characterVoiceConfigs, VoiceConfig, VoicePriority, shouldGenerateVoice, getSummarizedTextForVoice } from './voice-config'

// 音声キャッシュシステム
class VoiceCache {
  private cache = new Map<string, string>()
  private maxSize = 50 // 最大キャッシュ数

  getCacheKey(text: string, characterId: string): string {
    return `${characterId}:${text.substring(0, 100)}`
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
    // 全てのURLを解放
    this.cache.forEach(url => URL.revokeObjectURL(url))
    this.cache.clear()
  }
}

export class VoiceService {
  private cache = new VoiceCache()
  private isInitialized = false

  constructor() {
    // ブラウザ環境でのみ初期化
    if (typeof window !== 'undefined') {
      this.isInitialized = true
    }
  }

  // Google Cloud TTS APIを呼び出し（サーバーサイド経由）
  async generateVoice(
    text: string, 
    characterId: string, 
    priority: VoicePriority = VoicePriority.GENERAL_CHAT
  ): Promise<string | null> {
    if (!this.isInitialized) {
      console.warn('VoiceService not initialized (server-side)')
      return null
    }

    // 音声生成の必要性を判定
    if (!shouldGenerateVoice(text, priority)) {
      console.log('⏭️ Voice generation skipped by policy')
      return null
    }

    // 長文の場合は要約処理を実行
    const processedText = getSummarizedTextForVoice(text, characterId)

    // キャッシュチェック（処理済みテキストでキャッシュキーを生成）
    const cacheKey = this.cache.getCacheKey(processedText, characterId)
    const cachedAudio = this.cache.get(cacheKey)
    if (cachedAudio) {
      console.log('🎵 Using cached voice:', {
        originalText: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        processedText: processedText.substring(0, 30) + (processedText.length > 30 ? '...' : ''),
        cacheKey: cacheKey.substring(0, 30) + '...'
      })
      return cachedAudio
    }

    try {
      console.log('🎤 Generating voice for:', {
        characterId,
        originalText: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        originalLength: text.length,
        processedText: processedText.substring(0, 30) + (processedText.length > 30 ? '...' : ''),
        processedLength: processedText.length,
        wasProcessed: text !== processedText,
        priority,
        timestamp: new Date().toISOString()
      })
      
      const voiceConfig = characterVoiceConfigs[characterId]
      if (!voiceConfig) {
        console.error('❌ Voice config not found for character:', characterId)
        return null
      }

      console.log('🎵 Using voice config:', {
        characterId,
        languageCode: voiceConfig.languageCode,
        voiceName: voiceConfig.name,
        personality: voiceConfig.personality
      })

      // サーバーサイドのTTS APIを呼び出し
      console.log('📡 Sending TTS API request...')
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: processedText.substring(0, 200), // 処理済みテキストを使用、200文字制限
          characterId,
          voiceConfig
        })
      })

      console.log('📡 TTS API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ TTS API failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`TTS API failed: ${response.status} - ${errorText}`)
      }

      // 音声データをBlobとして取得
      console.log('📦 Processing audio response...')
      const audioBlob = await response.blob()
      console.log('📦 Audio blob size:', audioBlob.size, 'bytes')
      
      const audioUrl = URL.createObjectURL(audioBlob)
      console.log('🔗 Audio URL created:', audioUrl.substring(0, 50) + '...')

      // キャッシュに保存
      this.cache.set(cacheKey, audioUrl)
      console.log('💾 Audio cached with key:', cacheKey.substring(0, 30) + '...')

      console.log('✅ Voice generated successfully:', {
        characterId,
        text: text.substring(0, 30),
        audioSize: audioBlob.size,
        cacheKey: cacheKey.substring(0, 30) + '...'
      })
      return audioUrl

    } catch (error) {
      console.error('❌ Voice generation failed:', {
        characterId,
        text: text.substring(0, 30),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return null
    }
  }

  // 音声を再生（改善版 - 途切れ問題対策）
  async playVoice(audioUrl: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('⚠️ VoiceService not initialized - cannot play audio')
      return
    }

    try {
      console.log('🔊 Starting enhanced audio playback:', audioUrl.substring(0, 50) + '...')
      const audio = new Audio(audioUrl)
      
      // 音声バッファリング強化設定
      audio.preload = 'auto'
      audio.volume = 0.85 // 音量設定
      audio.crossOrigin = 'anonymous' // CORS対応
      
      // 音声再生品質向上のための設定
      if ('webkitAudioContext' in window || 'AudioContext' in window) {
        console.log('🎧 Enhanced audio context available')
      }
      
      console.log('🎵 Audio element created with enhanced settings...')
      
      return new Promise((resolve, reject) => {
        let isResolved = false
        const timeout = setTimeout(() => {
          if (!isResolved) {
            console.warn('⏰ Audio playback timeout (30s)')
            isResolved = true
            reject(new Error('Audio playback timeout'))
          }
        }, 30000) // 30秒タイムアウト

        // 完了時の処理
        const handleComplete = () => {
          if (!isResolved) {
            console.log('✅ Audio playback completed successfully')
            clearTimeout(timeout)
            isResolved = true
            resolve()
          }
        }

        // エラー処理
        const handleError = () => {
          if (!isResolved) {
            console.error('❌ Audio playback error:', {
              currentTime: audio.currentTime,
              duration: audio.duration,
              readyState: audio.readyState,
              networkState: audio.networkState
            })
            clearTimeout(timeout)
            isResolved = true
            reject(new Error('Audio playback failed'))
          }
        }

        // イベントリスナー設定
        audio.onended = handleComplete
        audio.onerror = handleError
        audio.onabort = handleError
        
        // 進行状況の詳細ログ
        audio.onloadstart = () => console.log('📥 Audio loading started')
        audio.onloadeddata = () => console.log('📊 Audio data loaded')
        audio.oncanplay = () => console.log('▶️ Audio ready to play')
        audio.oncanplaythrough = () => console.log('🎯 Audio can play through')
        audio.onprogress = () => {
          if (audio.buffered.length > 0) {
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1)
            const duration = audio.duration || 0
            const bufferedPercent = duration > 0 ? (bufferedEnd / duration * 100).toFixed(1) : '0'
            console.log(`📊 Audio buffered: ${bufferedPercent}%`)
          }
        }
        
        // 音声データの完全ロード待機
        const attemptPlay = () => {
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA以上
            console.log('🎵 Starting audio playback (readyState:', audio.readyState, ')')
            audio.play().then(() => {
              console.log('🎵 Audio playback started successfully:', {
                duration: audio.duration,
                currentTime: audio.currentTime,
                volume: audio.volume,
                readyState: audio.readyState
              })
            }).catch(error => {
              console.warn('⚠️ Audio autoplay failed:', error)
              if (!isResolved) {
                clearTimeout(timeout)
                isResolved = true
                reject(error)
              }
            })
          } else {
            console.log('⏳ Waiting for audio data to load (readyState:', audio.readyState, ')')
            setTimeout(attemptPlay, 100) // 100ms後に再試行
          }
        }

        // ロード完了時に再生開始
        audio.oncanplay = () => {
          console.log('▶️ Audio ready to play, attempting playback...')
          attemptPlay()
        }
      })
    } catch (error) {
      console.error('❌ Audio playback setup error:', {
        error: error instanceof Error ? error.message : String(error),
        audioUrl: audioUrl.substring(0, 50) + '...'
      })
      throw error
    }
  }

  // 音声生成 + 再生
  async generateAndPlay(
    text: string, 
    characterId: string, 
    priority: VoicePriority = VoicePriority.GENERAL_CHAT
  ): Promise<boolean> {
    const startTime = Date.now()
    console.log('🎬 Starting voice generation and playback workflow:', {
      characterId,
      text: text.substring(0, 30),
      priority,
      timestamp: new Date().toISOString()
    })

    try {
      const audioUrl = await this.generateVoice(text, characterId, priority)
      if (!audioUrl) {
        console.log('⏭️ Voice generation skipped - returning false')
        return false
      }

      await this.playVoice(audioUrl)
      
      const duration = Date.now() - startTime
      console.log('🎉 Voice workflow completed successfully:', {
        characterId,
        text: text.substring(0, 30),
        duration: `${duration}ms`,
        success: true
      })
      return true
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ Voice generation and play failed:', {
        characterId,
        text: text.substring(0, 30),
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
        success: false
      })
      return false
    }
  }

  // キャッシュクリア
  clearCache(): void {
    console.log('🗑️ Clearing voice cache...')
    const cacheSize = this.cache['cache'].size
    this.cache.clear()
    console.log(`✅ Voice cache cleared (${cacheSize} items removed)`)
  }

  // 音声対応チェック
  isVoiceSupported(): boolean {
    const isSupported = this.isInitialized && typeof Audio !== 'undefined'
    console.log('🔍 Voice support check:', {
      isInitialized: this.isInitialized,
      hasAudio: typeof Audio !== 'undefined',
      isSupported,
      browser: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'unknown'
    })
    return isSupported
  }

  // キャラクター音声設定取得
  getVoiceConfig(characterId: string): VoiceConfig | null {
    const config = characterVoiceConfigs[characterId] || null
    console.log('🎭 Getting voice config for character:', {
      characterId,
      found: !!config,
      config: config ? {
        languageCode: config.languageCode,
        voiceName: config.name,
        personality: config.personality
      } : null
    })
    return config
  }
}

// シングルトンインスタンス
export const voiceService = new VoiceService()