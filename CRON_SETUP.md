# Cron Setup Instructions

## 必要な環境変数（Vercelダッシュボードで設定）

### CRON_SECRET
- 値: ランダムな文字列（例: cron_secret_nutriroom_2025）
- 用途: Cron API認証

### SUPABASE_SERVICE_ROLE_KEY  
- 値: SupabaseのService Role Key
- 用途: 管理者権限でのデータベースアクセス

## テスト方法

### ローカルテスト
```bash
curl -X GET "http://localhost:3000/api/cron/generate-daily-letters" \
  -H "Authorization: Bearer your_cron_secret"
```

### 本番テスト
```bash
curl -X GET "https://your-app.vercel.app/api/cron/generate-daily-letters" \
  -H "Authorization: Bearer your_cron_secret"
```

## 動作仕様

### 実行タイミング
- 毎日22:00（JST）に自動実行

### 処理内容
1. 過去7日以内に会話したアクティブユーザーを取得
2. 重複を除去してユニークなユーザー・キャラクターペアを抽出
3. 各ペアについて今日既にお手紙があるかチェック
4. 未生成の場合のみお手紙を生成
5. 実行結果を集計してログ出力

### 生成条件
- 過去7日以内に会話がある
- 当日まだお手紙が生成されていない
- 対象キャラクターとの会話履歴がある

### パフォーマンス対策
- API呼び出し間隔: 1秒間隔
- 最大会話履歴: 10件まで
- 重複チェックでスキップ処理

## 監視とログ

### 成功ログ
```
🕙 22:00 自動お手紙生成開始
📊 対象ユーザー数: 15
✅ 成功: akari → user123
⏭️ スキップ: akari → user456 (既存)
🎊 22:00自動生成完了: { success_count: 12, error_count: 0 }
```

### エラーログ
```
❌ 失敗: akari → user789 [詳細]
❌ エラー: akari → user101 [例外]
🚨 Cron実行エラー: [全体エラー]
```

## デプロイ後の確認

1. Vercelダッシュボードで環境変数設定
2. Functions タブでCron実行履歴確認
3. ログで成功・失敗件数確認
4. 翌朝のお手紙表示テスト

## トラブルシューティング

### 認証エラー
- CRON_SECRET環境変数の設定確認
- Authorization ヘッダー形式確認

### データベースエラー
- SUPABASE_SERVICE_ROLE_KEY の設定確認
- テーブル権限とRLS設定確認

### 生成エラー
- Gemini API キー設定確認
- /api/generate-letter エンドポイント動作確認