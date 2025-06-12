# ElevenLabs API統合ガイド

## 概要

NutriRoomにElevenLabs APIを統合し、高品質な日本語音声合成機能を実装しました。

## 実装機能

### 1. 基本音声生成機能

```typescript
// 基本的な音声生成
const audioUrl = await elevenLabsVoiceService.generateElevenLabsVoice(
  "こんにちは、テストです", 
  "minato"
)
```

### 2. 名前読み上げ機能

```typescript
// "[ユーザー名]さん" を各キャラクター声で生成
const audioUrl = await elevenLabsVoiceService.generateNameGreeting(
  "太郎", 
  "akari"
)
```

### 3. 統合音声システム（優先使用モード）

- **ElevenLabs最優先**: APIキー設定時はすべてのテキスト（500文字以内）でElevenLabsを使用
- **Google TTS フォールバック**: ElevenLabsが利用不可、失敗、または文字数制限超過時の代替

## 設定

### 環境変数

`.env.local` に以下を追加：

```bash
# ElevenLabs API設定
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
```

### 音声品質設定

最適化済み設定（日本語対応）：

```typescript
{
  model_id: "eleven_multilingual_v2",  // 日本語最適モデル
  voice_settings: {
    stability: 0.5,           // 音声安定性
    similarity_boost: 0.75    // 類似性ブースト
  }
}
```

## キャラクター別音声ID

| キャラクター | 音声名 | Voice ID |
|-------------|--------|----------|
| minato | Yamato | bqpOyYNUu11tjjvRUbKn |
| akari | Sakura Suzuki | RBnMinrYKeccY3vaUxlZ |
| yuki | Morioki | 8EkOjt4xTPGMclNlh1pk |
| riku | Asashi | GKDaBI8TKSBJVhsCLD6n |
| mao | Kyoko | 4lOQ7A2l7HPuG7UIHiKA |
| satsuki | Harmony | 7t2ZyEiayA71HXxCzkln |
| sora | Ichiro | LNzr3u01PIEDg0fRlvE7 |

## 使用方法

### 1. 基本的な音声生成

```typescript
import { elevenLabsVoiceService } from '@/lib/elevenlabs-voice-service'

// 音声生成
const audioUrl = await elevenLabsVoiceService.generateElevenLabsVoice(
  "おはようございます", 
  "minato"
)

// 音声再生
if (audioUrl) {
  const audio = new Audio(audioUrl)
  await audio.play()
}
```

### 2. 名前読み上げ

```typescript
import { generateNameGreeting } from '@/lib/elevenlabs-config'

// 名前呼びかけテキスト生成
const greetingText = generateNameGreeting("太郎", "akari")
// 結果: "太郎さん♪" または "太郎ちゃん！" など

// 音声生成して再生
const success = await elevenLabsVoiceService.playNameCall("太郎", "akari")
```

### 3. 統合音声システム（優先使用モード）

```typescript
import { VoicePriority } from '@/lib/voice-config'

// 一般的なチャット（ElevenLabs優先、Google TTSフォールバック）
await elevenLabsVoiceService.generateAndPlay(
  "今日の栄養について説明します", 
  "riku",
  VoicePriority.GENERAL_CHAT
)

// 名前呼びかけ（ElevenLabs最優先）
await elevenLabsVoiceService.generateAndPlay(
  "", 
  "yuki",
  VoicePriority.USER_NAME_CALLING,
  "さくら"
)

// 長文（500文字以上は自動的にGoogle TTSフォールバック）
await elevenLabsVoiceService.generateAndPlay(
  "非常に長いテキスト...", 
  "minato",
  VoicePriority.GENERAL_CHAT
)
```

## テスト・デバッグ機能

### ブラウザコンソールでのテスト

#### 基本テスト機能

```javascript
// 設定確認
window.elevenLabsTest.testConfiguration()

// 名前生成テスト
window.elevenLabsTest.testNameGeneration()

// 基本音声テスト
await window.elevenLabsTest.testBasicVoice('minato')

// 名前読み上げテスト
await window.elevenLabsTest.testNameGreeting('テストユーザー', 'akari')

// 全機能テスト
await window.elevenLabsTest.runFullTest()

// 特定キャラクターの音声テスト
await window.elevenLabsTest.testCharacter('sora', 'こんにちは')
```

#### デバッグ機能

```javascript
// 設定詳細表示
window.elevenLabsTest.debug.showConfig()

// キャラクター設定表示
window.elevenLabsTest.debug.showCharacters()

// APIキーテスト
window.elevenLabsTest.debug.testApiKey()

// キャッシュクリア
window.elevenLabsTest.debug.clearCache()

// デバッグモード切り替え
window.elevenLabsTest.debug.enableDebugMode()
window.elevenLabsTest.debug.disableDebugMode()

// ログ表示
window.elevenLabsTest.debug.showLogs()
```

#### ユーティリティ機能

```javascript
// 利用可能キャラクター一覧
window.elevenLabsTest.utils.listAllCharacters()

// キャラクター設定取得
window.elevenLabsTest.utils.getCharacterConfig('minato')

// テストテキスト生成
const testText = window.elevenLabsTest.utils.generateTestText(100)

// パフォーマンステスト
await window.elevenLabsTest.utils.benchmarkVoiceGeneration('akari', 5)
```

### デバッグモード自動有効化

URLパラメータで自動デバッグモード：
```
http://localhost:3000/?debug=true
```

## APIエンドポイント

### `/api/elevenlabs-tts`

ElevenLabs音声合成API

**リクエスト:**
```typescript
{
  text: string,           // 音声化するテキスト
  characterId: string,    // キャラクターID
  voiceConfig?: object    // 音声設定（オプション）
}
```

**レスポンス:**
- 成功: MP3音声データ
- エラー: JSONエラーメッセージ

## エラーハンドリング

- **401**: 無効なAPIキー
- **402**: クレジット不足
- **422**: 無効な音声IDまたはパラメータ
- **500**: 一般的なサーバーエラー

## 優先システム

### ElevenLabs最優先使用

1. **APIキー確認**: `ELEVENLABS_API_KEY`が設定されている場合
2. **文字数制限**: 500文字以内のテキスト
3. **音声ID確認**: キャラクターに対応する音声IDが存在

### Google TTSフォールバック

以下の場合に自動的にGoogle TTSを使用：
- ElevenLabs APIキーが未設定
- テキストが500文字を超過
- ElevenLabs API呼び出しが失敗
- キャラクターの音声IDが見つからない

## パフォーマンス

- **キャッシュ**: 音声ファイルを30分間キャッシュ
- **自動フォールバック**: ElevenLabs失敗時はGoogle TTSに自動切り替え
- **最適化**: 日本語専用モデル使用で高品質音声
- **優先使用**: APIキー設定時はElevenLabsを最大限活用

## セキュリティ

- APIキーは環境変数で管理
- サーバーサイドでのみAPIキーを使用
- クライアントサイドにAPIキーは露出しない

## 今後の拡張

1. **ストリーミング再生**: リアルタイム音声ストリーミング
2. **感情パラメータ**: キャラクター別の感情表現
3. **音声速度調整**: ユーザー設定による再生速度変更
4. **音声キューシステム**: 複数音声の順次再生

## トラブルシューティング

### よくある問題

1. **音声が生成されない**
   - APIキーが正しく設定されているか確認
   - ElevenLabsアカウントにクレジットがあるか確認

2. **特定のキャラクターで失敗**
   - Voice IDが正しいか確認
   - 該当音声がElevenLabsで利用可能か確認

3. **テキストが長すぎる**
   - 500文字以下に制限
   - 長文は自動的にGoogle TTSにフォールバック

### デバッグ

```javascript
// サポート状況確認
elevenLabsVoiceService.isElevenLabsSupported()

// 設定確認
elevenLabsVoiceService.getVoiceConfig('minato')

// フルテスト実行
await window.elevenLabsTest.runFullTest()
```