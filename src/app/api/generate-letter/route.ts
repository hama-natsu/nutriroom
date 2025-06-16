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
    
    // daily_summariesテーブルに保存（一時的に簡略化）
    try {
      console.log('💾 Saving letter to daily_summaries...');
      
      const today = new Date().toISOString().split('T')[0];
      
      // 一時的に直接挿入（開発用）
      const { data: insertResult, error: insertError } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: '00000000-0000-0000-0000-000000000000', // 一時的な固定値
          character_id: characterId,
          date: today,
          letter_content: letterContent,
          main_topics: ['今日の会話'],
          session_count: 1,
          total_messages: 1,
          emotions_detected: ['friendly']
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Failed to save letter:', insertError);
        letterId = 'save_error';
      } else if (insertResult) {
        letterId = insertResult.id;
        console.log('✅ Letter saved successfully with ID:', letterId);
      } else {
        letterId = 'no_result';
      }
    } catch (saveError) {
      console.error('❌ Error saving letter to database:', saveError);
      letterId = 'save_error';
    }
    
    return NextResponse.json({
      success: true,
      message: testMode ? 'Test mode: Letter generation successful' : 'Letter generation successful',
      data: {
        letterId,
        content: letterContent,
        characterId,
        date: new Date().toISOString().split('T')[0],
        saved: letterId !== 'unsaved' && letterId !== 'save_error'
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