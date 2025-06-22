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
  error?: string
}

// 会話履歴要約を取得
async function getConversationSummary(userId: string, characterId: string) {
  console.log('📊 Getting conversation summary for:', { userId: userId.substring(0, 8), characterId })
  
  const supabase = createClient<Database>(supabaseUrl, serviceKey)
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // 今日のセッション取得
    const { data: sessions, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id, session_start, heartbeat_count')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .gte('session_start', today)
      .order('session_start', { ascending: false })
    
    if (sessionError) {
      console.error('❌ Session query error:', sessionError)
      return { todayMessages: 0, lastActivity: null, topics: [] }
    }
    
    if (!sessions || sessions.length === 0) {
      console.log('ℹ️ No sessions found for today')
      return { todayMessages: 0, lastActivity: null, topics: [] }
    }
    
    // セッション内の会話ログ取得
    const sessionIds = sessions.map(s => s.id)
    const { data: logs, error: logError } = await supabase
      .from('conversation_logs')
      .select('message_content, message_type, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })
    
    if (logError) {
      console.error('❌ Conversation logs query error:', logError)
      return { todayMessages: 0, lastActivity: null, topics: [] }
    }
    
    const messageCount = logs?.length || 0
    const lastActivity = logs?.[0]?.created_at || null
    
    // トピック抽出（簡易版）
    const topics: string[] = []
    logs?.forEach(log => {
      if (log.message_type === 'user') {
        const message = log.message_content.toLowerCase()
        if (message.includes('食事') || message.includes('料理')) topics.push('食事')
        if (message.includes('運動') || message.includes('トレーニング')) topics.push('運動')
        if (message.includes('体重') || message.includes('ダイエット')) topics.push('体重管理')
        if (message.includes('栄養') || message.includes('ビタミン')) topics.push('栄養')
      }
    })
    
    const uniqueTopics = [...new Set(topics)]
    
    console.log('✅ Conversation summary:', {
      todayMessages: messageCount,
      lastActivity,
      topics: uniqueTopics
    })
    
    return {
      todayMessages: messageCount,
      lastActivity,
      topics: uniqueTopics
    }
    
  } catch (error) {
    console.error('❌ Error getting conversation summary:', error)
    return { todayMessages: 0, lastActivity: null, topics: [] }
  }
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
    
    // 会話履歴要約取得
    const conversationSummary = await getConversationSummary(targetUserId, characterId)
    
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
      // 実際のGemini APIを使用してお手紙生成
      letter = await DailyLetterGenerator.generateDailyLetter(
        characterId,
        'テストユーザー', // userName
        targetUserId
      )
      geminiUsed = true
      console.log('✅ Gemini letter generation successful')
    } catch (geminiError) {
      console.warn('⚠️ Gemini generation failed, using fallback:', geminiError)
      
      // フォールバック：シンプルなテスト用お手紙
      const fallbackContent = characterId === 'minato' 
        ? `テストユーザーへ\n\n今日の会話データを確認した。\n${conversationSummary.todayMessages}件のメッセージがあったな。\n\n別に心配しているわけではないが...継続することが重要だ。\n\nみなと`
        : `テストユーザーさん♪\n\n今日もお話しできて嬉しかったです！\n${conversationSummary.todayMessages}件のやりとりがありましたね。\n\n明日も一緒に頑張りましょう〜\n\nあかり`
      
      letter = {
        id: 'test-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        characterId,
        characterName: characterId === 'minato' ? 'みなと' : 'あかり',
        greeting: fallbackContent.split('\n')[0],
        mainTopics: conversationSummary.topics,
        conversationHighlights: [`今日は${conversationSummary.todayMessages}件の会話がありました`],
        encouragementMessage: '継続することが大切です',
        nextSessionHint: '明日もお話ししましょう',
        signature: characterId === 'minato' ? 'みなと' : 'あかり',
        createdAt: new Date()
      }
    }
    
    const generationTime = Date.now() - generationStart
    
    if (debugInfo) {
      debugInfo.generationTime = generationTime
      debugInfo.geminiUsed = geminiUsed
    }
    
    // レスポンス生成
    if (!letter) {
      throw new Error('Letter generation failed - no letter object returned')
    }
    
    const letterContent = `${letter.greeting}\n\n${letter.mainTopics.join('\n')}\n\n${letter.encouragementMessage}\n\n${letter.signature}`
    
    const response: LetterTestResponse = {
      success: true,
      letter: {
        content: letterContent,
        characterId: letter.characterId,
        generatedAt: letter.createdAt.toISOString(),
        wordCount: letterContent.length
      },
      conversationSummary,
      ...(debugInfo && { debugInfo })
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