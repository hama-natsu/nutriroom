// 🎯 NutriRoom 統一時間帯システム - 音声・テキスト完全同期

export type UnifiedTimeSlot = 
  | 'very_late'    // 1:00-4:59
  | 'morning_early' // 5:00-6:59
  | 'morning'       // 7:00-8:59
  | 'morning_late'  // 9:00-10:59
  | 'lunch'         // 11:00-12:59
  | 'afternoon'     // 13:00-14:59
  | 'snack'         // 15:00-16:59
  | 'evening'       // 17:00-18:59
  | 'dinner'        // 19:00-20:59
  | 'night'         // 21:00-22:59
  | 'late'          // 23:00-0:59

export interface SyncedGreeting {
  timeSlot: UnifiedTimeSlot
  hour: number
  voiceFile: string
  text: string
  description: string
  isCurrentTime: boolean
}

// 【単一のソース・オブ・トゥルース】統一時間帯判定
export function getUnifiedTimeSlot(): UnifiedTimeSlot {
  const hour = new Date().getHours()
  
  // スプレッドシート準拠の11段階分類
  if (hour >= 1 && hour < 5) return 'very_late'    // 1:00-4:59
  if (hour >= 5 && hour < 7) return 'morning_early' // 5:00-6:59
  if (hour >= 7 && hour < 9) return 'morning'       // 7:00-8:59
  if (hour >= 9 && hour < 11) return 'morning_late' // 9:00-10:59
  if (hour >= 11 && hour < 13) return 'lunch'       // 11:00-12:59
  if (hour >= 13 && hour < 15) return 'afternoon'   // 13:00-14:59
  if (hour >= 15 && hour < 17) return 'snack'       // 15:00-16:59
  if (hour >= 17 && hour < 19) return 'evening'     // 17:00-18:59
  if (hour >= 19 && hour < 21) return 'dinner'      // 19:00-20:59
  if (hour >= 21 && hour < 23) return 'night'       // 21:00-22:59
  return 'late' // 23:00-0:59
}

// 【統一システム対応】音声ファイル名生成（全キャラクター対応）
export function getUnifiedVoiceFile(timeSlot: UnifiedTimeSlot, characterId: string = 'akari'): string {
  return `${characterId}_${timeSlot}.wav`
}

// 【レガシー互換】あかり専用関数（既存コード互換性のため）
export function getAkariVoiceFile(timeSlot: UnifiedTimeSlot): string {
  return getUnifiedVoiceFile(timeSlot, 'akari')
}

// 【スプレッドシート準拠】テキスト挨拶生成
export function getUnifiedGreetingText(timeSlot: UnifiedTimeSlot): string {
  // 音声ファイルの内容と完全に一致するテキスト
  const textMapping: Record<UnifiedTimeSlot, string> = {
    very_late: 'こんな時間まで...お疲れさまです。早く休んでくださいね〜',
    morning_early: 'おはよう！早起きですね〜今日も一緒に頑張りましょう♪',
    morning: 'おはよう！爽やかな朝ですね〜今日も元気に過ごしましょう♪',
    morning_late: 'おはよう！いい時間になりましたね〜朝ごはんは食べましたか？',
    lunch: 'お昼の時間ですね〜お腹空いてませんか？栄養バランスを考えて食べましょう♪',
    afternoon: 'こんにちは〜午後もお疲れさまです！水分補給はしっかりと〜',
    snack: 'おやつの時間ですね〜甘いものもたまにはいいですよ♪',
    evening: 'お疲れさまです〜夕方になりましたね。今日はどんな一日でしたか？',
    dinner: '夕食の時間ですね〜今日も一日お疲れさまでした♪',
    night: 'こんばんは〜夜の時間ですね。リラックスして過ごしましょう♪',
    late: 'こんばんは...遅い時間ですが、お疲れさまです。明日に備えて早めに休みましょうね〜'
  }
  
  return textMapping[timeSlot]
}

// 時間帯の説明文
export function getUnifiedTimeDescription(timeSlot: UnifiedTimeSlot): string {
  const descriptions: Record<UnifiedTimeSlot, string> = {
    very_late: '超深夜 (1:00-4:59)',
    morning_early: '早朝 (5:00-6:59)',
    morning: '朝 (7:00-8:59)',
    morning_late: '朝遅め (9:00-10:59)',
    lunch: '昼食時 (11:00-12:59)',
    afternoon: '午後 (13:00-14:59)',
    snack: 'おやつ時間 (15:00-16:59)',
    evening: '夕方 (17:00-18:59)',
    dinner: '夕食時 (19:00-20:59)',
    night: '夜 (21:00-22:59)',
    late: '深夜 (23:00-0:59)'
  }
  
  return descriptions[timeSlot]
}

// 【音声・テキスト同期生成】メイン関数（全キャラクター対応）
export function generateSyncedGreeting(characterId: string = 'akari'): SyncedGreeting {
  const now = new Date()
  const hour = now.getHours()
  const timeSlot = getUnifiedTimeSlot()
  const voiceFile = getUnifiedVoiceFile(timeSlot, characterId)
  const text = getUnifiedGreetingText(timeSlot)
  const description = getUnifiedTimeDescription(timeSlot)
  
  const result: SyncedGreeting = {
    timeSlot,
    hour,
    voiceFile,
    text,
    description,
    isCurrentTime: true
  }
  
  // 【同期確認ログ】
  console.log('🎯 Synced Greeting Generated:', {
    timestamp: now.toLocaleString('ja-JP'),
    hour,
    timeSlot,
    voiceFile,
    textLength: text.length,
    description
  })
  
  return result
}

// 【同期検証システム】
export function verifySynchronization(): {
  isValid: boolean
  errors: string[]
  details: SyncedGreeting
} {
  const greeting = generateSyncedGreeting()
  const errors: string[] = []
  
  // 音声ファイル名と時間帯の一致確認（キャラクター名を考慮）
  const characterId = greeting.voiceFile.split('_')[0] || 'akari'
  const expectedVoiceFile = `${characterId}_${greeting.timeSlot}.wav`
  if (greeting.voiceFile !== expectedVoiceFile) {
    errors.push(`Voice file mismatch: expected ${expectedVoiceFile}, got ${greeting.voiceFile}`)
  }
  
  // テキストの存在確認
  if (!greeting.text || greeting.text.length < 10) {
    errors.push(`Text is too short or empty: "${greeting.text}"`)
  }
  
  // 時間帯判定の論理確認
  const hour = greeting.hour
  let expectedTimeSlot: UnifiedTimeSlot
  
  if (hour >= 1 && hour < 5) expectedTimeSlot = 'very_late'
  else if (hour >= 5 && hour < 7) expectedTimeSlot = 'morning_early'
  else if (hour >= 7 && hour < 9) expectedTimeSlot = 'morning'
  else if (hour >= 9 && hour < 11) expectedTimeSlot = 'morning_late'
  else if (hour >= 11 && hour < 13) expectedTimeSlot = 'lunch'
  else if (hour >= 13 && hour < 15) expectedTimeSlot = 'afternoon'
  else if (hour >= 15 && hour < 17) expectedTimeSlot = 'snack'
  else if (hour >= 17 && hour < 19) expectedTimeSlot = 'evening'
  else if (hour >= 19 && hour < 21) expectedTimeSlot = 'dinner'
  else if (hour >= 21 && hour < 23) expectedTimeSlot = 'night'
  else expectedTimeSlot = 'late'
  
  if (greeting.timeSlot !== expectedTimeSlot) {
    errors.push(`Time slot mismatch: expected ${expectedTimeSlot}, got ${greeting.timeSlot}`)
  }
  
  const isValid = errors.length === 0
  
  console.log('🔍 Synchronization Verification:', {
    isValid,
    errorsCount: errors.length,
    errors,
    currentTimeSlot: greeting.timeSlot,
    expectedTimeSlot
  })
  
  return {
    isValid,
    errors,
    details: greeting
  }
}

// 【デバッグシステム】
export function debugUnifiedTimeSystem(): void {
  const verification = verifySynchronization()
  const now = new Date()
  
  console.log('🎯 Unified Time System Debug Report')
  console.log('=' .repeat(70))
  console.log(`Current Time: ${now.toLocaleString('ja-JP')} (Hour: ${now.getHours()})`)
  console.log(`Synchronization Status: ${verification.isValid ? '✅ VALID' : '❌ INVALID'}`)
  
  if (!verification.isValid) {
    console.log('🚨 SYNCHRONIZATION ERRORS:')
    verification.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`)
    })
  }
  
  console.log('')
  console.log('📋 Current Greeting Details:')
  const details = verification.details
  console.log(`  Time Slot: ${details.timeSlot}`)
  console.log(`  Description: ${details.description}`)
  console.log(`  Voice File: ${details.voiceFile}`)
  console.log(`  Greeting Text: "${details.text}"`)
  
  console.log('')
  console.log('🧪 All Time Slots Test:')
  const allSlots: UnifiedTimeSlot[] = [
    'very_late', 'morning_early', 'morning', 'morning_late',
    'lunch', 'afternoon', 'snack', 'evening',
    'dinner', 'night', 'late'
  ]
  
  allSlots.forEach(slot => {
    const voiceFile = getUnifiedVoiceFile(slot)
    const text = getUnifiedGreetingText(slot)
    const description = getUnifiedTimeDescription(slot)
    const isCurrent = slot === details.timeSlot ? ' ← CURRENT' : ''
    
    console.log(`  ${description}`)
    console.log(`    Voice: ${voiceFile}`)
    console.log(`    Text: "${text.substring(0, 40)}..."${isCurrent}`)
  })
  
  console.log('=' .repeat(70))
}

// 【レガシーシステムとの互換性】
export function convertToLegacyTimeSlot(unifiedSlot: UnifiedTimeSlot): 'morning' | 'afternoon' | 'evening' | 'night' {
  const legacyMapping: Record<UnifiedTimeSlot, 'morning' | 'afternoon' | 'evening' | 'night'> = {
    very_late: 'night',
    morning_early: 'morning',
    morning: 'morning',
    morning_late: 'morning',
    lunch: 'afternoon',
    afternoon: 'afternoon',
    snack: 'afternoon',
    evening: 'evening',
    dinner: 'evening',
    night: 'night',
    late: 'night'
  }
  
  return legacyMapping[unifiedSlot]
}

// ブラウザ環境でのデバッグ関数公開
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).debugUnifiedTime = debugUnifiedTimeSystem
  ;(window as unknown as Record<string, unknown>).verifySyncronization = verifySynchronization
  ;(window as unknown as Record<string, unknown>).generateSyncedGreeting = generateSyncedGreeting
  
  console.log('🎯 Unified Time System Debug Functions Available:')
  console.log('- debugUnifiedTime() : 統一時間システムデバッグ')
  console.log('- verifySyncronization() : 同期検証')
  console.log('- generateSyncedGreeting() : 同期挨拶生成')
}