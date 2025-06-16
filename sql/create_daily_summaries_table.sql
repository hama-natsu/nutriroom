-- 🎯 NutriRoom Phase 2.4: 日次サマリーテーブル作成
-- お手紙システムで使用する日次統計・サマリーテーブル

CREATE TABLE daily_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  letter_content TEXT,
  main_topics TEXT[] DEFAULT '{}',
  session_count INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  emotions_detected TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 日付ごとにユニーク制約
  UNIQUE(user_id, character_id, date)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_daily_summaries_user_id ON daily_summaries(user_id);
CREATE INDEX idx_daily_summaries_character_id ON daily_summaries(character_id);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(date);
CREATE INDEX idx_daily_summaries_user_char_date ON daily_summaries(user_id, character_id, date);

-- RLS (Row Level Security) 設定
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーのみ自分のサマリーにアクセス可能
CREATE POLICY "Users can access their own daily summaries" 
ON daily_summaries FOR ALL 
USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE TRIGGER update_daily_summaries_updated_at 
BEFORE UPDATE ON daily_summaries 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE daily_summaries IS 'NutriRoom日次サマリー - 日別の会話統計とお手紙内容';
COMMENT ON COLUMN daily_summaries.user_id IS '認証済みユーザーID (auth.users参照)';
COMMENT ON COLUMN daily_summaries.character_id IS 'キャラクターID (akari, mao等)';
COMMENT ON COLUMN daily_summaries.date IS 'サマリー対象日';
COMMENT ON COLUMN daily_summaries.letter_content IS '生成されたお手紙内容';
COMMENT ON COLUMN daily_summaries.main_topics IS '主要な会話トピック配列';
COMMENT ON COLUMN daily_summaries.session_count IS 'その日のセッション数';
COMMENT ON COLUMN daily_summaries.total_messages IS 'その日の総メッセージ数';
COMMENT ON COLUMN daily_summaries.emotions_detected IS '検出された感情の配列';