'use client'

import { useState, useEffect } from 'react'
import { speechRecognitionService, SpeechRecognitionOutput } from '@/lib/speech-recognition'

interface MicrophoneButtonProps {
  onTranscript: (text: string, isFinal: boolean) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MicrophoneButton({ 
  onTranscript, 
  onError, 
  disabled = false,
  className = '',
  size = 'md'
}: MicrophoneButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [error, setError] = useState<string>('')

  // サイズ設定
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  useEffect(() => {
    // ブラウザサポート確認
    setIsSupported(speechRecognitionService.isSupported())
    
    // マイク権限チェック
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    if (!speechRecognitionService.isSupported()) {
      setError('このブラウザは音声認識をサポートしていません')
      return
    }

    const result = await speechRecognitionService.checkMicrophonePermission()
    if (result.granted) {
      setPermissionStatus('granted')
      setError('')
    } else {
      setPermissionStatus('denied')
      setError(result.error || 'マイクの権限が必要です')
    }
  }

  const startListening = async () => {
    if (!isSupported) {
      const errorMsg = 'このブラウザは音声認識をサポートしていません'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (permissionStatus === 'denied') {
      await checkPermissions()
      if (permissionStatus === 'denied') {
        const errorMsg = 'マイクの使用許可が必要です'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }
    }

    setError('')
    
    const success = speechRecognitionService.startListening({
      onStart: () => {
        console.log('🎙️ Recording started')
        setIsListening(true)
      },
      onEnd: () => {
        console.log('🎙️ Recording ended')
        setIsListening(false)
      },
      onResult: (result: SpeechRecognitionOutput) => {
        console.log('🎙️ Transcript:', result.transcript, 'Final:', result.isFinal)
        onTranscript(result.transcript, result.isFinal)
      },
      onError: (errorMessage: string) => {
        console.error('🎙️ Speech recognition error:', errorMessage)
        setError(errorMessage)
        setIsListening(false)
        onError?.(errorMessage)
      },
      onNoMatch: () => {
        console.log('🎙️ No speech match')
        setIsListening(false)
      }
    })

    if (!success) {
      setError('音声認識の開始に失敗しました')
      onError?.('音声認識の開始に失敗しました')
    }
  }

  const stopListening = () => {
    speechRecognitionService.stopListening()
    setIsListening(false)
  }

  const handleClick = () => {
    if (disabled) return
    
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // ボタンの状態に応じた見た目
  const getButtonStyle = () => {
    if (disabled || !isSupported) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
    
    if (error && permissionStatus === 'denied') {
      return 'bg-red-100 text-red-600 hover:bg-red-200 border-red-300'
    }
    
    if (isListening) {
      return 'bg-red-500 text-white animate-pulse hover:bg-red-600 shadow-lg'
    }
    
    return 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
  }

  // アイコンの選択
  const getIcon = () => {
    if (!isSupported) {
      return '🚫'
    }
    
    if (error && permissionStatus === 'denied') {
      return '🔒'
    }
    
    if (isListening) {
      return '⏹️'
    }
    
    return '🎙️'
  }

  // ツールチップテキスト
  const getTooltip = () => {
    if (!isSupported) {
      return 'このブラウザは音声認識をサポートしていません'
    }
    
    if (error) {
      return error
    }
    
    if (isListening) {
      return '録音を停止'
    }
    
    return '音声入力を開始'
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled || !isSupported}
        className={`
          ${sizeClasses[size]}
          ${getButtonStyle()}
          rounded-full border-2 border-transparent
          transition-all duration-200 ease-in-out
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-blue-300
          touch-manipulation
          ${className}
        `}
        title={getTooltip()}
        aria-label={getTooltip()}
      >
        <span className="select-none">
          {getIcon()}
        </span>
        
        {/* 録音中の波形アニメーション */}
        {isListening && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
            <div className="absolute inset-1 rounded-full bg-red-300 animate-pulse opacity-50"></div>
          </div>
        )}
      </button>
      
      {/* エラー表示 */}
      {error && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-50">
          <div className="bg-red-100 border border-red-300 text-red-700 px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
            {error}
          </div>
        </div>
      )}
      
      {/* 音量レベルインジケーター（将来的な拡張用） */}
      {isListening && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-red-500 rounded-full animate-pulse`}
                style={{
                  height: `${4 + i * 2}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 使用例コンポーネント
export function MicrophoneButtonExample() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  const handleTranscript = (text: string, isFinal: boolean) => {
    if (isFinal) {
      setTranscript(prev => prev + text + ' ')
      setInterimTranscript('')
    } else {
      setInterimTranscript(text)
    }
  }

  const handleError = (error: string) => {
    console.error('Microphone error:', error)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <MicrophoneButton
          onTranscript={handleTranscript}
          onError={handleError}
          size="lg"
        />
        <div className="text-sm text-gray-600">
          音声入力ボタン
        </div>
      </div>
      
      {(transcript || interimTranscript) && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm font-medium text-gray-700 mb-1">認識結果:</div>
          <div className="text-gray-900">
            {transcript}
            <span className="text-gray-500 italic">{interimTranscript}</span>
          </div>
        </div>
      )}
    </div>
  )
}