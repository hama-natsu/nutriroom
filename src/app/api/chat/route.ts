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
    
    console.error('❌ COMPLETE CHAT API ERROR DETAILS:', {
      // Basic error info
      name: err.name,
      message: err.message,
      
      // HTTP/API specific
      status: err.status,
      statusText: err.statusText,
      code: err.code,
      
      // Gemini specific
      details: err.details,
      cause: err.cause,
      
      // Full objects
      fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      errorObject: err,
      errorConstructor: err.constructor?.name,
      
      // Context
      timestamp: new Date().toISOString(),
      
      // Debugging
      stack: err.stack,
      
      // Environment
      nodeEnv: process.env.NODE_ENV,
      
      // Additional properties that might exist
      response: err.response,
      request: err.request,
      config: err.config,
      
      // Request context
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // より詳細なエラーメッセージ
    let errorMessage = 'チャット処理中にエラーが発生しました';
    let statusCode = 500;
    
    if (err.message?.includes('API_KEY')) {
      errorMessage = 'APIキーの設定に問題があります';
      statusCode = 401;
    } else if (err.message?.includes('QUOTA')) {
      errorMessage = 'API利用量の上限に達しました';
      statusCode = 429;
    } else if (err.message?.includes('FORBIDDEN')) {
      errorMessage = 'APIアクセスが制限されています';
      statusCode = 403;
    } else if (err.message?.includes('timeout')) {
      errorMessage = 'APIリクエストがタイムアウトしました';
      statusCode = 408;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        errorCode: err.code,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}