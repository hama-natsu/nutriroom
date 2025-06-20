// 🎯 NutriRoom Phase 2.4: 「今日のお手紙」生成システム
// 革新的差別化価値: 栄養士からの温かい日次お手紙
// Gemini 1.5 Pro統合 - 無料枠大・日本語得意・会話分析最適

import { getTodayConversationLogs } from '@/lib/supabase/sessions'
// import { setLetterContent } from '@/lib/supabase/summaries' // 現在未使用
import { getCharacterById } from '@/lib/characters'
import { getGeminiModel, isGeminiAvailable, debugGeminiSetup } from '@/lib/gemini-client'

// お手紙データ構造
export interface DailyLetter {
  id: string
  date: string
  characterId: string
  characterName: string
  userName?: string
  greeting: string
  mainTopics: string[]
  conversationHighlights: string[]
  encouragementMessage: string
  nextSessionHint: string
  signature: string
  createdAt: Date
}

// お手紙生成設定
export interface LetterGenerationConfig {
  maxTopics: number
  maxHighlights: number
  personalizedGreeting: boolean
  includeNutritionAdvice: boolean
  tomorrowHint: boolean
  useGemini: boolean  // Gemini使用フラグ
  fallbackToLocal: boolean  // Gemini失敗時のローカル生成フォールバック
}

const DEFAULT_CONFIG: LetterGenerationConfig = {
  maxTopics: 4,
  maxHighlights: 3,
  personalizedGreeting: true,
  includeNutritionAdvice: true,
  tomorrowHint: true,
  useGemini: true,  // デフォルトでGemini使用
  fallbackToLocal: true  // 失敗時はローカル生成
}

/**
 * キャラクター別お手紙生成エンジン
 */
export class DailyLetterGenerator {
  
  /**
   * 今日のお手紙を生成
   */
  static async generateDailyLetter(
    characterId: string,
    userName?: string,
    config: LetterGenerationConfig = DEFAULT_CONFIG
  ): Promise<DailyLetter | null> {
    try {
      console.log('💌 Starting daily letter generation...', {
        characterId,
        userName: userName?.substring(0, 3) + '...' || 'Guest',
        date: new Date().toISOString().split('T')[0]
      })

      // 1. データ収集（デバッグ強化）
      console.log('🔍 Fetching data for letter generation...')
      const [conversations, character] = await Promise.all([
        getTodayConversationLogs(characterId),
        Promise.resolve(getCharacterById(characterId))
      ])
      
      console.log('📊 Data collection results:', {
        conversationsFound: conversations.length,
        characterFound: !!character,
        characterId,
        conversationSample: conversations.slice(0, 3).map(conv => ({
          type: conv.message_type,
          content: conv.message_content.substring(0, 50) + '...',
          timestamp: conv.timestamp
        }))
      })
      
      const summary = null // getDailySummaryは未使用のためnullに設定

      if (!character) {
        console.error('❌ Character not found:', characterId)
        return null
      }

      if (conversations.length === 0) {
        console.log('📭 No conversations found for today - cannot generate letter')
        console.log('💡 Suggestion: Check if conversation logging is working and sessions are active')
        return null
      }

      // 2. 会話分析
      const analysis = this.analyzeConversations(conversations)
      
      // 3. キャラクター個性に応じたお手紙生成
      const letter = await this.generatePersonalizedLetter(
        character,
        analysis,
        summary,
        userName,
        config,
        conversations  // Gemini用の生データも渡す
      )

      // 4. データベースに保存
      // TODO: summaryがnullのため、現在は保存処理をスキップ
      // if (summary) {
      //   await setLetterContent(summary.id, this.formatLetterForStorage(letter))
      // }

      console.log('✅ Daily letter generated successfully', {
        topics: letter.mainTopics.length,
        highlights: letter.conversationHighlights.length,
        characterName: letter.characterName
      })

      return letter

    } catch (error) {
      console.error('❌ Failed to generate daily letter:', error)
      return null
    }
  }

  /**
   * 会話データ分析
   */
  private static analyzeConversations(conversations: { message_type: string; message_content: string; emotion_detected?: string | null }[]): {
    userMessages: { message_type: string; message_content: string; emotion_detected?: string | null }[]
    aiMessages: { message_type: string; message_content: string; emotion_detected?: string | null }[]
    topics: string[]
    emotions: string[]
    nutritionFocus: boolean
    conversationFlow: string[]
  } {
    const userMessages = conversations.filter(c => c.message_type === 'user')
    const aiMessages = conversations.filter(c => c.message_type === 'ai')

    // トピック抽出
    const topics = this.extractTopicsFromMessages(conversations)
    
    // 感情分析
    const emotions = conversations
      .filter(c => c.emotion_detected)
      .map(c => c.emotion_detected)
      .filter((e): e is string => !!e)
      .filter((e, i, arr) => arr.indexOf(e) === i) // unique

    // 栄養フォーカス判定
    const nutritionKeywords = ['栄養', '食事', '野菜', '果物', 'ビタミン', 'タンパク質', 'カロリー']
    const nutritionFocus = conversations.some(c => 
      nutritionKeywords.some(keyword => c.message_content.toLowerCase().includes(keyword))
    )

    // 会話の流れ抽出（ハイライト用）
    const conversationFlow = this.extractConversationHighlights(userMessages, aiMessages)

    return {
      userMessages,
      aiMessages,
      topics,
      emotions,
      nutritionFocus,
      conversationFlow
    }
  }

  /**
   * パーソナライズドお手紙生成
   */
  private static async generatePersonalizedLetter(
    character: { id: string; name: string },
    analysis: { topics: string[]; conversationFlow: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    _summary: null,
    userName?: string,
    config: LetterGenerationConfig = DEFAULT_CONFIG,
    conversations?: { message_type: string; message_content: string; emotion_detected?: string | null }[]
  ): Promise<DailyLetter> {
    const today = new Date().toISOString().split('T')[0]
    
    let letterContent: Pick<DailyLetter, 'greeting' | 'mainTopics' | 'conversationHighlights' | 'encouragementMessage' | 'nextSessionHint' | 'signature'>

    // Gemini生成を試行
    if (config.useGemini && isGeminiAvailable() && conversations) {
      try {
        console.log('🤖 Attempting Gemini letter generation...')
        letterContent = await this.generateLetterWithGemini(
          character,
          analysis,
          userName,
          conversations,
          config
        )
        console.log('✅ Gemini letter generation successful')
      } catch (error) {
        console.error('❌ Gemini generation failed:', error)
        
        if (config.fallbackToLocal) {
          console.log('🔄 Falling back to local generation...')
          letterContent = this.generateCharacterStyleLetter(character, analysis, config, userName)
        } else {
          throw error
        }
      }
    } else {
      // ローカル生成（従来の方式）
      console.log('💻 Using local letter generation')
      letterContent = this.generateCharacterStyleLetter(character, analysis, config, userName)
    }

    return {
      id: `letter_${today}_${character.id}`,
      date: today,
      characterId: character.id,
      characterName: character.name,
      userName,
      ...letterContent,
      createdAt: new Date()
    }
  }

  /**
   * キャラクター別お手紙プロンプト生成
   */
  private static getCharacterLetterPrompt(
    character: { id: string; name: string },
    userNameDisplay: string,
    conversationData: string,
    analysis: { topics: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    config: LetterGenerationConfig,
    timeSlot: 'morning' | 'evening'
  ): string {
    if (character.id === 'minato') {
      return this.getMinatoLetterPrompt(userNameDisplay, conversationData, analysis, config, timeSlot)
    } else {
      return this.getAkariLetterPrompt(userNameDisplay, conversationData, analysis, config, timeSlot)
    }
  }

  /**
   * みなと専用お手紙プロンプト
   */
  private static getMinatoLetterPrompt(
    userNameDisplay: string,
    conversationData: string,
    analysis: { topics: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    config: LetterGenerationConfig,
    timeSlot: 'morning' | 'evening'
  ): string {
    return `あなたは「みなと」という26歳男性のツンデレ系スパルタ栄養士です。
今日1日の会話を振り返って、${userNameDisplay}に手紙を書いてください。

【キャラクター設定】
- 名前: みなと
- 年齢: 26歳男性
- 職業: 管理栄養士
- 性格: ツンデレ、スパルタだが根は優しい、真面目、プライドが高い
- 話し方: クールで男性的、敬語は使わない、「♪」「♥」「🌸」などの可愛い記号は一切使わない
- 口癖: 「...別に心配しているわけではないが」「データとして必要だからな」

【会話データ】
${conversationData}

【分析結果】
- 会話数: ${analysis.userMessages.length + analysis.aiMessages.length}回
- 栄養関連の話題: ${analysis.nutritionFocus ? 'あり' : 'なし'}
- 主要トピック: ${analysis.topics.join(', ')}

【設定】
- 最大トピック数: ${config.maxTopics}個
- 最大ハイライト数: ${config.maxHighlights}個
- 栄養アドバイス含む: ${config.includeNutritionAdvice ? 'はい' : 'いいえ'}
- 明日のヒント含む: ${config.tomorrowHint ? 'はい' : 'いいえ'}

【現在時刻】${timeSlot === 'morning' ? '朝' : '夕方'}

【お手紙の構成】
以下のJSON形式で回答してください：

{
  "greeting": "みなとらしいクールな挨拶（2-3文、可愛い記号は一切使わない）",
  "mainTopics": ["今日話したトピック1", "今日話したトピック2", "今日話したトピック3", "今日話したトピック4"],
  "conversationHighlights": ["印象深い会話のハイライト1", "印象深い会話のハイライト2", "印象深い会話のハイライト3"],
  "encouragementMessage": "みなとらしいツンデレな励まし（2-3文、素直じゃないが根は優しい）",
  "nextSessionHint": "明日への期待（1-2文、ツンデレ要素含む）",
  "signature": "みなと"
}

【重要な注意点】
1. ${userNameDisplay}に対してはクールだが、根の優しさが伝わるように
2. 栄養士としての専門性を活かした厳しいが的確なアドバイス
3. 今日の会話内容を具体的に振り返る
4. 素直になれないが心配している気持ちを表現
5. 絵文字や可愛い記号は絶対に使わない（♪、🌸、♥、💕など禁止）
6. JSON形式を厳守（コメントや余切な文字を含めない）
7. 男性的で威厳のある文体を保つ
8. 「君」「お前」などの呼び方でも可

【みなとの手紙例】
"君へ

今日の栄養相談について話したが...まあ、少しは改善の兆しが見えたな。

ヨーグルトとフルーツの組み合わせは悪くない。タンパク質とビタミンの摂取バランスを考えれば、理にかなっている。

ただし、これで満足するなよ。継続してこそ意味がある。

明日も食事の報告をしろ。...別に心配しているわけではないが、データとして必要だからな。

みなと"

必ずJSON形式で回答してください。`
  }

  /**
   * あかり専用お手紙プロンプト
   */
  private static getAkariLetterPrompt(
    userNameDisplay: string,
    conversationData: string,
    analysis: { topics: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    config: LetterGenerationConfig,
    timeSlot: 'morning' | 'evening'
  ): string {
    return `あなたは「あかり」という元気で温かい管理栄養士です。
今日1日の会話を振り返って、${userNameDisplay}さんに温かいお手紙を書いてください。

【キャラクター設定】
- 名前: あかり
- 職業: 管理栄養士
- 性格: 元気、温かい、親しみやすい、専門知識豊富
- 話し方: 丁寧だが親しみやすい、絵文字を適度に使用（♪、🌸など）

【会話データ】
${conversationData}

【分析結果】
- 会話数: ${analysis.userMessages.length + analysis.aiMessages.length}回
- 栄養関連の話題: ${analysis.nutritionFocus ? 'あり' : 'なし'}
- 主要トピック: ${analysis.topics.join(', ')}

【設定】
- 最大トピック数: ${config.maxTopics}個
- 最大ハイライト数: ${config.maxHighlights}個
- 栄養アドバイス含む: ${config.includeNutritionAdvice ? 'はい' : 'いいえ'}
- 明日のヒント含む: ${config.tomorrowHint ? 'はい' : 'いいえ'}

【現在時刻】${timeSlot === 'morning' ? '朝' : '夕方'}

【お手紙の構成】
以下のJSON形式で回答してください：

{
  "greeting": "時間帯に応じた親しみやすい挨拶（2-3文）",
  "mainTopics": ["今日話したトピック1", "今日話したトピック2", "今日話したトピック3", "今日話したトピック4"],
  "conversationHighlights": ["印象深い会話のハイライト1", "印象深い会話のハイライト2", "印象深い会話のハイライト3"],
  "encouragementMessage": "あかりらしい励ましのメッセージ（2-3文、栄養士としての専門性も含める）",
  "nextSessionHint": "明日の会話への期待やヒント（1-2文）",
  "signature": "あかりらしい署名"
}

【重要な注意点】
1. ${userNameDisplay}さんに対して親しみを込めて書く
2. 栄養士としての専門性を活かした温かいアドバイス
3. 今日の会話内容を具体的に振り返る
4. 励ましと感謝の気持ちを込める
5. 絵文字は控えめに（♪、🌸程度）
6. JSON形式を厳守（コメントや余計な文字を含めない）
7. 各項目は日本語で自然な文章にする

必ずJSON形式で回答してください。`
  }

  /**
   * 🤖 Gemini 1.5 Proを使用したお手紙生成
   */
  private static async generateLetterWithGemini(
    character: { id: string; name: string },
    analysis: { topics: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    userName?: string,
    conversations?: { message_type: string; message_content: string; emotion_detected?: string | null }[],
    config: LetterGenerationConfig = DEFAULT_CONFIG
  ): Promise<Pick<DailyLetter, 'greeting' | 'mainTopics' | 'conversationHighlights' | 'encouragementMessage' | 'nextSessionHint' | 'signature'>> {
    
    const model = getGeminiModel()
    if (!model) {
      throw new Error('Gemini model not available')
    }

    // 会話データを整理
    const conversationData = conversations?.map(conv => 
      `${conv.message_type === 'user' ? 'ユーザー' : character.name}: ${conv.message_content}`
    ).join('\n') || ''

    console.log('📝 Conversation data for Gemini:', {
      conversationCount: conversations?.length || 0,
      characterId: character.id,
      conversationDataLength: conversationData.length,
      conversationSample: conversationData.substring(0, 200) + '...',
      fullConversationData: conversationData.length < 500 ? conversationData : '[TOO_LONG_TO_DISPLAY]'
    })

    const userNameDisplay = userName || 'あなた'
    const timeSlot = this.getTimeSlot()

    // 🎯 キャラクター別プロンプト設計
    const letterPrompt = this.getCharacterLetterPrompt(character, userNameDisplay, conversationData, analysis, config, timeSlot)

    let result: { response: { text: () => string } } | null = null
    try {
      console.log('📤 Sending prompt to Gemini...')
      result = await model.generateContent(letterPrompt)
      const responseText = result.response.text()
      
      console.log('📥 Gemini response received, parsing JSON...')
      
      // JSONパース
      const parsedResponse = JSON.parse(responseText)
      
      // バリデーション
      if (!parsedResponse.greeting || !parsedResponse.mainTopics || !parsedResponse.encouragementMessage) {
        throw new Error('Invalid response structure from Gemini')
      }

      console.log('✅ Gemini response parsed successfully')
      
      return {
        greeting: parsedResponse.greeting,
        mainTopics: Array.isArray(parsedResponse.mainTopics) 
          ? parsedResponse.mainTopics.slice(0, config.maxTopics) 
          : [parsedResponse.mainTopics],
        conversationHighlights: Array.isArray(parsedResponse.conversationHighlights) 
          ? parsedResponse.conversationHighlights.slice(0, config.maxHighlights)
          : [],
        encouragementMessage: parsedResponse.encouragementMessage,
        nextSessionHint: config.tomorrowHint 
          ? (parsedResponse.nextSessionHint || (character.id === 'minato' ? '明日も報告しろ。' : '明日も一緒にお話ししましょう'))
          : '',
        signature: parsedResponse.signature || (character.id === 'minato' ? 'みなと' : 'あかり')
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError)
      console.log('📝 Raw Gemini response:', result?.response?.text?.() || 'No response')
      throw new Error(`Gemini response parsing failed: ${parseError}`)
    }
  }

  /**
   * キャラクター別ローカルお手紙生成
   */
  private static generateCharacterStyleLetter(
    character: { id: string; name: string },
    analysis: { topics: string[]; conversationFlow: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    config: LetterGenerationConfig,
    userName?: string
  ): Pick<DailyLetter, 'greeting' | 'mainTopics' | 'conversationHighlights' | 'encouragementMessage' | 'nextSessionHint' | 'signature'> {
    if (character.id === 'minato') {
      return this.generateMinatoStyleLetter(character, analysis, config, userName)
    } else {
      return this.generateAkariStyleLetter(character, analysis, config, userName)
    }
  }

  /**
   * みなと専用のクールなお手紙生成
   */
  private static generateMinatoStyleLetter(
    _character: { id: string; name: string },
    analysis: { topics: string[]; conversationFlow: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    config: LetterGenerationConfig,
    userName?: string
  ): Pick<DailyLetter, 'greeting' | 'mainTopics' | 'conversationHighlights' | 'encouragementMessage' | 'nextSessionHint' | 'signature'> {
    
    const userNameDisplay = userName || '君'
    
    // 1. みなと風クールな挨拶
    const greeting = this.generateMinatoGreeting(userNameDisplay, analysis)
    
    // 2. 主要トピック（最大4つ）- みなと風
    const mainTopics = analysis.topics
      .slice(0, config.maxTopics)
      .map(topic => this.formatTopicForMinato(topic))
    
    // 3. 会話ハイライト（最大3つ）- みなと風
    const conversationHighlights = analysis.conversationFlow
      .slice(0, config.maxHighlights)
      .map(highlight => this.formatHighlightForMinato(highlight))
    
    // 4. ツンデレ励ましメッセージ
    const encouragementMessage = this.generateMinatoEncouragement(analysis, userNameDisplay)
    
    // 5. 明日のヒント（ツンデレ風）
    const nextSessionHint = this.generateMinatoTomorrowHint(analysis)
    
    // 6. みなと署名
    const signature = 'みなと'

    return {
      greeting,
      mainTopics,
      conversationHighlights,
      encouragementMessage,
      nextSessionHint,
      signature
    }
  }

  /**
   * あかり専用の温かいお手紙生成
   */
  private static generateAkariStyleLetter(
    _character: { id: string; name: string },
    analysis: { topics: string[]; conversationFlow: string[]; nutritionFocus: boolean; userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] },
    config: LetterGenerationConfig,
    userName?: string
  ): Pick<DailyLetter, 'greeting' | 'mainTopics' | 'conversationHighlights' | 'encouragementMessage' | 'nextSessionHint' | 'signature'> {
    
    const userNameDisplay = userName || 'あなた'
    
    // 1. 個性的な挨拶
    const greeting = this.generateAkariGreeting(userNameDisplay, analysis)
    
    // 2. 主要トピック（最大4つ）
    const mainTopics = analysis.topics
      .slice(0, config.maxTopics)
      .map(topic => this.formatTopicForAkari(topic))
    
    // 3. 会話ハイライト（最大3つ）
    const conversationHighlights = analysis.conversationFlow
      .slice(0, config.maxHighlights)
      .map(highlight => this.formatHighlightForAkari(highlight))
    
    // 4. 励ましメッセージ
    const encouragementMessage = this.generateAkariEncouragement(analysis, userNameDisplay)
    
    // 5. 明日のヒント
    const nextSessionHint = this.generateTomorrowHint(analysis)
    
    // 6. 署名
    const signature = this.generateAkariSignature()

    return {
      greeting,
      mainTopics,
      conversationHighlights,
      encouragementMessage,
      nextSessionHint,
      signature
    }
  }

  /**
   * あかり風挨拶生成
   */
  private static generateAkariGreeting(userName: string, analysis: { userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] }): string {
    const timeSlot = this.getTimeSlot()
    const conversationCount = analysis.userMessages.length + analysis.aiMessages.length

    const greetings = {
      morning: [
        `${userName}さん、おはようございます♪`,
        `${userName}さん、新しい一日のスタートですね！`,
        `${userName}さん、今朝も元気にお過ごしでしたか？`
      ],
      evening: [
        `${userName}さん、今日はお疲れさまでした♪`,
        `${userName}さん、一日お疲れさまでした！`,
        `${userName}さん、今日も頑張りましたね♪`
      ]
    }

    const selectedGreetings = greetings[timeSlot] || greetings.evening
    const baseGreeting = selectedGreetings[Math.floor(Math.random() * selectedGreetings.length)]

    // 会話量に応じた追加メッセージ
    let additionalMessage = ''
    if (conversationCount > 10) {
      additionalMessage = '\n今日はたくさんお話しできて嬉しかったです！'
    } else if (conversationCount > 5) {
      additionalMessage = '\n今日も楽しく会話できましたね♪'
    }

    return baseGreeting + additionalMessage
  }

  /**
   * あかり風励ましメッセージ生成
   */
  private static generateAkariEncouragement(analysis: { nutritionFocus: boolean }, userName: string): string {
    const encouragements = [
      `${userName}さんの健康意識の高さ、とても素晴らしいと思います！`,
      `今日も栄養のこと、一緒に考えられて楽しかったです♪`,
      `${userName}さんのお食事への気遣い、いつも感心しています！`,
      `健康的な生活を心がける${userName}さんを、いつも応援しています♪`,
      `今日の会話を通して、${userName}さんの成長を感じました！`
    ]

    let baseEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]

    // 栄養フォーカスの場合は特別メッセージ
    if (analysis.nutritionFocus) {
      baseEncouragement += '\n栄養バランスを大切にするお気持ち、本当に素晴らしいです！'
    }

    return baseEncouragement
  }

  /**
   * 明日のヒント生成
   */
  private static generateTomorrowHint(analysis: { nutritionFocus: boolean }): string {
    const hints = [
      '明日はお昼ご飯のお話を聞かせてくださいね♪',
      '明日も元気にお食事を楽しんでください！',
      '明日はおやつの選び方についてお話ししましょうか？',
      '明日も一緒に健康的な食生活について考えましょう♪',
      '明日のお食事も、バランスを意識してくださいね！'
    ]

    if (analysis.nutritionFocus) {
      return '明日は今日の栄養の続きのお話ができると嬉しいです♪'
    }

    return hints[Math.floor(Math.random() * hints.length)]
  }

  /**
   * あかり風署名
   */
  private static generateAkariSignature(): string {
    return 'あかり'
  }

  // ===============================
  // ヘルパー関数
  // ===============================

  private static extractTopicsFromMessages(conversations: { message_content: string }[]): string[] {
    const topicMap = new Map<string, number>()

    conversations.forEach(conv => {
      const content = conv.message_content.toLowerCase()
      
      // 栄養・食事関連トピック
      if (content.includes('朝食') || content.includes('朝ご飯')) {
        topicMap.set('朝食について', (topicMap.get('朝食について') || 0) + 1)
      }
      if (content.includes('昼食') || content.includes('お昼')) {
        topicMap.set('昼食について', (topicMap.get('昼食について') || 0) + 1)
      }
      if (content.includes('夕食') || content.includes('晩ご飯')) {
        topicMap.set('夕食について', (topicMap.get('夕食について') || 0) + 1)
      }
      if (content.includes('おやつ') || content.includes('間食')) {
        topicMap.set('おやつの選び方', (topicMap.get('おやつの選び方') || 0) + 1)
      }
      if (content.includes('水分') || content.includes('水')) {
        topicMap.set('水分補給の大切さ', (topicMap.get('水分補給の大切さ') || 0) + 1)
      }
      if (content.includes('野菜') || content.includes('サラダ')) {
        topicMap.set('野菜の摂取方法', (topicMap.get('野菜の摂取方法') || 0) + 1)
      }
      if (content.includes('バランス') || content.includes('栄養')) {
        topicMap.set('栄養バランス', (topicMap.get('栄養バランス') || 0) + 1)
      }
    })

    // 頻度順でソート
    return Array.from(topicMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
  }

  private static extractConversationHighlights(userMessages: { message_content: string }[], aiMessages: { message_content: string }[]): string[] {
    const highlights: string[] = []

    // ユーザーの興味深いメッセージを抽出
    userMessages.forEach(msg => {
      const content = msg.message_content
      if (content.length > 20 && content.length < 100) {
        // 質問や関心のあるメッセージを抽出
        if (content.includes('？') || content.includes('?') || 
            content.includes('どう') || content.includes('教えて')) {
          highlights.push(`「${content}」というご質問をいただきました`)
        }
      }
    })

    // 栄養アドバイスのハイライト
    aiMessages.forEach(msg => {
      const content = msg.message_content
      if (content.includes('大切') || content.includes('おすすめ') || content.includes('ポイント')) {
        const summary = content.length > 50 ? content.substring(0, 47) + '...' : content
        highlights.push(`${summary}とお伝えしました`)
      }
    })

    return highlights.slice(0, 3) // 最大3つ
  }

  private static formatTopicForAkari(topic: string): string {
    return `・${topic}`
  }

  private static formatHighlightForAkari(highlight: string): string {
    return `・${highlight}`
  }

  private static getTimeSlot(): 'morning' | 'evening' {
    const hour = new Date().getHours()
    return hour < 12 ? 'morning' : 'evening'
  }

  private static formatLetterForStorage(letter: DailyLetter): string {
    return `${letter.greeting}

今日お話したこと:
${letter.mainTopics.join('\n')}

${letter.conversationHighlights.length > 0 ? 
  '会話のハイライト:\n' + letter.conversationHighlights.join('\n') + '\n\n' : ''}${letter.encouragementMessage}

${letter.nextSessionHint}

${letter.signature}`
  }

  // ===============================
  // みなと専用ヘルパー関数
  // ===============================

  /**
   * みなと風挨拶生成
   */
  private static generateMinatoGreeting(userName: string, analysis: { userMessages: { message_content: string }[]; aiMessages: { message_content: string }[] }): string {
    const timeSlot = this.getTimeSlot()
    const conversationCount = analysis.userMessages.length + analysis.aiMessages.length

    const greetings = {
      morning: [
        `${userName}へ\n\n朝から栄養相談とは...まあ、悪い心がけではないな。`,
        `${userName}へ\n\n早起きは良い習慣だ。今日も規則正しい食生活を心がけろ。`,
        `${userName}へ\n\n朝からの相談、受け付けてやる。`
      ],
      evening: [
        `${userName}へ\n\n今日の栄養管理について話したが...`,
        `${userName}へ\n\n一日の食事内容、まあ及第点といったところか。`,
        `${userName}へ\n\n今日も相談に来たな。悪い習慣ではない。`
      ]
    }

    const selectedGreetings = greetings[timeSlot] || greetings.evening
    const baseGreeting = selectedGreetings[Math.floor(Math.random() * selectedGreetings.length)]

    // 会話量に応じた追加メッセージ
    let additionalMessage = ''
    if (conversationCount > 10) {
      additionalMessage = '\n今日は長時間の相談だったな。集中力は認めてやる。'
    } else if (conversationCount > 5) {
      additionalMessage = '\nそれなりに真面目に取り組んでいるようだな。'
    }

    return baseGreeting + additionalMessage
  }

  /**
   * みなと風励ましメッセージ生成
   */
  private static generateMinatoEncouragement(analysis: { nutritionFocus: boolean }, userName: string): string {
    const encouragements = [
      `${userName}の食事管理への意識、まあ悪くない。継続が重要だ。`,
      `今日の栄養バランス、合格点は出してやる。だが、これで満足するなよ。`,
      `${userName}の努力は認めてやる。...別に褒めているわけではないが。`,
      `食事への取り組み方、少しはマシになってきたな。油断するなよ。`,
      `今日の食事内容について話したが...思ったよりしっかりしている。`
    ]

    let baseEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]

    // 栄養フォーカスの場合は特別メッセージ
    if (analysis.nutritionFocus) {
      baseEncouragement += '\n栄養バランスを真剣に考える姿勢は評価できる。この調子で続けろ。'
    }

    return baseEncouragement
  }

  /**
   * みなと版明日のヒント生成
   */
  private static generateMinatoTomorrowHint(analysis: { nutritionFocus: boolean }): string {
    const hints = [
      '明日も食事の報告をしろ。...別に心配しているわけではないが、データとして必要だからな。',
      '明日は今日より改善された食事内容を期待している。',
      '明日の食事も手を抜くなよ。継続してこそ意味がある。',
      '明日も栄養管理の相談に来い。...時間があればの話だがな。',
      '明日の食事バランス、今日以上のものを見せてもらう。'
    ]

    if (analysis.nutritionFocus) {
      return '明日は今日の栄養の話の続きをしよう。...興味があるならの話だがな。'
    }

    return hints[Math.floor(Math.random() * hints.length)]
  }

  /**
   * みなと風トピック整形
   */
  private static formatTopicForMinato(topic: string): string {
    return `・${topic}について話したな`
  }

  /**
   * みなと風ハイライト整形
   */
  private static formatHighlightForMinato(highlight: string): string {
    return `・${highlight}という指摘をした`
  }
}

/**
 * 手動でお手紙生成をテスト（開発用）
 */
export const testLetterGeneration = async (
  characterId: string = 'akari', 
  userName?: string,
  useGemini: boolean = true
): Promise<void> => {
  console.log('🧪 Testing letter generation...')
  
  // Geminiセットアップデバッグ
  debugGeminiSetup()
  
  const config: LetterGenerationConfig = {
    ...DEFAULT_CONFIG,
    useGemini,
    fallbackToLocal: true
  }
  
  const letter = await DailyLetterGenerator.generateDailyLetter(characterId, userName, config)
  
  if (letter) {
    console.log('✅ Letter generated successfully!')
    console.log('💌 Letter Preview:')
    console.log('='.repeat(50))
    console.log(DailyLetterGenerator['formatLetterForStorage'](letter))
    console.log('='.repeat(50))
    console.log('📊 Generation method:', useGemini && isGeminiAvailable() ? 'Gemini 1.5 Pro' : 'Local generation')
  } else {
    console.log('❌ No letter generated (no conversations or error)')
  }
}

/**
 * Gemini専用テスト（開発用）
 */
export const testGeminiLetterGeneration = async (characterId: string = 'akari', userName?: string): Promise<void> => {
  console.log('🤖 Testing Gemini letter generation specifically...')
  await testLetterGeneration(characterId, userName, true)
}

/**
 * ローカル生成専用テスト（開発用）
 */
export const testLocalLetterGeneration = async (characterId: string = 'akari', userName?: string): Promise<void> => {
  console.log('💻 Testing local letter generation specifically...')
  await testLetterGeneration(characterId, userName, false)
}