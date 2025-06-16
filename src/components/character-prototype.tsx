'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useInitialGreeting } from '@/hooks/useInitialGreeting'
import { getUnifiedTimeSlot, getUnifiedGreetingText } from '@/lib/unified-time-system'
import { getCharacterById } from '@/lib/characters'
import { MicrophoneButton } from '@/components/microphone-button'
import { useSmartVoice } from '@/hooks/useSmartVoice'
import { useChatResponseController } from '@/components/ChatResponseController'
// 🎯 Complete system rebuild - First sentence analysis only
import { handleAiResponseVoice, debugAiResponseVoice } from '@/lib/ai-response-voice-controller'
// 🎯 Phase 2.3-実用版: リアルタイムデータ収集
import { useConversationLogger, debugConversationLogger } from '@/hooks/useConversationLogger'
// 🎯 Phase 2.4: 今日のお手紙システム
import { DailyLetterComponent } from '@/components/DailyLetter'


interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface CharacterPrototypeProps {
  characterId: string
  userName?: string
  onBack?: () => void
}

export function CharacterPrototype({ characterId, userName, onBack }: CharacterPrototypeProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [showInitialGreeting, setShowInitialGreeting] = useState(true)
  const [backgroundPosition] = useState('center 20%')
  const [pendingResponse, setPendingResponse] = useState<string | null>(null)
  const [responseControlActive, setResponseControlActive] = useState(false)
  const [showDailyLetter, setShowDailyLetter] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // キャラクター情報を取得
  const character = getCharacterById(characterId)

  // スマート音声エンジン
  const { 
    isPlaying, 
    playSmartVoice, 
    debugVoiceSystem 
  } = useSmartVoice()

  // 🎯 リアルタイム会話ログ収集（透明な動作）
  const { saveMessage, sessionState, isReady } = useConversationLogger(characterId)

  // 応答制御システム（常時初期化、条件付きで実行）
  const responseController = useChatResponseController({
    characterId,
    responseText: pendingResponse || '',
    userMessage: messages[messages.length - 1]?.text || '',
    conversationHistory: messages.map(m => m.text),
    onTextDisplay: (text) => {
      if (responseControlActive) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📝 Response controller: Text display triggered')
        }
        const aiMessage: Message = {
          id: (Date.now() + Math.random()).toString(),
          text,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        setCurrentMessage(text)
      }
    },
    onVoiceStart: () => {
      if (responseControlActive && process.env.NODE_ENV === 'development') {
        console.log('🎵 Response controller: Voice playback started')
      }
    },
    onVoiceEnd: () => {
      if (responseControlActive && process.env.NODE_ENV === 'development') {
        console.log('🎵 Response controller: Voice playback ended')
      }
    },
    onResponseComplete: () => {
      if (responseControlActive) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🎯 Response controller: Response completed')
        }
        setPendingResponse(null)
        setResponseControlActive(false)
      }
    },
    onError: (error) => {
      if (responseControlActive) {
        console.error('❌ Response controller error:', error)
        setPendingResponse(null)
        setResponseControlActive(false)
      }
    }
  })

  // 初期挨拶の設定 - 重複防止Hook使用
  useInitialGreeting({
    characterId,
    enabled: true,
    delay: 1000,
    onSuccess: () => {
      console.log('✅ Initial greeting completed successfully')
      // 初期挨拶後に今日のお手紙チェック
      setTimeout(() => checkForDailyLetter(), 2000)
    },
    onError: (error) => {
      console.error('❌ Initial greeting failed:', error)
    }
  })

  // 今日のお手紙チェック
  const checkForDailyLetter = async () => {
    try {
      const { getTodaySummary } = await import('@/lib/supabase/summaries')
      const summary = await getTodaySummary(characterId)
      
      if (summary?.letter_content && !showDailyLetter) {
        // 今日のお手紙があり、まだ表示していない場合
        setTimeout(() => {
          setShowDailyLetter(true)
          if (process.env.NODE_ENV === 'development') {
            console.log('💌 Daily letter available - showing to user')
          }
        }, 1000)
      }
    } catch (error) {
      console.warn('⚠️ Failed to check for daily letter:', error)
    }
  }

  // 【緊急修正】直接的な時間帯テキストマッピング
  const getTimeBasedText = (): string => {
    const hour = new Date().getHours();
    
    // 統一システムと完全一致する11段階判定
    if (hour >= 1 && hour < 5) {
      return "こんな時間まで...お疲れさまです。早く休んでくださいね〜";
    }
    if (hour >= 5 && hour < 7) {
      return "おはよう！早起きですね〜今日も一緒に頑張りましょう♪";
    }
    if (hour >= 7 && hour < 9) {
      return "おはよう！爽やかな朝ですね〜今日も元気に過ごしましょう♪";
    }
    if (hour >= 9 && hour < 11) {
      return "おはよう！いい時間になりましたね〜朝ごはんは食べましたか？";
    }
    if (hour >= 11 && hour < 13) {
      return "お昼の時間ですね♪お昼ご飯、何食べました〜？";
    }
    if (hour >= 13 && hour < 15) {
      return "こんにちは〜午後もお疲れさまです！水分補給はしっかりと〜";
    }
    if (hour >= 15 && hour < 17) {
      return "おやつの時間ですね〜甘いものもたまにはいいですよ♪";
    }
    if (hour >= 17 && hour < 19) {
      return "お疲れさまです〜夕方になりましたね。今日はどんな一日でしたか？";
    }
    if (hour >= 19 && hour < 21) {
      return "夕食の時間ですね〜今日も一日お疲れさまでした♪";
    }
    if (hour >= 21 && hour < 23) {
      return "こんばんは〜夜の時間ですね。リラックスして過ごしましょう♪";
    }
    // 23:00-0:59
    return "こんばんは...遅い時間ですが、お疲れさまです。明日に備えて早めに休みましょうね〜";
  };

  // 挨拶メッセージの設定（統一システム使用）
  useEffect(() => {
    if (!character) return
    
    // 直接的な時間帯テキスト取得
    const baseGreeting = getTimeBasedText()
    
    // デバッグ情報表示
    const timeSlot = getUnifiedTimeSlot()
    const unifiedText = getUnifiedGreetingText(timeSlot)
    const hour = new Date().getHours()
    
    console.log('🎯 Greeting Sync Debug:', {
      hour,
      timeSlot,
      directText: baseGreeting.substring(0, 30) + '...',
      unifiedText: unifiedText.substring(0, 30) + '...',
      isMatching: baseGreeting === unifiedText
    })
    
    // ユーザー名がある場合は個人化された挨拶を作成
    const personalizedGreeting = userName 
      ? `${userName}さん、${baseGreeting}` 
      : baseGreeting
    
    setCurrentMessage(personalizedGreeting)
  }, [userName, characterId, character])

  // スクロール調整
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!character) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">キャラクターが見つかりません</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              戻る
            </button>
          )}
        </div>
      </div>
    )
  }

  // メッセージ送信
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)
    setShowInitialGreeting(false)

    // 🎯 ユーザーメッセージのリアルタイム保存
    if (isReady) {
      try {
        console.log('💾 Attempting to save user message:', inputText.substring(0, 50) + '...')
        const saveResult = await saveMessage({
          message: inputText,
          type: 'user'
        })
        console.log('✅ User message save result:', saveResult)
      } catch (error) {
        console.error('❌ Failed to save user message:', error)
      }
    } else {
      console.warn('⚠️ Conversation logger not ready - user message not saved')
    }

    try {
      // API呼び出し
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: characterId,
          message: inputText,
          conversationHistory: messages.map(m => 
            `${m.isUser ? 'ユーザー' : character.name}: ${m.text}`
          )
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // 応答制御システムを使用するかの判定（完全無効化）
        const useResponseControl = false // 緊急修正: 完全無効化
        
        if (useResponseControl) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🎭 Using response control system')
          }
          setPendingResponse(data.response)
          setResponseControlActive(true)
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('🎵 Using legacy response system')
          }
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response,
            isUser: false,
            timestamp: new Date()
          }

          setMessages(prev => [...prev, aiMessage])
          setCurrentMessage(data.response)

          // 🚫【レガシーシステム完全バイパス】新システム音声制御
          if (process.env.NODE_ENV === 'development') {
            console.log('🚫 BYPASSING ALL LEGACY SYSTEMS - Using new voice handler')
          }

          // 【新システム】レガシー競合を完全回避した音声制御
          try {
            const voiceSuccess = await handleAiResponseVoice(data.response, false)
            
            // 🎯 AIメッセージのリアルタイム保存（音声再生と同時）
            if (isReady) {
              try {
                console.log('💾 Attempting to save AI message:', data.response.substring(0, 50) + '...')
                const saveResult = await saveMessage({
                  message: data.response,
                  type: 'ai',
                  voiceFile: voiceSuccess ? 'voice_played' : undefined,
                  emotionDetected: voiceSuccess ? 'ai_response' : undefined
                })
                console.log('✅ AI message save result:', saveResult)
              } catch (error) {
                console.error('❌ Failed to save AI message:', error)
              }
            } else {
              console.warn('⚠️ Conversation logger not ready - AI message not saved')
            }
            
            if (process.env.NODE_ENV === 'development') {
              if (voiceSuccess) {
                console.log('✅ NEW SYSTEM: Voice played successfully without legacy interference')
              } else {
                console.log('🔇 NEW SYSTEM: No voice needed or playback failed')
              }
            }
          } catch (error) {
            console.error('❌ NEW SYSTEM: Voice playback failed:', error)
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'すみません、今は応答できません。少し時間をおいてもう一度お試しください。',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setCurrentMessage(errorMessage.text)
    } finally {
      setIsLoading(false)
    }
  }

  // Enter送信
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 音声入力のハンドラー
  const handleSpeechTranscript = (text: string, isFinal: boolean) => {
    if (isFinal) {
      setInputText(prev => {
        const newText = prev.trim() + (prev.trim() ? ' ' : '') + text
        return newText
      })
      console.log('🎙️ Final speech input:', text)
    }
  }

  const handleSpeechError = (error: string) => {
    console.error('🎙️ Speech input error:', error)
  }

  // キャラクターアイコンの文字
  const getCharacterIcon = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* PNG背景イラスト */}
      <div className="absolute inset-0">
        <Image
          src={`/images/characters/${characterId}-room-full.png`}
          alt={`${character.name}の部屋`}
          fill
          className="object-cover"
          style={{ objectPosition: backgroundPosition }}
          priority
          sizes="100vw"
        />
        {/* オーバーレイで少し明るく調整 */}
        <div className="absolute inset-0 bg-white/10"></div>
      </div>

      {/* ヘッダー */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-white/40 relative z-10">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-medium">戻る</span>
          </button>
        )}
        
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ 
              background: `linear-gradient(135deg, ${character.colorTheme.primary}, ${character.colorTheme.secondary})` 
            }}
          >
            {getCharacterIcon(character.name)}
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">{character.name}</h1>
            <p className="text-xs text-gray-500">栄養管理アシスタント</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          
          {/* 今日のお手紙ボタン */}
          <button
            onClick={() => {
              setShowDailyLetter(true)
              if (process.env.NODE_ENV === 'development') {
                console.log('💌 Daily letter manually opened')
              }
            }}
            className="px-3 py-1 text-xs bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
            title="今日のお手紙"
          >
            💌
          </button>
          
          {/* スマート音声テストボタン */}
          <button
            onClick={async () => {
              if (process.env.NODE_ENV === 'development') {
                console.log('🎯 Testing smart voice system')
              }
              
              const success = await playSmartVoice({
                characterId,
                interactionContext: 'greeting',
                userMessage: 'こんにちは'
              })
              
              if (success) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Smart voice test successful')
                }
              } else {
                console.warn('⚠️ Smart voice test failed')
              }
            }}
            disabled={isPlaying}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
          >
            🎯
          </button>
          
          {/* 応答制御テストボタン（一時無効化） */}
          <button
            onClick={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('🎭 Response control system is temporarily disabled')
              }
              // 一時的に無効化
              // setPendingResponse('こんにちは！元気ですか？今日も栄養バランスを意識した食事を心がけましょうね♪')
              // setResponseControlActive(true)
            }}
            disabled={true}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-400 rounded-lg transition-colors opacity-50"
            title="応答パターン制御（一時無効化）"
          >
            🎭
          </button>
          
          {/* デバッグ情報ボタン */}
          <button
            onClick={() => {
              debugVoiceSystem()
              console.log('🎭 Response Controller Debug:', responseController.getDebugInfo())
              
              // 🎯 会話ログシステムデバッグ
              debugConversationLogger(sessionState)
              
              // AI返答ベース分析のデモ
              if (messages.length > 0) {
                const lastAiMsg = messages.filter(m => !m.isUser).pop()?.text || ''
                if (lastAiMsg) {
                  console.log('\n=== AI返答ベース音声分析 ===')
                  debugAiResponseVoice(lastAiMsg)
                }
              }
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="システムデバッグ"
          >
            🔍
          </button>
          
          {/* ステータス表示 */}
          {(isPlaying || responseControlActive) && (
            <div className="flex items-center gap-1 text-pink-500 text-sm">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <span>
                {responseControlActive ? '制御中' : '話し中'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* メインエリア */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* キャラクターエリア */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
          {/* キャラクター（背景イラストに統合） */}
          <div className="relative mb-6">
            {/* 話し中エフェクトのみ表示（キャラクターは背景イラストにあるため） */}
            {isPlaying && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
                <div className="flex space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full animate-bounce shadow-lg"
                    style={{ backgroundColor: character.colorTheme.primary }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full animate-bounce shadow-lg"
                    style={{ 
                      backgroundColor: character.colorTheme.secondary,
                      animationDelay: '0.15s' 
                    }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full animate-bounce shadow-lg"
                    style={{ 
                      backgroundColor: character.colorTheme.accent,
                      animationDelay: '0.3s' 
                    }}
                  ></div>
                </div>
                {/* 音声インジケーター */}
                <div className="mt-2 text-center">
                  <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: character.colorTheme.primary }}
                    ></div>
                    <span className="text-xs font-medium text-gray-700">話し中</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* メッセージ吹き出し */}
          <div className="max-w-md w-full mx-auto px-4 sm:px-0">
            {showInitialGreeting ? (
              // 初期挨拶
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 relative">
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-white/90 rotate-45 border-r border-b border-white/50"></div>
                </div>
                <p className="text-gray-800 leading-relaxed text-center">
                  {currentMessage}
                </p>
                <div className="text-xs text-gray-500 text-center mt-3">
                  {(() => {
                    const timeSlot = getUnifiedTimeSlot()
                    const hour = new Date().getHours()
                    
                    const timeIcons = {
                      very_late: '🌌 深夜',
                      morning_early: '🌅 早朝', 
                      morning: '☀️ 朝',
                      morning_late: '🌤️ 朝遅め',
                      lunch: '🍽️ 昼食時',
                      afternoon: '☀️ 午後',
                      snack: '🍪 おやつ時間',
                      evening: '🌆 夕方',
                      dinner: '🍽️ 夕食時',
                      night: '🌙 夜',
                      late: '🌌 深夜'
                    }
                    
                    return `${timeIcons[timeSlot]} (${hour}:00) の挨拶`
                  })()}
                </div>
              </div>
            ) : (
              // 通常の会話
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {messages.slice(-3).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-2xl ${
                        message.isUser
                          ? 'text-white rounded-br-sm'
                          : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-white/50'
                      }`}
                      style={message.isUser ? {
                        background: `linear-gradient(135deg, ${character.colorTheme.primary}, ${character.colorTheme.secondary})`
                      } : {}}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className={`text-xs mt-1 ${message.isUser ? 'text-white/80' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ローディング表示 */}
          {isLoading && (
            <div className="mt-4 flex items-center gap-2 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">{character.name}が考え中...</span>
            </div>
          )}
        </div>

        {/* 入力エリア */}
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-white/40">
          <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3 px-4 sm:px-0">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${character.name}に相談してみましょう...`}
                className="w-full p-3 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm sm:text-base"
                style={{ 
                  '--tw-ring-color': character.colorTheme.primary + '50'
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
              disabled={!inputText.trim() || isLoading}
              className="px-4 sm:px-6 py-3 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium min-w-[60px] sm:min-w-[80px] text-sm sm:text-base"
              style={{
                background: `linear-gradient(135deg, ${character.colorTheme.primary}, ${character.colorTheme.secondary})`
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                '送信'
              )}
            </button>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-2">
            Enterで送信 • Shift+Enterで改行
          </div>
        </div>
      </main>

      {/* 今日のお手紙モーダル */}
      {showDailyLetter && (
        <DailyLetterComponent
          characterId={characterId}
          userName={userName}
          onClose={() => setShowDailyLetter(false)}
        />
      )}
    </div>
  )
}