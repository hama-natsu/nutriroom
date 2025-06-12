import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'
import { characters } from '@/lib/characters'
import { getCharacterPersonality } from '@/lib/character-personalities'
import { userMemoryManager } from '@/lib/user-memory'

// 個性分析関数
function analyzeUserMessage(message: string): {
  emotion: 'positive' | 'negative' | 'neutral' | 'confused'
  topics: string[]
  isFirstTime: boolean
  needsSupport: boolean
  isResistant: boolean
} {
  const lowerMessage = message.toLowerCase()
  
  // 感情分析
  let emotion: 'positive' | 'negative' | 'neutral' | 'confused' = 'neutral'
  if (lowerMessage.includes('嬉しい') || lowerMessage.includes('ありがとう') || lowerMessage.includes('良い')) {
    emotion = 'positive'
  } else if (lowerMessage.includes('困') || lowerMessage.includes('悩') || lowerMessage.includes('難しい')) {
    emotion = 'confused'
  } else if (lowerMessage.includes('やだ') || lowerMessage.includes('嫌') || lowerMessage.includes('無理')) {
    emotion = 'negative'
  }

  // トピック分析
  const topics: string[] = []
  if (lowerMessage.includes('ダイエット') || lowerMessage.includes('痩せ')) topics.push('ダイエット')
  if (lowerMessage.includes('筋トレ') || lowerMessage.includes('運動')) topics.push('運動')
  if (lowerMessage.includes('食事') || lowerMessage.includes('料理')) topics.push('食事')
  if (lowerMessage.includes('栄養') || lowerMessage.includes('ビタミン')) topics.push('栄養')
  if (lowerMessage.includes('健康')) topics.push('健康')

  return {
    emotion,
    topics,
    isFirstTime: lowerMessage.includes('初めて') || lowerMessage.includes('はじめ'),
    needsSupport: lowerMessage.includes('助け') || lowerMessage.includes('サポート') || lowerMessage.includes('頑張'),
    isResistant: lowerMessage.includes('でも') || lowerMessage.includes('けど') || lowerMessage.includes('やりたくない')
  }
}

// エンハンスされたプロンプト生成
function createEnhancedPrompt(
  character: { id: string; name: string },
  userMessage: string,
  conversationHistory: string[],
  userAnalysis: { emotion: string; topics: string[]; needsSupport: boolean; isResistant: boolean },
  relationshipLevel: number,
  recentTopics: string[]
): string {
  const personality = getCharacterPersonality(character.id)
  if (!personality) return ''

  const relationshipStage = relationshipLevel <= 0 ? 'stranger' : 
                           relationshipLevel <= 1 ? 'acquaintance' :
                           relationshipLevel <= 2 ? 'friend' : 'close'

  return `あなたは${character.name}です。以下の詳細な個性で応答してください。

【基本個性】
${personality.detailedPersonality}

【専門分野】
${personality.expertise.specialty}
アプローチ: ${personality.expertise.approach}

【現在の関係性】
レベル: ${relationshipLevel} (${relationshipStage})
関係性の特徴: ${personality.relationshipStages[relationshipStage as keyof typeof personality.relationshipStages].tone}

【ユーザー分析】
感情状態: ${userAnalysis.emotion}
話題: ${userAnalysis.topics.join(', ')}
サポートが必要: ${userAnalysis.needsSupport ? 'はい' : 'いいえ'}
抵抗感あり: ${userAnalysis.isResistant ? 'はい' : 'いいえ'}

【会話履歴】
${conversationHistory.slice(-5).join('\n')}

【最近の話題】
${recentTopics.join(', ')}

【応答指示】
1. ${character.name}の個性を活かした自然な応答
2. 関係性レベル${relationshipLevel}に適した話し方
3. ユーザーの感情(${userAnalysis.emotion})に配慮
4. 専門知識を個性的に表現
5. 150文字以内で簡潔に

ユーザーメッセージ: "${userMessage}"

${character.name}として、あなたらしく応答してください。`
}

export async function POST(request: NextRequest) {
  console.log('🎭 Enhanced Chat API with personality system');
  
  // デバッグ情報
  const debugInfo = {
    apiKeyExists: !!process.env.GOOGLE_AI_API_KEY,
    isPlaceholder: process.env.GOOGLE_AI_API_KEY?.includes('your_google_ai_api_key') || false,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  try {
    const { characterId, message, conversationHistory, userId = 'default-user' } = await request.json()

    console.log('🎭 Enhanced request data:', {
      characterId,
      messageLength: message?.length || 0,
      historyLength: conversationHistory?.length || 0,
      userId
    });

    // 入力バリデーション
    if (!characterId || !message) {
      return NextResponse.json(
        { error: 'キャラクターIDとメッセージは必須です' },
        { status: 400 }
      )
    }

    // キャラクターを取得
    const character = characters.find(c => c.id === characterId);
    if (!character) {
      return NextResponse.json(
        { error: 'キャラクターが見つかりません' },
        { status: 404 }
      );
    }

    // ユーザーメモリーの初期化または取得
    let userMemory = userMemoryManager.getUserMemory(userId)
    if (!userMemory) {
      userMemory = userMemoryManager.initializeUser(userId)
      console.log('👤 New user initialized:', userId)
    }

    // ユーザーメッセージの分析
    const userAnalysis = analyzeUserMessage(message)
    console.log('🧠 User analysis:', userAnalysis)

    // 関係性レベルの取得
    const relationshipLevel = userMemoryManager.getRelationshipLevel(userId, characterId)
    console.log('💝 Relationship level:', relationshipLevel)

    // 最近の会話からトピックを抽出
    const recentConversations = userMemoryManager.getRecentConversations(userId, characterId, 5)
    const recentTopics = recentConversations.flatMap(c => c.topics).slice(0, 10)

    // エンハンスされたプロンプトを生成
    const enhancedPrompt = createEnhancedPrompt(
      character,
      message,
      conversationHistory || [],
      userAnalysis,
      relationshipLevel,
      recentTopics
    )

    console.log('📝 Enhanced prompt created for', character.name)

    // Gemini APIを使用してレスポンスを生成
    const response = await generateResponse(character, enhancedPrompt, [])
    
    console.log('🎯 Response generated:', {
      characterId,
      responseLength: response.length,
      relationshipLevel,
      userEmotion: userAnalysis.emotion
    });

    // 会話をメモリーに記録
    const context = userAnalysis.isFirstTime ? 'greeting' : 
                   userAnalysis.needsSupport ? 'advice' : 'casual'
    
    const outcome = userAnalysis.emotion === 'positive' ? 'successful' :
                   userAnalysis.emotion === 'negative' ? 'resistant' :
                   userAnalysis.emotion === 'confused' ? 'unclear' : 'helpful'

    userMemoryManager.addConversation(
      userId,
      characterId,
      message,
      response,
      context,
      userAnalysis.emotion,
      outcome,
      userAnalysis.topics
    )

    // ユーザーの好みを学習
    userMemoryManager.learnUserPreferences(userId, characterId, userAnalysis.topics, outcome)

    // 個性強化された応答と追加情報
    const enhancedResponse = {
      response,
      characterPersonality: {
        relationshipLevel,
        emotionalState: userAnalysis.emotion,
        topics: userAnalysis.topics,
        specialResponse: userAnalysis.isResistant ? 'resistant' : 
                        userAnalysis.needsSupport ? 'supportive' : 'normal'
      },
      memoryStats: userMemoryManager.getMemoryStats(userId)
    }

    return NextResponse.json({
      ...enhancedResponse,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          ...debugInfo,
          success: true,
          userAnalysis,
          relationshipLevel,
          recentTopics,
          promptLength: enhancedPrompt.length
        }
      })
    })
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string; code?: string };
    
    console.error('❌ Enhanced Chat API Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      timestamp: new Date().toISOString()
    });
    
    let errorMessage = 'チャット処理中にエラーが発生しました';
    let statusCode = 500;
    
    if (err.message?.includes('API_KEY')) {
      errorMessage = 'APIキーの設定に問題があります';
      statusCode = 401;
    } else if (err.message?.includes('QUOTA')) {
      errorMessage = 'API利用量の上限に達しました';
      statusCode = 429;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            ...debugInfo,
            success: false,
            errorMessage: err.message,
            errorStack: err.stack?.substring(0, 500)
          }
        })
      },
      { status: statusCode }
    )
  }
}