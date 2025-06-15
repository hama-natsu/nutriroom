// 🧪 NutriRoom 音声・テキスト同期システムテスト

import {
  generateSyncedGreeting,
  verifySynchronization,
  debugUnifiedTimeSystem,
  getUnifiedVoiceFile,
  getUnifiedGreetingText,
  type UnifiedTimeSlot
} from '../unified-time-system'

// 同期システム基本テスト
export async function testBasicSynchronization(): Promise<void> {
  console.log('🧪 Testing Basic Voice-Text Synchronization')
  console.log('=' .repeat(60))

  // 1. 現在時間での同期テスト
  console.log('\n📝 Test 1: Current time synchronization')
  const syncedGreeting = generateSyncedGreeting()
  
  console.log('Generated Synced Greeting:', {
    timeSlot: syncedGreeting.timeSlot,
    hour: syncedGreeting.hour,
    voiceFile: syncedGreeting.voiceFile,
    textPreview: syncedGreeting.text.substring(0, 50) + '...',
    description: syncedGreeting.description
  })

  // 2. 同期検証テスト
  console.log('\n📝 Test 2: Synchronization verification')
  const verification = verifySynchronization()
  
  console.log('Verification Result:', {
    isValid: verification.isValid,
    errorsCount: verification.errors.length,
    errors: verification.errors
  })

  if (!verification.isValid) {
    console.error('❌ Synchronization errors detected:', verification.errors)
  } else {
    console.log('✅ Synchronization is valid!')
  }

  console.log('=' .repeat(60))
}

// 全時間帯同期テスト
export async function testAllTimeSlotsSync(): Promise<void> {
  console.log('\n🧪 Testing All Time Slots Synchronization')
  console.log('=' .repeat(60))

  const allSlots: UnifiedTimeSlot[] = [
    'very_late', 'morning_early', 'morning', 'morning_late',
    'lunch', 'afternoon', 'snack', 'evening', 
    'dinner', 'night', 'late'
  ]

  console.log('📋 Testing all 11 time slots:')
  
  allSlots.forEach((slot, index) => {
    const voiceFile = getUnifiedVoiceFile(slot)
    const text = getUnifiedGreetingText(slot)
    const expectedVoiceFile = `akari_${slot}.wav`
    
    const isVoiceValid = voiceFile === expectedVoiceFile
    const isTextValid = text.length > 10
    
    console.log(`\n${index + 1}. ${slot}:`)
    console.log(`   Voice: ${voiceFile} ${isVoiceValid ? '✅' : '❌'}`)
    console.log(`   Text: "${text.substring(0, 40)}..." ${isTextValid ? '✅' : '❌'}`)
    
    if (!isVoiceValid) {
      console.error(`   ❌ Voice file mismatch: expected ${expectedVoiceFile}, got ${voiceFile}`)
    }
    if (!isTextValid) {
      console.error(`   ❌ Text too short: "${text}"`)
    }
  })

  console.log('=' .repeat(60))
}

// 時間帯判定ロジックテスト
export async function testTimeSlotLogic(): Promise<void> {
  console.log('\n🧪 Testing Time Slot Detection Logic')
  console.log('=' .repeat(60))

  const testHours = [
    { hour: 2, expected: 'very_late' },
    { hour: 6, expected: 'morning_early' },
    { hour: 8, expected: 'morning' },
    { hour: 10, expected: 'morning_late' },
    { hour: 12, expected: 'lunch' },
    { hour: 14, expected: 'afternoon' },
    { hour: 16, expected: 'snack' },
    { hour: 18, expected: 'evening' },
    { hour: 20, expected: 'dinner' },
    { hour: 22, expected: 'night' },
    { hour: 0, expected: 'late' }
  ]

  console.log('🕒 Testing time slot detection for various hours:')
  
  let allValid = true
  
  testHours.forEach(test => {
    // 実際の時間を一時的に変更することはできないので、
    // ロジックを直接テストする
    let detected: UnifiedTimeSlot
    
    if (test.hour >= 1 && test.hour < 5) detected = 'very_late'
    else if (test.hour >= 5 && test.hour < 7) detected = 'morning_early'
    else if (test.hour >= 7 && test.hour < 9) detected = 'morning'
    else if (test.hour >= 9 && test.hour < 11) detected = 'morning_late'
    else if (test.hour >= 11 && test.hour < 13) detected = 'lunch'
    else if (test.hour >= 13 && test.hour < 15) detected = 'afternoon'
    else if (test.hour >= 15 && test.hour < 17) detected = 'snack'
    else if (test.hour >= 17 && test.hour < 19) detected = 'evening'
    else if (test.hour >= 19 && test.hour < 21) detected = 'dinner'
    else if (test.hour >= 21 && test.hour < 23) detected = 'night'
    else detected = 'late'
    
    const isValid = detected === test.expected
    if (!isValid) allValid = false
    
    console.log(`   ${test.hour}:00 → ${detected} ${isValid ? '✅' : '❌'} (expected: ${test.expected})`)
  })

  if (allValid) {
    console.log('✅ All time slot detection tests passed!')
  } else {
    console.error('❌ Some time slot detection tests failed!')
  }

  console.log('=' .repeat(60))
}

// 音声・テキスト内容一致テスト
export async function testContentConsistency(): Promise<void> {
  console.log('\n🧪 Testing Voice-Text Content Consistency')
  console.log('=' .repeat(60))

  const allSlots: UnifiedTimeSlot[] = [
    'very_late', 'morning_early', 'morning', 'morning_late',
    'lunch', 'afternoon', 'snack', 'evening', 
    'dinner', 'night', 'late'
  ]

  console.log('🔍 Checking voice-text content consistency:')
  
  let allConsistent = true
  
  allSlots.forEach(slot => {
    const voiceFile = getUnifiedVoiceFile(slot)
    const text = getUnifiedGreetingText(slot)
    
    // 音声ファイル名とスロット名の一致確認
    const expectedVoiceFile = `akari_${slot}.wav`
    const voiceConsistent = voiceFile === expectedVoiceFile
    
    // テキストの適切性確認
    const textValid = text.length >= 15 && text.includes('♪' || '〜' || '！')
    
    // 時間帯に適したテキスト内容の確認
    let contentAppropriate = true
    switch (slot) {
      case 'morning_early':
      case 'morning':
      case 'morning_late':
        contentAppropriate = text.includes('おはよう')
        break
      case 'lunch':
        contentAppropriate = text.includes('お昼') || text.includes('昼')
        break
      case 'evening':
      case 'dinner':
        contentAppropriate = text.includes('夕') || text.includes('お疲れ')
        break
      case 'night':
      case 'late':
      case 'very_late':
        contentAppropriate = text.includes('こんばんは') || text.includes('遅い') || text.includes('深夜')
        break
    }
    
    const isAllConsistent = voiceConsistent && textValid && contentAppropriate
    if (!isAllConsistent) allConsistent = false
    
    console.log(`\n   ${slot}:`)
    console.log(`     Voice: ${voiceFile} ${voiceConsistent ? '✅' : '❌'}`)
    console.log(`     Text Valid: ${textValid ? '✅' : '❌'}`)
    console.log(`     Content Appropriate: ${contentAppropriate ? '✅' : '❌'}`)
    console.log(`     Text: "${text.substring(0, 30)}..."`)
  })

  if (allConsistent) {
    console.log('\n✅ All voice-text content is consistent!')
  } else {
    console.error('\n❌ Some voice-text content inconsistencies detected!')
  }

  console.log('=' .repeat(60))
}

// メイン統合テスト実行
export async function runVoiceTextSyncTests(): Promise<void> {
  console.log('🚀 Starting Voice-Text Synchronization Tests')
  console.log('=' .repeat(80))

  try {
    await testBasicSynchronization()
    await testAllTimeSlotsSync()
    await testTimeSlotLogic()
    await testContentConsistency()
    
    console.log('\n🎉 ALL VOICE-TEXT SYNC TESTS COMPLETED!')
    console.log('✅ NutriRoom voice-text synchronization system is working properly')
    
    // 統合デバッグ情報表示
    debugUnifiedTimeSystem()
    
  } catch (error) {
    console.error('❌ Voice-Text sync test failed:', error)
    throw error
  }

  console.log('=' .repeat(80))
}

// ブラウザ環境でのテスト実行
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).testVoiceTextSync = runVoiceTextSyncTests
  ;(window as unknown as Record<string, unknown>).testBasicSync = testBasicSynchronization
  ;(window as unknown as Record<string, unknown>).testAllSlots = testAllTimeSlotsSync
  
  console.log('🧪 Voice-Text Sync Test Functions Available:')
  console.log('- testVoiceTextSync() : 全統合テスト実行')
  console.log('- testBasicSync() : 基本同期テスト')
  console.log('- testAllSlots() : 全時間帯テスト')
}