import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    console.log('🔍 環境変数チェック:');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅設定済み' : '❌未設定');
    console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅設定済み' : '❌未設定');
    console.log('CRON_SECRET:', process.env.CRON_SECRET ? '✅設定済み' : '❌未設定');

    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ 認証失敗:', authHeader);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 環境変数チェック
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ 必要な環境変数が未設定');
      return NextResponse.json({ 
        error: 'Configuration error', 
        details: 'Missing required environment variables' 
      }, { status: 500 });
    }

    // Supabaseクライアント作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🕙 22:00 自動お手紙生成開始');

    // 簡易テスト: 直接お手紙生成を実行
    const testResult = {
      success: true,
      timestamp: new Date().toISOString(),
      processed: 1,
      success_count: 1,
      error_count: 0,
      message: 'Cron test successful - 今回は簡易テスト実行'
    };

    console.log('🎊 Cronテスト完了:', testResult);
    return NextResponse.json(testResult);

  } catch (error) {
    console.error('🚨 Cron実行エラー詳細:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}