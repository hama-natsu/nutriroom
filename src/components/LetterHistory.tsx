'use client'

import { useState, useEffect, useCallback } from 'react'
import { DailyLetter } from '@/components/DailyLetterSimple'

interface LetterRecord {
  id: string
  date: string
  characterId: string
  content: string
  createdAt: string
  updatedAt: string
  displayDate: string
  preview: string
}

interface LetterHistoryProps {
  characterId: string
  characterName: string
  onClose?: () => void
}

interface HistoryState {
  letters: LetterRecord[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  offset: number
}

export function LetterHistory({ characterId, characterName, onClose }: LetterHistoryProps) {
  const [state, setState] = useState<HistoryState>({
    letters: [],
    isLoading: true,
    error: null,
    hasMore: true,
    offset: 0
  })
  
  const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // フェードインアニメーション
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const loadLetterHistory = useCallback(async (reset = false) => {
    try {
      setState(prev => {
        const currentOffset = reset ? 0 : prev.offset
        
        return { 
          ...prev, 
          isLoading: true, 
          error: null,
          ...(reset && { letters: [], offset: 0 })
        }
      })

      // Use state within the function instead of dependency
      const currentOffset = reset ? 0 : state.offset

      const response = await fetch(
        `/api/letters/history?characterId=${characterId}&limit=10&offset=${currentOffset}`
      )
      
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load letter history')
      }

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          letters: reset 
            ? result.data.letters 
            : [...prev.letters, ...result.data.letters],
          hasMore: result.data.pagination.hasMore,
          offset: currentOffset + result.data.letters.length,
          isLoading: false,
          error: null
        }))

        console.log(`📚 Loaded ${result.data.letters.length} letters (total: ${result.data.pagination.total})`)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('❌ Failed to load letter history:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [characterId]) // Removed state.offset dependency

  // 初回お手紙履歴ロード
  useEffect(() => {
    loadLetterHistory(true)
  }, [characterId]) // Changed to depend on characterId only

  const handleLoadMore = () => {
    if (!state.isLoading && state.hasMore) {
      loadLetterHistory(false)
    }
  }

  const handleLetterClick = (letter: LetterRecord) => {
    setSelectedLetter(letter)
  }

  const handleCloseSelectedLetter = () => {
    setSelectedLetter(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return '今日'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日'
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className={`bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden transform transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* ヘッダー */}
          <div className="relative p-6 pb-4 border-b border-pink-100">
            {/* 閉じるボタン */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
            
            {/* タイトル */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-pink-800 mb-2">
                📚 {characterName}からのお手紙
              </h2>
              <div className="text-sm text-purple-600">
                過去のお手紙を振り返ってみましょう
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="flex-1 overflow-y-auto">
            {state.isLoading && state.letters.length === 0 ? (
              // 初回ローディング
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">お手紙を読み込み中...</p>
                </div>
              </div>
            ) : state.error ? (
              // エラー表示
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">😢</div>
                  <p className="text-gray-600 mb-4">お手紙の読み込みに失敗しました</p>
                  <button
                    onClick={() => loadLetterHistory(true)}
                    className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                  >
                    再試行
                  </button>
                </div>
              </div>
            ) : state.letters.length === 0 ? (
              // お手紙なし
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">💌</div>
                  <p className="text-gray-600 mb-4">まだお手紙がありません</p>
                  <p className="text-sm text-gray-500">
                    {characterName}と会話すると、素敵なお手紙が届きますよ♪
                  </p>
                </div>
              </div>
            ) : (
              // お手紙一覧
              <div className="p-6 space-y-4">
                {state.letters.map((letter) => (
                  <div
                    key={letter.id}
                    onClick={() => handleLetterClick(letter)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-pink-100 hover:shadow-md hover:border-pink-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      {/* 日付アイコン */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">💌</span>
                      </div>
                      
                      {/* お手紙情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 group-hover:text-pink-700 transition-colors">
                            {formatDate(letter.date)}のお手紙
                          </h3>
                          <span className="text-xs text-gray-500">
                            {letter.displayDate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {letter.preview}
                        </p>
                      </div>
                      
                      {/* 矢印アイコン */}
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-pink-500 transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                ))}

                {/* もっと見るボタン */}
                {state.hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={state.isLoading}
                      className="px-6 py-3 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 disabled:opacity-50 transition-colors"
                    >
                      {state.isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                          読み込み中...
                        </div>
                      ) : (
                        'もっと見る'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* フッター装飾 */}
          <div className="h-2 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200"></div>
        </div>
      </div>

      {/* お手紙詳細モーダル */}
      {selectedLetter && (
        <DailyLetter
          date={selectedLetter.date}
          content={selectedLetter.content}
          characterName={characterName}
          onClose={handleCloseSelectedLetter}
        />
      )}
    </>
  )
}

// プレビュー用コンポーネント
export function LetterHistoryPreview() {
  const [showHistory, setShowHistory] = useState(true)

  if (!showHistory) return null

  return (
    <LetterHistory
      characterId="akari"
      characterName="あかり"
      onClose={() => setShowHistory(false)}
    />
  )
}