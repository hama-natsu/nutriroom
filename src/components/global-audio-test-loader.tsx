'use client'

import { useEffect } from 'react'
import { generateVoice, debugAudioSystem } from '@/lib/audio-utils'

export default function GlobalAudioTestLoader() {
  useEffect(() => {
    // テスト関数をグローバルに登録（重複チェック付き）
    if (!window.elevenLabsTestSimple) {
      window.elevenLabsTestSimple = async (
        text: string = "こんにちは、テストです", 
        character: string = "akari"
      ) => {
        try {
          console.log('🧪 ElevenLabs Test Starting...');
          console.log(`Text: "${text}", Character: "${character}"`);
          
          const audioBlob = await generateVoice(text, character);
          
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onloadeddata = () => {
            console.log('✅ ElevenLabs Test: Audio loaded successfully');
          };
          
          audio.onerror = (e) => {
            console.error('❌ ElevenLabs Test: Audio playback failed', e);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onended = () => {
            console.log('🔇 ElevenLabs Test: Audio playback completed');
            URL.revokeObjectURL(audioUrl);
          };
          
          await audio.play();
          console.log('🔊 ElevenLabs Test: Playing audio...');
          
        } catch (error) {
          console.error('❌ ElevenLabs Test Failed:', error);
        }
      };
    }

    // デバッグ情報表示関数
    if (!window.debugAudioSimple) {
      window.debugAudioSimple = () => {
        debugAudioSystem();
      };
    }

    // 音声プロバイダー優先度テスト
    if (!window.testAudioPrioritySimple) {
      window.testAudioPrioritySimple = async () => {
        console.log('🔄 Testing Audio Provider Priority...');
        
        const testText = "プライオリティテスト";
        const testCharacter = "akari";
        
        try {
          const audioBlob = await generateVoice(testText, testCharacter);
          console.log('✅ Audio generation successful:', audioBlob.size, 'bytes');
          
          // 音声再生テスト
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onloadeddata = () => {
            console.log('✅ Audio loaded successfully');
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = (e) => {
            console.error('❌ Audio playback failed:', e);
            URL.revokeObjectURL(audioUrl);
          };
          
          await audio.play();
          
        } catch (error) {
          console.error('❌ Priority test failed:', error);
        }
      };
    }

    // 音声生成テスト（Blobを返す）
    if (!window.generateVoiceTestSimple) {
      window.generateVoiceTestSimple = async (text: string, characterId: string) => {
        console.log(`🎵 Generating voice: "${text}" for ${characterId}`);
        return await generateVoice(text, characterId);
      };
    }

    // 起動時にデバッグ情報を表示
    console.log('🚀 Global Audio Test Functions Loaded');
    debugAudioSystem();
    
    // クリーンアップ
    return () => {
      // 必要に応じてクリーンアップ処理
    };
  }, []);

  return null; // UIは表示しない
}

// Window型拡張（重複を避けるため、別の名前を使用）
declare global {
  interface Window {
    elevenLabsTestSimple?: (text?: string, character?: string) => Promise<void>
    debugAudioSimple?: () => void
    testAudioPrioritySimple?: () => Promise<void>
    generateVoiceTestSimple?: (text: string, characterId: string) => Promise<Blob>
  }
}