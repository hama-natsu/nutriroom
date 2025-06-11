'use client'

import { useState, useRef, useEffect } from 'react'
import { Character } from '@/lib/characters'

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
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div 
      className="h-screen flex flex-col keyboard-aware"
      style={{ 
        background: character.colorTheme.background.includes('gradient') 
          ? character.colorTheme.background 
          : `linear-gradient(135deg, ${character.colorTheme.background} 0%, ${character.colorTheme.secondary}20 100%)`
      }}
    >
      {/* ヘッダー - モバイル最適化 */}
      <div 
        className="p-3 sm:p-4 text-white shadow-lg"
        style={{ backgroundColor: character.colorTheme.primary }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg min-h-[44px] min-w-[64px] flex items-center justify-center touch-button"
            >
              ← 戻る
            </button>
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl hover-scale cursor-pointer"
              style={{ backgroundColor: character.colorTheme.accent }}
              title={`${character.name} (${character.personalityType})`}
            >
              {character.gender === '男性' ? '👨‍⚕️' : character.gender === '女性' ? '👩‍⚕️' : '🧑‍⚕️'}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">{character.name}</h1>
              <p className="text-xs sm:text-sm opacity-90">{character.personalityType}</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs opacity-80">専門分野</div>
            <div className="text-sm">{character.specialties.join('・')}</div>
          </div>
        </div>
      </div>

      {/* メッセージエリア - モバイル最適化 */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 smooth-scroll">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} ${
              index >= messages.length - 3 ? (message.isUser ? 'animate-slideInRight' : 'animate-slideInLeft') : ''
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl transition-all duration-200 hover:shadow-md message-bubble ${
                message.isUser
                  ? 'text-white rounded-br-sm'
                  : 'bg-white rounded-bl-sm shadow-md'
              }`}
              style={{
                backgroundColor: message.isUser ? character.colorTheme.primary : undefined,
                borderLeft: !message.isUser ? `4px solid ${character.colorTheme.primary}` : undefined
              }}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div 
                className={`text-xs mt-2 ${
                  message.isUser ? 'text-white opacity-70' : 'text-gray-500'
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
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-lg border-l-4" 
                 style={{ borderLeftColor: character.colorTheme.primary }}>
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
                  <div className="text-xs text-gray-500 mt-1">
                    {character.name}が入力中...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア - モバイル最適化 */}
      <div className="p-3 sm:p-4 bg-white border-t mobile-bottom-action fixed-bottom-safe">
        <div className="flex space-x-2 sm:space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${character.name}に相談してみましょう...`}
              className="w-full p-3 text-base border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': character.colorTheme.primary + '50'
              } as React.CSSProperties}
              rows={2}
              disabled={isLoading}
            />
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
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Enterキーで送信 / Shift+Enterで改行
        </div>
      </div>
    </div>
  )
}