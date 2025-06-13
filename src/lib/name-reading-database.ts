// 日本語名前の読み方データベース

export interface NameReading {
  kanji: string
  hiragana: string
  category: 'surname' | 'given_name' | 'both'
  frequency: 'high' | 'medium' | 'low'
}

// よくある苗字の読み方
export const surnameReadings: NameReading[] = [
  // 超高頻度苗字
  { kanji: '佐藤', hiragana: 'さとう', category: 'surname', frequency: 'high' },
  { kanji: '鈴木', hiragana: 'すずき', category: 'surname', frequency: 'high' },
  { kanji: '高橋', hiragana: 'たかはし', category: 'surname', frequency: 'high' },
  { kanji: '田中', hiragana: 'たなか', category: 'surname', frequency: 'high' },
  { kanji: '渡辺', hiragana: 'わたなべ', category: 'surname', frequency: 'high' },
  { kanji: '伊藤', hiragana: 'いとう', category: 'surname', frequency: 'high' },
  { kanji: '山田', hiragana: 'やまだ', category: 'surname', frequency: 'high' },
  { kanji: '中村', hiragana: 'なかむら', category: 'surname', frequency: 'high' },
  { kanji: '小林', hiragana: 'こばやし', category: 'surname', frequency: 'high' },
  { kanji: '加藤', hiragana: 'かとう', category: 'surname', frequency: 'high' },
  
  // 高頻度苗字
  { kanji: '吉田', hiragana: 'よしだ', category: 'surname', frequency: 'high' },
  { kanji: '山本', hiragana: 'やまもと', category: 'surname', frequency: 'high' },
  { kanji: '佐々木', hiragana: 'ささき', category: 'surname', frequency: 'high' },
  { kanji: '山口', hiragana: 'やまぐち', category: 'surname', frequency: 'high' },
  { kanji: '松本', hiragana: 'まつもと', category: 'surname', frequency: 'high' },
  { kanji: '井上', hiragana: 'いのうえ', category: 'surname', frequency: 'high' },
  { kanji: '木村', hiragana: 'きむら', category: 'surname', frequency: 'high' },
  { kanji: '林', hiragana: 'はやし', category: 'surname', frequency: 'high' },
  { kanji: '斎藤', hiragana: 'さいとう', category: 'surname', frequency: 'high' },
  { kanji: '清水', hiragana: 'しみず', category: 'surname', frequency: 'high' },
  
  // 中頻度苗字
  { kanji: '山崎', hiragana: 'やまざき', category: 'surname', frequency: 'medium' },
  { kanji: '阿部', hiragana: 'あべ', category: 'surname', frequency: 'medium' },
  { kanji: '森', hiragana: 'もり', category: 'surname', frequency: 'medium' },
  { kanji: '池田', hiragana: 'いけだ', category: 'surname', frequency: 'medium' },
  { kanji: '橋本', hiragana: 'はしもと', category: 'surname', frequency: 'medium' },
  { kanji: '山下', hiragana: 'やました', category: 'surname', frequency: 'medium' },
  { kanji: '石川', hiragana: 'いしかわ', category: 'surname', frequency: 'medium' },
  { kanji: '中島', hiragana: 'なかじま', category: 'surname', frequency: 'medium' },
  { kanji: '前田', hiragana: 'まえだ', category: 'surname', frequency: 'medium' },
  { kanji: '藤田', hiragana: 'ふじた', category: 'surname', frequency: 'medium' },
  { kanji: '後藤', hiragana: 'ごとう', category: 'surname', frequency: 'medium' },
  { kanji: '小川', hiragana: 'おがわ', category: 'surname', frequency: 'medium' },
  { kanji: '岡田', hiragana: 'おかだ', category: 'surname', frequency: 'medium' },
  { kanji: '長谷川', hiragana: 'はせがわ', category: 'surname', frequency: 'medium' },
  { kanji: '村上', hiragana: 'むらかみ', category: 'surname', frequency: 'medium' },
  
  // 難読苗字
  { kanji: '東海林', hiragana: 'しょうじ', category: 'surname', frequency: 'low' },
  { kanji: '小鳥遊', hiragana: 'たかなし', category: 'surname', frequency: 'low' },
  { kanji: '月見里', hiragana: 'やまなし', category: 'surname', frequency: 'low' },
  { kanji: '四月一日', hiragana: 'わたぬき', category: 'surname', frequency: 'low' },
  { kanji: '一尺八寸', hiragana: 'かまつか', category: 'surname', frequency: 'low' },
]

// よくある名前の読み方
export const givenNameReadings: NameReading[] = [
  // 男性名前（高頻度）
  { kanji: '太郎', hiragana: 'たろう', category: 'given_name', frequency: 'high' },
  { kanji: '次郎', hiragana: 'じろう', category: 'given_name', frequency: 'high' },
  { kanji: '三郎', hiragana: 'さぶろう', category: 'given_name', frequency: 'high' },
  { kanji: '健太', hiragana: 'けんた', category: 'given_name', frequency: 'high' },
  { kanji: '翔太', hiragana: 'しょうた', category: 'given_name', frequency: 'high' },
  { kanji: '大輔', hiragana: 'だいすけ', category: 'given_name', frequency: 'high' },
  { kanji: '洋平', hiragana: 'ようへい', category: 'given_name', frequency: 'high' },
  { kanji: '雄大', hiragana: 'ゆうだい', category: 'given_name', frequency: 'high' },
  { kanji: '拓也', hiragana: 'たくや', category: 'given_name', frequency: 'high' },
  { kanji: '健一', hiragana: 'けんいち', category: 'given_name', frequency: 'high' },
  
  // 女性名前（高頻度）
  { kanji: '花子', hiragana: 'はなこ', category: 'given_name', frequency: 'high' },
  { kanji: '由美', hiragana: 'ゆみ', category: 'given_name', frequency: 'high' },
  { kanji: '恵美', hiragana: 'えみ', category: 'given_name', frequency: 'high' },
  { kanji: '智子', hiragana: 'ともこ', category: 'given_name', frequency: 'high' },
  { kanji: '裕子', hiragana: 'ゆうこ', category: 'given_name', frequency: 'high' },
  { kanji: '美穂', hiragana: 'みほ', category: 'given_name', frequency: 'high' },
  { kanji: '真由美', hiragana: 'まゆみ', category: 'given_name', frequency: 'high' },
  { kanji: '美樹', hiragana: 'みき', category: 'given_name', frequency: 'high' },
  { kanji: '春香', hiragana: 'はるか', category: 'given_name', frequency: 'high' },
  { kanji: '愛', hiragana: 'あい', category: 'given_name', frequency: 'high' },
  
  // 現代的な名前
  { kanji: '結愛', hiragana: 'ゆあ', category: 'given_name', frequency: 'medium' },
  { kanji: '心愛', hiragana: 'ここあ', category: 'given_name', frequency: 'medium' },
  { kanji: '陽翔', hiragana: 'はると', category: 'given_name', frequency: 'medium' },
  { kanji: '蒼空', hiragana: 'そら', category: 'given_name', frequency: 'medium' },
  { kanji: '碧', hiragana: 'あおい', category: 'given_name', frequency: 'medium' },
  { kanji: '凛', hiragana: 'りん', category: 'given_name', frequency: 'medium' },
  { kanji: '咲良', hiragana: 'さくら', category: 'given_name', frequency: 'medium' },
  { kanji: '陽菜', hiragana: 'ひな', category: 'given_name', frequency: 'medium' },
  { kanji: '美月', hiragana: 'みつき', category: 'given_name', frequency: 'medium' },
  { kanji: '悠斗', hiragana: 'ゆうと', category: 'given_name', frequency: 'medium' },
]

// 共通の文字パターン
export const commonCharacterReadings: Record<string, string> = {
  // 敬称
  'さん': 'さん',
  'さま': 'さま',
  'くん': 'くん',
  'ちゃん': 'ちゃん',
  
  // 単一漢字（よく使われる）
  '田': 'た',
  '中': 'なか',
  '山': 'やま',
  '川': 'かわ',
  '木': 'き',
  '本': 'もと',
  '村': 'むら',
  '藤': 'ふじ',
  '井': 'い',
  '上': 'うえ',
  '下': 'した',
  '前': 'まえ',
  '後': 'うしろ',
  '東': 'ひがし',
  '西': 'にし',
  '南': 'みなみ',
  '北': 'きた',
  
  // 名前でよく使われる漢字
  '太': 'た',
  '子': 'こ',
  '美': 'み',
  '愛': 'あい',
  '花': 'はな',
  '春': 'はる',
  '夏': 'なつ',
  '秋': 'あき',
  '冬': 'ふゆ',
}

// データベースを統合
export const allNameReadings = [...surnameReadings, ...givenNameReadings]

// 名前検索関数
export function findNameReading(name: string): NameReading | null {
  // 完全一致を最優先
  const exactMatch = allNameReadings.find(reading => reading.kanji === name)
  if (exactMatch) {
    return exactMatch
  }
  
  // 部分一致（苗字+名前の組み合わせ対応）
  for (const reading of allNameReadings) {
    if (name.includes(reading.kanji)) {
      return reading
    }
  }
  
  return null
}

// カテゴリ別検索
export function findSurnameReading(surname: string): NameReading | null {
  return surnameReadings.find(reading => reading.kanji === surname) || null
}

export function findGivenNameReading(givenName: string): NameReading | null {
  return givenNameReadings.find(reading => reading.kanji === givenName) || null
}

// 統計情報
export function getNameDatabaseStats() {
  const stats = {
    totalEntries: allNameReadings.length,
    surnames: surnameReadings.length,
    givenNames: givenNameReadings.length,
    frequencyBreakdown: {
      high: allNameReadings.filter(r => r.frequency === 'high').length,
      medium: allNameReadings.filter(r => r.frequency === 'medium').length,
      low: allNameReadings.filter(r => r.frequency === 'low').length,
    },
    categoryBreakdown: {
      surname: allNameReadings.filter(r => r.category === 'surname').length,
      given_name: allNameReadings.filter(r => r.category === 'given_name').length,
      both: allNameReadings.filter(r => r.category === 'both').length,
    }
  }
  
  return stats
}

// デバッグ用：データベース検索テスト
export function testNameDatabase() {
  console.log('🔍 Name Database Test Results:')
  console.log('=' .repeat(50))
  
  const testNames = [
    '田中太郎', '佐藤花子', '山田', '鈴木',
    '翔太', '美穂', '東海林', '小鳥遊'
  ]
  
  testNames.forEach(name => {
    const result = findNameReading(name)
    console.log(`${name}: ${result ? result.hiragana : '見つかりません'} ${result ? `(${result.frequency})` : ''}`)
  })
  
  console.log('\n📊 Database Statistics:')
  const stats = getNameDatabaseStats()
  console.log(`Total entries: ${stats.totalEntries}`)
  console.log(`Surnames: ${stats.surnames}`)
  console.log(`Given names: ${stats.givenNames}`)
  console.log(`High frequency: ${stats.frequencyBreakdown.high}`)
  console.log(`Medium frequency: ${stats.frequencyBreakdown.medium}`)
  console.log(`Low frequency: ${stats.frequencyBreakdown.low}`)
}