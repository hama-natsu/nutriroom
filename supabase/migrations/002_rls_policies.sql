-- 🔒 Row Level Security (RLS) ポリシー設定
-- ユーザーは自分のデータのみアクセス可能

-- RLS有効化
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- 1. user_sessionsテーブルのポリシー
-- ユーザーは自分のセッションのみ表示可能
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のセッションのみ作成可能
CREATE POLICY "Users can create own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のセッションのみ更新可能
CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のセッションのみ削除可能
CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 2. conversation_logsテーブルのポリシー
-- ユーザーは自分のセッションの会話ログのみ表示可能
CREATE POLICY "Users can view own conversation logs" ON conversation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_sessions 
      WHERE user_sessions.id = conversation_logs.session_id 
      AND user_sessions.user_id = auth.uid()
    )
  );

-- ユーザーは自分のセッションに会話ログを作成可能
CREATE POLICY "Users can create conversation logs for own sessions" ON conversation_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_sessions 
      WHERE user_sessions.id = conversation_logs.session_id 
      AND user_sessions.user_id = auth.uid()
    )
  );

-- ユーザーは自分の会話ログのみ更新可能
CREATE POLICY "Users can update own conversation logs" ON conversation_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_sessions 
      WHERE user_sessions.id = conversation_logs.session_id 
      AND user_sessions.user_id = auth.uid()
    )
  );

-- 3. daily_summariesテーブルのポリシー
-- ユーザーは自分のサマリーのみ表示可能
CREATE POLICY "Users can view own daily summaries" ON daily_summaries
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のサマリーのみ作成可能
CREATE POLICY "Users can create own daily summaries" ON daily_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のサマリーのみ更新可能
CREATE POLICY "Users can update own daily summaries" ON daily_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のサマリーのみ削除可能
CREATE POLICY "Users can delete own daily summaries" ON daily_summaries
  FOR DELETE USING (auth.uid() = user_id);