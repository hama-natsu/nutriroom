// 🎯 NutriRoom Phase 2.2: チャット応答制御コンポーネント

'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ResponseControlRequest,
  ResponseControlResult,
  ResponseExecutionState,
  ResponseType
} from '@/types/responseTypes'
import { controlChatResponse } from '@/utils/responsePatternAnalyzer'
import { useSmartVoice } from '@/hooks/useSmartVoice'

interface ChatResponseControllerProps {
  characterId: string
  responseText: string
  userMessage: string
  conversationHistory: string[]
  onTextDisplay?: (text: string) => void
  onVoiceStart?: () => void
  onVoiceEnd?: () => void
  onResponseComplete?: () => void
  onError?: (error: string) => void
  context?: {
    isFirstInteraction?: boolean
    userEmotionState?: string
    topicComplexity?: 'simple' | 'medium' | 'complex'
    urgency?: 'low' | 'medium' | 'high' | 'critical'
  }
}

export function ChatResponseController({
  characterId,
  responseText,
  userMessage,
  conversationHistory,
  onTextDisplay,
  onVoiceStart,
  onVoiceEnd,
  onResponseComplete,
  onError,
  context
}: ChatResponseControllerProps) {
  const [controlResult, setControlResult] = useState<ResponseControlResult | null>(null)
  const [executionState, setExecutionState] = useState<ResponseExecutionState>({
    isVoicePlaying: false,
    isTextDisplaying: false,
    voiceStarted: false,
    textStarted: false,
    completed: false
  })
  
  const { playSmartVoice, isPlaying } = useSmartVoice()

  // 応答制御分析
  useEffect(() => {
    const request: ResponseControlRequest = {
      characterId,
      responseText,
      userMessage,
      conversationHistory,
      context
    }
    
    const result = controlChatResponse(request)
    setControlResult(result)
    
    console.log('🎭 Response control initialized:', {
      type: result.pattern.type,
      category: result.pattern.category,
      priority: result.pattern.priority,
      reason: result.pattern.reason
    })
  }, [characterId, responseText, userMessage, conversationHistory, context])

  // テキスト表示処理
  const executeTextDisplay = useCallback(async (delay: number) => {
    if (!controlResult?.content.textRequired) return
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    setExecutionState(prev => ({ ...prev, isTextDisplaying: true, textStarted: true }))
    
    if (onTextDisplay) {
      onTextDisplay(responseText)
    }
    
    console.log('📝 Text display executed with delay:', delay)
  }, [controlResult, responseText, onTextDisplay])

  // 音声再生処理
  const executeVoicePlayback = useCallback(async (delay: number) => {
    if (!controlResult?.content.voiceRequired) return
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    setExecutionState(prev => ({ ...prev, isVoicePlaying: true, voiceStarted: true }))
    
    if (onVoiceStart) {
      onVoiceStart()
    }
    
    try {
      console.log('🎵 Voice playback started with delay:', delay)
      
      const success = await playSmartVoice({
        characterId,
        interactionContext: mapCategoryToContext(controlResult.pattern.category),
        userMessage,
        conversationHistory
      })
      
      if (success) {
        console.log('✅ Voice playback completed successfully')
      } else {
        console.warn('⚠️ Voice playback failed')
        if (onError) {
          onError('Voice playback failed')
        }
      }
    } catch (error) {
      console.error('❌ Voice playback error:', error)
      if (onError) {
        onError(error instanceof Error ? error.message : 'Voice playback error')
      }
    } finally {
      setExecutionState(prev => ({ ...prev, isVoicePlaying: false }))
      if (onVoiceEnd) {
        onVoiceEnd()
      }
    }
  }, [controlResult, characterId, userMessage, conversationHistory, playSmartVoice, onVoiceStart, onVoiceEnd, onError])

  // 応答実行の完了チェック
  useEffect(() => {
    if (!controlResult) return
    
    const { content } = controlResult
    const shouldWaitForVoice = content.voiceRequired && !executionState.voiceStarted
    const shouldWaitForText = content.textRequired && !executionState.textStarted
    
    if (!shouldWaitForVoice && !shouldWaitForText && !executionState.completed) {
      setExecutionState(prev => ({ ...prev, completed: true }))
      if (onResponseComplete) {
        onResponseComplete()
      }
      console.log('🎯 Response execution completed')
    }
  }, [controlResult, executionState, onResponseComplete])

  // メイン実行処理
  useEffect(() => {
    if (!controlResult) return
    
    const { timing, content } = controlResult
    
    // 実行スケジューリング
    const promises: Promise<void>[] = []
    
    if (content.voiceRequired) {
      promises.push(executeVoicePlayback(timing.voiceDelay))
    }
    
    if (content.textRequired) {
      promises.push(executeTextDisplay(timing.textDelay))
    }
    
    // 並行実行
    Promise.all(promises).catch(error => {
      console.error('❌ Response execution error:', error)
      if (onError) {
        onError(error instanceof Error ? error.message : 'Response execution error')
      }
    })
  }, [controlResult, executeVoicePlayback, executeTextDisplay, onError])

  // フォールバック実行
  const executeWithFallback = useCallback(async (fallbackType: ResponseType) => {
    if (!controlResult) return
    
    console.log('🔄 Executing fallback response type:', fallbackType)
    
    const fallbackContent = {
      ...controlResult.content,
      voiceRequired: fallbackType === 'voice_only' || fallbackType === 'voice_and_text',
      textRequired: fallbackType === 'text_only' || fallbackType === 'voice_and_text'
    }
    
    // リセット
    setExecutionState({
      isVoicePlaying: false,
      isTextDisplaying: false,
      voiceStarted: false,
      textStarted: false,
      completed: false
    })
    
    // フォールバック実行
    const promises: Promise<void>[] = []
    
    if (fallbackContent.voiceRequired) {
      promises.push(executeVoicePlayback(200))
    }
    
    if (fallbackContent.textRequired) {
      promises.push(executeTextDisplay(100))
    }
    
    Promise.all(promises).catch(error => {
      console.error('❌ Fallback execution error:', error)
      if (onError) {
        onError('Fallback execution failed')
      }
    })
  }, [controlResult, executeVoicePlayback, executeTextDisplay, onError])

  // デバッグ情報表示
  const getDebugInfo = useCallback(() => {
    if (!controlResult) return null
    
    return {
      pattern: controlResult.pattern,
      content: controlResult.content,
      timing: controlResult.timing,
      execution: executionState,
      fallbacks: controlResult.fallbackOptions
    }
  }, [controlResult, executionState])

  return {
    controlResult,
    executionState,
    executeWithFallback,
    getDebugInfo,
    isProcessing: executionState.isVoicePlaying || executionState.isTextDisplaying || isPlaying
  }
}

// ヘルパー関数：カテゴリーをコンテキストにマッピング
function mapCategoryToContext(category: string): 'greeting' | 'response' | 'encouragement' | 'explanation' | 'goodbye' {
  switch (category) {
    case 'greeting':
      return 'greeting'
    case 'encouragement':
      return 'encouragement'
    case 'explanation':
    case 'advice':
    case 'question':
      return 'explanation'
    case 'goodbye':
      return 'goodbye'
    default:
      return 'response'
  }
}

// Hook版のエクスポート
export function useChatResponseController(props: ChatResponseControllerProps) {
  return ChatResponseController(props)
}