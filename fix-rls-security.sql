-- NutriRoom RLS Security Fix
-- このSQLをSupabaseのSQL Editorで実行してセキュリティ問題を修正

-- 1. RLSを明示的に有効化（foodsテーブル含む）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- 2. 既存のポリシーを削除して再作成（安全な再設定）
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

DROP POLICY IF EXISTS "Anyone can view foods" ON foods;

DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals;

DROP POLICY IF EXISTS "Users can view own meal foods" ON meal_foods;
DROP POLICY IF EXISTS "Users can insert own meal foods" ON meal_foods;
DROP POLICY IF EXISTS "Users can update own meal foods" ON meal_foods;
DROP POLICY IF EXISTS "Users can delete own meal foods" ON meal_foods;

DROP POLICY IF EXISTS "Users can view own nutrition logs" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can insert own nutrition logs" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can update own nutrition logs" ON nutrition_logs;
DROP POLICY IF EXISTS "Users can delete own nutrition logs" ON nutrition_logs;

-- 3. セキュアなポリシーを再作成

-- user_profiles のポリシー
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- conversations のポリシー
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- foods のポリシー（全ユーザーが読み取り可能、管理者のみ変更可能）
CREATE POLICY "Everyone can read foods" ON foods
    FOR SELECT USING (true);

-- 管理者ロールがある場合のみ変更を許可（安全のため現在は無効化）
-- CREATE POLICY "Admins can manage foods" ON foods
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- meals のポリシー
CREATE POLICY "Users can view own meals" ON meals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON meals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON meals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON meals
    FOR DELETE USING (auth.uid() = user_id);

-- meal_foods のポリシー
CREATE POLICY "Users can view own meal foods" ON meal_foods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meal foods" ON meal_foods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own meal foods" ON meal_foods
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own meal foods" ON meal_foods
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

-- nutrition_logs のポリシー
CREATE POLICY "Users can view own nutrition logs" ON nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" ON nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" ON nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" ON nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- 4. セキュリティ強化された更新関数を再作成
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 5. 関数の権限設定
REVOKE ALL ON FUNCTION update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- 6. 確認クエリ
SELECT 
    'Table: ' || schemaname || '.' || tablename || 
    ' | RLS: ' || CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT 
    'Policy: ' || policyname || 
    ' | Table: ' || tablename ||
    ' | Command: ' || cmd as policy_info
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 完了メッセージ
SELECT 'RLS Security fixes applied successfully! ✅' as message;