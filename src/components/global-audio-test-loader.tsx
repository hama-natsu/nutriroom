'use client'

import { useEffect } from 'react'
import { generateVoice, debugAudioSystem } from '@/lib/audio-utils'
import { playHybridGreeting, debugHybridSystem } from '@/lib/hybrid-audio'
import { debugTimeSystem, getAllTimeSlots, TimeSlot } from '@/lib/time-greeting'
import { debugKanjiConverter, convertNameForElevenLabs, kanjiConverter } from '@/lib/kanji-reading-converter'
import { kanjiTestFunctions, registerGlobalTestFunctions } from '@/lib/kanji-test-functions'
import { testAllCharacterAddressing, formatUserNameForCharacter, getCharacterSampleGreeting } from '@/lib/character-addressing'

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

    // ハイブリッド音声テスト関数（キャラクター対応）
    if (!window.testHybridGreeting) {
      window.testHybridGreeting = async (userName?: string, timeSlot?: TimeSlot, characterId?: string) => {
        console.log('🎵 Hybrid Greeting Test Starting...', { userName, timeSlot, characterId });
        try {
          await playHybridGreeting(userName, timeSlot, characterId);
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
            await playHybridGreeting(userName, timeSlot, 'akari');
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

    // 漢字読み変換テスト関数
    if (!window.testKanjiConversion) {
      window.testKanjiConversion = (text: string) => {
        console.log('🔤 Kanji Conversion Test:', text);
        const result = kanjiConverter.convertText(text);
        console.log('Original:', result.original);
        console.log('Converted:', result.converted);
        console.log('Has changes:', result.hasChanges);
        console.log('Conversions:', result.conversions);
        return result;
      };
    }

    // 名前変換テスト関数
    if (!window.testNameConversion) {
      window.testNameConversion = (name: string) => {
        console.log('👤 Name Conversion Test:', name);
        const result = convertNameForElevenLabs(name);
        console.log('Original:', name);
        console.log('Converted:', result);
        return result;
      };
    }

    // ハイブリッド挨拶（名前変換付き）
    if (!window.testHybridWithKanji) {
      window.testHybridWithKanji = async (kanjiName: string, timeSlot?: TimeSlot) => {
        console.log('🎎 Hybrid Greeting with Kanji Conversion Test:', kanjiName);
        try {
          const convertedName = convertNameForElevenLabs(kanjiName);
          console.log('Name conversion:', kanjiName, '→', convertedName);
          await playHybridGreeting(convertedName, timeSlot, 'akari');
          console.log('✅ Hybrid greeting with kanji conversion: Success');
        } catch (error) {
          console.error('❌ Hybrid greeting with kanji conversion: Failed', error);
        }
      };
    }

    // 変換システム総合テスト
    if (!window.testAllConversions) {
      window.testAllConversions = () => {
        console.log('🧪 Testing All Conversion Systems...');
        
        const testCases = [
          '田中太郎さん',
          '佐藤花子ちゃん', 
          '山田くん',
          '東海林さま',
          '鈴木美穂',
          '小鳥遊',
          '渡辺'
        ];
        
        testCases.forEach(testCase => {
          window.testKanjiConversion?.(testCase);
        });
        
        console.log('🏁 All conversion tests completed');
      };
    }

    // キャラクター別呼び方テスト関数
    if (!window.testCharacterAddressing) {
      window.testCharacterAddressing = (userName: string = 'はまなつ') => {
        console.log('🎭 Character Addressing Test Starting...');
        testAllCharacterAddressing(userName);
      };
    }

    // キャラクター別挨拶テスト関数
    if (!window.testCharacterGreeting) {
      window.testCharacterGreeting = async (userName: string = 'はまなつ', characterId: string = 'akari') => {
        console.log('🎪 Character Greeting Test Starting...', { userName, characterId });
        
        try {
          // キャラクター風の呼び方をテスト
          const formattedName = formatUserNameForCharacter(userName, characterId);
          console.log(`📝 ${characterId}: ${userName} → ${formattedName}`);
          
          // サンプル挨拶をテスト
          const sampleGreeting = getCharacterSampleGreeting(userName, characterId);
          console.log(`💬 Sample greeting: ${sampleGreeting}`);
          
          // 実際の音声テスト（あかりのみ録音音声あり）
          if (characterId === 'akari') {
            await playHybridGreeting(userName, undefined, characterId);
            console.log('✅ Character greeting test: Success');
          } else {
            console.log('ℹ️ Audio test skipped - recorded audio only available for Akari');
          }
        } catch (error) {
          console.error('❌ Character greeting test: Failed', error);
        }
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
        
        console.log('\n🔤 Kanji Conversion System:');
        debugKanjiConverter();
        
        console.log('\n🎯 Available Test Functions:');
        console.log('  Basic Functions:');
        console.log('    - window.testHybridGreeting(userName?, timeSlot?, characterId?)');
        console.log('    - window.testTimeSlots(userName?)');
        console.log('    - window.elevenLabsTestSimple(text?, character?)');
        console.log('  Character Addressing:');
        console.log('    - window.testCharacterAddressing(userName?)');
        console.log('    - window.testCharacterGreeting(userName?, characterId?)');
        console.log('  Kanji Conversion:');
        console.log('    - window.testKanjiConversion(text)');
        console.log('    - window.testNameConversion(name)');
        console.log('    - window.testHybridWithKanji(kanjiName, timeSlot?)');
        console.log('    - window.testAllConversions()');
        console.log('  System Debug:');
        console.log('    - window.debugAllSystems()');
        
        console.log('\n💡 Quick Examples:');
        console.log('  window.testCharacterAddressing("はまなつ")');
        console.log('  window.testCharacterGreeting("田中太郎", "minato")');
        console.log('  window.testHybridGreeting("田中さん", "morning", "mao")');
        console.log('  window.testAllConversions()');
      };
    }

    // 専用テスト関数を登録
    try {
      registerGlobalTestFunctions();
      console.log('✅ Kanji test functions registered via dedicated module');
    } catch (error) {
      console.warn('⚠️ Failed to register kanji test functions:', error);
    }

    // グローバルオブジェクトに直接アクセス可能な関数を追加
    window.kanjiTestFunctions = kanjiTestFunctions;

    // 起動時にデバッグ情報を表示
    console.log('🚀 Global Audio Test Functions Loaded (Enhanced Kanji System)');
    
    // 関数登録確認
    const registeredFunctions = [
      'elevenLabsTestSimple',
      'debugAudioSimple', 
      'testAudioPrioritySimple',
      'generateVoiceTestSimple',
      'testHybridGreeting',
      'testTimeSlots',
      'testKanjiConversion',
      'testNameConversion',
      'testHybridWithKanji',
      'testAllConversions',
      'testCharacterAddressing',
      'testCharacterGreeting',
      'debugAllSystems'
    ];
    
    const missingFunctions = registeredFunctions.filter(fn => typeof window[fn as keyof Window] !== 'function');
    
    if (missingFunctions.length === 0) {
      console.log('✅ All test functions registered successfully');
      console.log('🎯 Alternative access: window.kanjiTestFunctions.functionName()');
      
      // 少し遅らせてデバッグ情報表示
      setTimeout(() => {
        if (window.debugAllSystems) {
          window.debugAllSystems();
        }
      }, 500);
    } else {
      console.warn('⚠️ Missing functions:', missingFunctions);
      console.log('💡 Use window.forceRegisterTestFunctions() to manually register');
      console.log('🔄 Alternative: window.kanjiTestFunctions.functionName()');
    }

    // 手動登録関数の追加
    if (!window.forceRegisterTestFunctions) {
      window.forceRegisterTestFunctions = () => {
        console.log('🔧 Force registering all test functions...');
        
        // 強制的に全関数を再登録
        const forceRegister = () => {
          // 漢字変換テスト
          window.testKanjiConversion = (text: string) => {
            try {
              console.log('🔤 Kanji Conversion Test:', text);
              const result = kanjiConverter.convertText(text);
              console.log('📝 Results:');
              console.log('  Original:', result.original);
              console.log('  Converted:', result.converted);
              console.log('  Has changes:', result.hasChanges);
              console.log('  Conversions count:', result.conversions.length);
              
              if (result.conversions.length > 0) {
                console.log('  Conversion details:');
                result.conversions.forEach((conv, index) => {
                  console.log(`    ${index + 1}. ${conv.from} → ${conv.to} (${conv.type}, ${conv.confidence})`);
                });
              }
              
              return result;
            } catch (error) {
              console.error('❌ Kanji conversion test failed:', error);
              return null;
            }
          };

          // 名前変換テスト
          window.testNameConversion = (name: string) => {
            try {
              console.log('👤 Name Conversion Test:', name);
              const result = convertNameForElevenLabs(name);
              console.log('📝 Results:');
              console.log('  Original:', name);
              console.log('  Converted:', result);
              console.log('  Changed:', name !== result);
              return result;
            } catch (error) {
              console.error('❌ Name conversion test failed:', error);
              return name;
            }
          };

          // ハイブリッド挨拶（漢字変換付き）
          window.testHybridWithKanji = async (kanjiName: string, timeSlot?: TimeSlot) => {
            try {
              console.log('🎎 Hybrid Greeting with Kanji Conversion Test:', kanjiName);
              const convertedName = convertNameForElevenLabs(kanjiName);
              console.log('📝 Name conversion:', kanjiName, '→', convertedName);
              
              await playHybridGreeting(convertedName, timeSlot, 'akari');
              console.log('✅ Hybrid greeting with kanji conversion: Success');
            } catch (error) {
              console.error('❌ Hybrid greeting with kanji conversion: Failed', error);
              throw error;
            }
          };

          // 総合変換テスト
          window.testAllConversions = () => {
            try {
              console.log('🧪 Testing All Conversion Systems...');
              console.log('=' .repeat(60));
              
              const testCases = [
                { name: '田中太郎さん', type: 'フルネーム（男性）' },
                { name: '佐藤花子ちゃん', type: 'フルネーム（女性）' }, 
                { name: '山田くん', type: '苗字のみ' },
                { name: '東海林さま', type: '難読苗字' },
                { name: '鈴木美穂', type: '敬称なし' },
                { name: '小鳥遊', type: '超難読' },
                { name: '渡辺', type: '一般苗字' }
              ];
              
              testCases.forEach((testCase, index) => {
                console.log(`\n${index + 1}. ${testCase.type}: ${testCase.name}`);
                if (window.testKanjiConversion) {
                  window.testKanjiConversion(testCase.name);
                }
              });
              
              console.log('\n🏁 All conversion tests completed');
            } catch (error) {
              console.error('❌ All conversions test failed:', error);
            }
          };

          // 総合デバッグ
          window.debugAllSystems = () => {
            try {
              console.log('🔍 Complete System Debug Information');
              console.log('=' .repeat(80));
              
              console.log('\n🎵 Audio System:');
              debugAudioSystem();
              
              console.log('\n🤝 Hybrid System:');
              debugHybridSystem();
              
              console.log('\n🕒 Time System:');
              debugTimeSystem();
              
              console.log('\n🔤 Kanji Conversion System:');
              debugKanjiConverter();
              
              console.log('\n🎯 Available Test Functions:');
              console.log('  Basic Functions:');
              console.log('    - window.testHybridGreeting(userName?, timeSlot?)');
              console.log('    - window.testTimeSlots(userName?)');
              console.log('    - window.elevenLabsTestSimple(text?, character?)');
              console.log('  Kanji Conversion:');
              console.log('    - window.testKanjiConversion(text)');
              console.log('    - window.testNameConversion(name)');
              console.log('    - window.testHybridWithKanji(kanjiName, timeSlot?)');
              console.log('    - window.testAllConversions()');
              console.log('  System Debug:');
              console.log('    - window.debugAllSystems()');
              console.log('    - window.forceRegisterTestFunctions()');
              
              console.log('\n💡 Quick Examples:');
              console.log('  window.testKanjiConversion("田中太郎さん")');
              console.log('  window.testNameConversion("佐藤花子")');
              console.log('  window.testHybridWithKanji("田中太郎", "morning")');
              console.log('  window.testAllConversions()');
            } catch (error) {
              console.error('❌ Debug all systems failed:', error);
            }
          };
        };

        forceRegister();
        
        // 登録確認
        const functions = ['testKanjiConversion', 'testNameConversion', 'testHybridWithKanji', 'testAllConversions', 'debugAllSystems'];
        const registered = functions.filter(fn => typeof window[fn as keyof Window] === 'function');
        
        console.log(`✅ Registered ${registered.length}/${functions.length} functions:`, registered);
        
        if (registered.length === functions.length) {
          console.log('🎉 All test functions are now available!');
          console.log('💡 Try: window.testAllConversions()');
        }
      };
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
    testHybridGreeting?: (userName?: string, timeSlot?: TimeSlot, characterId?: string) => Promise<void>
    testTimeSlots?: (userName?: string) => Promise<void>
    testKanjiConversion?: (text: string) => unknown
    testNameConversion?: (name: string) => string
    testHybridWithKanji?: (kanjiName: string, timeSlot?: TimeSlot) => Promise<void>
    testAllConversions?: () => void
    testCharacterAddressing?: (userName?: string) => void
    testCharacterGreeting?: (userName?: string, characterId?: string) => Promise<void>
    debugAllSystems?: () => void
    forceRegisterTestFunctions?: () => void
    kanjiTestFunctions?: {
      testKanjiConversion: (text: string) => unknown
      testNameConversion: (name: string) => string
      testHybridWithKanji: (kanjiName: string, timeSlot?: TimeSlot) => Promise<void>
      testAllConversions: () => void
      debugAllSystems: () => void
      testCharacterConversion: (character: string) => unknown
    }
  }
}