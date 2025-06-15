// 🎯 NutriRoom Phase 2.4: 美しい「今日のお手紙」UIコンポーネント
// 感情的価値を高めるエレガントなデザイン

'use client'

import { useState, useEffect } from 'react'
import { DailyLetter } from '@/lib/letter-generator'
import { getTodaySummary } from '@/lib/supabase'

interface DailyLetterProps {
  characterId: string
  userName?: string
  onClose?: () => void
}

interface DailyLetterUIState {
  letter: DailyLetter | null
  isLoading: boolean
  isVisible: boolean
  animationPhase: 'fadeIn' | 'typing' | 'complete'
}

export function DailyLetterComponent({ characterId, userName, onClose }: DailyLetterProps) {
  const [state, setState] = useState<DailyLetterUIState>({
    letter: null,
    isLoading: true,
    isVisible: false,
    animationPhase: 'fadeIn'
  })

  const [typingText, setTypingText] = useState('')
  const [currentSection, setCurrentSection] = useState(0)

  // お手紙データ取得
  useEffect(() => {
    loadTodayLetter()
  }, [characterId])

  const loadTodayLetter = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      // 今日のサマリーからお手紙を取得
      const summary = await getTodaySummary(characterId)
      
      if (summary?.letter_content) {
        // 既存のお手紙をパース
        const letter = parseStoredLetter(summary.letter_content, characterId, userName)
        setState(prev => ({ 
          ...prev, 
          letter, 
          isLoading: false, 
          isVisible: true 
        }))
        
        // タイピングアニメーション開始
        setTimeout(() => {
          setState(prev => ({ ...prev, animationPhase: 'typing' }))
          startTypingAnimation(letter)
        }, 500)
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isVisible: false 
        }))
      }
    } catch (error) {
      console.error('❌ Failed to load daily letter:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isVisible: false 
      }))
    }
  }

  // タイピングアニメーション
  const startTypingAnimation = (letter: DailyLetter) => {
    const sections = [
      letter.greeting,
      '\n今日お話したこと:\n' + letter.mainTopics.join('\n'),
      letter.conversationHighlights.length > 0 ? '\n' + letter.conversationHighlights.join('\n') : '',
      '\n' + letter.encouragementMessage,
      '\n' + letter.nextSessionHint,
      '\n\n' + letter.signature
    ].filter(section => section.trim() !== '')

    let currentText = ''
    let sectionIndex = 0
    let charIndex = 0

    const typeCharacter = () => {
      if (sectionIndex >= sections.length) {
        setState(prev => ({ ...prev, animationPhase: 'complete' }))
        return
      }

      const currentSectionText = sections[sectionIndex]
      
      if (charIndex < currentSectionText.length) {
        currentText += currentSectionText[charIndex]
        setTypingText(currentText)
        charIndex++
        
        // 句読点で少し停止、通常文字は高速タイピング
        const delay = ['\n', '。', '♪', '！'].includes(currentSectionText[charIndex - 1]) ? 200 : 30
        setTimeout(typeCharacter, delay)
      } else {
        sectionIndex++
        charIndex = 0
        setCurrentSection(sectionIndex)
        setTimeout(typeCharacter, 300) // セクション間の停止
      }
    }

    typeCharacter()
  }

  // 格納済みお手紙をパース
  const parseStoredLetter = (content: string, characterId: string, userName?: string): DailyLetter => {
    const lines = content.split('\n')
    const today = new Date().toISOString().split('T')[0]
    
    // 簡易パース（実際の格納形式に応じて調整）
    return {
      id: `parsed_${today}_${characterId}`,
      date: today,
      characterId,
      characterName: 'あかり',
      userName,
      greeting: lines[0] || '',
      mainTopics: lines.filter(line => line.startsWith('・')),
      conversationHighlights: [],
      encouragementMessage: lines.find(line => line.includes('素晴らしい') || line.includes('応援')) || '',
      nextSessionHint: lines.find(line => line.includes('明日')) || '',
      signature: lines[lines.length - 1] || 'あかりより♪',
      createdAt: new Date()
    }
  }

  if (state.isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">今日のお手紙を準備中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!state.isVisible || !state.letter) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* お手紙カード */}
      <div 
        className={`bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto transform transition-all duration-500 ${
          state.isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
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
              {new Date().toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* お手紙本文 */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl p-6 shadow-inner border border-pink-100">
            {/* 手紙用罫線効果 */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-pink-200"></div>
              
              {/* タイピングアニメーション表示 */}
              <div className="pl-12 pr-4 leading-relaxed text-gray-800">
                {state.animationPhase === 'typing' ? (
                  <div className="whitespace-pre-wrap">
                    {typingText}
                    <span className="animate-pulse text-pink-500">|</span>
                  </div>
                ) : state.animationPhase === 'complete' ? (
                  <div className="whitespace-pre-wrap">
                    {formatLetterForDisplay(state.letter)}
                  </div>
                ) : (
                  // フェードイン段階
                  <div className="text-center text-pink-500 py-8">
                    <div className="animate-pulse">💝</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          {state.animationPhase === 'complete' && (
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('💾 Letter saved to favorites')
                  }
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

// お手紙表示用フォーマット
function formatLetterForDisplay(letter: DailyLetter): string {
  const sections = [
    letter.greeting,
    '\n今日お話したこと:',
    ...letter.mainTopics.map(topic => topic),
    ''
  ]

  if (letter.conversationHighlights.length > 0) {
    sections.push('\n会話のハイライト:')
    sections.push(...letter.conversationHighlights)
    sections.push('')
  }

  sections.push(letter.encouragementMessage)
  sections.push('')
  sections.push(letter.nextSessionHint)
  sections.push('')
  sections.push(letter.signature)

  return sections.filter(section => section !== undefined).join('\n')
}

/**
 * お手紙コンポーネントのプレビュー（開発用）
 */
export function DailyLetterPreview() {
  const sampleLetter: DailyLetter = {
    id: 'sample_letter',
    date: new Date().toISOString().split('T')[0],
    characterId: 'akari',
    characterName: 'あかり',
    userName: 'はまなつ',
    greeting: 'はまなつさん、今日はお疲れさまでした♪',
    mainTopics: [
      '・朝食のバランスについて',
      '・おやつの選び方のコツ',
      '・水分補給の大切さ'
    ],
    conversationHighlights: [
      '・栄養バランスについて詳しく質問されました',
      '・野菜の摂取方法をお伝えしました'
    ],
    encouragementMessage: 'はまなつさんの健康意識の高さ、とても素晴らしいと思います！',
    nextSessionHint: '明日はお昼ご飯のお話を聞かせてくださいね♪',
    signature: 'あかりより♪',
    createdAt: new Date()
  }

  return (
    <DailyLetterComponent 
      characterId="akari" 
      userName="はまなつ"
      onClose={() => console.log('Preview letter closed')}
    />
  )
}