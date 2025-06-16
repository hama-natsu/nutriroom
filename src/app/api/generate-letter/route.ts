// 🎯 NutriRoom Phase 2.4: 毎晩22:00自動お手紙生成API
// Vercel Cron Jobs対応エンドポイント

import { NextRequest, NextResponse } from 'next/server'
import { DailyLetterGenerator } from '@/lib/letter-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, testMode } = body;
    
    console.log('API called with:', { characterId, testMode });
    
    if (testMode) {
      // テストモード：Gemini呼び出しなしで成功レスポンス
      return NextResponse.json({
        success: true,
        message: 'Test mode: Letter generation successful',
        data: {
          greeting: 'テストモードでの温かい挨拶',
          topics: ['朝食について', 'バランスの大切さ'],
          encouragement: 'いつも頑張っていますね！'
        }
      });
    }
    
    // 実際のGemini呼び出し
    const letter = await DailyLetterGenerator.generateDailyLetter(
      characterId,
      'テストユーザー'
    );
    
    return NextResponse.json({
      success: true,
      message: 'Letter generation successful',
      data: letter
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}