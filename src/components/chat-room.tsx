'use client'

import { useState, useRef, useEffect } from 'react'
import { Character } from '@/lib/characters'
import { ThreeDRoom } from './3d-room'
import { usePerformanceDetector } from './3d-performance-detector'

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
  const [is3DMode, setIs3DMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const performanceInfo = usePerformanceDetector()

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
      {/* 3D背景レイヤー */}
      {is3DMode && (
        <div className="absolute inset-0 z-0">
          <ThreeDRoom />
        </div>
      )}
      {/* ヤフーフリマ風固定ヘッダー */}
      <div 
        className="fixed top-0 left-0 right-0 text-white shadow-md z-50"
        style={{ backgroundColor: character.colorTheme.primary }}
      >
        <div className="flex items-center px-4 py-3 max-w-4xl mx-auto">
          {/* ヤフーフリマ風戻るボタン - 囲いなし */}
          <button
            onClick={onBack}
            className="mr-4 p-2 text-white text-xl font-normal hover:text-white/80 transition-colors duration-200"
            style={{ minWidth: '32px' }}
            title="戻る"
          >
            ＜
          </button>
          
          {/* キャラクター情報 - 適切な間隔 */}
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
          
          {/* 3D切り替えボタン - パフォーマンス判定により表示制御 */}
          {performanceInfo.shouldEnable3D && (
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className="ml-4 p-2 text-white text-sm font-medium hover:text-white/80 transition-colors duration-200 rounded-md"
              style={{ minWidth: '64px' }}
              title={is3DMode ? '2D表示' : '3D表示'}
            >
              {is3DMode ? '2D' : '3D'}
            </button>
          )}
        </div>
      </div>

      {/* メッセージエリア - ヘッダーと入力エリア分のpadding追加 */}
      <div className={`pt-20 pb-32 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 smooth-scroll relative z-10 ${is3DMode ? 'bg-black/10 backdrop-blur-sm' : ''}`}>
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

      {/* 入力エリア - 固定下部配置 */}
      <div className={`fixed bottom-0 left-0 right-0 p-3 sm:p-4 border-t mobile-bottom-action fixed-bottom-safe z-40 ${is3DMode ? 'bg-white/90 backdrop-blur-md' : 'bg-white'}`}>
        <div className="flex space-x-2 sm:space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="栄養について相談してみましょう"
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
          送信ボタンで送信
        </div>
      </div>
    </div>
  )
}