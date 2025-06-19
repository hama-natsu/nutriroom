import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🔍 環境変数チェック
console.log('🔍 環境変数チェック:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅設定済み' : '❌未設定');
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅設定済み' : '❌未設定');
console.log('CRON_SECRET:', process.env.CRON_SECRET ? '✅設定済み' : '❌未設定');

// Supabase client initialization with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: Request) {
  try {
    // Environment variables check
    if (!supabase) {
      console.error('❌ Supabase client not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'Configuration error', details: 'Database not available' },
        { status: 500 }
      );
    }

    // 認証チェック (Vercel Cronからのリクエストのみ許可)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕙 22:00 自動お手紙生成開始');

    // アクティブユーザーを取得（過去7日以内に会話したユーザー）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activeUsers, error: usersError } = await supabase
      .from('conversation_logs')
      .select('user_id, character_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Ensure activeUsers is not null
    if (!activeUsers) {
      console.log('📊 アクティブユーザーなし');
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        processed: 0,
        success_count: 0,
        error_count: 0
      });
    }

    // ユニークなユーザー・キャラクター組み合わせを抽出
    const uniqueUserCharacters = Array.from(
      new Map(
        activeUsers.map(log => [`${log.user_id}-${log.character_id}`, log])
      ).values()
    ) as Array<{ user_id: string; character_id: string }>;

    console.log(`📊 対象ユーザー数: ${uniqueUserCharacters.length}`);

    let successCount = 0;
    let errorCount = 0;

    // 各ユーザー・キャラクターペアでお手紙生成
    for (const { user_id, character_id } of uniqueUserCharacters) {
      try {
        // 今日既にお手紙があるかチェック
        const today = new Date().toISOString().split('T')[0];
        const { data: existingLetter } = await supabase
          .from('daily_summaries')
          .select('id')
          .eq('user_id', user_id)
          .eq('character_id', character_id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)
          .limit(1);

        if (existingLetter && existingLetter.length > 0) {
          console.log(`⏭️ スキップ: ${character_id} → ${user_id} (既存)`);
          continue;
        }

        // 過去の会話を取得
        const { data: conversations } = await supabase
          .from('conversation_logs')
          .select('message, response, created_at')
          .eq('user_id', user_id)
          .eq('character_id', character_id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        if (!conversations || conversations.length === 0) {
          console.log(`⏭️ スキップ: ${character_id} → ${user_id} (会話なし)`);
          continue;
        }

        // お手紙生成API呼び出し
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/generate-letter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character_id,
            user_id,
            conversations: conversations.slice(0, 10)
          })
        });

        if (response.ok) {
          console.log(`✅ 成功: ${character_id} → ${user_id}`);
          successCount++;
        } else {
          console.error(`❌ 失敗: ${character_id} → ${user_id}`, await response.text());
          errorCount++;
        }

        // API制限対策で少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ エラー: ${character_id} → ${user_id}`, error);
        errorCount++;
      }
    }

    // 結果を返却（この行で result 変数を使用）
    const cronResult = {
      success: true,
      timestamp: new Date().toISOString(),
      processed: uniqueUserCharacters.length,
      success_count: successCount,
      error_count: errorCount
    };

    console.log('🎊 22:00自動生成完了:', cronResult);
    return NextResponse.json(cronResult);

  } catch (error) {
    console.error('🚨 Cron実行エラー:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}