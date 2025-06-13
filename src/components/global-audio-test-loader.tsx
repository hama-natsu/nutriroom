'use client'

import { useEffect } from 'react'
import { generateVoice, debugAudioSystem } from '@/lib/audio-utils'
import { playHybridGreeting, debugHybridSystem } from '@/lib/hybrid-audio'
import { debugTimeSystem, getAllTimeSlots, TimeSlot } from '@/lib/time-greeting'

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

    // ハイブリッド音声テスト関数
    if (!window.testHybridGreeting) {
      window.testHybridGreeting = async (userName?: string, timeSlot?: TimeSlot) => {
        console.log('🎵 Hybrid Greeting Test Starting...', { userName, timeSlot });
        try {
          await playHybridGreeting(userName, timeSlot);
          console.log('✅ Hybrid Greeting Test: Success');
        } catch (error) {
          console.error('❌ Hybrid Greeting Test: Failed', error);
        }
      };
    }

    // 時間帯テスト関数
    if (!window.testTimeSlots) {
      window.testTimeSlots = async (userName?: string) => {
        console.log('🕒 Testing all time slots...', { userName });
        const timeSlots = getAllTimeSlots();
        
        for (const timeSlot of timeSlots) {
          console.log(`\n🧪 Testing ${timeSlot}...`);
          try {
            await playHybridGreeting(userName, timeSlot);
            console.log(`✅ ${timeSlot}: Success`);
            // 次のテストまで2秒待機
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`❌ ${timeSlot}: Failed`, error);
          }
        }
        console.log('🏁 All time slot tests completed');
      };
    }

    // デバッグ情報統合表示
    if (!window.debugAllSystems) {
      window.debugAllSystems = () => {
        console.log('🔍 Complete System Debug Information');
        console.log('=' .repeat(80));
        
        console.log('\n🎵 Audio System:');
        debugAudioSystem();
        
        console.log('\n🤝 Hybrid System:');
        debugHybridSystem();
        
        console.log('\n🕒 Time System:');
        debugTimeSystem();
        
        console.log('\n🎯 Available Test Functions:');
        console.log('  - window.testHybridGreeting(userName?, timeSlot?)');
        console.log('  - window.testTimeSlots(userName?)');
        console.log('  - window.elevenLabsTestSimple(text?, character?)');
        console.log('  - window.debugAllSystems()');
        console.log('\n💡 Quick Examples:');
        console.log('  window.testHybridGreeting("田中さん")');
        console.log('  window.testHybridGreeting("山田さん", "morning")');
        console.log('  window.testTimeSlots("佐藤さん")');
      };
    }

    // 起動時にデバッグ情報を表示
    console.log('🚀 Global Audio Test Functions Loaded (with Hybrid System)');
    if (window.debugAllSystems) {
      window.debugAllSystems();
    }
    
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
    testHybridGreeting?: (userName?: string, timeSlot?: TimeSlot) => Promise<void>
    testTimeSlots?: (userName?: string) => Promise<void>
    debugAllSystems?: () => void
  }
}