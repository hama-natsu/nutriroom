'use client'

import { Character } from '@/lib/characters'

interface CharacterCardProps {
  character: Character
  onSelect: (character: Character) => void
}

export function CharacterCard({ character, onSelect }: CharacterCardProps) {
  const handleClick = () => {
    onSelect(character)
  }

  return (
    <div 
      className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer card-hover animate-fadeIn"
      style={{ 
        background: character.colorTheme.background.includes('gradient') 
          ? character.colorTheme.background 
          : character.colorTheme.background 
      }}
      onClick={handleClick}
    >
      {/* カードヘッダー */}
      <div 
        className="p-6 text-white relative"
        style={{ backgroundColor: character.colorTheme.primary }}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-2xl font-bold">{character.name}</h3>
            <p className="text-sm opacity-90">{character.age}歳 • {character.gender}</p>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: character.colorTheme.accent }}
          >
            {character.gender === '男性' ? '👨‍⚕️' : character.gender === '女性' ? '👩‍⚕️' : '🧑‍⚕️'}
          </div>
        </div>
        
        <div 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: character.colorTheme.accent,
            color: character.colorTheme.primary 
          }}
        >
          {character.personalityType}
        </div>
      </div>

      {/* カードボディ */}
      <div className="p-6">
        {/* 専門分野 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">専門分野</h4>
          <div className="flex flex-wrap gap-2">
            {character.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: character.colorTheme.secondary + '20',
                  color: character.colorTheme.primary 
                }}
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* 口癖 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">口癖</h4>
          <p 
            className="text-sm italic p-3 rounded-lg font-bold"
            style={{ 
              backgroundColor: '#ffffff',
              border: `2px solid ${character.colorTheme.primary}`,
              color: '#000000',
              textShadow: '0 1px 2px rgba(255, 255, 255, 1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            「{character.catchphrases[0]}」
          </p>
        </div>

        {/* 部屋の雰囲気 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">部屋の雰囲気</h4>
          <p 
            className="text-sm font-medium p-2 rounded-lg"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            {character.roomAtmosphere}
          </p>
        </div>

        {/* 説明 */}
        <div className="mb-6">
          <p 
            className="text-sm font-medium p-2 rounded-lg"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            {character.description}
          </p>
        </div>

        {/* 選択ボタン - タッチターゲット拡大 */}
        <button
          className="w-full py-4 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 ripple-button shadow-md hover:shadow-lg min-h-[48px] touch-button"
          style={{ backgroundColor: character.colorTheme.primary }}
        >
          このAI栄養士と相談する
        </button>
      </div>

      {/* ホバー効果 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{ backgroundColor: character.colorTheme.primary }}
      />
    </div>
  )
}