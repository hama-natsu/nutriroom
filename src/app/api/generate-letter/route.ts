// 🎯 NutriRoom Phase 2.4: 毎晩22:00自動お手紙生成API
// Vercel Cron Jobs対応エンドポイント

import { NextRequest, NextResponse } from 'next/server'
import { DailyLetterGenerator } from '@/lib/letter-generator'
import { setLetterContent } from '@/lib/supabase/summaries'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, testMode, userName } = body;
    
    console.log('API called with:', { characterId, testMode, userName });
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
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
    
    // daily_summariesテーブルに保存
    try {
      console.log('💾 Saving letter to daily_summaries...');
      
      // 今日のサマリーを取得または作成
      const { getTodaySummary } = await import('@/lib/supabase/summaries');
      const todaySummary = await getTodaySummary(characterId);
      
      if (!todaySummary) {
        console.error('❌ Failed to get or create today summary');
        letterId = 'no_summary';
      } else {
        const saveResult = await setLetterContent(
          todaySummary.id,
          letterContent
        );
        
        if (saveResult) {
          letterId = saveResult.id;
          console.log('✅ Letter saved successfully with ID:', letterId);
        } else {
          console.error('❌ Failed to save letter - no result returned');
          // 保存失敗でもレスポンスは返す（UX優先）
          letterId = 'unsaved';
        }
      }
    } catch (saveError) {
      console.error('❌ Error saving letter to database:', saveError);
      // 保存エラーでもレスポンスは返す（UX優先）
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