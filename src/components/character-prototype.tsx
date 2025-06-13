'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { playHybridGreeting } from '@/lib/hybrid-audio'
import { getCurrentTimeSlot, getTimeSlotGreeting } from '@/lib/time-greeting'
import { playVoice } from '@/lib/audio-utils'
import { getCharacterById } from '@/lib/characters'

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [showInitialGreeting, setShowInitialGreeting] = useState(true)
  const [backgroundPosition, setBackgroundPosition] = useState('center 20%')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // キャラクター情報を取得
  const character = getCharacterById(characterId)

  // 初期挨拶の設定
  useEffect(() => {
    if (!character) return
    const timeSlot = getCurrentTimeSlot()
    const baseGreeting = getTimeSlotGreeting(timeSlot)
    
    // ユーザー名がある場合は個人化された挨拶を作成
    const personalizedGreeting = userName 
      ? `${userName}さん、${baseGreeting}` 
      : baseGreeting
    
    setCurrentMessage(personalizedGreeting)
    
    // 自動で初期挨拶を再生
    const playInitialGreeting = async () => {
      try {
        setIsPlaying(true)
        await playHybridGreeting(userName, undefined, characterId)
        console.log('✅ Initial greeting played')
      } catch (error) {
        console.error('❌ Initial greeting failed:', error)
      } finally {
        setIsPlaying(false)
      }
    }

    // 1秒後に挨拶再生
    const timer = setTimeout(() => {
      playInitialGreeting()
    }, 1000)

    return () => clearTimeout(timer)
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
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, aiMessage])
        setCurrentMessage(data.response)

        // 音声再生（通常の音声生成、ハイブリッドは初回のみ）
        try {
          setIsPlaying(true)
          await playVoice(data.response, characterId)
          console.log('✅ Response voice played')
        } catch (error) {
          console.error('❌ Voice playback failed:', error)
        } finally {
          setIsPlaying(false)
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
          {/* 背景位置調整ボタン（デバッグ用） */}
          <button
            onClick={() => {
              const positions = ['center 10%', 'center 15%', 'center 20%', 'center 25%', 'center 30%']
              const current = positions.indexOf(backgroundPosition)
              const next = (current + 1) % positions.length
              setBackgroundPosition(positions[next])
              console.log('Background position changed to:', positions[next])
            }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="背景位置調整"
          >
            📐
          </button>
          
          {/* ハイブリッド挨拶テストボタン */}
          <button
            onClick={async () => {
              try {
                setIsPlaying(true)
                await playHybridGreeting(undefined, undefined, characterId)
                console.log('✅ Manual hybrid greeting played')
              } catch (error) {
                console.error('❌ Manual hybrid greeting failed:', error)
              } finally {
                setIsPlaying(false)
              }
            }}
            disabled={isPlaying}
            className="px-3 py-1 text-xs bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 disabled:opacity-50 transition-colors"
          >
            🎵
          </button>
          
          {isPlaying && (
            <div className="flex items-center gap-1 text-pink-500 text-sm">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <span>話し中</span>
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
                  {getCurrentTimeSlot() === 'morning' && '🌅 朝'}
                  {getCurrentTimeSlot() === 'afternoon' && '☀️ 昼'}
                  {getCurrentTimeSlot() === 'evening' && '🌆 夕'}
                  {getCurrentTimeSlot() === 'night' && '🌙 夜'}
                  の挨拶
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
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${character.name}に相談してみましょう...`}
              className="flex-1 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm sm:text-base"
              rows={2}
              disabled={isLoading}
            />
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
    </div>
  )
}