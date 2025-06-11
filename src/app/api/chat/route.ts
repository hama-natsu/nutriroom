import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'
import { characters } from '@/lib/characters'

export async function POST(request: NextRequest) {
  console.log('🚀 Chat API route called');
  console.error('🔥 FORCED ERROR LOG: Chat API route called');
  console.warn('⚠️ WARNING LOG: Chat API route called');
  
  // 強制アラート表示
  if (typeof global !== 'undefined') {
    try {
      // サーバーサイドでも強制ログ
      console.error('🚨 SERVER ALERT: API ROUTE STARTED');
    } catch (e) {
      console.error('Alert error:', e);
    }
  }
  
  // 環境変数の詳細確認 - 複数ログレベルで強制表示
  console.error('🔑 API_KEY_EXISTS:', !!process.env.GOOGLE_AI_API_KEY);
  console.warn('🔑 API_KEY_EXISTS:', !!process.env.GOOGLE_AI_API_KEY);
  console.log('🔑 API_KEY_EXISTS:', !!process.env.GOOGLE_AI_API_KEY);
  
  console.error('🔑 API_KEY_LENGTH:', process.env.GOOGLE_AI_API_KEY?.length);
  console.warn('🔑 API_KEY_LENGTH:', process.env.GOOGLE_AI_API_KEY?.length);
  
  console.error('🔑 API_KEY_START:', process.env.GOOGLE_AI_API_KEY?.substring(0, 10) || 'undefined');
  console.warn('🔑 API_KEY_START:', process.env.GOOGLE_AI_API_KEY?.substring(0, 10) || 'undefined');
  
  console.error('🔑 IS_PLACEHOLDER:', process.env.GOOGLE_AI_API_KEY?.includes('your_google_ai_api_key'));
  console.warn('🔑 IS_PLACEHOLDER:', process.env.GOOGLE_AI_API_KEY?.includes('your_google_ai_api_key'));
  
  console.error('🌍 NODE_ENV:', process.env.NODE_ENV);
  console.warn('🌍 NODE_ENV:', process.env.NODE_ENV);
  
  console.error('🌍 VERCEL_ENV:', process.env.VERCEL_ENV);
  console.warn('🌍 VERCEL_ENV:', process.env.VERCEL_ENV);
  
  // デバッグ情報を準備
  const debugInfo = {
    apiKeyExists: !!process.env.GOOGLE_AI_API_KEY,
    apiKeyLength: process.env.GOOGLE_AI_API_KEY?.length || 0,
    apiKeyStart: process.env.GOOGLE_AI_API_KEY?.substring(0, 10) || 'undefined',
    isPlaceholder: process.env.GOOGLE_AI_API_KEY?.includes('your_google_ai_api_key') || false,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  };
  
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
    console.warn('🔄 Calling generateResponse...');
    console.error('🔄 Calling generateResponse...');
    
    console.log('🤖 GEMINI_MODEL_INIT: 開始');
    console.warn('🤖 GEMINI_MODEL_INIT: 開始');
    console.error('🤖 GEMINI_MODEL_INIT: 開始');
    
    // キャラクターを取得
    const character = characters.find(c => c.id === characterId);
    if (!character) {
      console.error('❌ Character not found:', characterId);
      return NextResponse.json(
        { error: 'キャラクターが見つかりません' },
        { status: 404 }
      );
    }

    // Gemini APIを使用してレスポンスを生成
    const response = await generateResponse(character, message, conversationHistory)
    
    console.log('🤖 GEMINI_MODEL_INIT: 完了');
    console.warn('🤖 GEMINI_MODEL_INIT: 完了');
    console.error('🤖 GEMINI_MODEL_INIT: 完了');

    // 実際のレスポンステキストを詳細ログ
    console.error('🔥 API ROUTE - ACTUAL GEMINI RESPONSE:', response);
    console.error('🔥 API ROUTE - RESPONSE TYPE:', typeof response);
    console.error('🔥 API ROUTE - RESPONSE LENGTH:', response.length);
    console.error('🔥 API ROUTE - RESPONSE PREVIEW:', response.substring(0, 200));
    console.error('🔥 API ROUTE - IS ERROR RESPONSE?', response.toLowerCase().includes('error'));

    console.log('✅ Response generated:', {
      responseLength: response.length,
      success: true
    });

    return NextResponse.json({ 
      response,
      // デバッグ情報は開発環境でのみ
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          ...debugInfo,
          success: true,
          responseLength: response.length,
          timestamp: new Date().toISOString(),
          actualResponseText: response
        }
      })
    })
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    
    // 本番環境用の詳細ログ出力 - 全ログレベルで強制表示
    console.log('🔥 PRODUCTION ERROR DETAILS START 🔥');
    console.warn('🔥 PRODUCTION ERROR DETAILS START 🔥');
    console.error('🔥 PRODUCTION ERROR DETAILS START 🔥');
    
    console.log('ERROR_MESSAGE:', err.message);
    console.warn('ERROR_MESSAGE:', err.message);
    console.error('ERROR_MESSAGE:', err.message);
    
    console.log('ERROR_STACK:', err.stack);
    console.warn('ERROR_STACK:', err.stack);
    console.error('ERROR_STACK:', err.stack);
    
    console.log('ERROR_STATUS:', err.status);
    console.warn('ERROR_STATUS:', err.status);
    console.error('ERROR_STATUS:', err.status);
    
    console.log('ERROR_CODE:', err.code);
    console.warn('ERROR_CODE:', err.code);
    console.error('ERROR_CODE:', err.code);
    
    console.log('🔥 PRODUCTION ERROR DETAILS END 🔥');
    console.warn('🔥 PRODUCTION ERROR DETAILS END 🔥');
    console.error('🔥 PRODUCTION ERROR DETAILS END 🔥');
    
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
      apiKeyExists: !!process.env.GOOGLE_AI_API_KEY,
      apiKeyLength: process.env.GOOGLE_AI_API_KEY?.length,
      
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
        details: err.message, // 本番環境でも表示
        errorCode: err.code,
        timestamp: new Date().toISOString(),
        debug: {
          ...debugInfo,
          success: false,
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack?.substring(0, 500) || 'No stack',
          errorStatus: err.status,
          errorCode: err.code,
          errorDetails: err.details,
          errorCause: err.cause,
          fullErrorJson: JSON.stringify(err, Object.getOwnPropertyNames(err), 2).substring(0, 1000),
          forceVisible: true,
          serverAlert: 'ERROR: API failed with error - ' + err.message?.substring(0, 100),
          logLevels: 'ALL LEVELS (log, warn, error) used for visibility'
        }
      },
      { status: statusCode }
    )
  }
}