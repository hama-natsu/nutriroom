'use client'

import { useState, useEffect } from 'react'

interface DailyLetterProps {
  date: string
  content: string
  characterName: string
  onClose?: () => void
}

export function DailyLetter({ date, content, characterName, onClose }: DailyLetterProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  // フェードインアニメーション
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // タイピングアニメーション
  useEffect(() => {
    if (!isVisible) return

    let index = 0
    const timer = setInterval(() => {
      if (index < content.length) {
        setTypingText(content.slice(0, index + 1))
        index++
      } else {
        setIsTypingComplete(true)
        clearInterval(timer)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [content, isVisible])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* ヘッダー */}
        <div className="relative p-6 pb-4">
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
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-pink-800 mb-2">
              💌 今日のお手紙
            </h2>
            <div className="text-sm text-purple-600">
              {formatDate(date)}
            </div>
          </div>
        </div>

        {/* お手紙本文 */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl p-6 shadow-inner border border-pink-100">
            {/* 手紙用罫線効果 */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-pink-200"></div>
              
              {/* お手紙内容 */}
              <div className="pl-12 pr-4 leading-relaxed text-gray-800">
                <div className="whitespace-pre-wrap">
                  {typingText}
                  {!isTypingComplete && (
                    <span className="animate-pulse text-pink-500">|</span>
                  )}
                </div>
                
                {/* 署名 */}
                {isTypingComplete && (
                  <div className="mt-6 text-right">
                    <div className="text-pink-600 font-medium">
                      {characterName}より 💕
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          {isTypingComplete && (
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => {
                  console.log('💾 Letter saved to favorites')
                }}
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium"
              >
                💝 お気に入りに保存
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  ✨ 今日も頑張ろう
                </button>
              )}
            </div>
          )}
        </div>

        {/* フッター装飾 */}
        <div className="h-2 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200 rounded-b-2xl"></div>
      </div>
    </div>
  )
}

// プレビュー用コンポーネント
export function DailyLetterPreview() {
  const [showLetter, setShowLetter] = useState(true)

  const sampleContent = `おはようございます！今日も素敵な一日になりそうですね♪

昨日お話した栄養バランスのこと、覚えていてくださってありがとうございます。

朝食にヨーグルトとフルーツを取り入れるアイデア、とても良いと思います！ビタミンもしっかり摂れますし、お腹にも優しいですからね。

お仕事で忙しい毎日だと思いますが、少しずつでも健康を意識していただけて嬉しいです。

明日は、お昼ご飯のお話も聞かせてくださいね！`

  if (!showLetter) return null

  return (
    <DailyLetter
      date={new Date().toISOString()}
      content={sampleContent}
      characterName="あかり"
      onClose={() => setShowLetter(false)}
    />
  )
}