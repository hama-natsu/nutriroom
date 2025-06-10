-- NutriRoom RLS Security Fix v2
-- トリガー依存関係を考慮した修正版

-- 1. RLSを明示的に有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- 2. 既存のポリシーを削除して再作成
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

-- 3. トリガーを削除してから関数を修正
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_foods_updated_at ON foods;
DROP TRIGGER IF EXISTS update_meals_updated_at ON meals;
DROP TRIGGER IF EXISTS update_nutrition_logs_updated_at ON nutrition_logs;

-- 4. 関数を削除して再作成
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

-- 6. トリガーを再作成
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at 
    BEFORE UPDATE ON foods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at 
    BEFORE UPDATE ON meals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at 
    BEFORE UPDATE ON nutrition_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. セキュアなポリシーを作成

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

-- foods のポリシー（全ユーザーが読み取り可能）
CREATE POLICY "Everyone can read foods" ON foods
    FOR SELECT USING (true);

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

-- 8. 確認クエリ
SELECT 
    'Table: ' || schemaname || '.' || tablename || 
    ' | RLS: ' || CASE WHEN rowsecurity THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END as security_status
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
SELECT 'RLS Security fixes applied successfully! All triggers and policies recreated. ✅' as message;