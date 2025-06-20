// 🎯 初期挨拶重複防止Hook - セッション管理

import { useState, useEffect, useRef, useCallback } from 'react'

interface InitialGreetingState {
  hasPlayed: boolean
  isPlaying: boolean
  error: string | null
}

interface UseInitialGreetingOptions {
  characterId: string
  enabled?: boolean
  delay?: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseInitialGreetingResult extends InitialGreetingState {
  playGreeting: () => Promise<boolean>
  reset: () => void
}

// セッション全体で共有する初期挨拶状態
const globalGreetingState = new Map<string, boolean>()

export function useInitialGreeting({
  characterId,
  enabled = true,
  delay = 1000,
  onSuccess,
  onError
}: UseInitialGreetingOptions): UseInitialGreetingResult {
  
  const [state, setState] = useState<InitialGreetingState>({
    hasPlayed: globalGreetingState.get(characterId) || false,
    isPlaying: false,
    error: null
  })
  
  const playingRef = useRef(false)
  const mountedRef = useRef(true)

  // コンポーネントアンマウント時の処理
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 初期挨拶の実行
  const playGreeting = useCallback(async (): Promise<boolean> => {
    // 既に再生済みまたは実行中の場合はスキップ
    if (globalGreetingState.get(characterId) || playingRef.current) {
      console.log('🔄 Initial greeting skipped:', {
        characterId,
        alreadyPlayed: globalGreetingState.get(characterId),
        currentlyPlaying: playingRef.current
      })
      return true
    }

    playingRef.current = true
    
    if (mountedRef.current) {
      setState(prev => ({ ...prev, isPlaying: true, error: null }))
    }

    try {
      console.log('🎯 Playing initial greeting:', {
        characterId,
        timestamp: new Date().toISOString()
      })

      // 動的インポートで循環参照を回避
      const { handleUnifiedVoiceResponse, getUnifiedTimeSlot } = await import('@/lib/unified-voice-system')
      
      // 統一システムを使用した時間帯取得
      const timeSlot = getUnifiedTimeSlot()
      
      console.log('🌅 Unified time-based greeting:', {
        characterId,
        timeSlot,
        timestamp: new Date().toISOString()
      })

      // 統一音声システムでの初期挨拶再生（型チェック省略）
      const validCharacters = ['akari', 'minato', 'yuki', 'riku', 'mao', 'satsuki', 'sora']
      if (!validCharacters.includes(characterId)) {
        throw new Error(`Unsupported character: ${characterId}`)
      }
      const success = await handleUnifiedVoiceResponse(characterId as 'akari' | 'minato' | 'yuki' | 'riku' | 'mao' | 'satsuki' | 'sora', undefined, true)
      
      if (success) {
        // グローバル状態を更新（セッション全体で共有）
        globalGreetingState.set(characterId, true)
        
        if (mountedRef.current) {
          setState(prev => ({ 
            ...prev, 
            hasPlayed: true, 
            isPlaying: false,
            error: null 
          }))
        }
        
        console.log('✅ Initial greeting completed successfully:', { characterId })
        onSuccess?.()
        return true
        
      } else {
        throw new Error('Smart greeting playback failed')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Initial greeting failed:', {
        characterId,
        error: errorMessage
      })
      
      if (mountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          isPlaying: false,
          error: errorMessage 
        }))
      }
      
      onError?.(errorMessage)
      return false
      
    } finally {
      playingRef.current = false
    }
  }, [characterId, onSuccess, onError])

  // 自動実行 - useEffectで1回のみ
  useEffect(() => {
    if (!enabled || globalGreetingState.get(characterId)) {
      return
    }

    const timer = setTimeout(() => {
      if (mountedRef.current && !globalGreetingState.get(characterId)) {
        playGreeting()
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [characterId, enabled, delay, playGreeting]) // playGreeting依存関係を追加

  // リセット関数
  const reset = () => {
    globalGreetingState.delete(characterId)
    setState({
      hasPlayed: false,
      isPlaying: false,
      error: null
    })
    console.log('🔄 Initial greeting state reset for:', characterId)
  }

  return {
    ...state,
    playGreeting,
    reset
  }
}

// デバッグ用関数
export const debugInitialGreeting = () => {
  console.log('🔍 Initial Greeting Debug Info:')
  console.log('=' .repeat(50))
  console.log('Global greeting states:')
  for (const [characterId, hasPlayed] of globalGreetingState.entries()) {
    console.log(`  ${characterId}: ${hasPlayed ? '✅ Played' : '❌ Not played'}`)
  }
  console.log('=' .repeat(50))
}

// グローバル状態をクリア（テスト用）
export const clearAllGreetingStates = () => {
  globalGreetingState.clear()
  console.log('🗑️ All initial greeting states cleared')
}