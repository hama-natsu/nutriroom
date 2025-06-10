import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  console.log('🚀 Chat API route called');
  
  try {
    console.log('📥 Parsing request body...');
    const { characterId, message, conversationHistory } = await request.json()

    console.log('📋 Request data:', {
      characterId,
      messageLength: message?.length || 0,
      historyLength: conversationHistory?.length || 0,
      hasCharacterId: !!characterId,
      hasMessage: !!message
    });

    // 入力バリデーション
    if (!characterId || !message) {
      console.error('❌ Validation failed:', { characterId: !!characterId, message: !!message });
      return NextResponse.json(
        { error: 'キャラクターIDとメッセージは必須です' },
        { status: 400 }
      )
    }

    console.log('🔄 Calling generateResponse...');
    // Gemini APIを使用してレスポンスを生成
    const response = await generateResponse(characterId, message, conversationHistory)

    console.log('✅ Response generated:', {
      responseLength: response.length,
      success: true
    });

    return NextResponse.json({ response })
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error('❌ Chat API Error Details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'チャット処理中にエラーが発生しました',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    )
  }
}