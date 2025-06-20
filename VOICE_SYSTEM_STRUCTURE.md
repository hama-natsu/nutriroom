# 🎯 統一音声システム - ファイル命名規則

## 📋 概要
レガシーシステムを完全除去し、あかりで成功したパターンを全7キャラクターに拡張。

## 🎭 対応キャラクター
- `akari` (あかり) - 完全実装済み
- `minato` (みなと) - 完全実装済み  
- `yuki` (ゆき) - 統一システム対応
- `riku` (りく) - 統一システム対応
- `mao` (まお) - 統一システム対応
- `satsuki` (さつき) - 統一システム対応
- `sora` (そら) - 統一システム対応

## 📁 統一ファイル命名規則

### ⏰ 時間帯別音声 (11パターン)
```
{character}_very_late.wav     # 1:00-4:59 (超深夜)
{character}_morning_early.wav # 5:00-6:59 (早朝)
{character}_morning.wav       # 7:00-8:59 (朝)
{character}_morning_late.wav  # 9:00-10:59 (朝遅め)
{character}_lunch.wav         # 11:00-12:59 (昼食)
{character}_afternoon.wav     # 13:00-14:59 (午後)
{character}_snack.wav         # 15:00-16:59 (おやつ)
{character}_evening.wav       # 17:00-18:59 (夕方)
{character}_dinner.wav        # 19:00-20:59 (夕食)
{character}_night.wav         # 21:00-22:59 (夜)
{character}_late.wav          # 23:00-0:59 (深夜)
```

### 💭 感情別音声 (16パターン)
```
{character}_agreement.wav     # 同意・共感
{character}_understanding.wav # 理解・納得
{character}_surprise.wav      # 驚き・興味
{character}_thinking.wav      # 考え込み
{character}_great.wav         # 称賛・素晴らしい
{character}_nice.wav          # 肯定評価
{character}_effort.wav        # 努力認知
{character}_empathy.wav       # 気持ち共感
{character}_thanks.wav        # 感謝
{character}_welcome.wav       # どういたしまして
{character}_sorry.wav         # 謝罪
{character}_no_problem.wav    # 安心・問題なし
{character}_encouragement.wav # 励まし・応援
{character}_cheer.wav         # 応援・ファイト
{character}_support.wav       # サポート宣言
{character}_care.wav          # 気遣い・ケア
```

### 🌸 季節別音声 (4パターン)
```
{character}_spring.wav        # 春
{character}_summer.wav        # 夏
{character}_autumn.wav        # 秋
{character}_winter.wav        # 冬
```

## 📁 ディレクトリ構造
```
/public/audio/recorded/
├── akari/           # あかり (35ファイル実装済み)
│   ├── akari_morning_late.wav
│   ├── akari_encouragement.wav
│   ├── akari_spring.wav
│   └── ...
├── minato/          # みなと (35ファイル実装済み)
│   ├── minato_morning_late.wav
│   ├── minato_encouragement.wav
│   ├── minato_spring.wav
│   └── ...
├── yuki/            # ゆき (統一システム対応)
│   ├── yuki_morning_late.wav
│   ├── yuki_encouragement.wav
│   └── ...
├── riku/            # りく (統一システム対応)
├── mao/             # まお (統一システム対応)
├── satsuki/         # さつき (統一システム対応)
└── sora/            # そら (統一システム対応)
```

## 🎯 使用例

### 時間帯ベース選択
```typescript
// 10:40の場合
const timeSlot = getUnifiedTimeSlot(); // 'morning_late'
const voiceFile = getVoiceFile('minato', timeSlot);
// 結果: 'minato_morning_late.wav'
```

### 感情ベース選択
```typescript
const aiResponse = "素晴らしい決意ですね！";
const emotion = analyzeEmotionPattern(aiResponse); // 'great'
const voiceFile = getVoiceFile('yuki', emotion);
// 結果: 'yuki_great.wav'
```

### 季節ベース選択
```typescript
const season = getCurrentSeason(); // 'spring'
const voiceFile = getVoiceFile('sora', season);
// 結果: 'sora_spring.wav'
```

## ✅ 統一システムの利点

1. **統一ファイル命名**: `{character}_{pattern}.wav`
2. **レガシー除去**: 古いシステム完全削除
3. **7キャラクター対応**: 同じロジックで全対応
4. **拡張性**: 新キャラクター追加が簡単
5. **正確選択**: 10:40 → minato_morning_late.wav

## 🚀 統一システム関数

### メイン関数
```typescript
// 全キャラクター対応音声選択・再生
handleUnifiedVoiceResponse(characterId, aiResponse, isGreeting)

// 音声選択のみ（再生なし）
selectUnifiedVoice(characterId, aiResponse, isGreeting)
```

### 推奨使用法
```typescript
// AI応答音声ハンドラー（推奨）
handleUnifiedAiResponseVoice('minato', aiResponse, false)

// 統一音声選択エンジン
selectAndPlayUnifiedVoice('yuki', aiResponse, true)
```

## 🔧 システム構成

- **統一システム**: `/lib/unified-voice-system.ts`
- **AI応答制御**: `/lib/ai-response-voice-controller.ts` (統一システム対応)
- **音声選択**: `/utils/voiceSelection.ts` (統一システム対応)
- **時間システム**: `/lib/unified-time-system.ts`

## 📊 完成度

| キャラクター | 音声ファイル | システム対応 | 状態 |
|------------|------------|------------|------|
| akari      | 35ファイル   | ✅ 完全対応  | 🟢 運用中 |
| minato     | 35ファイル   | ✅ 完全対応  | 🟢 運用中 |
| yuki       | 0ファイル    | ✅ 統一対応  | 🟡 準備完了 |
| riku       | 0ファイル    | ✅ 統一対応  | 🟡 準備完了 |
| mao        | 0ファイル    | ✅ 統一対応  | 🟡 準備完了 |
| satsuki    | 0ファイル    | ✅ 統一対応  | 🟡 準備完了 |
| sora       | 0ファイル    | ✅ 統一対応  | 🟡 準備完了 |

🎯 **統一システム完成！** 音声ファイル追加時は統一命名規則に従ってください。