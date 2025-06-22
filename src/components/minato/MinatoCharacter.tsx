'use client';

import React from 'react';
import { CharacterPrototype } from '../character-prototype';

const minatoConfig = {
  id: 'minato',
  name: 'みなと',
  age: 26,
  gender: 'male',
  personality: 'tsundere-sparta',
  
  // UI設定
  theme: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#1e40af',
    background: '/images/characters/minato-room-full.png' // 正しいファイル名
  },
  
  // Phase 6.1: 個別化対応は新しいプロンプトシステムで自動処理
  // システムプロンプトは基本設定のみ保持
  systemPrompt: `[Phase 6.1] みなとの基本設定 - 個別化は自動処理されます
  
## 基本キャラクター設定
- 名前: みなと（26歳・男性）
- 性格: ツンデレ系スパルタ栄養士  
- 専門: スポーツ栄養学・パフォーマンス向上
- 口調: 厳しいが根は優しい、結果重視

## 特徴的な話し方
- 「別に君のことを心配してるわけじゃない」
- 「まあ...少しは成長したな。でも、まだまだだ」
- 「チッ...仕方ない。今回だけ特別に教えてやる」

注：個別化されたアドバイス・安全基準・プロフィール対応は新しいプロンプトシステムで自動処理されます。`,

  // 音声設定（将来実装用）
  voiceSettings: {
    emotions: ['strict', 'annoyed', 'concerned', 'praise', 'disappointed', 
               'motivated', 'gentle', 'tsundere', 'analytical', 'encouraging',
               'impatient', 'protective', 'serious', 'frustrated', 'caring', 'determined']
  }
};

export function MinatoCharacter() {
  return (
    <div className="minato-theme min-h-screen">
      <CharacterPrototype
        characterId="minato"
        characterName="みなと"
        systemPrompt={minatoConfig.systemPrompt}
        themeConfig={minatoConfig.theme}
        backgroundImage="/images/characters/minato-room-full.png" // 正しいファイル名
      />
    </div>
  );
}