// 漢字読み変換システム（ElevenLabs送信前処理）

import { 
  commonCharacterReadings,
  allNameReadings,
  testNameDatabase
} from './name-reading-database'

export interface ConversionResult {
  original: string
  converted: string
  conversions: Array<{
    from: string
    to: string
    type: 'exact_match' | 'partial_match' | 'character_replacement' | 'manual_rule'
    confidence: 'high' | 'medium' | 'low'
  }>
  hasChanges: boolean
}

export class KanjiReadingConverter {
  private customRules: Map<string, string> = new Map()
  
  constructor() {
    this.initializeCustomRules()
  }

  private initializeCustomRules() {
    // カスタムルール（特殊なケースや企業固有の読み方）
    this.customRules.set('田中さん', 'たなかさん')
    this.customRules.set('佐藤さん', 'さとうさん')
    this.customRules.set('山田くん', 'やまだくん')
    this.customRules.set('花子ちゃん', 'はなこちゃん')
    
    // 敬称パターン
    this.customRules.set('様', 'さま')
    this.customRules.set('君', 'くん')
    this.customRules.set('ちゃん', 'ちゃん')
    
    // よくある間違いの修正
    this.customRules.set('お疲れ様', 'おつかれさま')
    this.customRules.set('有難う', 'ありがとう')
  }

  // メイン変換関数（エラーハンドリング強化）
  convertText(text: string): ConversionResult {
    const result: ConversionResult = {
      original: text,
      converted: text,
      conversions: [],
      hasChanges: false
    }

    try {
      // 入力検証
      if (!text || typeof text !== 'string') {
        console.warn('⚠️ Invalid input for convertText:', text);
        return result;
      }

      if (text.trim() === '') {
        console.warn('⚠️ Empty text provided for conversion');
        return result;
      }

      let workingText = text;

      // 1. カスタムルールの適用
      try {
        workingText = this.applyCustomRules(workingText, result);
      } catch (error) {
        console.error('❌ Error in custom rules application:', error);
      }

      // 2. 完全名前マッチング（苗字+名前）
      try {
        workingText = this.applyFullNameMatching(workingText, result);
      } catch (error) {
        console.error('❌ Error in full name matching:', error);
      }

      // 3. 部分名前マッチング（苗字または名前）
      try {
        workingText = this.applyPartialNameMatching(workingText, result);
      } catch (error) {
        console.error('❌ Error in partial name matching:', error);
      }

      // 4. 単一文字変換
      try {
        workingText = this.applySingleCharacterConversion(workingText, result);
      } catch (error) {
        console.error('❌ Error in single character conversion:', error);
      }

      // 5. 敬称の処理
      try {
        workingText = this.applyHonorificConversion(workingText, result);
      } catch (error) {
        console.error('❌ Error in honorific conversion:', error);
      }

      result.converted = workingText;
      result.hasChanges = result.conversions.length > 0;

      // 変換結果の検証
      if (result.converted.length === 0) {
        console.warn('⚠️ Conversion resulted in empty text, reverting to original');
        result.converted = text;
        result.hasChanges = false;
        result.conversions = [];
      }

      return result;
    } catch (error) {
      console.error('❌ Critical error in convertText:', error);
      // フォールバック：元のテキストを返す
      return {
        original: text,
        converted: text,
        conversions: [],
        hasChanges: false
      };
    }
  }

  private applyCustomRules(text: string, result: ConversionResult): string {
    let workingText = text

    for (const [from, to] of this.customRules.entries()) {
      if (workingText.includes(from)) {
        workingText = workingText.replace(new RegExp(from, 'g'), to)
        result.conversions.push({
          from,
          to,
          type: 'manual_rule',
          confidence: 'high'
        })
      }
    }

    return workingText
  }

  private applyFullNameMatching(text: string, result: ConversionResult): string {
    let workingText = text

    // フルネームパターンの検出（苗字+名前）
    for (const surname of allNameReadings.filter(r => r.category === 'surname')) {
      for (const givenName of allNameReadings.filter(r => r.category === 'given_name')) {
        const fullName = surname.kanji + givenName.kanji
        const fullReading = surname.hiragana + givenName.hiragana

        if (workingText.includes(fullName)) {
          workingText = workingText.replace(new RegExp(fullName, 'g'), fullReading)
          result.conversions.push({
            from: fullName,
            to: fullReading,
            type: 'exact_match',
            confidence: 'high'
          })
        }
      }
    }

    return workingText
  }

  private applyPartialNameMatching(text: string, result: ConversionResult): string {
    let workingText = text

    // 名前データベースから変換
    for (const nameData of allNameReadings) {
      if (workingText.includes(nameData.kanji)) {
        const regex = new RegExp(nameData.kanji, 'g')
        workingText = workingText.replace(regex, nameData.hiragana)
        
        result.conversions.push({
          from: nameData.kanji,
          to: nameData.hiragana,
          type: 'exact_match',
          confidence: nameData.frequency === 'high' ? 'high' : 
                     nameData.frequency === 'medium' ? 'medium' : 'low'
        })
      }
    }

    return workingText
  }

  private applySingleCharacterConversion(text: string, result: ConversionResult): string {
    let workingText = text

    for (const [kanji, hiragana] of Object.entries(commonCharacterReadings)) {
      if (workingText.includes(kanji)) {
        // 単語境界を考慮して変換
        const regex = new RegExp(kanji, 'g')
        workingText = workingText.replace(regex, hiragana)
        
        result.conversions.push({
          from: kanji,
          to: hiragana,
          type: 'character_replacement',
          confidence: 'medium'
        })
      }
    }

    return workingText
  }

  private applyHonorificConversion(text: string, result: ConversionResult): string {
    let workingText = text

    const honorifics = [
      { kanji: 'さん', hiragana: 'さん' },
      { kanji: 'くん', hiragana: 'くん' },
      { kanji: 'ちゃん', hiragana: 'ちゃん' },
      { kanji: '様', hiragana: 'さま' },
      { kanji: '君', hiragana: 'くん' }
    ]

    for (const honorific of honorifics) {
      if (workingText.includes(honorific.kanji)) {
        workingText = workingText.replace(
          new RegExp(honorific.kanji, 'g'), 
          honorific.hiragana
        )
        
        result.conversions.push({
          from: honorific.kanji,
          to: honorific.hiragana,
          type: 'exact_match',
          confidence: 'high'
        })
      }
    }

    return workingText
  }

  // 名前に特化した変換（ハイブリッド音声用・エラーハンドリング強化）
  convertNameForVoice(name: string): ConversionResult {
    try {
      console.log('🔤 Converting name for voice:', name);
      
      // 入力検証
      if (!name || typeof name !== 'string') {
        console.error('❌ Invalid name input:', name);
        return {
          original: name || '',
          converted: name || '',
          conversions: [],
          hasChanges: false
        };
      }

      const result = this.convertText(name);
      
      // 名前専用の追加処理
      if (!result.hasChanges) {
        try {
          // データベースにない場合の推測変換
          const guessedReading = this.attemptPhoneticGuess(name);
          if (guessedReading !== name) {
            result.converted = guessedReading;
            result.conversions.push({
              from: name,
              to: guessedReading,
              type: 'manual_rule',
              confidence: 'low'
            });
            result.hasChanges = true;
          }
        } catch (error) {
          console.error('❌ Error in phonetic guess:', error);
        }
      }

      console.log('✅ Name conversion result:', {
        original: result.original,
        converted: result.converted,
        hasChanges: result.hasChanges,
        conversions: result.conversions.length
      });

      return result;
    } catch (error) {
      console.error('❌ Critical error in convertNameForVoice:', error);
      // フォールバック
      return {
        original: name,
        converted: name,
        conversions: [],
        hasChanges: false
      };
    }
  }

  private attemptPhoneticGuess(name: string): string {
    // 基本的な音韻変換ルール（簡略版）
    let converted = name

    // 長音符の処理
    converted = converted.replace(/ー/g, 'ー')
    
    // カタカナをひらがなに変換
    converted = converted.replace(/[\u30A1-\u30F6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0x60)
    })

    return converted
  }

  // カスタムルール追加
  addCustomRule(from: string, to: string): void {
    this.customRules.set(from, to)
    console.log(`✅ Custom rule added: ${from} → ${to}`)
  }

  // カスタムルール削除
  removeCustomRule(from: string): boolean {
    const result = this.customRules.delete(from)
    if (result) {
      console.log(`🗑️ Custom rule removed: ${from}`)
    }
    return result
  }

  // すべてのカスタムルールを取得
  getCustomRules(): Array<{from: string, to: string}> {
    return Array.from(this.customRules.entries()).map(([from, to]) => ({ from, to }))
  }

  // 変換テスト用関数
  testConversion(testCases: string[]): void {
    console.log('🧪 Kanji Reading Conversion Test:')
    console.log('=' .repeat(60))

    testCases.forEach((testCase, index) => {
      const result = this.convertText(testCase)
      console.log(`\n${index + 1}. "${testCase}"`)
      console.log(`   → "${result.converted}"`)
      console.log(`   Changes: ${result.hasChanges ? result.conversions.length : 0}`)
      
      if (result.hasChanges) {
        result.conversions.forEach(conv => {
          console.log(`     ${conv.from} → ${conv.to} (${conv.type}, ${conv.confidence})`)
        })
      }
    })
  }

  // 統計情報
  getConversionStats(): object {
    return {
      customRules: this.customRules.size,
      databaseEntries: allNameReadings.length,
      commonCharacters: Object.keys(commonCharacterReadings).length,
      supportedCategories: ['surname', 'given_name', 'honorifics', 'common_characters']
    }
  }
}

// シングルトンインスタンス
export const kanjiConverter = new KanjiReadingConverter()

// 便利関数（エラーハンドリング強化）
export function convertForElevenLabs(text: string): string {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('⚠️ Invalid text for ElevenLabs conversion:', text);
      return text || '';
    }
    
    const result = kanjiConverter.convertText(text);
    return result.converted;
  } catch (error) {
    console.error('❌ Error in convertForElevenLabs:', error);
    return text; // フォールバック
  }
}

export function convertNameForElevenLabs(name: string): string {
  try {
    if (!name || typeof name !== 'string') {
      console.warn('⚠️ Invalid name for ElevenLabs conversion:', name);
      return name || '';
    }
    
    const result = kanjiConverter.convertNameForVoice(name);
    return result.converted;
  } catch (error) {
    console.error('❌ Error in convertNameForElevenLabs:', error);
    return name; // フォールバック
  }
}

// デバッグ用関数
export function debugKanjiConverter(): void {
  console.log('🔍 Kanji Reading Converter Debug:')
  console.log('=' .repeat(50))
  
  // データベーステスト
  testNameDatabase()
  
  console.log('\n🔤 Conversion System Stats:')
  const stats = kanjiConverter.getConversionStats()
  console.log(stats)
  
  console.log('\n🧪 Sample Conversions:')
  const testCases = [
    '田中太郎さん',
    '佐藤花子ちゃん',
    '山田くん',
    '東海林さま',
    '鈴木美穂',
    'こんにちは、田中さん！',
    '佐々木さん、お疲れ様でした。'
  ]
  
  kanjiConverter.testConversion(testCases)
}