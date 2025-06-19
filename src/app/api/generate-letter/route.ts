// 🎯 NutriRoom Phase 2.4: 毎晩22:00自動お手紙生成API
// Vercel Cron Jobs対応エンドポイント

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { DailyLetterGenerator } from '@/lib/letter-generator'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, testMode, userName } = body;
    
    console.log('API called with:', { characterId, testMode, userName });
    
    // 既存のSupabaseクライアント使用
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📝 Processing letter generation request...')
    
    let letterContent: string;
    let letterId: string;
    
    if (testMode) {
      // テストモード：簡単なお手紙コンテンツ
      letterContent = `${userName || 'あなた'}さん、こんにちは！

今日も一日お疲れさまでした♪

昨日お話した栄養バランスのこと、覚えていてくださってありがとうございます。
朝食にヨーグルトとフルーツを取り入れるアイデア、とても良いと思います！

お仕事で忙しい毎日だと思いますが、少しずつでも健康を意識していただけて嬉しいです。

明日は、お昼ご飯のお話も聞かせてくださいね！

あかりより 💕`;
      
      console.log('💌 Test mode: Generated sample letter content');
    } else {
      // 実際のGemini呼び出し
      const letter = await DailyLetterGenerator.generateDailyLetter(
        characterId,
        userName || 'テストユーザー'
      );
      
      if (!letter) {
        return NextResponse.json({
          success: false,
          error: 'Failed to generate letter'
        }, { status: 500 });
      }
      
      // DailyLetterオブジェクトからテキストを抽出
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
      if (schemaError) console.error('❌ Schema error:', schemaError);
    } catch (schemaErr) {
      console.error('❌ Schema check error:', schemaErr);
    }
    
    // Step 3: 保存データ準備
    const saveData = {
      character_id: characterId || 'akari',
      letter_content: letterContent,
      conversation_summary: 'Generated from conversation',
      user_id: 'anonymous_user_' + Date.now(), // ユニークID
      created_at: new Date().toISOString()
    };
    
    console.log('💾 Step 3: Data to save:', {
      ...saveData,
      letter_content: saveData.letter_content.substring(0, 50) + '...'
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
        characterId,
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