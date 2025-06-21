'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DailyLetter } from '@/components/DailyLetterSimple'
import { supabase } from '@/lib/supabase/client'

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
  onRefreshRequest?: () => void
}

interface HistoryState {
  letters: LetterRecord[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  offset: number
  lastRefresh: Date | null
}

export function LetterHistory({ characterId, characterName, onClose, onRefreshRequest }: LetterHistoryProps) {
  const [state, setState] = useState<HistoryState>({
    letters: [],
    isLoading: true,
    error: null,
    hasMore: true,
    offset: 0,
    lastRefresh: null
  })
  
  const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const stateRef = useRef(state)

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // 外部からのリフレッシュリクエスト対応
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest()
    }
  }, [onRefreshRequest])

  // フェードインアニメーション
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const loadLetterHistory = useCallback(async (reset = false) => {
    try {
      // Use ref to get current offset without adding it to dependencies
      const currentOffset = reset ? 0 : stateRef.current.offset
      
      console.log('🔄 Loading letter history:', {
        characterId,
        reset,
        currentOffset,
        timestamp: new Date().toISOString()
      })
      
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        ...(reset && { letters: [], offset: 0 })
      }))

      // 表示件数を20に増加
      const response = await fetch(
        `/api/letters/history?characterId=${characterId}&limit=20&offset=${currentOffset}`
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
          error: null,
          lastRefresh: new Date()
        }))

        console.log(`📚 Loaded ${result.data.letters.length} letters (total: ${result.data.pagination.total})`)
        console.log('📊 Letter details:', {
          characterId,
          newLetters: result.data.letters.length,
          totalLettersNow: reset ? result.data.letters.length : stateRef.current.letters.length + result.data.letters.length,
          hasMore: result.data.pagination.hasMore,
          latestLetterDate: result.data.letters[0]?.date || 'none'
        })

        
        if (result.data.letters.length > 1) {
          const firstDate = new Date(result.data.letters[0].date)
          const lastDate = new Date(result.data.letters[result.data.letters.length - 1].date)
          console.log('📅 フロントエンド日付順序確認:', {
            first: result.data.letters[0].date,
            last: result.data.letters[result.data.letters.length - 1].date,
            isDescending: firstDate >= lastDate ? '✅ 正しい順序 (新→古)' : '❌ 逆順序 (古→新)'
          })
        }
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
  }, [characterId]) // Only characterId dependency

  // 初回お手紙履歴ロード
  useEffect(() => {
    loadLetterHistory(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]) // Only characterId dependency to avoid infinite loop

  // Supabaseリアルタイム購読でINSERTイベントを監視
  useEffect(() => {
    console.log('🔊 Setting up realtime subscription for:', characterId)
    
    const channel = supabase
      .channel('daily_summaries_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_summaries',
          filter: `character_id=eq.${characterId}`
        },
        (payload) => {
          console.log('🔥 New letter detected via realtime:', {
            characterId,
            newLetterData: payload.new,
            timestamp: new Date().toISOString()
          })
          
          // 新しいお手紙が挿入された場合、履歴を再取得
          if (payload.new && (payload.new as unknown as Record<string, unknown>).letter_content) {
            console.log('📬 Refreshing letter history due to new letter insertion')
            loadLetterHistory(true)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
      })

    return () => {
      console.log('🔇 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [characterId, loadLetterHistory])

  // お手紙生成イベントのリスニング
  useEffect(() => {
    const handleLetterGenerated = (event: CustomEvent) => {
      const { characterId: eventCharacterId } = event.detail
      if (eventCharacterId === characterId) {
        console.log('📬 Letter generation event received, refreshing history')
        setTimeout(() => {
          loadLetterHistory(true)
        }, 500) // 少し待ってからリフレッシュ
      }
    }

    window.addEventListener('letterGenerated', handleLetterGenerated as EventListener)
    
    return () => {
      window.removeEventListener('letterGenerated', handleLetterGenerated as EventListener)
    }
  }, [characterId, loadLetterHistory])

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

  // キャラクター別の色設定
  const getCharacterColors = (charId: string) => {
    switch (charId) {
      case 'minato':
        return {
          gradient: 'from-blue-50 to-indigo-50',
          border: 'border-blue-100',
          title: 'text-blue-800',
          subtitle: 'text-blue-600',
          footer: 'from-blue-200 via-indigo-200 to-blue-200',
          iconGradient: 'from-blue-100 to-indigo-100'
        }
      case 'akari':
      default:
        return {
          gradient: 'from-pink-50 to-purple-50',
          border: 'border-pink-100',
          title: 'text-pink-800',
          subtitle: 'text-purple-600',
          footer: 'from-pink-200 via-purple-200 to-pink-200',
          iconGradient: 'from-pink-100 to-purple-100'
        }
    }
  }

  const colors = getCharacterColors(characterId)

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
          className={`bg-gradient-to-br ${colors.gradient} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden transform transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* ヘッダー */}
          <div className={`relative p-6 pb-4 border-b ${colors.border}`}>
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
              <h2 className={`text-2xl font-bold ${colors.title} mb-2`}>
                📚 {characterName}からのお手紙
              </h2>
              <div className={`text-sm ${colors.subtitle} mb-2`}>
                過去のお手紙を振り返ってみましょう
              </div>
              
              {/* デバッグ情報と手動リフレッシュボタン */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                {state.lastRefresh && (
                  <span>
                    最終更新: {state.lastRefresh.toLocaleTimeString('ja-JP')}
                  </span>
                )}
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered')
                    loadLetterHistory(true)
                  }}
                  disabled={state.isLoading}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors text-xs"
                >
                  {state.isLoading ? '更新中...' : '🔄 再読み込み'}
                </button>
                <span className="text-green-600">
                  {state.letters.length}件表示
                </span>
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
              // お手紙一覧（スクロール対応）
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {(() => {
                  // フロントエンド側でソート処理を追加（新しい順）
                  const sortedLetters = [...state.letters].sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.date);
                    const dateB = new Date(b.createdAt || b.date);
                    return dateB.getTime() - dateA.getTime(); // 新しい順
                  });
                  
                  return sortedLetters.map((letter) => (
                  <div
                    key={letter.id}
                    onClick={() => handleLetterClick(letter)}
                    className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border} hover:shadow-md transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start gap-4">
                      {/* 日付アイコン */}
                      <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${colors.iconGradient} rounded-full flex items-center justify-center`}>
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
                  ))
                })()}

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
          <div className={`h-2 bg-gradient-to-r ${colors.footer}`}></div>
        </div>
      </div>

      {/* お手紙詳細モーダル */}
      {selectedLetter && (
        <DailyLetter
          date={selectedLetter.date}
          content={selectedLetter.content}
          characterId={characterId}
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