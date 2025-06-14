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
   * スマート音声再生（フォールバック機能付き）
   */
  const playSmartVoice = useCallback(async (request: VoiceSelectionRequest): Promise<boolean> => {
    if (isPlaying) {
      console.warn('🔄 Voice is already playing, skipping new request')
      return false
    }

    setIsLoading(true)
    setIsPlaying(true)

    try {
      // 1. スマート音声選択
      const selection = await selectSmartVoice(request, config)
      setLastSelection(selection)

      console.log('🎯 Smart voice selection result:', {
        fileName: selection.fileName,
        pattern: selection.pattern,
        confidence: selection.confidence,
        reason: selection.selectionReason
      })

      // 2. メイン音声ファイルを試行
      let success = false
      try {
        success = await voicePlayer.playVoice({
          characterId: request.characterId,
          timeSlot: request.timeSlot,
          pattern: selection.pattern
        })
      } catch (mainError) {
        console.warn('🔄 Main voice file failed, trying fallbacks:', mainError)
      }

      // 3. フォールバック音声を試行
      if (!success && selection.fallbackOptions.length > 0) {
        for (const fallbackFile of selection.fallbackOptions) {
          try {
            console.log('🔄 Trying fallback voice:', fallbackFile)
            
            // フォールバック音声の再生を試行
            const fallbackSuccess = await voicePlayer.playVoice({
              characterId: request.characterId,
              emotion: 'default',
              fallbackToDefault: false
            })

            if (fallbackSuccess) {
              console.log('✅ Fallback voice played successfully:', fallbackFile)
              success = true
              break
            }
          } catch (fallbackError) {
            console.warn('⚠️ Fallback voice failed:', fallbackFile, fallbackError)
            continue
          }
        }
      }

      // 4. 最終的なデフォルト音声
      if (!success) {
        console.log('🆘 All options failed, playing default voice')
        try {
          success = await voicePlayer.playVoice({
            characterId: request.characterId,
            emotion: 'default'
          })
        } catch (defaultError) {
          console.error('❌ Even default voice failed:', defaultError)
        }
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