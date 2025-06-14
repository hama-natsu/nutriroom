// 🎯 グローバル音声再生管理システム - 同時再生完全防止

export interface AudioInfo {
  id: string
  characterId: string
  audioElement: HTMLAudioElement
  startTime: Date
  type: 'greeting' | 'response' | 'emotion'
}

export interface AudioQueueItem {
  id: string
  characterId: string
  audioBlob: Blob
  type: 'greeting' | 'response' | 'emotion'
  priority: 'high' | 'normal' | 'low'
}

class GlobalAudioManager {
  private static instance: GlobalAudioManager
  private currentAudio: HTMLAudioElement | null = null
  private isPlaying: boolean = false
  private audioQueue: AudioQueueItem[] = []
  private isProcessingQueue: boolean = false
  private listeners: Set<(isPlaying: boolean) => void> = new Set()

  private constructor() {
    console.log('🎵 GlobalAudioManager initialized')
  }

  public static getInstance(): GlobalAudioManager {
    if (!GlobalAudioManager.instance) {
      GlobalAudioManager.instance = new GlobalAudioManager()
    }
    return GlobalAudioManager.instance
  }

  // 🔊 排他的音声再生 - 既存音声を即座に停止
  public async playAudioExclusive(audioBlob: Blob, characterId: string, type: 'greeting' | 'response' | 'emotion' = 'response'): Promise<boolean> {
    try {
      // 既存音声を強制停止
      this.stopCurrentAudio()

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      this.currentAudio = audio
      this.isPlaying = true
      this.notifyListeners(true)

      console.log('🎵 Starting exclusive audio playback:', {
        characterId,
        type,
        timestamp: new Date().toISOString(),
        audioSize: audioBlob.size
      })

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          this.cleanupAudio(audioUrl)
          console.log('✅ Audio playback completed:', { characterId, type })
          resolve(true)
        }

        audio.onerror = (error) => {
          this.cleanupAudio(audioUrl)
          console.error('❌ Audio playback error:', error)
          reject(new Error('Audio playback failed'))
        }

        audio.onloadeddata = () => {
          console.log('📥 Audio loaded for playback:', { characterId, duration: audio.duration })
        }

        // 音声再生開始
        audio.play().catch(reject)
      })

    } catch (error) {
      this.isPlaying = false
      this.currentAudio = null
      this.notifyListeners(false)
      console.error('❌ Exclusive audio playback failed:', error)
      throw error
    }
  }

  // 🛑 現在の音声を強制停止
  public stopCurrentAudio(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      console.log('🛑 Stopping current audio playback')
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      
      // URL cleanup
      if (this.currentAudio.src) {
        URL.revokeObjectURL(this.currentAudio.src)
      }
    }
    
    this.cleanupAudio()
  }

  // 🧹 音声リソースのクリーンアップ
  private cleanupAudio(audioUrl?: string): void {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    
    this.currentAudio = null
    this.isPlaying = false
    this.notifyListeners(false)
  }

  // 📊 再生状態の取得
  public getPlaybackState(): { isPlaying: boolean; currentAudio: AudioInfo | null } {
    const currentAudioInfo = this.currentAudio ? {
      id: Date.now().toString(),
      characterId: 'unknown',
      audioElement: this.currentAudio,
      startTime: new Date(),
      type: 'response' as const
    } : null

    return {
      isPlaying: this.isPlaying,
      currentAudio: currentAudioInfo
    }
  }

  // 🎯 キューシステム - 音声を順次処理
  public addToQueue(item: AudioQueueItem): void {
    // 高優先度は先頭に、通常優先度は末尾に追加
    if (item.priority === 'high') {
      this.audioQueue.unshift(item)
    } else {
      this.audioQueue.push(item)
    }

    console.log('📥 Audio added to queue:', {
      id: item.id,
      characterId: item.characterId,
      type: item.type,
      priority: item.priority,
      queueLength: this.audioQueue.length
    })

    // キュー処理を開始
    this.processQueue()
  }

  // ⚙️ キューの順次処理
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.audioQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.audioQueue.length > 0) {
      const item = this.audioQueue.shift()!
      
      try {
        console.log('🎵 Processing queue item:', {
          id: item.id,
          characterId: item.characterId,
          type: item.type,
          remainingInQueue: this.audioQueue.length
        })

        await this.playAudioExclusive(item.audioBlob, item.characterId, item.type)
        
        // 音声間の短い間隔
        await new Promise(resolve => setTimeout(resolve, 300))
        
      } catch (error) {
        console.error('❌ Queue item playback failed:', {
          id: item.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    this.isProcessingQueue = false
    console.log('✅ Audio queue processing completed')
  }

  // 🗑️ キューをクリア
  public clearQueue(): void {
    this.audioQueue = []
    console.log('🗑️ Audio queue cleared')
  }

  // 👂 再生状態の監視
  public addPlaybackListener(callback: (isPlaying: boolean) => void): () => void {
    this.listeners.add(callback)
    
    // 初回コールバック
    callback(this.isPlaying)
    
    // リスナー削除関数を返す
    return () => {
      this.listeners.delete(callback)
    }
  }

  // 📢 リスナーに状態変更を通知
  private notifyListeners(isPlaying: boolean): void {
    this.listeners.forEach(callback => {
      try {
        callback(isPlaying)
      } catch (error) {
        console.error('❌ Playback listener error:', error)
      }
    })
  }

  // 🔍 デバッグ情報
  public getDebugInfo(): object {
    return {
      isPlaying: this.isPlaying,
      currentAudio: this.currentAudio ? {
        src: this.currentAudio.src.substring(0, 50) + '...',
        paused: this.currentAudio.paused,
        currentTime: this.currentAudio.currentTime,
        duration: this.currentAudio.duration
      } : null,
      queueLength: this.audioQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      listenerCount: this.listeners.size
    }
  }

  // 🔄 システムリセット
  public reset(): void {
    console.log('🔄 Resetting GlobalAudioManager')
    this.stopCurrentAudio()
    this.clearQueue()
    this.isProcessingQueue = false
    this.listeners.clear()
  }
}

// シングルトンインスタンスをエクスポート
export const globalAudioManager = GlobalAudioManager.getInstance()

// 便利関数：排他的音声再生
export async function playAudioExclusive(
  audioBlob: Blob, 
  characterId: string, 
  type: 'greeting' | 'response' | 'emotion' = 'response'
): Promise<boolean> {
  try {
    await globalAudioManager.playAudioExclusive(audioBlob, characterId, type)
    return true
  } catch (error) {
    console.error('❌ Exclusive audio playback failed:', error)
    return false
  }
}

// 便利関数：現在の音声を停止
export function stopCurrentAudio(): void {
  globalAudioManager.stopCurrentAudio()
}

// 便利関数：再生状態の取得
export function getAudioPlaybackState(): { isPlaying: boolean; currentAudio: AudioInfo | null } {
  return globalAudioManager.getPlaybackState()
}

// 便利関数：キューに音声を追加
export function addAudioToQueue(
  audioBlob: Blob,
  characterId: string,
  type: 'greeting' | 'response' | 'emotion' = 'response',
  priority: 'high' | 'normal' | 'low' = 'normal'
): void {
  const item: AudioQueueItem = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    characterId,
    audioBlob,
    type,
    priority
  }
  
  globalAudioManager.addToQueue(item)
}

// デバッグ用関数
export const debugGlobalAudioManager = () => {
  console.log('🔍 GlobalAudioManager Debug Info:')
  console.log('=' .repeat(50))
  console.log(globalAudioManager.getDebugInfo())
  console.log('=' .repeat(50))
}