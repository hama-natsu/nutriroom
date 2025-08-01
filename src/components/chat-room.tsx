'use client'

import { useState, useRef, useEffect } from 'react'
import { Character } from '@/lib/characters'
import { playEmotionResponse } from '@/lib/voice-player'
import { useInitialGreeting } from '@/hooks/useInitialGreeting'
import { MicrophoneButton } from '@/components/microphone-button'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatRoomProps {
  character: Character
  onBack: () => void
}

export function ChatRoom({ character, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: character.catchphrases[0] || `こんにちは！${character.name}です。何かご相談はありますか？`,
      isUser: false,
      timestamp: new Date()
    }
  ])
  // const [hasPlayedInitialGreeting, setHasPlayedInitialGreeting] = useState(false) // 重複防止Hookで管理
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      })
    }, 50) // より軽快にスクロール
  }

  // キーボード表示時の処理
  useEffect(() => {
    const handleResize = () => {
      // モバイルでキーボードが表示された場合の処理
      if (window.innerHeight < window.screen.height * 0.75) {
        scrollToBottom()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初期挨拶の再生（重複防止Hook使用）
  useInitialGreeting({
    characterId: character.id,
    enabled: isVoiceMode && character.id === 'akari',
    delay: 500,
    onSuccess: () => {
      console.log('✅ Initial greeting completed for', character.name)
    },
    onError: (error) => {
      console.error('❌ Initial greeting failed for', character.name, ':', error)
    }
  })

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // デバッグアラートは開発環境でのみ
    if (process.env.NODE_ENV === 'development') {
      console.log('DEBUG: メッセージ送信開始 - ' + new Date().toISOString());
    }

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // API呼び出し
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: character.id,
          message: inputMessage,
          conversationHistory: messages.map(m => 
            `${m.isUser ? 'ユーザー' : character.name}: ${m.content}`
          )
        })
      })

      if (!response.ok) {
        throw new Error('API呼び出しに失敗しました')
      }

      const data = await response.json()

      // デバッグ情報は開発環境でのみ表示
      if (process.env.NODE_ENV === 'development') {
        console.log('🔥 FRONTEND DEBUG INFO:', data.debug);
        if (data.debug && data.debug.success === false) {
          console.error('DEBUG ERROR INFO:', data.debug);
        }
      }

      // AIの応答を追加（本番環境では通常表示）
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // 🔥 修正箇所：音声生成の優先順位（ElevenLabs > Google TTS）
      if (isVoiceMode) {
        try {
          setIsPlayingVoice(true)
          
          console.log('🎵 Generating voice with ElevenLabs priority...', {
            characterId: character.id,
            characterName: character.name,
            responseText: data.response.substring(0, 50) + '...',
            responseLength: data.response.length,
            timestamp: new Date().toISOString()
          })

          // 新しい優先システムで音声生成
          const voiceSuccess = await playEmotionResponse(character.id, 'agreement')

          if (voiceSuccess) {
            console.log('✅ Voice generation and playback completed:', {
              characterId: character.id,
              responseLength: data.response.length,
              system: 'ElevenLabs Priority System'
            })
          } else {
            console.log('⚠️ Voice generation failed:', {
              characterId: character.id,
              reason: 'playVoice returned false'
            })
          }
        } catch (voiceError) {
          console.error('❌ Voice generation error:', {
            characterId: character.id,
            error: voiceError instanceof Error ? voiceError.message : String(voiceError),
            stack: voiceError instanceof Error ? voiceError.stack?.substring(0, 200) : undefined
          })
          
          // フォールバック: 感情応答を再生
          try {
            console.log('🔄 Playing fallback emotion response...')
            const voiceSuccess = await playEmotionResponse(character.id, 'encouragement')
            
            if (voiceSuccess) {
              console.log('✅ Fallback voice generation successful')
            }
          } catch (fallbackError) {
            console.error('❌ Fallback voice generation also failed:', fallbackError)
          }
        } finally {
          setIsPlayingVoice(false)
        }
      } else {
        console.log('🔇 Voice generation skipped (voice mode disabled)', {
          characterId: character.id
        })
      }
    } catch (error) {
      console.error('エラー:', error)
      
      // エラー詳細は開発環境でのみ表示
      if (process.env.NODE_ENV === 'development') {
        console.error('🔥 FRONTEND CATCH ERROR:', error);
      }
      
      // エラーメッセージを追加
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'すみません、今は応答できません。少し時間をおいてもう一度お試しください。',
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 音声入力のハンドラー
  const handleSpeechTranscript = (text: string, isFinal: boolean) => {
    if (isFinal) {
      // 確定した音声認識結果をテキストエリアに追加
      setInputMessage(prev => {
        const newText = prev.trim() + (prev.trim() ? ' ' : '') + text
        return newText
      })
      setInterimTranscript('')
      console.log('🎙️ Final speech input:', text)
    } else {
      // 中間結果を表示
      setInterimTranscript(text)
      console.log('🎙️ Interim speech input:', text)
    }
  }

  const handleSpeechError = (error: string) => {
    console.error('🎙️ Speech input error:', error)
    setInterimTranscript('')
    // エラーメッセージを表示する場合はここに追加
  }

  // 日本語入力対応 - Enterキー自動送信を無効化
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enterキーでの自動送信は行わない（改行ボタンに委ねる）
    // 日本語入力（あいうえお）でShift+Enterは非現実的なため
    if (e.key === 'Enter') {
      // 何もしない - テキストエリアの標準動作（改行）を維持
      return
    }
  }

  return (
    <div 
      className="h-screen flex flex-col keyboard-aware relative"
      style={{ 
        background: character.colorTheme.background.includes('gradient') 
          ? character.colorTheme.background 
          : `linear-gradient(135deg, ${character.colorTheme.background} 0%, ${character.colorTheme.secondary}20 100%)`
      }}
    >
      {/* 音声モード時の背景 */}
      {isVoiceMode && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${character.colorTheme.background} 0%, ${character.colorTheme.secondary}20 100%)`,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, ${character.colorTheme.primary}15 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${character.colorTheme.accent}15 0%, transparent 50%)
            `
          }}
        >
          {/* キャラクター立ち絵エリア（将来の実装用） */}
          <div className="absolute bottom-0 right-4 w-48 h-64 bg-gradient-to-t from-black/10 to-transparent rounded-t-3xl">
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl">
              {character.gender === '男性' ? '👨‍⚕️' : character.gender === '女性' ? '👩‍⚕️' : '🧑‍⚕️'}
            </div>
            {isPlayingVoice && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  🎵
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 固定ヘッダー - 音声/テキスト切り替えのみ */}
      <div 
        className="fixed top-0 left-0 right-0 text-white shadow-md z-50"
        style={{ backgroundColor: character.colorTheme.primary }}
      >
        <div className="flex items-center px-4 py-3 max-w-4xl mx-auto">
          {/* 戻るボタン */}
          <button
            onClick={onBack}
            className="mr-4 p-2 text-white text-xl font-normal hover:text-white/80 transition-colors duration-200"
            style={{ minWidth: '32px' }}
            title="戻る"
          >
            ＜
          </button>
          
          {/* キャラクター情報 */}
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: character.colorTheme.accent }}
              title={`${character.name} (${character.personalityType})`}
            >
              {character.gender === '男性' ? '👨‍⚕️' : character.gender === '女性' ? '👩‍⚕️' : '🧑‍⚕️'}
            </div>
            <div>
              <h1 className="font-bold text-lg">{character.name}</h1>
              <p className="text-sm opacity-90">{character.personalityType}</p>
            </div>
          </div>
          
          {/* Voice/Text切り替えボタン */}
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className="p-2 text-white text-sm font-medium hover:text-white/80 transition-colors duration-200 rounded-md ml-4"
            style={{ 
              minWidth: '72px',
              fontSize: '14px'
            }}
            title={isVoiceMode ? 'テキストモード' : '音声モード'}
          >
            {isVoiceMode ? '💬テキスト' : '🎙️音声'}
          </button>
          
          {/* 音声再生インジケーター */}
          {isPlayingVoice && (
            <div className="ml-2 text-xs text-white/80 animate-pulse">
              🔊再生中
            </div>
          )}
        </div>
      </div>

      {/* メッセージエリア - ヘッダーと入力エリア分のpadding追加 */}
      <div className={`pt-24 sm:pt-24 pb-32 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 smooth-scroll relative z-10 ${
        isVoiceMode ? 'bg-black/10 backdrop-blur-sm pr-52' : ''
      }`}> {/* 音声モード時は右側に立ち絵スペース確保 */}
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} ${
              index >= messages.length - 3 ? (message.isUser ? 'animate-slideInRight' : 'animate-slideInLeft') : ''
            }`}
            data-ai-message={!message.isUser ? "true" : undefined}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl transition-all duration-200 hover:shadow-md message-bubble ${
                message.isUser
                  ? 'text-white rounded-br-sm'
                  : 'rounded-bl-sm shadow-md'
              }`}
              style={{
                backgroundColor: message.isUser 
                  ? character.colorTheme.primary 
                  : '#ffffff',
                borderLeft: !message.isUser ? `4px solid ${character.colorTheme.primary}` : undefined,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="whitespace-pre-wrap font-medium">
                {message.content}
              </div>
              <div 
                className={`text-xs mt-2 ${
                  message.isUser 
                    ? 'text-white opacity-70 font-medium' 
                    : 'text-gray-500 font-medium'
                }`}
              >
                {message.timestamp.toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fadeIn" data-ai-message="true">
            <div 
              className="p-4 rounded-2xl rounded-bl-sm shadow-lg border-l-4 bg-white"
              style={{ 
                borderLeftColor: character.colorTheme.primary,
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: character.colorTheme.accent }}
                >
                  {character.gender === '男性' ? '👨‍⚕️' : character.gender === '女性' ? '👩‍⚕️' : '🧑‍⚕️'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: character.colorTheme.primary }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: character.colorTheme.primary,
                        animationDelay: '0.2s' 
                      }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: character.colorTheme.primary,
                        animationDelay: '0.4s' 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    {character.name}が入力中...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア - 固定下部配置 */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 border-t mobile-bottom-action fixed-bottom-safe z-40 bg-white">
        {/* 中間音声認識結果の表示 */}
        {interimTranscript && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-600 mb-1">音声認識中...</div>
            <div className="text-sm text-blue-800 italic">
              {interimTranscript}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2 sm:space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="栄養について相談してみましょう"
              className="w-full p-3 pr-12 text-base border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': character.colorTheme.primary + '50',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontWeight: '600'
              } as React.CSSProperties}
              rows={2}
              disabled={isLoading}
            />
            
            {/* マイクボタン（テキストエリア内） */}
            <div className="absolute right-2 bottom-2">
              <MicrophoneButton
                onTranscript={handleSpeechTranscript}
                onError={handleSpeechError}
                disabled={isLoading}
                size="sm"
                className="shadow-sm"
              />
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 sm:px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ripple-button shadow-md hover:shadow-lg min-w-[64px] min-h-[44px] flex items-center justify-center touch-button"
            style={{ backgroundColor: character.colorTheme.primary }}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>送信中...</span>
              </div>
            ) : (
              '送信'
            )}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-center text-gray-500">
          送信ボタンで送信
        </div>
      </div>
    </div>
  )
}