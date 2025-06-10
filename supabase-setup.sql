-- NutriRoom Database Setup
-- このSQLをSupabaseのSQL Editorで実行してください

-- 1. ユーザープロフィールテーブル
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    height DECIMAL(5,2), -- cm
    weight DECIMAL(5,2), -- kg
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    goal TEXT CHECK (goal IN ('maintain', 'lose_weight', 'gain_weight', 'build_muscle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 会話履歴テーブル
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 食品データベーステーブル
CREATE TABLE foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    brand TEXT,
    category TEXT NOT NULL,
    calories_per_100g DECIMAL(7,2) NOT NULL,
    protein_per_100g DECIMAL(7,2) NOT NULL,
    carbs_per_100g DECIMAL(7,2) NOT NULL,
    fat_per_100g DECIMAL(7,2) NOT NULL,
    fiber_per_100g DECIMAL(7,2),
    sugar_per_100g DECIMAL(7,2),
    sodium_per_100g DECIMAL(7,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 食事記録テーブル
CREATE TABLE meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 食事-食品関連テーブル
CREATE TABLE meal_foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(7,2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'g',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 栄養ログテーブル
CREATE TABLE nutrition_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_calories DECIMAL(7,2) NOT NULL,
    total_protein DECIMAL(7,2) NOT NULL,
    total_carbs DECIMAL(7,2) NOT NULL,
    total_fat DECIMAL(7,2) NOT NULL,
    total_fiber DECIMAL(7,2),
    total_sugar DECIMAL(7,2),
    total_sodium DECIMAL(7,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 7. Row Level Security (RLS) を有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- 8. RLSポリシーを作成

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

-- foods テーブルは全ユーザーが読み取り可能
CREATE POLICY "Anyone can view foods" ON foods FOR SELECT USING (true);

-- 9. 更新時刻の自動更新用関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. トリガーを作成
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_logs_updated_at BEFORE UPDATE ON nutrition_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. サンプル食品データを追加
INSERT INTO foods (name, name_en, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g) VALUES
('白米', 'White Rice', '穀類', 356, 6.1, 77.6, 0.9, 0.5),
('鶏胸肉', 'Chicken Breast', '肉類', 108, 22.3, 0, 1.5, 0),
('卵', 'Egg', 'その他', 151, 12.3, 0.3, 10.3, 0),
('ブロッコリー', 'Broccoli', '野菜', 33, 4.3, 5.2, 0.5, 4.4),
('バナナ', 'Banana', 'フルーツ', 86, 1.1, 22.5, 0.2, 2.6),
('牛乳', 'Milk', '乳製品', 67, 3.3, 5.0, 3.8, 0),
('食パン', 'Bread', '穀類', 264, 9.3, 46.7, 4.4, 2.3),
('鮭', 'Salmon', '魚類', 139, 22.3, 0.1, 4.5, 0);

-- セットアップ完了メッセージ
SELECT 'NutriRoom database setup completed successfully!' as message;