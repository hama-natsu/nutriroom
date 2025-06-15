// 🎯 NutriRoom Phase 2.1: スマート音声選択エンジン React Hook

import { useState, useCallback, useMemo } from 'react'
import { 
  VoiceSelectionRequest, 
  VoiceSelectionResult, 
  VoiceFileInfo,
  SmartVoiceConfig
} from '@/types/voiceTypes'
import { 
  selectSmartVoice, 
  checkVoiceFileExists,
  debugSmartVoiceSystem 
} from '@/utils/voiceSelection'
import { VOICEVOXPlayer } from '@/lib/voice-player'

interface UseSmartVoiceReturn {
  isPlaying: boolean
  isLoading: boolean
  lastSelection: VoiceSelectionResult | null
  playSmartVoice: (request: VoiceSelectionRequest) => Promise<boolean>
  testVoiceSelection: (request: VoiceSelectionRequest) => Promise<VoiceSelectionResult>
  checkAudioFile: (characterId: string, fileName: string) => Promise<VoiceFileInfo>
  debugVoiceSystem: () => void
}

/**
 * スマート音声選択エンジンのReact Hook
 */
export function useSmartVoice(config?: SmartVoiceConfig): UseSmartVoiceReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSelection, setLastSelection] = useState<VoiceSelectionResult | null>(null)

  // VOICEVOXプレイヤーインスタンス（useMemoで最適化）
  const voicePlayer = useMemo(() => new VOICEVOXPlayer(), [])

  /**
   * スマート音声再生（フォールバック機能付き・無限ループ防止）
   */
  const playSmartVoice = useCallback(async (request: VoiceSelectionRequest): Promise<boolean> => {
    if (isPlaying) {
      console.warn('🔄 Voice is already playing, skipping new request')
      return false
    }

    setIsLoading(true)
    setIsPlaying(true)

    // 🚨 フォールバック制限設定
    const MAX_FALLBACK_ATTEMPTS = 3
    const FALLBACK_TIMEOUT = 5000 // 5秒タイムアウト
    let fallbackAttempts = 0

    try {
      // 1. スマート音声選択
      const selection = await selectSmartVoice(request, config)
      setLastSelection(selection)

      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Smart voice selection result:', {
          fileName: selection.fileName,
          pattern: selection.pattern,
          confidence: selection.confidence
        })
      }

      // 2. メイン音声ファイルを試行（タイムアウト付き）
      let success = false
      
      try {
        const mainVoicePromise = voicePlayer.playVoice({
          characterId: request.characterId,
          timeSlot: request.timeSlot,
          pattern: selection.pattern
        })
        
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Main voice timeout')), FALLBACK_TIMEOUT)
        )
        
        success = await Promise.race([mainVoicePromise, timeoutPromise])
        
        if (success) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Main voice played successfully')
          }
          return true
        }
      } catch {
        console.warn('🔄 Main voice failed, trying fallbacks')
      }

      // 3. フォールバック音声を試行（最大3回制限）
      if (!success && selection.fallbackOptions.length > 0) {
        for (const fallbackFile of selection.fallbackOptions.slice(0, MAX_FALLBACK_ATTEMPTS)) {
          fallbackAttempts++
          
          if (fallbackAttempts > MAX_FALLBACK_ATTEMPTS) {
            console.warn('⚠️ Maximum fallback attempts reached, stopping')
            break
          }
          
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log(`🔄 Fallback attempt ${fallbackAttempts}/${MAX_FALLBACK_ATTEMPTS}:`, fallbackFile)
            }
            
            const fallbackPromise = voicePlayer.playVoice({
              characterId: request.characterId,
              emotion: 'default',
              fallbackToDefault: false
            })
            
            const timeoutPromise = new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Fallback timeout')), FALLBACK_TIMEOUT)
            )
            
            const fallbackSuccess = await Promise.race([fallbackPromise, timeoutPromise])

            if (fallbackSuccess) {
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Fallback voice played successfully:', fallbackFile)
              }
              success = true
              break
            }
          } catch (fallbackError) {
            console.warn(`⚠️ Fallback ${fallbackAttempts} failed:`, fallbackError instanceof Error ? fallbackError.message : 'Unknown error')
            continue
          }
        }
      }

      // 4. No final default fallback - gracefully handle failure
      if (!success) {
        console.log('🆘 No final default fallback - system designed to work without default.wav')
        console.log('✅ Graceful degradation: Voice playback failed but system continues normally')
        // REMOVED: No more default.wav dependency - system should handle voice failure gracefully
      }

      return success

    } catch (error) {
      console.error('❌ Smart voice playback failed:', error)
      return false
    } finally {
      setIsLoading(false)
      setIsPlaying(false)
    }
  }, [isPlaying, config, voicePlayer])

  /**
   * 音声選択テスト（実際に再生せずに選択結果のみ取得）
   */
  const testVoiceSelection = useCallback(async (request: VoiceSelectionRequest): Promise<VoiceSelectionResult> => {
    const selection = await selectSmartVoice(request, config)
    setLastSelection(selection)
    return selection
  }, [config])

  /**
   * 音声ファイル存在確認
   */
  const checkAudioFile = useCallback(async (characterId: string, fileName: string): Promise<VoiceFileInfo> => {
    return await checkVoiceFileExists(characterId, fileName, config)
  }, [config])

  /**
   * デバッグ情報出力
   */
  const debugVoiceSystem = useCallback(() => {
    debugSmartVoiceSystem()
    
    if (lastSelection) {
      console.log('🎯 Last Selection Details:', lastSelection)
    }
    
    console.log('🎵 Voice Player Cache Info:', voicePlayer.getCacheInfo())
  }, [lastSelection, voicePlayer])

  return {
    isPlaying,
    isLoading,
    lastSelection,
    playSmartVoice,
    testVoiceSelection,
    checkAudioFile,
    debugVoiceSystem
  }
}

// デフォルトエクスポート
export default useSmartVoice