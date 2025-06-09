# NutriRoom 🥗

AI栄養士との3Dチャットアプリ - あなた専用の栄養管理パートナー

## 📋 概要

NutriRoomは、AI栄養士と対話しながら食事記録と栄養管理ができる次世代アプリケーションです。3Dキャラクターとの自然な会話を通じて、健康的な食生活をサポートします。

## ✨ 主な機能

- 🔐 **Supabase認証** - 安全なユーザー管理
- 🍽️ **食事記録** - 日々の食事を簡単に記録
- 📊 **栄養分析** - 摂取栄養素の詳細分析
- 🎯 **目標設定** - 個人の健康目標に合わせた栄養計画
- 🤖 **AI栄養士** - パーソナライズされた栄養アドバイス
- 👤 **ユーザープロフィール** - 個人情報と健康データの管理

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **認証・データベース**: Supabase
- **開発ツール**: ESLint, Turbopack

## 📊 データベース構造

- `user_profiles` - ユーザープロフィール情報
- `foods` - 食品データベース
- `meals` - 食事記録
- `meal_foods` - 食事と食品の関連
- `nutrition_logs` - 栄養ログ
- `conversations` - AI栄養士との会話履歴

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/YOUR_USERNAME/nutriroom.git
cd nutriroom
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.local.example .env.local
```

`.env.local`に以下を設定：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 開発サーバーを起動
```bash
npm run dev
```

## 📱 使用方法

1. **アカウント作成** - メールアドレスとパスワードで新規登録
2. **プロフィール設定** - 年齢、性別、身長、体重、目標を入力
3. **食事記録** - 毎日の食事を記録
4. **栄養分析** - 摂取栄養素をリアルタイムで確認
5. **AI相談** - 栄養士AIにアドバイスを求める

## 🔒 セキュリティ

- Row Level Security (RLS) によるデータ保護
- Supabase Auth による安全な認証
- 環境変数による機密情報の管理

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👨‍💻 開発者

Created with ❤️ by [Your Name]

---

**健康的な食生活は、NutriRoomから始まります！** 🌟