'use client'

import { characterVoiceConfigs, VoiceConfig, VoicePriority, shouldGenerateVoice } from './voice-config'

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
      return null
    }

    // キャッシュチェック
    const cacheKey = this.cache.getCacheKey(text, characterId)
    const cachedAudio = this.cache.get(cacheKey)
    if (cachedAudio) {
      console.log('🎵 Using cached voice:', text.substring(0, 30))
      return cachedAudio
    }

    try {
      console.log('🎤 Generating voice for:', characterId, text.substring(0, 30))
      
      const voiceConfig = characterVoiceConfigs[characterId]
      if (!voiceConfig) {
        console.error('Voice config not found for character:', characterId)
        return null
      }

      // サーバーサイドのTTS APIを呼び出し
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.substring(0, 200), // 200文字制限
          characterId,
          voiceConfig
        })
      })

      if (!response.ok) {
        throw new Error(`TTS API failed: ${response.status}`)
      }

      // 音声データをBlobとして取得
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // キャッシュに保存
      this.cache.set(cacheKey, audioUrl)

      console.log('✅ Voice generated successfully:', text.substring(0, 30))
      return audioUrl

    } catch (error) {
      console.error('❌ Voice generation failed:', error)
      return null
    }
  }

  // 音声を再生
  async playVoice(audioUrl: string): Promise<void> {
    if (!this.isInitialized) return

    try {
      const audio = new Audio(audioUrl)
      
      // モバイル対応
      audio.preload = 'auto'
      
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve()
        audio.onerror = () => reject(new Error('Audio playback failed'))
        
        // ユーザー操作による再生（モバイル対応）
        audio.play().catch(error => {
          console.warn('Audio autoplay failed (expected on mobile):', error)
          reject(error)
        })
      })
    } catch (error) {
      console.error('Audio playback error:', error)
      throw error
    }
  }

  // 音声生成 + 再生
  async generateAndPlay(
    text: string, 
    characterId: string, 
    priority: VoicePriority = VoicePriority.GENERAL_CHAT
  ): Promise<boolean> {
    try {
      const audioUrl = await this.generateVoice(text, characterId, priority)
      if (!audioUrl) {
        return false
      }

      await this.playVoice(audioUrl)
      return true
    } catch (error) {
      console.error('Voice generation and play failed:', error)
      return false
    }
  }

  // キャッシュクリア
  clearCache(): void {
    this.cache.clear()
  }

  // 音声対応チェック
  isVoiceSupported(): boolean {
    return this.isInitialized && typeof Audio !== 'undefined'
  }

  // キャラクター音声設定取得
  getVoiceConfig(characterId: string): VoiceConfig | null {
    return characterVoiceConfigs[characterId] || null
  }
}

// シングルトンインスタンス
export const voiceService = new VoiceService()