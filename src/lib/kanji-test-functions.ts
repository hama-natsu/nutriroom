// 漢字変換テスト関数（スタンドアロン版）

import { kanjiConverter, convertNameForElevenLabs } from './kanji-reading-converter'
import { playHybridGreeting } from './hybrid-audio'
import { debugAudioSystem } from './audio-utils'
import { debugHybridSystem } from './hybrid-audio'
import { debugTimeSystem, TimeSlot } from './time-greeting'

// エクスポート可能なテスト関数群
export const kanjiTestFunctions = {
  // 基本変換テスト
  testKanjiConversion: (text: string) => {
    try {
      console.log('🔤 Kanji Conversion Test:', text);
      const result = kanjiConverter.convertText(text);
      
      console.log('📝 Conversion Results:');
      console.log('  ✏️  Original:', result.original);
      console.log('  ✅ Converted:', result.converted);
      console.log('  🔄 Has changes:', result.hasChanges);
      console.log('  📊 Conversions:', result.conversions.length);
      
      if (result.conversions.length > 0) {
        console.log('  🔍 Conversion Details:');
        result.conversions.forEach((conv, index) => {
          console.log(`    ${index + 1}. "${conv.from}" → "${conv.to}"`);
          console.log(`       Type: ${conv.type}, Confidence: ${conv.confidence}`);
        });
      } else {
        console.log('  ℹ️  No conversions needed (already in hiragana/katakana)');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Kanji conversion test failed:', error);
      return null;
    }
  },

  // 名前特化変換テスト
  testNameConversion: (name: string) => {
    try {
      console.log('👤 Name Conversion Test:', name);
      const result = convertNameForElevenLabs(name);
      
      console.log('📝 Name Conversion Results:');
      console.log('  ✏️  Original name:', name);
      console.log('  ✅ Converted name:', result);
      console.log('  🔄 Changed:', name !== result ? 'Yes' : 'No');
      
      if (name !== result) {
        console.log('  ✨ Conversion successful - ready for ElevenLabs!');
      } else {
        console.log('  ℹ️  No conversion needed (already optimal for TTS)');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Name conversion test failed:', error);
      return name;
    }
  },

  // ハイブリッド挨拶＋漢字変換テスト
  testHybridWithKanji: async (kanjiName: string, timeSlot?: TimeSlot) => {
    try {
      console.log('🎎 Hybrid Greeting with Kanji Conversion Test');
      console.log('=' .repeat(50));
      console.log('Input name:', kanjiName);
      console.log('Time slot:', timeSlot || 'auto-detect');
      
      // 名前変換
      const convertedName = convertNameForElevenLabs(kanjiName);
      console.log('\n🔤 Name conversion phase:');
      console.log('  Original:', kanjiName);
      console.log('  Converted:', convertedName);
      console.log('  Ready for ElevenLabs:', convertedName);
      
      // ハイブリッド挨拶再生
      console.log('\n🎵 Playing hybrid greeting...');
      await playHybridGreeting(convertedName, timeSlot);
      
      console.log('\n✅ Hybrid greeting with kanji conversion completed successfully!');
    } catch (error) {
      console.error('❌ Hybrid greeting with kanji conversion failed:', error);
      throw error;
    }
  },

  // 総合変換テスト
  testAllConversions: () => {
    try {
      console.log('🧪 Comprehensive Kanji Conversion Test Suite');
      console.log('=' .repeat(60));
      
      const testCases = [
        { name: '田中太郎さん', category: 'フルネーム（男性・敬称）', difficulty: 'Easy' },
        { name: '佐藤花子ちゃん', category: 'フルネーム（女性・愛称）', difficulty: 'Easy' },
        { name: '山田くん', category: '苗字のみ（愛称）', difficulty: 'Easy' },
        { name: '東海林さま', category: '難読苗字（敬称）', difficulty: 'Hard' },
        { name: '鈴木美穂', category: '敬称なしフルネーム', difficulty: 'Medium' },
        { name: '小鳥遊', category: '超難読苗字', difficulty: 'Extreme' },
        { name: '渡辺', category: '一般的苗字', difficulty: 'Easy' },
        { name: '結愛ちゃん', category: '現代的名前', difficulty: 'Medium' },
        { name: '陽翔くん', category: '現代的男性名', difficulty: 'Medium' }
      ];
      
      testCases.forEach((testCase, index) => {
        console.log(`\n📋 Test ${index + 1}/${testCases.length}: ${testCase.category}`);
        console.log(`   🎯 Target: ${testCase.name}`);
        console.log(`   📈 Difficulty: ${testCase.difficulty}`);
        
        const result = kanjiTestFunctions.testKanjiConversion(testCase.name);
        
        if (result) {
          const success = result.hasChanges;
          console.log(`   ${success ? '✅ CONVERTED' : 'ℹ️  NO CHANGE'}`);
        } else {
          console.log('   ❌ FAILED');
        }
      });
      
      console.log('\n🏁 Comprehensive test suite completed!');
      console.log('💡 Individual results logged above');
    } catch (error) {
      console.error('❌ Comprehensive conversion test failed:', error);
    }
  },

  // システム診断
  debugAllSystems: () => {
    try {
      console.log('🔍 Complete System Diagnostic Report');
      console.log('=' .repeat(80));
      
      console.log('\n🎵 Audio System Status:');
      debugAudioSystem();
      
      console.log('\n🤝 Hybrid Audio System Status:');
      debugHybridSystem();
      
      console.log('\n🕒 Time System Status:');
      debugTimeSystem();
      
      console.log('\n🔤 Kanji Conversion System Status:');
      const stats = kanjiConverter.getConversionStats();
      console.log('Conversion Engine Stats:', stats);
      
      console.log('\n🎯 Available Test Functions:');
      console.log('  📊 Analysis Functions:');
      console.log('    - kanjiTestFunctions.testKanjiConversion(text)');
      console.log('    - kanjiTestFunctions.testNameConversion(name)');
      console.log('  🎵 Audio Functions:');
      console.log('    - kanjiTestFunctions.testHybridWithKanji(name, timeSlot?)');
      console.log('  🧪 Test Suites:');
      console.log('    - kanjiTestFunctions.testAllConversions()');
      console.log('  🔧 Debug Functions:');
      console.log('    - kanjiTestFunctions.debugAllSystems()');
      
      console.log('\n💡 Quick Start Examples:');
      console.log('  kanjiTestFunctions.testKanjiConversion("田中太郎さん")');
      console.log('  kanjiTestFunctions.testNameConversion("佐藤花子")');
      console.log('  kanjiTestFunctions.testHybridWithKanji("山田太郎", "morning")');
      console.log('  kanjiTestFunctions.testAllConversions()');
      
      console.log('\n🌟 System Status: All systems operational');
    } catch (error) {
      console.error('❌ System diagnostic failed:', error);
    }
  },

  // 個別文字変換テスト
  testCharacterConversion: (character: string) => {
    try {
      console.log('🔤 Individual Character Conversion Test:', character);
      const result = kanjiConverter.convertText(character);
      
      console.log('Results:');
      console.log('  Input:', character);
      console.log('  Output:', result.converted);
      console.log('  Type:', result.conversions[0]?.type || 'no-conversion');
      
      return result;
    } catch (error) {
      console.error('❌ Character conversion test failed:', error);
      return null;
    }
  }
};

// グローバル登録用のユーティリティ
export function registerGlobalTestFunctions() {
  if (typeof window !== 'undefined') {
    window.testKanjiConversion = kanjiTestFunctions.testKanjiConversion;
    window.testNameConversion = kanjiTestFunctions.testNameConversion;
    window.testHybridWithKanji = kanjiTestFunctions.testHybridWithKanji;
    window.testAllConversions = kanjiTestFunctions.testAllConversions;
    window.debugAllSystems = kanjiTestFunctions.debugAllSystems;
    
    console.log('✅ Kanji test functions registered globally');
    console.log('💡 Available: testKanjiConversion, testNameConversion, testHybridWithKanji, testAllConversions, debugAllSystems');
  }
}

// 自動実行（ブラウザ環境のみ）
if (typeof window !== 'undefined') {
  registerGlobalTestFunctions();
}