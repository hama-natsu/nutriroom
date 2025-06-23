// 🎯 NutriRoom Phase 6.1: お手紙システムテスト機能
// 開発者用手動お手紙生成API

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
  console.log('ユーザーID:', userId ? `${userId.substring(0, 8)}...` : 'anonymous')
  console.log('キャラクターID:', characterId)
  
  const supabase = createClient<Database>(supabaseUrl, serviceKey);
  const today = new Date().toISOString().split('T')[0];
  console.log('対象日:', today)
  console.log('🔑 Service Key使用確認:', serviceKey ? `${serviceKey.substring(0, 10)}...` : 'なし')
  
  try {
    // 🔧 Service Key使用時のRLS回避テスト
    console.log('🔓 Service Key直接アクセステスト開始...')
    
    // テスト1: conversation_logsテーブル直接アクセス
    const { data: directTest, error: directError } = await supabase
      .from('conversation_logs')
      .select('id, message_type, created_at')
      .limit(3)
    
    console.log('🔓 直接アクセステスト結果:', {
      success: !directError,
      error: directError?.message || 'なし',
      dataCount: directTest?.length || 0
    })
    
    // 🚨 セキュリティ修正: ユーザーIDでフィルタリングして今日の会話を取得
    const { data: conversations, error } = await supabase
      .from('conversation_logs')
      .select('message_content, message_type, created_at, session_id, user_sessions!inner(user_id)')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`)
      .eq('user_sessions.user_id', userId)
      .order('created_at', { ascending: true })
    
    console.log('取得された会話数:', conversations?.length || 0)
    
    if (error) {
      console.error('❌ 会話ログ取得エラー:', error)
      return createEmptyConversationSummary();
    }
    
    if (!conversations || conversations.length === 0) {
      console.log('⚠️ 今日の会話データが存在しません')
      // テスト用の仮想会話データを生成
      return createTestConversationData(characterId);
    }
    
    // 🔍 詳細な会話データ診断ログ
    console.log('=== 📋 取得された会話データ詳細 ===')
    console.log('総会話数:', conversations.length)
    console.log('ユーザーメッセージ数:', conversations.filter(c => c.message_type === 'user').length)
    console.log('AIメッセージ数:', conversations.filter(c => c.message_type === 'ai').length)
    
    // 全会話内容を詳細ログ出力（最大10件）
    conversations.slice(0, 10).forEach((conv, index) => {
      console.log(`[${index + 1}] ${conv.message_type}: "${conv.message_content}" (${conv.created_at})`)
    })
    
    if (conversations.length > 10) {
      console.log(`... and ${conversations.length - 10} more messages`)
    }
    
    console.log('=== 📋 会話データ診断完了 ===')
    
    // サンプル表示（既存）
    console.log('会話内容サンプル:', conversations.slice(0, 2).map(c => ({
      type: c.message_type,
      content: c.message_content.substring(0, 50) + '...',
      time: c.created_at
    })))
    
    // 会話要約を作成
    const summary = createConversationSummary(conversations);
    console.log('会話要約完了:', summary);
    
    return summary;
    
  } catch (error) {
    console.error('❌ 会話履歴取得エラー:', error)
    return createEmptyConversationSummary();
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
    .filter(conv => conv.message_type === 'ai')
    .map(conv => conv.message_content)
    .slice(-3) // 最新3件のAI回答
  
  // 🎯 会話の長さと深さ分析
  const totalCharacters = conversations.reduce((sum, conv) => sum + conv.message_content.length, 0);
  const avgMessageLength = totalCharacters / Math.max(conversations.length, 1);
  const conversationDepth = conversations.length <= 2 ? 'short' : conversations.length <= 6 ? 'medium' : 'long';
  const isShortConversation = conversations.length <= 2 && totalCharacters < 100;
  
  console.log('ユーザーメッセージ数:', userMessages.length)
  console.log('ユーザーメッセージサンプル:', userMessages.slice(0, 2).map(m => m.substring(0, 30) + '...'))
  console.log('AI回答数:', aiResponses.length)
  console.log('AI回答サンプル:', aiResponses.slice(0, 2).map(m => m.substring(0, 30) + '...'))
  
  console.log('🔍 会話分析結果:', {
    totalMessages: conversations.length,
    totalCharacters,
    avgMessageLength: Math.round(avgMessageLength),
    conversationDepth,
    isShortConversation
  })
  
  // トピック抽出
  const topics = extractTopics(conversations);
  
  return {
    todayMessages: conversations.length,
    lastActivity: conversations[conversations.length - 1]?.created_at || null,
    topics,
    userMessages: userMessages.join('. '),
    aiResponses: aiResponses.join('. '),
    conversationCount: conversations.length,
    hasRealConversation: true,
    // 🎯 新機能: 会話分析データ
    conversationDepth,
    totalCharacters,
    avgMessageLength: Math.round(avgMessageLength),
    isShortConversation
  }
}

// テスト用会話データ生成
// 🔧 改良版: 短い会話に対応したテスト用会話データ生成
function createTestConversationData(characterId: string) {
  console.log('🧪 テスト用会話データを生成中...')
  
  // 🎯 短い会話パターン（「かぜをひきやすい」タイプ）
  const shortPatterns = [
    { userMessages: 'かぜをひきやすい', topics: ['免疫力', '体調管理'], count: 2 },
    { userMessages: '疲れやすくなった', topics: ['栄養不足', '休息'], count: 2 },
    { userMessages: '最近食欲がない', topics: ['食欲不振', '栄養'], count: 2 },
    { userMessages: 'お腹の調子が悪い', topics: ['消化', '腸内環境'], count: 2 }
  ]
  
  // 🎯 通常の会話パターン
  const regularPatterns = [
    { 
      userMessages: '最近太ってきて困っています. どんな運動をすればいいですか',
      topics: ['ダイエット', '運動'], 
      count: 4
    },
    { 
      userMessages: 'バランスの良い食事について教えてください. ビタミンが足りているか心配です',
      topics: ['栄養バランス', 'ビタミン'], 
      count: 3
    }
  ]
  
  // ランダムに短い会話か通常の会話かを選択
  const useShort = Math.random() < 0.6; // 60%の確率で短い会話
  const pattern = useShort 
    ? shortPatterns[Math.floor(Math.random() * shortPatterns.length)]
    : regularPatterns[Math.floor(Math.random() * regularPatterns.length)];
  
  const testData = characterId === 'minato' ? {
    todayMessages: pattern.count,
    lastActivity: new Date().toISOString(),
    topics: pattern.topics,
    userMessages: pattern.userMessages,
    aiResponses: useShort 
      ? 'ふん...なるほどな。栄養をしっかり摂って規則正しい生活をしろ'
      : 'ふん、まあいいだろう...まずは食事記録をつけろ. 継続が重要だからな',
    conversationCount: pattern.count,
    hasRealConversation: false,
    isShortConversation: useShort,
    conversationDepth: useShort ? 'short' : 'medium',
    totalCharacters: pattern.userMessages.length + 50,
    avgMessageLength: (pattern.userMessages.length + 50) / pattern.count
  } : {
    todayMessages: pattern.count,
    lastActivity: new Date().toISOString(),
    topics: pattern.topics,
    userMessages: pattern.userMessages,
    aiResponses: useShort
      ? 'そうですね、体調管理は大切です♪ しっかり栄養を摂ってくださいね'
      : '栄養バランスを考えた食事、素晴らしいですね♪ 一緒に頑張りましょう',
    conversationCount: pattern.count,
    hasRealConversation: false,
    isShortConversation: useShort,
    conversationDepth: useShort ? 'short' : 'medium',
    totalCharacters: pattern.userMessages.length + 60,
    avgMessageLength: (pattern.userMessages.length + 60) / pattern.count
  }
  
  console.log('🧪 テストデータ生成完了:', {
    type: useShort ? 'short' : 'regular',
    messageCount: testData.todayMessages,
    userMessage: testData.userMessages,
    topics: testData.topics
  })
  
  return testData;
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
  const topics: string[] = [];
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
  return [...new Set(topics)];
}

// 🗑️ 未使用関数削除：強制保存処理で置き換え済み

export async function POST(request: NextRequest) {
  console.log('🧪 ========== LETTER TEST GENERATION START ==========')
  
  const startTime = Date.now();
  
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
    
    // 🚨 修正: Service Key使用のため直接リクエストからuserIdを取得
    const targetUserId = userId;
    if (!targetUserId) {
      console.error('❌ userId is required for letter generation')
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required'
      }, { status: 400 })
    }
    
    console.log('✅ Service Key使用でユーザーID処理:', targetUserId ? `${targetUserId.substring(0, 8)}...` : 'none')
    console.log('🔑 Service Key認証でRLS回避モード')
    
    // 会話履歴の詳細取得
    const conversationSummary = await getDetailedConversationSummary(targetUserId, characterId);
    console.log('🔍 会話履歴取得結果:', {
      messageCount: conversationSummary.todayMessages,
      hasRealConversation: conversationSummary.hasRealConversation,
      topics: conversationSummary.topics,
      userMessagesLength: conversationSummary.userMessages?.length || 0,
      aiResponsesLength: conversationSummary.aiResponses?.length || 0
    })
    
    // デバッグ情報収集
    let debugInfo = undefined;
    if (includeDebugInfo) {
      const supabase = createClient<Database>(supabaseUrl, serviceKey);
      
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
    
    // 🔧 診断モード：Gemini APIスキップしてフォールバック直接実行
    console.log('🧪 診断モード：会話データ確認のためGemini APIをスキップ')
    const generationStart = Date.now();
    
    let letter;
    const geminiUsed = false;
    
    console.log('=== 📊 会話データ診断結果表示 ===')
    console.log('🔄 取得された会話データの詳細:')
    console.log('- メッセージ数:', conversationSummary.todayMessages)
    console.log('- 実際の会話データか:', conversationSummary.hasRealConversation ? 'はい（実データ）' : 'いいえ（テストデータ）')
    console.log('- ユーザーメッセージ内容:', conversationSummary.userMessages || '（なし）')
    console.log('- AIレスポンス内容:', conversationSummary.aiResponses || '（なし）')
    console.log('- トピック:', conversationSummary.topics?.join(', ') || '（なし）')
    console.log('- 会話分析:', {
      isShortConversation: (conversationSummary as any).isShortConversation,
      conversationDepth: (conversationSummary as any).conversationDepth,
      totalCharacters: (conversationSummary as any).totalCharacters,
      avgMessageLength: (conversationSummary as any).avgMessageLength
    })
    
    console.log('🔧 診断：Gemini APIをスキップしてフォールバック生成を実行します')
    
    // 直接フォールバック生成を実行（診断用）
    try {
      // 🔧 改良版フォールバック：会話の長さに応じた適切なお手紙生成
      console.log('🔄 フォールバック生成中 - 会話データを反映します')
      
      // 🎯 会話の長さに応じたお手紙テンプレート選択
      const isShort = (conversationSummary as any).isShortConversation || conversationSummary.todayMessages <= 2;
      const conversationDepth = (conversationSummary as any).conversationDepth || 'medium';
      
      console.log('📝 お手紙テンプレート選択:', { isShort, conversationDepth, messageCount: conversationSummary.todayMessages })
      
      let fallbackContent: string;
      if (characterId === 'minato') {
        if (isShort) {
          // 短い会話用（「かぜをひきやすい」など）
          const userConcern = conversationSummary.userMessages?.split('.')[0] || '健康について';
          fallbackContent = `テストユーザーへ\n\n「${userConcern}」か...なるほどな。\n\n短いやりとりだったが、重要な話だ。栄養をしっかり摂り、規則正しい生活を心がけろ。\n\n継続が重要だからな。また報告しろ。\n\nみなと`;
        } else if (conversationSummary.hasRealConversation && conversationSummary.userMessages) {
          // 通常の会話がある場合
          fallbackContent = `テストユーザーへ\n\n今日の相談について話したが...${conversationSummary.todayMessages}件のやりとりがあったな。\n\n「${conversationSummary.userMessages.split('.')[0]}」という話をしていたが、まあ悪くない取り組みだ。\n\n別に心配しているわけではないが...継続することが重要だからな。\n\nみなと`;
        } else {
          // テストデータの場合
          const testTopics = conversationSummary.topics.join('、') || '栄養管理';
          fallbackContent = `テストユーザーへ\n\n今日は${testTopics}について話したな。\n\n「${conversationSummary.userMessages?.split('.')[0] || '最近太ってきて困っています'}」という相談だったが、まあ真面目に取り組んでいるようだな。\n\n継続してこそ意味がある。明日も報告しろ。\n\nみなと`;
        }
      } else {
        if (isShort) {
          // 短い会話用（「かぜをひきやすい」など）
          const userConcern = conversationSummary.userMessages?.split('.')[0] || '健康について';
          fallbackContent = `テストユーザーさん♪\n\n「${userConcern}」についてお話しできて良かったです！\n\n短いお話でしたが、大切なことですね。しっかりと栄養を摂って、体調管理を心がけてくださいね。\n\n何か気になることがあったら、いつでもお話ししましょう♪\n\nあかり`;
        } else if (conversationSummary.hasRealConversation && conversationSummary.userMessages) {
          // 通常の会話がある場合
          fallbackContent = `テストユーザーさん♪\n\n今日は${conversationSummary.todayMessages}件もお話しできて嬉しかったです！\n\n「${conversationSummary.userMessages.split('.')[0]}」というお話、とても素晴らしい取り組みですね。\n\n明日も一緒に頑張りましょう〜\n\nあかり`;
        } else {
          // テストデータの場合
          const testTopics = conversationSummary.topics.join('、') || '栄養バランス';
          fallbackContent = `テストユーザーさん♪\n\n今日は${testTopics}についてお話しできて嬉しかったです！\n\n「${conversationSummary.userMessages?.split('.')[0] || 'バランスの良い食事について教えてください'}」というご質問、とても良い意識ですね。\n\n明日も一緒にお話ししましょう♪\n\nあかり`;
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
      };
      
      console.log('📝 フォールバック生成完了:', {
        contentLength: fallbackContent.length,
        topicsCount: letter.mainTopics.length,
        highlightsCount: letter.conversationHighlights.length,
        hasRealConversation: conversationSummary.hasRealConversation
      })
    } catch (error) {
      console.error('❌ フォールバック生成エラー:', error)
      throw new Error('フォールバック生成に失敗しました')
    }
    
    const generationTime = Date.now() - generationStart;
    
    if (debugInfo) {
      debugInfo.generationTime = generationTime;
      debugInfo.geminiUsed = geminiUsed;
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
    ].filter(line => line !== undefined).join('\n');
    
    console.log('📝 最終お手紙内容:', {
      length: letterContent.length,
      preview: letterContent.substring(0, 100) + '...'
    })
    
    // 🚨 緊急修正: 強制保存処理
    console.log('=== 🎯 強制保存処理開始 ===')
    console.log('User ID:', targetUserId)
    console.log('Character ID:', characterId)
    console.log('Letter Content Length:', letterContent.length)
    
    let saveResult: { success: boolean; letterId: string | null; error: string | null } = { success: false, letterId: null, error: 'Initial state' };
    
    if (letterContent && targetUserId) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const supabaseSave = createClient<Database>(supabaseUrl, serviceKey);
        
        console.log('🎯 強制保存処理実行中...')
        console.log('🔑 保存用Service Key確認:', serviceKey ? `${serviceKey.substring(0, 10)}...` : 'なし')
        
        // 🔧 Service Key直接アクセステスト
        const { data: tableTest, error: tableError } = await supabaseSave
          .from('daily_summaries')
          .select('id, user_id, character_id')
          .limit(2)
        
        console.log('🔓 daily_summaries直接アクセステスト:', {
          success: !tableError,
          error: tableError?.message || 'なし',
          dataCount: tableTest?.length || 0,
          sampleData: tableTest?.[0] ? {
            id: tableTest[0].id.substring(0, 8) + '...',
            user_id: tableTest[0].user_id.substring(0, 8) + '...'
          } : null
        })
        
        // UPSERTで確実に保存
        const { data: directSaveResult, error: directSaveError } = await supabaseSave
          .from('daily_summaries')
          .upsert({
            user_id: targetUserId,
            character_id: characterId,
            date: today,
            letter_content: letterContent,
            summary: `今日の${characterId}との会話`,
            main_topics: conversationSummary.topics || ['健康相談'],
            total_messages: conversationSummary.todayMessages || 0,
            session_count: 1,
            emotions_detected: conversationSummary.topics || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,character_id,date'
          })
          .select()

        if (directSaveError) {
          console.error('❌ 強制保存エラー:', directSaveError)
          console.error('エラー詳細:', JSON.stringify(directSaveError, null, 2))
          saveResult = { success: false, letterId: null, error: directSaveError.message || 'Database error' }
        } else {
          console.log('✅ 強制保存成功:', directSaveResult);
          const letterId = directSaveResult?.[0]?.id || null;
          saveResult = { success: true, letterId, error: null };
        }

      } catch (exception) {
        console.error('❌ 強制保存例外:', exception)
        saveResult = { success: false, letterId: null, error: exception instanceof Error ? exception.message : 'Unknown error' };
      }
    }
    
    console.log('=== 🎯 強制保存処理結果 ===')
    console.log('保存成功:', saveResult.success)
    console.log('保存ID:', saveResult.letterId)
    console.log('エラー:', saveResult.error || 'なし')
    
    const savedToDatabase = saveResult.success;
    const savedLetterId = saveResult.letterId || null;
    const dbSaveError = saveResult.error ? (typeof saveResult.error === 'string' ? saveResult.error : JSON.stringify(saveResult.error)) : null;
    
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
      ...(dbSaveError && { error: dbSaveError })
    };
    
    const totalTime = Date.now() - startTime;
    console.log('🧪 ========== LETTER TEST GENERATION COMPLETE ==========')
    console.log('🧪 Total processing time:', totalTime + 'ms')
    console.log('🧪 Letter length:', letterContent.length, 'characters')
    
    return NextResponse.json(response);
    
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