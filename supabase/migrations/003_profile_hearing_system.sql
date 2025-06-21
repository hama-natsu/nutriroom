-- Phase 5.1: 事前ヒアリングシステム - user_profilesテーブル拡張
-- 実行日: 2025-06-21
-- 実装者: Claude Code

-- user_profilesテーブルに事前ヒアリング用のカラムを追加
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS age_group VARCHAR(10) CHECK (age_group IN ('20代', '30代', '40代', '50代以上'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goal_type VARCHAR(20) CHECK (goal_type IN ('体重管理', '健康維持', '筋肉増量', '生活習慣改善'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS activity_level_jp VARCHAR(15) CHECK (activity_level_jp IN ('座り仕事中心', '軽い運動', '活発', 'アスリート'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS meal_timing VARCHAR(10) CHECK (meal_timing IN ('規則的', '不規則', '夜遅め'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cooking_frequency VARCHAR(15) CHECK (cooking_frequency IN ('毎日自炊', '時々', '外食中心', 'コンビニ中心'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS main_concern VARCHAR(20) CHECK (main_concern IN ('間食', '偏食', '量', '栄養バランス'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS advice_style VARCHAR(15) CHECK (advice_style IN ('すぐ実践', 'じっくり学習'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS info_preference VARCHAR(10) CHECK (info_preference IN ('簡潔', '詳しく'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- インデックスを追加（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_completed ON user_profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_goal_type ON user_profiles(goal_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_activity_level_jp ON user_profiles(activity_level_jp);

-- RLSポリシーは既存のものが適用される（user_id ベース）

-- マイグレーション完了ログ
SELECT 'Phase 5.1: Profile hearing system migration completed successfully!' as message;