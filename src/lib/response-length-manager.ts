// 応答長さ管理システム
export interface ResponseLengthConfig {
  mode: 'short' | 'detailed'
  maxLength: number
  targetLength: number
  style: 'line' | 'formal' | 'casual'
}

export interface ConversationContext {
  messageCount: number
  lastMessages: string[]
  userRequestedDetails: boolean
  currentTopic: string | null
  relationshipLevel: number
}

export interface UserMessageAnalysis {
  requestsDetails: boolean
  isQuestion: boolean
  complexity: 'simple' | 'complex'
  keywords: string[]
}

export class ResponseLengthManager {
  private defaultConfigs: Record<string, ResponseLengthConfig> = {
    short: {
      mode: 'short',
      maxLength: 100,
      targetLength: 60,
      style: 'line'
    },
    detailed: {
      mode: 'detailed',
      maxLength: 300,
      targetLength: 200,
      style: 'casual'
    }
  }

  // ユーザーメッセージ分析
  public analyzeUserMessage(message: string): UserMessageAnalysis {
    const lowerMessage = message.toLowerCase()
    
    // 詳細要求の検出
    const detailTriggers = [
      '詳しく', '詳細', 'くわしく', 'もっと', 'さらに', 'なぜ', 'どうして',
      'どのように', 'どうやって', '方法', '理由', '原因', 'メカニズム',
      '具体的', '例えば', 'たとえば', '説明して', '教えて'
    ]
    
    const requestsDetails = detailTriggers.some(trigger => 
      lowerMessage.includes(trigger)
    )

    // 質問の検出
    const questionMarkers = ['？', '?', 'ですか', 'でしょうか', 'どう', 'なに', '何']
    const isQuestion = questionMarkers.some(marker => 
      lowerMessage.includes(marker)
    )

    // 複雑さの判定
    const complexityKeywords = [
      '栄養素', 'ビタミン', 'ミネラル', 'カロリー', '代謝', '吸収',
      'ダイエット', '筋トレ', '運動', '病気', '症状', '治療',
      'レシピ', '料理', '調理', '食材', '食品', '成分'
    ]
    
    const complexity = complexityKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    ) ? 'complex' : 'simple'

    // キーワード抽出
    const keywords = complexityKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    )

    return {
      requestsDetails,
      isQuestion,
      complexity,
      keywords
    }
  }

  // 応答モード決定
  public determineResponseMode(
    userAnalysis: UserMessageAnalysis,
    context: ConversationContext
  ): ResponseLengthConfig {
    
    // 詳細要求があった場合
    if (userAnalysis.requestsDetails || context.userRequestedDetails) {
      return this.defaultConfigs.detailed
    }

    // 複雑な質問の場合は中程度の長さ
    if (userAnalysis.isQuestion && userAnalysis.complexity === 'complex') {
      return {
        mode: 'short',
        maxLength: 120,
        targetLength: 80,
        style: 'line'
      }
    }

    // 基本は短い応答
    return this.defaultConfigs.short
  }

  // LINEスタイル応答生成指示
  public generateResponseInstruction(
    config: ResponseLengthConfig,
    characterId: string,
    userAnalysis: UserMessageAnalysis
  ): string {
    const instructions = []

    // 基本長さ指示
    if (config.mode === 'short') {
      instructions.push(`【応答長さ】1-2文以内（${config.targetLength}文字程度）`)
      instructions.push('【スタイル】LINEのような短いカジュアルな返信')
    } else {
      instructions.push(`【応答長さ】3-4文以内（${config.targetLength}文字程度）`)
      instructions.push('【スタイル】詳しいが簡潔な説明')
    }

    // 応答パターン指示
    instructions.push('【応答パターン】')
    if (userAnalysis.isQuestion) {
      instructions.push('・簡潔に答えてから、必要に応じて補足')
      instructions.push('・一度に全て説明せず、段階的に回答')
    } else {
      instructions.push('・共感や反応から始める')
      instructions.push('・簡単なアドバイスを1つだけ')
    }

    instructions.push('【重要】長い説明は避け、ユーザーが詳細を求めたら詳しく答える')

    return instructions.join('\n')
  }

  // 応答後処理（文字数チェック）
  public validateResponse(
    response: string,
    config: ResponseLengthConfig
  ): {
    isValid: boolean
    actualLength: number
    recommendation?: string
  } {
    const actualLength = response.length
    
    if (actualLength <= config.maxLength) {
      return {
        isValid: true,
        actualLength
      }
    }

    // 長すぎる場合の推奨
    let recommendation = ''
    if (config.mode === 'short') {
      recommendation = 'より簡潔に、要点のみに絞って回答してください'
    } else {
      recommendation = '詳細は段階的に説明し、一度に全てを伝えないでください'
    }

    return {
      isValid: false,
      actualLength,
      recommendation
    }
  }

  // キャラクター別短縮スタイル
  public getCharacterShortStyle(characterId: string): {
    greeting: string[]
    transition: string[]
    ending: string[]
  } {
    const styles: Record<string, {
      greeting: string[]
      transition: string[]
      ending: string[]
    }> = {
      minato: {
        greeting: ['...', 'はぁ？', 'ちっ'],
        transition: ['でも', 'まあ', '...まあ'],
        ending: ['だ', 'からな', '...']
      },
      akari: {
        greeting: ['わぁ〜', 'そうなんだ〜', 'すごいね〜'],
        transition: ['でもね〜', 'あのね〜', 'そうそう〜'],
        ending: ['よ〜♪', 'だよ〜', 'ね〜♪']
      },
      yuki: {
        greeting: ['あら...', 'そうですね...', 'まあ...'],
        transition: ['でも...', 'ただ...', 'それと...'],
        ending: ['ですね...', 'かもしれません...', 'でしょう...']
      },
      riku: {
        greeting: ['データによると', '結論から言うと', '科学的には'],
        transition: ['ただし', 'しかし', '一方で'],
        ending: ['です', 'ということです', 'が最適です']
      },
      mao: {
        greeting: ['えーっと〜', 'あ〜', 'そうそう〜'],
        transition: ['でも〜', 'あのね〜', 'それで〜'],
        ending: ['よ〜', 'です〜', 'かも〜']
      },
      satsuki: {
        greeting: ['はぁ？', 'あのね', 'ちょっと'],
        transition: ['でも', 'だけど', 'それより'],
        ending: ['でしょ', 'よ', 'なのよ']
      },
      sora: {
        greeting: ['そうですね...', 'なるほど...', 'ふむ...'],
        transition: ['でも...', 'ただ...', 'しかし...'],
        ending: ['ですね...', 'かもしれません...', 'でしょう...']
      }
    }

    return styles[characterId] || styles.yuki
  }

  // 段階的応答の提案
  public suggestFollowUpTopics(
    mainResponse: string,
    userKeywords: string[]
  ): string[] {
    const suggestions: string[] = []

    if (userKeywords.includes('ダイエット')) {
      suggestions.push('食事のタイミングについて')
      suggestions.push('運動との組み合わせ')
      suggestions.push('具体的なメニュー')
    }

    if (userKeywords.includes('栄養素')) {
      suggestions.push('他の重要な栄養素')
      suggestions.push('食材での摂取方法')
      suggestions.push('不足した時の症状')
    }

    if (userKeywords.includes('レシピ')) {
      suggestions.push('材料の代替案')
      suggestions.push('調理のコツ')
      suggestions.push('保存方法')
    }

    return suggestions.slice(0, 2) // 最大2つまで
  }
}

// シングルトンインスタンス
export const responseLengthManager = new ResponseLengthManager()

// 使用例
export const createLINEStylePrompt = (
  basePrompt: string,
  userMessage: string,
  characterId: string,
  context: ConversationContext
): string => {
  const userAnalysis = responseLengthManager.analyzeUserMessage(userMessage)
  const config = responseLengthManager.determineResponseMode(userAnalysis, context)
  const instruction = responseLengthManager.generateResponseInstruction(config, characterId, userAnalysis)
  
  return `${basePrompt}

${instruction}

【例】
ユーザー: 「ダイエットどうしたらいい？」
適切: 「まずは食事記録つけてみる？」（簡潔・1文）
不適切: 「ダイエットには様々な方法がありますが、基本的には...」（長すぎ）

ユーザーメッセージ: "${userMessage}"

${characterId}として、上記指示に従って簡潔に応答してください。`
}