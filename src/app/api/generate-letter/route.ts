// 🎯 NutriRoom Phase 2.4: 毎晩22:00自動お手紙生成API
// Vercel Cron Jobs対応エンドポイント

/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { DailyLetterGenerator } from '@/lib/letter-generator'
import { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 会話履歴の詳細取得関数
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
      return createTestConversationData(characterId)
    }
    
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
    .slice(0, 5)
  
  const aiResponses = conversations
    .filter(conv => conv.message_type === 'assistant' || conv.message_type === 'ai')
    .map(conv => conv.message_content)
    .slice(-3)
  
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
    aiResponses: 'ふん、まあいいだろう...まずは食事記録をつけろ. 運動なら筋トレから始めるのが効率的だ',
    conversationCount: 4,
    hasRealConversation: false
  } : {
    todayMessages: 3,
    lastActivity: new Date().toISOString(),
    topics: ['栄養', '食事'],
    userMessages: 'バランスの良い食事について教えてください. ビタミンが足りているか心配です',
    aiResponses: '栄養バランスを考えた食事、素晴らしいですね♪ 野菜をたくさん摂って、タンパク質も忘れずに！',
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

// 統一された保存処理関数
async function saveLetterToDatabase(userId: string, characterId: string, letterContent: string, conversationSummary: unknown) {
  try {
    const supabase = createClient<Database>(supabaseUrl, serviceKey)
    const today = new Date().toISOString().split('T')[0]
    
    console.log('データベース保存開始:', {
      userId: userId.substring(0, 8) + '...',
      characterId,
      date: today,
      contentLength: letterContent.length
    })

    // 既存チェック
    const { data: existing } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .eq('date', today)

    let result
    if (existing && existing.length > 0) {
      // 更新
      result = await supabase
        .from('daily_summaries')
        .update({
          letter_content: letterContent,
          summary: `${(conversationSummary as any)?.topics?.join('、') || '健康相談'}（${(conversationSummary as any)?.todayMessages || 0}件のメッセージ）`,
          main_topics: (conversationSummary as any)?.topics || ['健康相談'],
          total_messages: (conversationSummary as any)?.todayMessages || 0,
          emotions_detected: (conversationSummary as any)?.topics || [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('character_id', characterId)
        .eq('date', today)
        .select()
    } else {
      // 新規作成
      result = await supabase
        .from('daily_summaries')
        .insert({
          user_id: userId,
          character_id: characterId,
          date: today,
          summary: `${(conversationSummary as any)?.topics?.join('、') || '健康相談'}（${(conversationSummary as any)?.todayMessages || 0}件のメッセージ）`,
          letter_content: letterContent,
          main_topics: (conversationSummary as any)?.topics || ['健康相談'],
          session_count: 1,
          total_messages: (conversationSummary as any)?.todayMessages || 0,
          emotions_detected: (conversationSummary as any)?.topics || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
    }

    if (result.error) {
      console.error('❌ 保存エラー:', result.error)
      return { success: false, error: result.error }
    } else {
      console.log('✅ 保存成功:', result.data)
      return { success: true, data: result.data, letterId: result.data?.[0]?.id }
    }

  } catch (error) {
    console.error('❌ 保存例外:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔥 ========== LETTER GENERATION START ==========');
  console.log(`🔥 [${new Date().toISOString()}] Letter generation started`);
  
  try {
    // Step 1: リクエスト解析
    console.log('🔥 Step 1: Parsing request...');
    const body = await request.json();
    const { characterId, character_id, testMode, userName, cron_mode, userId } = body;
    
    // Cronモード対応: character_id → characterId 変換
    const finalCharacterId = characterId || character_id || 'akari';
    const isCronMode = cron_mode || false;
    
    console.log('🔥 Request body:', body);
    console.log('🔥 Parsed values:', { 
      finalCharacterId, 
      testMode, 
      userName, 
      isCronMode, 
      hasUserId: !!userId 
    });
    console.log(`🔥 User: ${userId || 'undefined'}, Character: ${finalCharacterId}`);
    
    // Step 2: 環境変数確認
    console.log('🔥 Step 2: Environment check...');
    console.log('🔥 Gemini API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔥 Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔥 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // 既存のSupabaseクライアント使用
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔥 Step 3: Processing letter generation request...')
    
    // 会話履歴取得処理を追加
    console.log('🔥 Step 3.1: Getting conversation history...')
    const conversationSummary = await getDetailedConversationSummary(userId || 'anonymous', finalCharacterId)
    console.log('🔍 会話履歴取得結果:', {
      messageCount: conversationSummary.todayMessages,
      hasRealConversation: conversationSummary.hasRealConversation,
      topics: conversationSummary.topics
    })
    
    let letterContent: string;
    let letterId: string;
    
    if (testMode) {
      // テストモード：キャラクター別お手紙コンテンツ
      console.log('🔥 Step 4: Test mode - generating sample content...');
      
      if (finalCharacterId === 'minato') {
        letterContent = `${userName || '君'}へ

今日の栄養相談について話したが...まあ、少しは改善の兆しが見えたな。

朝食にヨーグルトとフルーツを取り入れるという話、悪くない判断だ。
タンパク質とビタミンの摂取バランスを考えれば、理にかなっている。

ただし、これで満足するなよ。継続してこそ意味がある。

明日も食事の報告をしろ。...別に心配しているわけではないが、データとして必要だからな。

みなと`;
      } else {
        letterContent = `${userName || 'あなた'}さん、こんにちは！

今日も一日お疲れさまでした♪

昨日お話した栄養バランスのこと、覚えていてくださってありがとうございます。
朝食にヨーグルトとフルーツを取り入れるアイデア、とても良いと思います！

お仕事で忙しい毎日だと思いますが、少しずつでも健康を意識していただけて嬉しいです。

明日は、お昼ご飯のお話も聞かせてくださいね！

あかり`;
      }
      
      console.log('💌 Test mode: Generated sample letter content');
      console.log('🔍 取得した会話データ:', 'TEST_MODE');
      console.log('🔍 生成されたお手紙内容:', letterContent);
      console.log('🔍 最終署名部分:', letterContent.split('\n').slice(-2));
    } else {
      // Step 4: Gemini API呼び出しデバッグ
      console.log('🔥 Step 4: Real mode - calling Gemini API...');
      console.log('🔥 Generation parameters:', {
        characterId: finalCharacterId,
        userName: userName || 'テストユーザー',
        timestamp: new Date().toISOString()
      });
      
      try {
        // 実際のGemini呼び出し
        console.log('🔥 Calling DailyLetterGenerator.generateDailyLetter...');
        const letter = await DailyLetterGenerator.generateDailyLetter(
          finalCharacterId,
          userName || 'テストユーザー',
          undefined // userId - APIではundefinedを渡す
        );
        
        console.log('🔥 Letter generation result:', {
          success: !!letter,
          letterObject: letter ? 'OBJECT_RECEIVED' : 'NULL',
          characterId: finalCharacterId,
          greetingLength: letter?.greeting?.length || 0,
          topicsCount: letter?.mainTopics?.length || 0,
          signature: letter?.signature || 'NO_SIGNATURE'
        });
        
        if (!letter) {
          console.error('❌ Letter generation returned null/undefined');
          
          // フォールバック：キャラクター別固定メッセージ
          console.log('🔥 Using fallback message...');
          
          if (finalCharacterId === 'minato') {
            letterContent = `${userName || '君'}へ

今日の相談、まあ悪くなかった。

栄養バランスを意識した食事を心がけろ。基本的なことだが重要だ。
何か質問があれば、また来い。

みなと`;
          } else {
            letterContent = `${userName || 'あなた'}さん、こんにちは！

今日も素敵な一日になりそうですね♪

栄養バランスを意識した食事を心がけて、健康的な一日を過ごしましょう！
何か気になることがあれば、いつでもお話しくださいね。

あかり`;
          }

          console.log('💌 Fallback mode: Generated fallback letter content');
          console.log('🔍 取得した会話データ:', 'FALLBACK_MODE');
          console.log('🔍 生成されたお手紙内容:', letterContent);
          console.log('🔍 最終署名部分:', letterContent.split('\n').slice(-2));
        } else {
          // DailyLetterオブジェクトからテキストを抽出
          console.log('🔥 Processing Gemini letter object...');
          letterContent = [
            letter.greeting,
            '',
            '今日お話したこと:',
            ...letter.mainTopics.map(topic => `・${topic}`),
            '',
            ...(letter.conversationHighlights.length > 0 ? [
              '会話のハイライト:',
              ...letter.conversationHighlights.map(highlight => `・${highlight}`),
              ''
            ] : []),
            letter.encouragementMessage,
            '',
            letter.nextSessionHint,
            '',
            letter.signature
          ].filter(line => line !== undefined).join('\n');
          
          console.log('💌 Real mode: Generated letter using Gemini');
          console.log('🔍 取得した会話データ:', letter);
          console.log('🔍 生成されたお手紙内容:', letterContent);
          console.log('🔍 最終署名部分:', letterContent.split('\n').slice(-2));
        }
        
      } catch (geminiError) {
        console.error('❌ Gemini API error:', geminiError);
        
        // 型安全なエラー処理
        if (geminiError instanceof Error) {
          console.error('❌ Gemini error stack:', geminiError.stack);
          console.error('❌ Gemini error message:', geminiError.message);
        } else {
          console.error('❌ Unknown gemini error:', String(geminiError));
        }
        
        // フォールバック：キャラクター別固定メッセージ
        console.log('🔥 Gemini failed, using fallback message...');
        
        if (finalCharacterId === 'minato') {
          letterContent = `${userName || '君'}へ

今日の相談、システムに問題があったが...まあ、時にはこういうこともある。

栄養バランスを意識した食事を心がけろ。基本的なことだが重要だ。
また明日、相談に来い。

みなと`;
        } else {
          letterContent = `${userName || 'あなた'}さん、こんにちは！

今日も素敵な一日になりそうですね♪

栄養バランスを意識した食事を心がけて、健康的な一日を過ごしましょう！
何か気になることがあれば、いつでもお話しくださいね。

あかり`;
        }

        console.log('💌 Error fallback mode: Generated fallback letter content');
        console.log('🔍 取得した会話データ:', 'ERROR_FALLBACK');
        console.log('🔍 生成されたお手紙内容:', letterContent);
        console.log('🔍 最終署名部分:', letterContent.split('\n').slice(-2));
      }
    }
    
    console.log('💾 ========== SAVE PROCESS DEBUG ==========');
    
    // Step 1: Supabase接続テスト
    console.log('💾 Step 1: Testing Supabase connection...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('daily_summaries')
        .select('count', { count: 'exact', head: true });
      
      if (testError) {
        console.error('❌ Supabase connection failed:', testError);
      } else {
        console.log('✅ Supabase connection OK, table exists');
        console.log('💾 Connection test result:', testData);
      }
    } catch (connError) {
      console.error('❌ Connection error:', connError);
    }
    
    // Step 2: テーブル構造確認
    console.log('💾 Step 2: Checking table structure...');
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('daily_summaries')
        .select('*')
        .limit(1);
      
      console.log('💾 Table schema check:', schemaError ? 'FAILED' : 'OK');
      if (schemaError) {
        console.error('❌ Schema error:', schemaError);
      } else {
        console.log('💾 Schema test result:', schemaData);
        if (schemaData && schemaData.length > 0) {
          console.log('💾 Available columns:', Object.keys(schemaData[0]));
        }
      }
    } catch (schemaErr) {
      console.error('❌ Schema check error:', schemaErr);
    }
    
    // Step 3: 統一された保存処理を実行
    console.log('💾 Step 3: Executing unified save process...');
    const saveResult = await saveLetterToDatabase(
      userId || 'anonymous', 
      finalCharacterId, 
      letterContent, 
      conversationSummary
    );
      
    console.log('💾 Save result:', saveResult);
    
    // Step 4: 結果判定
    if (!saveResult.success) {
      console.error('❌ SAVE FAILED:', saveResult.error);
      
      return NextResponse.json({
        success: false,
        message: letterContent, // お手紙は表示
        error: 'Save failed',
        saveError: saveResult.error
      });
    }
    
    console.log('✅ SAVE SUCCESS:', saveResult.data);
    const finalLetterId = saveResult.letterId || 'success_no_id';
    letterId = finalLetterId;
    
    const totalTime = Date.now() - startTime
    console.log(`🔥 Letter generated successfully: ${letterContent.length} characters`)
    console.log(`🔥 Total processing time: ${totalTime}ms`)
    console.log('🔥 ========== LETTER GENERATION COMPLETE ==========')
    
    return NextResponse.json({
      success: true,
      message: letterContent,
      data: {
        letterId,
        content: letterContent,
        characterId: finalCharacterId,
        date: new Date().toISOString().split('T')[0],
        saved: letterId !== 'unsaved' && letterId !== 'save_error' && letterId !== 'success_no_id',
        processingTime: totalTime,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('❌ Letter generation failed:', error);
    console.error('❌ Error occurred after:', totalTime + 'ms');
    console.log('🔥 ========== LETTER GENERATION FAILED ==========')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime: totalTime
      },
      { status: 500 }
    );
  }
}