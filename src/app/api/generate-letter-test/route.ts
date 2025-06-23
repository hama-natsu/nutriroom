// 🎯 NutriRoom Phase 6.1: お手紙システムテスト機能
// 開発者用手動お手紙生成API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DailyLetterGenerator } from '@/lib/letter-generator'
import { Database } from '@/lib/database.types'

// Service Key使用でRLS回避
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface LetterTestRequest {
  characterId: 'akari' | 'minato'
  userId?: string
  forceGenerate?: boolean
  includeDebugInfo?: boolean
}

interface LetterTestResponse {
  success: boolean
  letter?: {
    content: string
    characterId: string
    generatedAt: string
    wordCount: number
  }
  conversationSummary?: {
    todayMessages: number
    lastActivity: string | null
    topics: string[]
  }
  debugInfo?: {
    hasUserProfile: boolean
    conversationExists: boolean
    generationTime: number
    geminiUsed: boolean
  }
  databaseSaved?: boolean
  savedLetterId?: string | null
  error?: string
}

// 会話履歴の詳細取得（修正版）
async function getDetailedConversationSummary(userId: string, characterId: string) {
  console.log('=== 会話履歴取得開始 ===')
  console.log('ユーザーID:', userId.substring(0, 8) + '...')
  console.log('キャラクターID:', characterId)
  
  const supabase = createClient<Database>(supabaseUrl, serviceKey)
  const today = new Date().toISOString().split('T')[0]
  console.log('対象日:', today)
  
  try {
    // 直接conversation_logsから今日の会話を取得
    const { data: conversations, error } = await supabase
      .from('conversation_logs')
      .select('message_content, message_type, created_at, session_id')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: true })
    
    console.log('取得された会話数:', conversations?.length || 0)
    
    if (error) {
      console.error('❌ 会話ログ取得エラー:', error)
      return createEmptyConversationSummary()
    }
    
    if (!conversations || conversations.length === 0) {
      console.log('⚠️ 今日の会話データが存在しません')
      // テスト用の仮想会話データを生成
      return createTestConversationData(characterId)
    }
    
    console.log('会話内容サンプル:', conversations.slice(0, 2).map(c => ({
      type: c.message_type,
      content: c.message_content.substring(0, 50) + '...',
      time: c.created_at
    })))
    
    // 会話要約を作成
    const summary = createConversationSummary(conversations)
    console.log('会話要約完了:', summary)
    
    return summary
    
  } catch (error) {
    console.error('❌ 会話履歴取得エラー:', error)
    return createEmptyConversationSummary()
  }
}

// 会話要約作成関数
function createConversationSummary(conversations: Array<{message_type: string, message_content: string, created_at: string}>) {
  console.log('会話要約生成開始:', conversations.length, '件の会話')
  
  const userMessages = conversations
    .filter(conv => conv.message_type === 'user')
    .map(conv => conv.message_content)
    .slice(0, 5) // 最新5件のユーザーメッセージ
  
  const aiResponses = conversations
    .filter(conv => conv.message_type === 'assistant' || conv.message_type === 'ai')
    .map(conv => conv.message_content)
    .slice(-3) // 最新3件のAI回答
  
  console.log('ユーザーメッセージ数:', userMessages.length)
  console.log('ユーザーメッセージサンプル:', userMessages.slice(0, 2).map(m => m.substring(0, 30) + '...'))
  console.log('AI回答数:', aiResponses.length)
  console.log('AI回答サンプル:', aiResponses.slice(0, 2).map(m => m.substring(0, 30) + '...'))
  
  // トピック抽出
  const topics = extractTopics(conversations)
  
  return {
    todayMessages: conversations.length,
    lastActivity: conversations[conversations.length - 1]?.created_at || null,
    topics,
    userMessages: userMessages.join('. '),
    aiResponses: aiResponses.join('. '),
    conversationCount: conversations.length,
    hasRealConversation: true
  }
}

// テスト用会話データ生成
function createTestConversationData(characterId: string) {
  console.log('🧪 テスト用会話データを生成中...')
  
  const testData = characterId === 'minato' ? {
    todayMessages: 4,
    lastActivity: new Date().toISOString(),
    topics: ['食事', '運動'],
    userMessages: '最近太ってきて困っています. どんな運動をすればいいですか. 食事で気をつけることはありますか',
    aiResponses: 'ふん、まあいいだろう...まずは食事記録をつけろ. 運動なら筋トレから始めるのが効率的だ. 別に君のためじゃないが、継続が重要だからな',
    conversationCount: 4,
    hasRealConversation: false
  } : {
    todayMessages: 3,
    lastActivity: new Date().toISOString(),
    topics: ['栄養', '食事'],
    userMessages: 'バランスの良い食事について教えてください. ビタミンが足りているか心配です',
    aiResponses: '栄養バランスを考えた食事、素晴らしいですね♪ 野菜をたくさん摂って、タンパク質も忘れずに！ 一緒に頑張りましょう',
    conversationCount: 3,
    hasRealConversation: false
  }
  
  console.log('🧪 テストデータ生成完了:', testData)
  return testData
}

// 空の会話要約
function createEmptyConversationSummary() {
  return {
    todayMessages: 0,
    lastActivity: null,
    topics: [],
    userMessages: '',
    aiResponses: '',
    conversationCount: 0,
    hasRealConversation: false
  }
}

// トピック抽出関数
function extractTopics(conversations: Array<{message_type: string, message_content: string}>) {
  const topics: string[] = []
  conversations.forEach(conv => {
    if (conv.message_type === 'user') {
      const message = conv.message_content.toLowerCase()
      if (message.includes('食事') || message.includes('料理')) topics.push('食事')
      if (message.includes('運動') || message.includes('トレーニング')) topics.push('運動')
      if (message.includes('体重') || message.includes('ダイエット')) topics.push('体重管理')
      if (message.includes('栄養') || message.includes('ビタミン')) topics.push('栄養')
      if (message.includes('健康')) topics.push('健康')
    }
  })
  return [...new Set(topics)]
}

export async function POST(request: NextRequest) {
  console.log('🧪 ========== LETTER TEST GENERATION START ==========')
  
  const startTime = Date.now()
  
  try {
    // リクエスト解析
    const body: LetterTestRequest = await request.json()
    const { 
      characterId = 'akari', 
      userId, 
      forceGenerate = true,
      includeDebugInfo = true 
    } = body
    
    console.log('🧪 Test generation request:', {
      characterId,
      hasUserId: !!userId,
      forceGenerate,
      includeDebugInfo
    })
    
    // ユーザーID確認（認証からの取得も対応）
    let targetUserId = userId
    if (!targetUserId) {
      // 認証ヘッダーからユーザーID取得（仮実装）
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        // 実際の認証処理は省略
        console.log('🔑 Auth header found, but using test user for now')
      }
      targetUserId = 'test-user-' + Date.now()
      console.log('⚠️ No userId provided, using test user:', targetUserId)
    }
    
    // 会話履歴の詳細取得
    const conversationSummary = await getDetailedConversationSummary(targetUserId, characterId)
    console.log('🔍 会話履歴取得結果:', {
      messageCount: conversationSummary.todayMessages,
      hasRealConversation: conversationSummary.hasRealConversation,
      topics: conversationSummary.topics,
      userMessagesLength: conversationSummary.userMessages?.length || 0,
      aiResponsesLength: conversationSummary.aiResponses?.length || 0
    })
    
    // デバッグ情報収集
    let debugInfo = undefined
    if (includeDebugInfo) {
      const supabase = createClient<Database>(supabaseUrl, serviceKey)
      
      // ユーザープロフィール確認
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_completed')
        .eq('user_id', targetUserId)
        .single()
      
      debugInfo = {
        hasUserProfile: !!profile?.profile_completed,
        conversationExists: conversationSummary.todayMessages > 0,
        generationTime: 0, // 後で更新
        geminiUsed: false // 後で更新
      }
    }
    
    // お手紙生成実行
    console.log('🧪 Starting letter generation...')
    const generationStart = Date.now()
    
    let letter
    let geminiUsed = false
    
    try {
      // 実際のGemini APIを使用してお手紙生成（改善版）
      console.log('=== お手紙生成プロセス開始 ===')
      console.log('🔄 お手紙生成に使用する会話データ:')
      console.log('- メッセージ数:', conversationSummary.todayMessages)
      console.log('- 実際の会話:', conversationSummary.hasRealConversation ? 'あり' : 'テストデータ')
      console.log('- ユーザーメッセージ:', conversationSummary.userMessages?.substring(0, 100) || 'なし')
      console.log('- AIレスポンス:', conversationSummary.aiResponses?.substring(0, 100) || 'なし')
      
      // Gemini API 設定確認
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                     process.env.GEMINI_API_KEY || 
                     process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
                     process.env.GOOGLE_AI_API_KEY
      
      console.log('🔍 Gemini API設定確認:')
      console.log('- API Key存在:', !!apiKey)
      console.log('- API Key長:', apiKey?.length || 0)
      console.log('- プレースホルダーか:', apiKey?.includes('your_') || false)
      
      if (!apiKey || apiKey.includes('your_')) {
        console.warn('⚠️ Gemini API Key not properly configured - using enhanced fallback')
        throw new Error('Gemini API Key not configured')
      }
      
      letter = await DailyLetterGenerator.generateDailyLetter(
        characterId,
        'テストユーザー', // userName
        targetUserId
      )
      
      if (!letter) {
        throw new Error('Letter generation returned null')
      }
      
      geminiUsed = true
      console.log('✅ Letter generation successful:', {
        greeting: letter.greeting?.substring(0, 30) + '...',
        topicsCount: letter.mainTopics?.length || 0,
        signature: letter.signature
      })
    } catch (geminiError) {
      console.warn('⚠️ Gemini generation failed, using fallback:', geminiError)
      
      // フォールバック：会話内容を反映したテスト用お手紙
      console.log('🔄 フォールバック生成中 - 会話データを反映します')
      
      let fallbackContent: string
      if (characterId === 'minato') {
        if (conversationSummary.hasRealConversation && conversationSummary.userMessages) {
          // 実際の会話がある場合
          fallbackContent = `テストユーザーへ\n\n今日の相談について話したが...${conversationSummary.todayMessages}件のやりとりがあったな。\n\n「${conversationSummary.userMessages.split('.')[0]}」という話をしていたが、まあ悪くない取り組みだ。\n\n別に心配しているわけではないが...継続することが重要だからな。\n\nみなと`
        } else {
          // テストデータの場合
          const testTopics = conversationSummary.topics.join('、') || '栄養管理'
          fallbackContent = `テストユーザーへ\n\n今日は${testTopics}について話したな。\n\n「${conversationSummary.userMessages?.split('.')[0] || '最近太ってきて困っています'}」という相談だったが、まあ真面目に取り組んでいるようだな。\n\n継続してこそ意味がある。明日も報告しろ。\n\nみなと`
        }
      } else {
        if (conversationSummary.hasRealConversation && conversationSummary.userMessages) {
          // 実際の会話がある場合
          fallbackContent = `テストユーザーさん♪\n\n今日は${conversationSummary.todayMessages}件もお話しできて嬉しかったです！\n\n「${conversationSummary.userMessages.split('.')[0]}」というお話、とても素晴らしい取り組みですね。\n\n明日も一緒に頑張りましょう〜\n\nあかり`
        } else {
          // テストデータの場合
          const testTopics = conversationSummary.topics.join('、') || '栄養バランス'
          fallbackContent = `テストユーザーさん♪\n\n今日は${testTopics}についてお話しできて嬉しかったです！\n\n「${conversationSummary.userMessages?.split('.')[0] || 'バランスの良い食事について教えてください'}」というご質問、とても良い意識ですね。\n\n明日も一緒にお話ししましょう♪\n\nあかり`
        }
      }
      
      letter = {
        id: 'test-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        characterId,
        characterName: characterId === 'minato' ? 'みなと' : 'あかり',
        greeting: fallbackContent.split('\n')[0],
        mainTopics: conversationSummary.topics.length > 0 ? conversationSummary.topics : ['今日の相談内容'],
        conversationHighlights: [
          `今日は${conversationSummary.todayMessages}件の会話がありました`,
          ...(conversationSummary.hasRealConversation ? 
            [`実際の会話: ${conversationSummary.userMessages?.substring(0, 50)}...`] : 
            [`テストデータでの会話シミュレーション`])
        ],
        encouragementMessage: characterId === 'minato' ? 
          '継続してこそ意味がある。明日も真面目に取り組め。' : 
          '今日も素晴らしい取り組みでした！継続が一番大切ですね♪',
        nextSessionHint: characterId === 'minato' ? 
          '明日も報告しろ。...データとして必要だからな。' : 
          '明日も一緒にお話ししましょう♪',
        signature: characterId === 'minato' ? 'みなと' : 'あかり',
        createdAt: new Date()
      }
      
      console.log('📝 フォールバック生成完了:', {
        contentLength: fallbackContent.length,
        topicsCount: letter.mainTopics.length,
        highlightsCount: letter.conversationHighlights.length,
        hasRealConversation: conversationSummary.hasRealConversation
      })
    }
    
    const generationTime = Date.now() - generationStart
    
    if (debugInfo) {
      debugInfo.generationTime = generationTime
      debugInfo.geminiUsed = geminiUsed
    }
    
    // レスポンス生成
    if (!letter) {
      console.error('❌ Letter generation failed - no letter object returned')
      throw new Error('Letter generation failed - no letter object returned')
    }
    
    console.log('📝 お手紙オブジェクト構造確認:', {
      hasGreeting: !!letter.greeting,
      hasMainTopics: !!letter.mainTopics,
      hasEncouragementMessage: !!letter.encouragementMessage,
      hasSignature: !!letter.signature,
      mainTopicsLength: letter.mainTopics?.length || 0
    })
    
    // お手紙内容を安全に構築
    const letterContent = [
      letter.greeting || 'テストユーザーへ',
      '',
      '今日お話したこと:',
      ...(letter.mainTopics || ['今日の相談内容']).map(topic => `・${topic}`),
      '',
      ...(letter.conversationHighlights || []).map(highlight => `・${highlight}`),
      letter.conversationHighlights && letter.conversationHighlights.length > 0 ? '' : undefined,
      letter.encouragementMessage || '今日もお疲れさまでした',
      '',
      letter.nextSessionHint || '明日もお話ししましょう',
      '',
      letter.signature || (characterId === 'minato' ? 'みなと' : 'あかり')
    ].filter(line => line !== undefined).join('\n')
    
    console.log('📝 最終お手紙内容:', {
      length: letterContent.length,
      preview: letterContent.substring(0, 100) + '...'
    })
    
    // データベース保存処理追加
    console.log('=== データベース保存開始 ===')
    console.log('保存対象手紙:', letterContent.substring(0, 50) + '...')
    
    let savedToDatabase = false
    let savedLetterId: string | null = null
    let dbSaveError: string | null = null
    
    try {
      const supabase = createClient<Database>(supabaseUrl, serviceKey)
      
      // Supabase設定確認
      console.log('Supabase設定確認:')
      console.log('- User ID:', targetUserId)
      console.log('- Service Key存在:', !!serviceKey)
      console.log('- Service Key長:', serviceKey?.length || 0)
      console.log('- daily_summariesテーブルアクセス権限をテスト中...')
      
      const today = new Date().toISOString().split('T')[0]
      
      // まず既存の手紙をチェック
      console.log('既存手紙チェック開始...')
      const { data: existingLetters, error: checkError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('character_id', characterId)
        .eq('date', today)
      
      if (checkError) {
        console.error('❌ 既存チェックエラー:', checkError)
        dbSaveError = 'Existing check failed: ' + checkError.message
      } else {
        console.log('既存チェック成功:', existingLetters?.length || 0, '件見つかりました')
      }

      let saveResult;
      
      if (existingLetters && existingLetters.length > 0) {
        // 更新
        console.log('既存手紙を更新します')
        const { data, error } = await supabase
          .from('daily_summaries')
          .update({
            letter_content: letterContent,
            summary: `${conversationSummary.topics?.join('、') || '健康相談'}（${conversationSummary.todayMessages || 0}件のメッセージ）`,
            main_topics: letter.mainTopics || ['今日の相談'],
            total_messages: conversationSummary.todayMessages || 0,
            emotions_detected: conversationSummary.topics || [],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId)
          .eq('character_id', characterId)
          .eq('date', today)
          .select()
        
        saveResult = { data, error }
      } else {
        // 新規作成
        console.log('新規手紙を作成します')
        const insertData = {
          user_id: targetUserId,
          character_id: characterId,
          date: today,
          summary: `${conversationSummary.topics?.join('、') || '健康相談'}（${conversationSummary.todayMessages || 0}件のメッセージ）`,
          letter_content: letterContent,
          main_topics: letter.mainTopics || ['今日の相談'],
          session_count: 1,
          total_messages: conversationSummary.todayMessages || 0,
          emotions_detected: conversationSummary.topics || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('挿入データ:', {
          userId: insertData.user_id.substring(0, 8) + '...',
          characterId: insertData.character_id,
          date: insertData.date,
          contentLength: insertData.letter_content.length,
          topicsCount: insertData.main_topics?.length || 0,
          messageCount: insertData.total_messages
        })
        
        const { data, error } = await supabase
          .from('daily_summaries')
          .insert(insertData)
          .select()
      
        saveResult = { data, error }
      }

      if (saveResult.error) {
        console.error('❌ データベース保存エラー:', saveResult.error)
        console.error('エラー詳細:', saveResult.error.message)
        dbSaveError = saveResult.error.message
      } else {
        console.log('✅ データベース保存成功:', saveResult.data)
        savedToDatabase = true
        savedLetterId = saveResult.data?.[0]?.id || null
      }

    } catch (dbError) {
      console.error('❌ データベース保存例外:', dbError)
      dbSaveError = dbError instanceof Error ? dbError.message : 'Unknown database error'
    }
    
    console.log('=== データベース保存結果 ===')
    console.log('保存成功:', savedToDatabase)
    console.log('保存ID:', savedLetterId)
    console.log('エラー:', dbSaveError || 'なし')
    
    const response: LetterTestResponse = {
      success: true,
      letter: {
        content: letterContent,
        characterId: letter.characterId,
        generatedAt: letter.createdAt.toISOString(),
        wordCount: letterContent.length
      },
      conversationSummary,
      ...(debugInfo && { debugInfo }),
      databaseSaved: savedToDatabase,
      savedLetterId,
      ...(dbSaveError && { error: dbSaveError }),
      debug: {
        conversationCount: conversationSummary.todayMessages || 0,
        timestamp: new Date().toISOString(),
        databaseSaveAttempted: true,
        databaseSaveSuccess: savedToDatabase,
        databaseError: dbSaveError || null
      }
    }
    
    const totalTime = Date.now() - startTime
    console.log('🧪 ========== LETTER TEST GENERATION COMPLETE ==========')
    console.log('🧪 Total processing time:', totalTime + 'ms')
    console.log('🧪 Letter length:', letterContent.length, 'characters')
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Letter test generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      conversationSummary: { todayMessages: 0, lastActivity: null, topics: [] }
    }, { status: 500 })
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    message: 'Letter Test Generation API is ready',
    timestamp: new Date().toISOString(),
    supportedCharacters: ['akari', 'minato']
  })
}