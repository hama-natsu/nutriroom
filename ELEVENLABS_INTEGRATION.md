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

### 3. 統合音声システム

- **ElevenLabs優先**: 短いテキストや名前呼びかけに使用
- **Google TTS フォールバック**: ElevenLabsが失敗した場合の代替

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

### 3. 統合音声システム

```typescript
import { VoicePriority } from '@/lib/voice-config'

// 一般的なチャット（Google TTS）
await elevenLabsVoiceService.generateAndPlay(
  "今日の栄養について説明します...", 
  "riku",
  VoicePriority.GENERAL_CHAT
)

// 名前呼びかけ（ElevenLabs優先）
await elevenLabsVoiceService.generateAndPlay(
  "", 
  "yuki",
  VoicePriority.USER_NAME_CALLING,
  "さくら"
)
```

## テスト

### ブラウザコンソールでのテスト

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
```

### 個別キャラクターテスト

```javascript
// 特定キャラクターの音声テスト
await window.elevenLabsTest.testCharacter('sora', 'こんにちは')
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

## パフォーマンス

- **キャッシュ**: 音声ファイルを30分間キャッシュ
- **フォールバック**: ElevenLabs失敗時はGoogle TTSに自動切り替え
- **最適化**: 日本語専用モデル使用で高品質音声

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