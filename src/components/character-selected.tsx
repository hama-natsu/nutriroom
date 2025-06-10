'use client'

import { Character } from '@/lib/characters'

interface CharacterSelectedProps {
  character: Character
  onBack: () => void
  onStartChat: () => void
}

export function CharacterSelected({ character, onBack, onStartChat }: CharacterSelectedProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: character.colorTheme.background.includes('gradient') 
          ? character.colorTheme.background 
          : `linear-gradient(135deg, ${character.colorTheme.background} 0%, ${character.colorTheme.secondary}20 100%)`
      }}
    >
      <div className="max-w-2xl w-full">
        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div 
            className="p-8 text-white text-center relative"
            style={{ backgroundColor: character.colorTheme.primary }}
          >
            <div className="relative z-10">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                style={{ backgroundColor: character.colorTheme.accent }}
              >
                {character.gender === '男性' ? '👨‍⚕️' : character.gender === '女性' ? '👩‍⚕️' : '🧑‍⚕️'}
              </div>
              <h1 className="text-3xl font-bold mb-2">{character.name}を選択しました！</h1>
              <p className="text-lg opacity-90">{character.personalityType}</p>
            </div>
            
            {/* 背景装飾 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 text-6xl">✨</div>
              <div className="absolute bottom-4 left-4 text-4xl">🎯</div>
              <div className="absolute top-1/2 left-8 text-3xl">💫</div>
              <div className="absolute top-1/4 right-12 text-2xl">⭐</div>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-8">
            {/* 挨拶メッセージ */}
            <div className="mb-8">
              <div 
                className="p-6 rounded-xl relative"
                style={{ 
                  backgroundColor: character.colorTheme.secondary + '15',
                  borderLeft: `4px solid ${character.colorTheme.primary}`
                }}
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: character.colorTheme.primary, color: 'white' }}
                  >
                    {character.gender === '男性' ? '👨‍⚕️' : character.gender === '女性' ? '👩‍⚕️' : '🧑‍⚕️'}
                  </div>
                  <div>
                    <p className="font-medium mb-2" style={{ color: character.colorTheme.primary }}>
                      {character.name}からのメッセージ
                    </p>
                    <p className="text-gray-700 italic">
                      「{character.catchphrase}」
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 特徴まとめ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">🎯 専門分野</h3>
                <ul className="space-y-2">
                  {character.specialties.map((specialty, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span 
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: character.colorTheme.primary }}
                      />
                      {specialty}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">🏠 相談環境</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {character.roomAtmosphere}
                </p>
              </div>
            </div>

            {/* 説明 */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-3">💡 {character.name}について</h3>
              <p className="text-gray-600 leading-relaxed">
                {character.description}
              </p>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStartChat}
                className="flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105 shadow-lg"
                style={{ backgroundColor: character.colorTheme.primary }}
              >
                🗣️ {character.name}と相談を始める
              </button>
              
              <button
                onClick={onBack}
                className="px-6 py-4 border-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50"
                style={{ 
                  borderColor: character.colorTheme.primary,
                  color: character.colorTheme.primary 
                }}
              >
                他の栄養士を見る
              </button>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-6">
          <p className="text-white text-sm opacity-80">
            💡 いつでも他の栄養士に変更できます
          </p>
        </div>
      </div>
    </div>
  )
}