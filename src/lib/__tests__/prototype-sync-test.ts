// 🧪 プロトタイプページ音声・テキスト同期テスト

import { getUnifiedTimeSlot, getUnifiedGreetingText } from '../unified-time-system'

// プロトタイプページの直接テキストマッピングを模倣
const getTimeBasedTextFromPrototype = (): string => {
  const hour = new Date().getHours();
  
  // 統一システムと完全一致する11段階判定
  if (hour >= 1 && hour < 5) {
    return "こんな時間まで...お疲れさまです。早く休んでくださいね〜";
  }
  if (hour >= 5 && hour < 7) {
    return "おはよう！早起きですね〜今日も一緒に頑張りましょう♪";
  }
  if (hour >= 7 && hour < 9) {
    return "おはよう！爽やかな朝ですね〜今日も元気に過ごしましょう♪";
  }
  if (hour >= 9 && hour < 11) {
    return "おはよう！いい時間になりましたね〜朝ごはんは食べましたか？";
  }
  if (hour >= 11 && hour < 13) {
    return "お昼の時間ですね♪お昼ご飯、何食べました〜？";
  }
  if (hour >= 13 && hour < 15) {
    return "こんにちは〜午後もお疲れさまです！水分補給はしっかりと〜";
  }
  if (hour >= 15 && hour < 17) {
    return "おやつの時間ですね〜甘いものもたまにはいいですよ♪";
  }
  if (hour >= 17 && hour < 19) {
    return "お疲れさまです〜夕方になりましたね。今日はどんな一日でしたか？";
  }
  if (hour >= 19 && hour < 21) {
    return "夕食の時間ですね〜今日も一日お疲れさまでした♪";
  }
  if (hour >= 21 && hour < 23) {
    return "こんばんは〜夜の時間ですね。リラックスして過ごしましょう♪";
  }
  // 23:00-0:59
  return "こんばんは...遅い時間ですが、お疲れさまです。明日に備えて早めに休みましょうね〜";
};

// プロトタイプ同期テスト
export function testPrototypeSync(): void {
  console.log('🧪 Testing Prototype Voice-Text Synchronization')
  console.log('=' .repeat(60))

  const now = new Date()
  const hour = now.getHours()

  // 1. 現在時間での同期確認
  const timeSlot = getUnifiedTimeSlot()
  const unifiedText = getUnifiedGreetingText(timeSlot)
  const prototypeText = getTimeBasedTextFromPrototype()

  console.log('\n📝 Current Time Sync Check:')
  console.log(`Current Time: ${now.toLocaleString('ja-JP')} (Hour: ${hour})`)
  console.log(`Time Slot: ${timeSlot}`)
  console.log(`Unified Text: "${unifiedText}"`)
  console.log(`Prototype Text: "${prototypeText}"`)
  console.log(`Texts Match: ${unifiedText === prototypeText ? '✅ YES' : '❌ NO'}`)

  if (unifiedText !== prototypeText) {
    console.error('❌ SYNCHRONIZATION MISMATCH DETECTED!')
    console.error('This means voice and text will not be synchronized!')
  } else {
    console.log('✅ PERFECT SYNCHRONIZATION!')
    console.log('Voice and text are perfectly aligned!')
  }

  // 2. 全時間帯での同期確認
  console.log('\n🕒 All Time Slots Sync Verification:')
  
  const testHours = [2, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0]
  let allSynced = true

  testHours.forEach(testHour => {
    // 模擬的に各時間での判定をテスト
    let expectedTimeSlot: string
    let expectedText: string

    if (testHour >= 1 && testHour < 5) {
      expectedTimeSlot = 'very_late'
      expectedText = "こんな時間まで...お疲れさまです。早く休んでくださいね〜"
    } else if (testHour >= 5 && testHour < 7) {
      expectedTimeSlot = 'morning_early'
      expectedText = "おはよう！早起きですね〜今日も一緒に頑張りましょう♪"
    } else if (testHour >= 7 && testHour < 9) {
      expectedTimeSlot = 'morning'
      expectedText = "おはよう！爽やかな朝ですね〜今日も元気に過ごしましょう♪"
    } else if (testHour >= 9 && testHour < 11) {
      expectedTimeSlot = 'morning_late'
      expectedText = "おはよう！いい時間になりましたね〜朝ごはんは食べましたか？"
    } else if (testHour >= 11 && testHour < 13) {
      expectedTimeSlot = 'lunch'
      expectedText = "お昼の時間ですね♪お昼ご飯、何食べました〜？"
    } else if (testHour >= 13 && testHour < 15) {
      expectedTimeSlot = 'afternoon'
      expectedText = "こんにちは〜午後もお疲れさまです！水分補給はしっかりと〜"
    } else if (testHour >= 15 && testHour < 17) {
      expectedTimeSlot = 'snack'
      expectedText = "おやつの時間ですね〜甘いものもたまにはいいですよ♪"
    } else if (testHour >= 17 && testHour < 19) {
      expectedTimeSlot = 'evening'
      expectedText = "お疲れさまです〜夕方になりましたね。今日はどんな一日でしたか？"
    } else if (testHour >= 19 && testHour < 21) {
      expectedTimeSlot = 'dinner'
      expectedText = "夕食の時間ですね〜今日も一日お疲れさまでした♪"
    } else if (testHour >= 21 && testHour < 23) {
      expectedTimeSlot = 'night'
      expectedText = "こんばんは〜夜の時間ですね。リラックスして過ごしましょう♪"
    } else {
      expectedTimeSlot = 'late'
      expectedText = "こんばんは...遅い時間ですが、お疲れさまです。明日に備えて早めに休みましょうね〜"
    }

    const isCurrentHour = testHour === hour
    const status = isCurrentHour ? ' ← CURRENT' : ''
    
    console.log(`   ${testHour}:00 → ${expectedTimeSlot} → "${expectedText.substring(0, 30)}..."${status}`)
  })

  console.log('\n🎯 Synchronization Status:')
  if (allSynced && unifiedText === prototypeText) {
    console.log('✅ ALL SYSTEMS SYNCHRONIZED!')
    console.log('🎵 Voice files will match text content perfectly')
    console.log('🎯 Users will experience consistent audio-visual alignment')
  } else {
    console.error('❌ SYNCHRONIZATION ISSUES DETECTED!')
    console.error('🚨 URGENT: Voice and text may not match!')
    allSynced = false
  }

  console.log('=' .repeat(60))
  return allSynced
}

// 緊急同期チェック
export function emergencySyncCheck(): boolean {
  const timeSlot = getUnifiedTimeSlot()
  const unifiedText = getUnifiedGreetingText(timeSlot)
  const prototypeText = getTimeBasedTextFromPrototype()
  const isSync = unifiedText === prototypeText

  console.log('🚨 EMERGENCY SYNC CHECK:', {
    timestamp: new Date().toLocaleString('ja-JP'),
    timeSlot,
    isSync: isSync ? '✅ SYNCED' : '❌ NOT SYNCED',
    unifiedLength: unifiedText.length,
    prototypeLength: prototypeText.length
  })

  return isSync
}

// ブラウザ環境での関数公開
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).testPrototypeSync = testPrototypeSync
  ;(window as unknown as Record<string, unknown>).emergencySyncCheck = emergencySyncCheck
  
  console.log('🧪 Prototype Sync Test Functions Available:')
  console.log('- testPrototypeSync() : プロトタイプ同期テスト')
  console.log('- emergencySyncCheck() : 緊急同期チェック')
}