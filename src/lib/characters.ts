export interface Character {
  id: string
  name: string
  age: number
  gender: '男性' | '女性' | '性別不詳'
  personalityType: string
  specialties: string[]
  catchphrase: string
  roomAtmosphere: string
  colorTheme: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  description: string
}

export const characters: Character[] = [
  {
    id: 'minato',
    name: 'みなと',
    age: 26,
    gender: '男性',
    personalityType: 'ツンデレ系スパルタ栄養士',
    specialties: ['糖質制限', '筋トレ系栄養管理', 'ボディメイク'],
    catchphrase: '別に君のためじゃないからな...でも、その食事じゃダメだ！',
    roomAtmosphere: 'シンプルでクールなオフィス。筋トレ器具と栄養学の専門書が並ぶ',
    colorTheme: {
      primary: '#1e40af',
      secondary: '#3b82f6', 
      accent: '#60a5fa',
      background: '#eff6ff'
    },
    description: '厳しくも愛情深い指導で、確実な結果を出してくれる頼れる栄養士'
  },
  {
    id: 'akari',
    name: 'あかり',
    age: 23,
    gender: '女性',
    personalityType: '元気系応援栄養士',
    specialties: ['ダイエット', '美容栄養', 'モチベーション管理'],
    catchphrase: '一緒に頑張りましょう♪ きっと素敵になれますよ！',
    roomAtmosphere: '明るくポップな空間。花やかわいい小物で彩られた温かい部屋',
    colorTheme: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#fbbf24',
      background: '#fef7ff'
    },
    description: '明るく前向きな性格で、楽しく続けられるダイエットをサポート'
  },
  {
    id: 'yuki',
    name: 'ゆき',
    age: 28,
    gender: '女性',
    personalityType: '癒し系おっとり栄養士',
    specialties: ['体調管理', '妊活・育児期栄養', 'ストレス軽減'],
    catchphrase: 'あら、大丈夫ですよ。ゆっくりでいいんです...',
    roomAtmosphere: '木の温もりを感じる和モダンな空間。観葉植物とお茶の香り',
    colorTheme: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#84cc16',
      background: '#fffbeb'
    },
    description: '優しく包み込むような話し方で、心身ともに健康をサポート'
  },
  {
    id: 'riku',
    name: 'りく',
    age: 30,
    gender: '男性',
    personalityType: 'クール系理論派栄養士',
    specialties: ['生活習慣病予防', 'エビデンスベース栄養学', 'データ分析'],
    catchphrase: 'データに基づいて説明しよう。科学的根拠が重要だ。',
    roomAtmosphere: 'モノトーンで整理されたモダンなオフィス。最新機器と研究資料',
    colorTheme: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      accent: '#3b82f6',
      background: '#f9fafb'
    },
    description: '論理的で正確な情報提供で、確実な健康改善を導く'
  },
  {
    id: 'mao',
    name: 'まお',
    age: 25,
    gender: '女性',
    personalityType: '天然系うっかり栄養士',
    specialties: ['初心者向け基礎栄養', '手抜き料理', '簡単レシピ'],
    catchphrase: 'あ、えーっと...簡単で美味しい方法がありますよ♪',
    roomAtmosphere: 'カラフルで親しみやすい空間。手作り感のある温かい雰囲気',
    colorTheme: {
      primary: '#10b981',
      secondary: '#6ee7b7',
      accent: '#fbbf24',
      background: '#f0fdf4'
    },
    description: 'マイペースながら、分かりやすく親しみやすい栄養指導'
  },
  {
    id: 'satsuki',
    name: 'さつき',
    age: 32,
    gender: '女性',
    personalityType: '毒舌系リアリスト栄養士',
    specialties: ['本格的な減量', '生活習慣改善', '現実的なアドバイス'],
    catchphrase: 'はぁ？そんな甘い考えじゃ痩せないわよ。現実を見なさい。',
    roomAtmosphere: '洗練されたダークトーンの部屋。高級感とプロ意識を感じる空間',
    colorTheme: {
      primary: '#7c2d12',
      secondary: '#dc2626',
      accent: '#fbbf24',
      background: '#fef2f2'
    },
    description: '厳しいけれど的確な指摘で、本気で変わりたい人をサポート'
  },
  {
    id: 'sora',
    name: 'そら',
    age: 27,
    gender: '性別不詳',
    personalityType: '中性的フリースタイル栄養士',
    specialties: ['オーガニック', 'マクロビ', '代替栄養学'],
    catchphrase: '自然と調和した食事...それが真の健康への道ですね。',
    roomAtmosphere: '虹色の光が差し込む神秘的な空間。クリスタルとハーブの香り',
    colorTheme: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#06b6d4',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    description: 'ユニークな視点から、個人に合った自然派の栄養アプローチを提案'
  }
]

export const getCharacterById = (id: string): Character | undefined => {
  return characters.find(character => character.id === id)
}