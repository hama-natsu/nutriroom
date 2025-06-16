-- 🎯 NutriRoom Phase 2.3: ユーザーセッションテーブル作成
-- useConversationLoggerで使用するセッション管理テーブル

CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'interrupted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_character_id ON user_sessions(character_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(session_status);
CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time);

-- RLS (Row Level Security) 設定
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーのみ自分のセッションにアクセス可能
CREATE POLICY "Users can access their own sessions" 
ON user_sessions FOR ALL 
USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sessions_updated_at 
BEFORE UPDATE ON user_sessions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE user_sessions IS 'NutriRoomユーザーセッション - キャラクターとの対話セッション管理';
COMMENT ON COLUMN user_sessions.user_id IS '認証済みユーザーID (auth.users参照)';
COMMENT ON COLUMN user_sessions.character_id IS 'キャラクターID (akari, mao等)';
COMMENT ON COLUMN user_sessions.session_status IS 'セッション状態: active, completed, interrupted';