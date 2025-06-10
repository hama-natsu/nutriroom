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
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI栄養士を選んでください</h1>
              <p className="text-gray-600 mt-1">あなたに最適な栄養士を見つけて、理想の食生活を始めましょう</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>

      {/* キャラクター選択エリア */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 説明セクション */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
            <span className="mr-2">✨</span>
            7つの個性豊かなAI栄養士があなたをサポート
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            それぞれ異なる専門分野と性格を持つAI栄養士たち。あなたの目標や好みに合わせて、
            最適なパートナーを選んでください。
          </p>
        </div>

        {/* キャラクターグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={handleCharacterSelect}
            />
          ))}
        </div>

        {/* フッター情報 */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 あなたにぴったりのAI栄養士を見つけるヒント
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
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