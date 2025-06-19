// 🎯 NutriRoom Phase 2.4: 毎晩22:00自動お手紙生成API
// Vercel Cron Jobs対応エンドポイント

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { DailyLetterGenerator } from '@/lib/letter-generator'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  console.log('🔥 ========== GENERATION PROCESS DEBUG ==========');
  
  try {
    // Step 1: リクエスト解析
    console.log('🔥 Step 1: Parsing request...');
    const body = await request.json();
    const { characterId, character_id, testMode, userName, cron_mode } = body;
    
    // Cronモード対応: character_id → characterId 変換
    const finalCharacterId = characterId || character_id || 'akari';
    const isCronMode = cron_mode || false;
    
    console.log('🔥 Request body:', body);
    console.log('🔥 Parsed values:', { finalCharacterId, testMode, userName, isCronMode });
    
    // Step 2: 環境変数確認
    console.log('🔥 Step 2: Environment check...');
    console.log('🔥 Gemini API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔥 Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔥 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // 既存のSupabaseクライアント使用
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔥 Step 3: Processing letter generation request...')
    
    let letterContent: string;
    let letterId: string;
    
    if (testMode) {
      // テストモード：簡単なお手紙コンテンツ
      console.log('🔥 Step 4: Test mode - generating sample content...');
      letterContent = `${userName || 'あなた'}さん、こんにちは！

今日も一日お疲れさまでした♪

昨日お話した栄養バランスのこと、覚えていてくださってありがとうございます。
朝食にヨーグルトとフルーツを取り入れるアイデア、とても良いと思います！

お仕事で忙しい毎日だと思いますが、少しずつでも健康を意識していただけて嬉しいです。

明日は、お昼ご飯のお話も聞かせてくださいね！

あかりより 💕`;
      
      console.log('💌 Test mode: Generated sample letter content');
    } else {
      // Step 4: Gemini API呼び出しデバッグ
      console.log('🔥 Step 4: Real mode - calling Gemini API...');
      
      try {
        // 実際のGemini呼び出し
        console.log('🔥 Calling DailyLetterGenerator.generateDailyLetter...');
        const letter = await DailyLetterGenerator.generateDailyLetter(
          finalCharacterId,
          userName || 'テストユーザー'
        );
        
        console.log('🔥 Gemini result:', letter ? 'SUCCESS' : 'NULL');
        
        if (!letter) {
          console.error('❌ Letter generation returned null/undefined');
          
          // フォールバック：固定メッセージ
          console.log('🔥 Using fallback message...');
          letterContent = `${userName || 'あなた'}さん、こんにちは！

今日も素敵な一日になりそうですね♪

栄養バランスを意識した食事を心がけて、健康的な一日を過ごしましょう！
何か気になることがあれば、いつでもお話しくださいね。

あかりより 💕`;

          console.log('💌 Fallback mode: Generated fallback letter content');
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
        
        // フォールバック：固定メッセージ
        console.log('🔥 Gemini failed, using fallback message...');
        letterContent = `${userName || 'あなた'}さん、こんにちは！

今日も素敵な一日になりそうですね♪

栄養バランスを意識した食事を心がけて、健康的な一日を過ごしましょう！
何か気になることがあれば、いつでもお話しくださいね。

あかりより 💕`;

        console.log('💌 Error fallback mode: Generated fallback letter content');
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
    
    // Step 3: 保存データ準備（安全な最小限のデータ）
    // user_idが必要な場合は適切なUUIDを生成
    let generatedUUID: string | undefined;
    try {
      generatedUUID = randomUUID();
      console.log('💾 Generated UUID for user_id:', generatedUUID);
    } catch {
      console.log('💾 UUID generation failed, proceeding without user_id');
    }

    // まず最小限のデータでテスト（user_idなし）
    const saveData: Record<string, unknown> = {
      character_id: finalCharacterId,
      letter_content: letterContent
      // user_id: generatedUUID, // 必要に応じてコメントアウト解除
      // conversation_summary: 存在しないカラムのため削除
      // created_at: 自動設定の可能性があるため削除
    };
    
    console.log('💾 Step 3: Data to save:', {
      character_id: saveData.character_id,
      letter_content_length: String(saveData.letter_content).length,
      user_id: saveData.user_id || 'not_set'
    });
    
    // Step 4: 実際の保存実行
    console.log('💾 Step 4: Executing save...');
    try {
      const { data: saveResult, error: saveError } = await supabase
        .from('daily_summaries')
        .insert(saveData)
        .select();
      
      console.log('💾 Save result:', saveResult);
      console.log('💾 Save error:', saveError);
      
      // Step 5: 結果判定
      if (saveError) {
        console.error('❌ SAVE FAILED:', {
          code: saveError.code,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint
        });
        
        return NextResponse.json({
          success: false,
          message: letterContent, // お手紙は表示
          error: 'Save failed',
          saveError: saveError
        });
      }
      
      console.log('✅ SAVE SUCCESS:', saveResult);
      letterId = saveResult?.[0]?.id || 'success_no_id';
      
    } catch (saveException) {
      console.error('❌ Save exception:', saveException);
      console.error('❌ Save exception stack:', saveException instanceof Error ? saveException.stack : 'No stack trace');
      
      return NextResponse.json({
        success: false,
        message: letterContent, // お手紙は表示
        error: 'Server error during save',
        details: saveException instanceof Error ? saveException.message : 'Unknown error'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: letterContent,
      data: {
        letterId,
        content: letterContent,
        characterId: finalCharacterId,
        date: new Date().toISOString().split('T')[0],
        saved: letterId !== 'unsaved' && letterId !== 'save_error' && letterId !== 'success_no_id'
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}