-- 🎯 NutriRoom Phase 2.3: セッション管理基盤構築
-- 「今日のお手紙」システムのためのデータベース設計

-- 1. ユーザーセッションテーブル
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  session_status TEXT DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'interrupted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 会話ログテーブル
CREATE TABLE conversation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
  message_content TEXT NOT NULL,
  voice_file_used TEXT,
  emotion_detected TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 日次サマリーテーブル（今日のお手紙用）
CREATE TABLE daily_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  character_id TEXT NOT NULL,
  letter_content TEXT,
  main_topics TEXT[],
  session_count INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  emotions_detected TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, character_id)
);

-- インデックス作成（パフォーマンス最適化）
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_character_id ON user_sessions(character_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(session_status);

CREATE INDEX idx_conversation_logs_session_id ON conversation_logs(session_id);
CREATE INDEX idx_conversation_logs_timestamp ON conversation_logs(timestamp);
CREATE INDEX idx_conversation_logs_type ON conversation_logs(message_type);

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date);
CREATE INDEX idx_daily_summaries_character ON daily_summaries(character_id);

-- 更新時間の自動更新（トリガー）
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

CREATE TRIGGER update_daily_summaries_updated_at 
    BEFORE UPDATE ON daily_summaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();