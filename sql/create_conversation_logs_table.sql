-- 🎯 NutriRoom Phase 2.3: 会話ログテーブル作成
-- useConversationLoggerで使用する適切なテーブル構造

CREATE TABLE conversation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
  message_content TEXT NOT NULL,
  voice_file_used TEXT,
  emotion_detected TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_conversation_logs_session_id ON conversation_logs(session_id);
CREATE INDEX idx_conversation_logs_timestamp ON conversation_logs(timestamp);
CREATE INDEX idx_conversation_logs_message_type ON conversation_logs(message_type);

-- RLS (Row Level Security) 設定
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーのみアクセス可能
CREATE POLICY "Users can access their own conversation logs" 
ON conversation_logs FOR ALL 
USING (auth.uid()::text IN (
  SELECT user_id FROM user_sessions WHERE id = conversation_logs.session_id
));

-- コメント追加
COMMENT ON TABLE conversation_logs IS 'NutriRoom会話ログ - ユーザーとAIの対話履歴を保存';
COMMENT ON COLUMN conversation_logs.session_id IS 'user_sessionsテーブルのsession_id';
COMMENT ON COLUMN conversation_logs.message_type IS 'メッセージタイプ: user (ユーザー) または ai (AI応答)';
COMMENT ON COLUMN conversation_logs.message_content IS 'メッセージ内容';
COMMENT ON COLUMN conversation_logs.voice_file_used IS '使用された音声ファイル名（オプション）';
COMMENT ON COLUMN conversation_logs.emotion_detected IS '検出された感情情報（オプション）';