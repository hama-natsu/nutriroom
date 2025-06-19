import { NextResponse } from 'next/server';

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

    console.log('🕙 22:00 自動お手紙生成開始');

    // 既存のお手紙生成APIを直接呼び出し（安全な方法）
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://nutriroom.vercel.app';
    
    try {
      const response = await fetch(`${baseUrl}/api/generate-letter`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          character_id: 'akari',
          cron_mode: true  // Cronモードフラグ
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const cronResult = {
          success: true,
          timestamp: new Date().toISOString(),
          processed: 1,
          success_count: 1,
          error_count: 0,
          message: '既存APIを使用したお手紙生成成功',
          letter_generated: true
        };

        console.log('🎊 22:00自動生成完了:', cronResult);
        return NextResponse.json(cronResult);
      } else {
        throw new Error(`お手紙生成失敗: ${result.error || 'Unknown error'}`);
      }

    } catch (fetchError) {
      console.error('❌ お手紙生成API呼び出しエラー:', fetchError);
      
      // フォールバック: 成功レスポンス（最低限の動作保証）
      const fallbackResult = {
        success: true,
        timestamp: new Date().toISOString(),
        processed: 1,
        success_count: 0,
        error_count: 1,
        message: 'Cronは実行されましたが、お手紙生成でエラーが発生',
        error_details: fetchError instanceof Error ? fetchError.message : String(fetchError)
      };

      console.log('⚠️ フォールバック実行:', fallbackResult);
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error('🚨 Cron実行エラー詳細:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      code: error instanceof Error && 'code' in error ? error.code : 'UNKNOWN'
    }, { status: 500 });
  }
}