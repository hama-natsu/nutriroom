// キャラクター別ユーザー呼び方システム

export interface CharacterAddressing {
  honorific: string // 敬称・呼び方のパターン
  tone: 'formal' | 'casual' | 'friendly' | 'strict' | 'gentle' | 'mysterious'
  samples: string[] // サンプル文
}

// キャラクター別呼び方設定
export const characterAddressingMap: Record<string, CharacterAddressing> = {
  // あかり - 元気系応援栄養士
  akari: {
    honorific: 'さん',
    tone: 'friendly',
    samples: [
      '{name}さん、こんにちは〜！',
      '{name}さん、今日も一緒に頑張りましょう♪',
      '{name}さん、お疲れさまです！'
    ]
  },

  // みなと - ツンデレ系スパルタ栄養士
  minato: {
    honorific: '',
    tone: 'casual',
    samples: [
      '{name}、まだ起きてるのか？',
      '{name}、その食事じゃダメだな',
      '{name}、別に君のためじゃないからな...'
    ]
  },

  // ゆき - 癒し系おっとり栄養士
  yuki: {
    honorific: 'さん',
    tone: 'gentle',
    samples: [
      '{name}さん、お疲れさまでした',
      '{name}さん、ゆっくりで大丈夫ですよ',
      '{name}さん、今日もお元気ですね'
    ]
  },

  // りく - クール系理論派栄養士
  riku: {
    honorific: '氏',
    tone: 'formal',
    samples: [
      '{name}氏、データを確認しましょう',
      '{name}氏、科学的根拠に基づいて説明します',
      '{name}氏、論理的に考えてみてください'
    ]
  },

  // まお - 天然系うっかり栄養士
  mao: {
    honorific: 'ちゃん',
    tone: 'friendly',
    samples: [
      '{name}ちゃん、お疲れさま〜',
      '{name}ちゃん、あ、えーっと...',
      '{name}ちゃん、簡単な方法がありますよ♪'
    ]
  },

  // さつき - 毒舌系リアリスト栄養士
  satsuki: {
    honorific: '',
    tone: 'strict',
    samples: [
      '{name}、現実を見なさい',
      '{name}、そんな甘い考えじゃダメよ',
      '{name}、本気で変わる気はあるの？'
    ]
  },

  // そら - 中性的フリースタイル栄養士
  sora: {
    honorific: '',
    tone: 'mysterious',
    samples: [
      '{name}、自然と調和した食事を...',
      '{name}、それが真の健康への道ですね',
      '{name}、宇宙のエネルギーを感じて...'
    ]
  }
}

// ユーザー名をキャラクター風に変換する関数
export function formatUserNameForCharacter(
  userName: string, 
  characterId: string
): string {
  const addressing = characterAddressingMap[characterId]
  
  if (!addressing) {
    // デフォルトはあかりの呼び方
    return `${userName}さん`
  }

  // 敬称を付けて返す
  return `${userName}${addressing.honorific}`
}

// キャラクター風挨拶文を生成する関数
export function generateCharacterGreeting(
  userName: string, 
  characterId: string, 
  baseGreeting: string
): string {
  const addressing = characterAddressingMap[characterId]
  const formattedName = formatUserNameForCharacter(userName, characterId)
  
  if (!addressing) {
    return `${formattedName}、${baseGreeting}`
  }

  // キャラクターの口調に合わせて挨拶を調整
  switch (addressing.tone) {
    case 'friendly':
      return `${formattedName}、${baseGreeting}♪`
    case 'casual':
      return `${formattedName}、${baseGreeting}な`
    case 'gentle':
      return `${formattedName}、${baseGreeting}ね`
    case 'formal':
      return `${formattedName}、${baseGreeting}。`
    case 'strict':
      return `${formattedName}、${baseGreeting}よ`
    case 'mysterious':
      return `${formattedName}、${baseGreeting}...`
    default:
      return `${formattedName}、${baseGreeting}`
  }
}

// キャラクター別サンプル挨拶を取得
export function getCharacterSampleGreeting(
  userName: string, 
  characterId: string
): string {
  const addressing = characterAddressingMap[characterId]
  
  if (!addressing || addressing.samples.length === 0) {
    return formatUserNameForCharacter(userName, characterId) + '、こんにちは'
  }

  // ランダムにサンプルを選択
  const randomSample = addressing.samples[Math.floor(Math.random() * addressing.samples.length)]
  
  // {name} プレースホルダーを実際の名前に置換
  return randomSample.replace('{name}', userName)
}

// 全キャラクターの呼び方テスト関数
export function testAllCharacterAddressing(userName: string = 'はまなつ'): void {
  console.log('🎭 キャラクター別呼び方テスト')
  console.log('=' .repeat(50))
  
  Object.keys(characterAddressingMap).forEach(characterId => {
    const addressing = characterAddressingMap[characterId]
    const formattedName = formatUserNameForCharacter(userName, characterId)
    const sampleGreeting = getCharacterSampleGreeting(userName, characterId)
    
    console.log(`\n📝 ${characterId.toUpperCase()}:`)
    console.log(`  呼び方: ${formattedName}`)
    console.log(`  口調: ${addressing.tone}`)
    console.log(`  サンプル: ${sampleGreeting}`)
  })
}

// デバッグ用: キャラクター呼び方情報取得
export function getCharacterAddressingInfo(characterId: string): CharacterAddressing | null {
  return characterAddressingMap[characterId] || null
}