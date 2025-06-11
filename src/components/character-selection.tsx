'use client'

import { Character, characters } from '@/lib/characters'
import { CharacterCard } from './character-card'

interface CharacterSelectionProps {
  onBack: () => void
  onCharacterSelect: (character: Character) => void
}

export function CharacterSelection({ onBack, onCharacterSelect }: CharacterSelectionProps) {
  const handleCharacterSelect = (character: Character) => {
    onCharacterSelect(character)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* 固定ヘッダー */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-700 text-xl font-normal hover:text-gray-500 transition-colors duration-200"
            style={{ minWidth: '32px' }}
            title="戻る"
          >
            ＜
          </button>
          <h1 className="text-xl font-bold text-gray-800">AI栄養士を選んでください</h1>
        </div>
      </div>

      {/* コンテンツエリア - ヘッダー分のpadding-top追加 */}
      <div className="pt-20 px-4 py-6">
        {/* 説明文 */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
            あなたに最適な栄養士を見つけて、理想の食生活を始めましょう
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mt-4">
            <span className="mr-2">✨</span>
            7つの個性豊かなAI栄養士があなたをサポート
          </div>
        </div>

        {/* キャラクターグリッド - モバイルファースト */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CharacterCard
                  character={character}
                  onSelect={handleCharacterSelect}
                />
              </div>
            ))}
          </div>
        </div>

        {/* フッター情報 */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 あなたにぴったりのAI栄養士を見つけるヒント
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <div className="font-medium text-purple-600 mb-2">目標で選ぶ</div>
                <p>ダイエット、筋肉増強、健康維持など、あなたの目標に合った専門分野を持つ栄養士を選びましょう。</p>
              </div>
              <div>
                <div className="font-medium text-blue-600 mb-2">性格で選ぶ</div>
                <p>厳しい指導が好みか、優しいサポートが好みか。あなたに合うコミュニケーションスタイルを選択。</p>
              </div>
              <div>
                <div className="font-medium text-pink-600 mb-2">直感で選ぶ</div>
                <p>色合いや雰囲気など、直感的に「この人と話してみたい」と思える栄養士を選ぶのも良い方法です。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}