# 🎯 NutriRoom Phase 2.3 データベースセットアップ

## 🚨 緊急問題解決: 会話データ収集システム修正

### 問題状況
- ✅ 音声システム（Phase 2.2）: 100%完璧動作
- ❌ データ保存システム（Phase 2.3）: 0%動作
- 原因: 必要なテーブルが存在しない

### 解決方法: 以下のSQLファイルをSupabaseで実行

## 📋 実行順序

### 1. ユーザーセッションテーブル作成
```bash
# Supabaseダッシュボードで実行
cat create_user_sessions_table.sql
```

### 2. 会話ログテーブル作成
```bash
# Supabaseダッシュボードで実行  
cat create_conversation_logs_table.sql
```

### 3. 日次サマリーテーブル作成
```bash
# Supabaseダッシュボードで実行
cat create_daily_summaries_table.sql
```

## 🔧 Supabaseでの実行手順

1. **Supabaseダッシュボード**にログイン
2. **SQL Editor**を開く
3. 上記SQLファイルの内容を**順番に**コピー＆ペースト
4. **Run**ボタンをクリックして実行

## ✅ 実行後の確認

### テーブル確認
```sql
-- テーブル存在確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_sessions', 'conversation_logs', 'daily_summaries');
```

### RLS確認  
```sql
-- Row Level Security確認
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('user_sessions', 'conversation_logs', 'daily_summaries');
```

## 🎯 実行後の効果

- ✅ useConversationLogger正常動作
- ✅ 会話データ正常保存
- ✅ conversationテーブルにデータ蓄積
- ✅ お手紙システム正常動作

## 🚀 代替手順（高速テスト用）

テーブル作成前に動作テストする場合：

1. **一時的ダミー処理**: 現在のコードでログ出力確認
2. **Supabase接続確認**: 他のテーブル（user_profiles等）へのアクセステスト
3. **テーブル作成**: 上記SQLを実行
4. **完全テスト**: 会話ログ保存完全動作確認

## 📊 期待される結果

実行完了後：
- conversationsテーブル → 空のまま（使用しない）
- conversation_logsテーブル → ユーザー・AI会話が蓄積される
- user_sessionsテーブル → セッション情報が蓄積される  
- daily_summariesテーブル → 日次統計が蓄積される