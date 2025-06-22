import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'
import { characters } from '@/lib/characters'
import { getCharacterPersonality } from '@/lib/character-personalities'
import { userMemoryManager } from '@/lib/user-memory'
import { createLINEStylePrompt } from '@/lib/response-length-manager'
import { createClient } from '@supabase/supabase-js'
import { createPersonalizedPrompt } from '@/lib/character-prompts'
import { Database } from '@/lib/database.types'

// ユーザープロフィール型定義
interface UserProfileInfo {
  age_group?: string | null
  goal_type?: string | null
  activity_level_jp?: string | null
  meal_timing?: string | null
  cooking_frequency?: string | null
  main_concern?: string | null
  advice_style?: string | null
  info_preference?: string | null
  profile_completed?: boolean | null
}

// 個性分析関数
function analyzeUserMessage(message: string): {
  emotion: 'positive' | 'negative' | 'neutral' | 'confused'
  topics: string[]
  isFirstTime: boolean
  needsSupport: boolean
  isResistant: boolean
  requestsDetails: boolean
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

  // 詳細要求の検出
  const detailTriggers = [
    '詳しく', '詳細', 'くわしく', 'もっと', 'さらに', 'なぜ', 'どうして',
    'どのように', 'どうやって', '方法', '理由', '原因', '具体的', '教えて'
  ]
  const requestsDetails = detailTriggers.some(trigger => lowerMessage.includes(trigger))

  return {
    emotion,
    topics,
    isFirstTime: lowerMessage.includes('初めて') || lowerMessage.includes('はじめ'),
    needsSupport: lowerMessage.includes('助け') || lowerMessage.includes('サポート') || lowerMessage.includes('頑張'),
    isResistant: lowerMessage.includes('でも') || lowerMessage.includes('けど') || lowerMessage.includes('やりたくない'),
    requestsDetails
  }
}

// ユーザープロフィール情報を取得
async function getUserProfileInfo(userId: string): Promise<Database['public']['Tables']['user_profiles']['Row'] | null> {
  try {
    // Service Key使用でRLS回避
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient<Database>(supabaseUrl, serviceKey)
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.log('Profile not found for user:', userId)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// エンハンスされたプロンプト生成（新しい個別化システム使用）
async function createEnhancedPrompt(
  character: { id: string; name: string },
  userMessage: string,
  conversationHistory: string[],
  userAnalysis: { emotion: string; topics: string[]; needsSupport: boolean; isResistant: boolean; requestsDetails: boolean },
  relationshipLevel: number,
  userId: string
): Promise<string> {
  console.log('🎯 Creating enhanced personalized prompt for:', character.id)
  
  // ユーザープロフィール情報を取得
  const userProfile = await getUserProfileInfo(userId)
  console.log('📋 User profile status:', userProfile ? 'Found' : 'Not found')
  
  // 新しい個別化プロンプトシステムを使用
  const personalizedPrompt = createPersonalizedPrompt({
    userProfile,
    userName: 'ユーザー', // 実際のユーザー名があれば使用
    characterId: character.id
  })
  
  // LINEスタイルのコンテキスト作成
  const context = {
    messageCount: conversationHistory.length,
    lastMessages: conversationHistory.slice(-3),
    userRequestedDetails: userAnalysis.requestsDetails,
    currentTopic: userAnalysis.topics[0] || null,
    relationshipLevel
  }
  
  // 追加のコンテキスト情報
  const additionalContext = `

【現在の会話状況】
- 関係性レベル: ${relationshipLevel}/3
- ユーザー感情: ${userAnalysis.emotion}
- 話題: ${userAnalysis.topics.join(', ') || 'なし'}
- サポートが必要: ${userAnalysis.needsSupport ? 'はい' : 'いいえ'}
- 詳細を求めている: ${userAnalysis.requestsDetails ? 'はい' : 'いいえ'}

【今回のメッセージ】
${userMessage}

上記を踏まえて、あなたのキャラクターに忠実に、かつユーザーの状況に最適化した返答をしてください。`

  return personalizedPrompt + additionalContext
}

export async function POST(request: NextRequest) {
  console.log('🎭 Enhanced Chat API with Phase 6.1 personalized prompts');
  
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

    // エンハンスされたプロンプトを生成
    const enhancedPrompt = await createEnhancedPrompt(
      character,
      message,
      conversationHistory || [],
      userAnalysis,
      relationshipLevel,
      userId
    )

    console.log('📝 Phase 6.1 personalized prompt created for', character.name, {
      hasProfile: !!userProfile,
      profileCompleted: userProfile?.profile_completed || false,
      promptLength: enhancedPrompt.length
    })

    // ユーザープロフィールをローカル変数に保存（後で使用）
    const userProfile = await getUserProfileInfo(userId)
    
    // Gemini APIを使用してレスポンスを生成
    const response = await generateResponse(character, enhancedPrompt, [])
    
    console.log('🎯 Phase 6.1 Response generated:', {
      characterId,
      responseLength: response.length,
      relationshipLevel,
      userEmotion: userAnalysis.emotion,
      hasUserProfile: !!userProfile,
      personalizedResponse: userProfile?.profile_completed || false
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

    // Phase 6.1: 個別化された応答と追加情報
    const enhancedResponse = {
      response,
      characterPersonality: {
        relationshipLevel,
        emotionalState: userAnalysis.emotion,
        topics: userAnalysis.topics,
        specialResponse: userAnalysis.isResistant ? 'resistant' : 
                        userAnalysis.needsSupport ? 'supportive' : 'normal'
      },
      personalization: {
        hasProfile: !!userProfile,
        profileCompleted: userProfile?.profile_completed || false,
        goalType: userProfile?.goal_type || null,
        adviceStyle: userProfile?.advice_style || null,
        mainConcern: userProfile?.main_concern || null
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