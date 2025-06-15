// 🎯 正確な時間帯音声選択 - スプレッドシート準拠

export type PreciseTimeSlot = 
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

export interface PreciseTimeInfo {
  timeSlot: PreciseTimeSlot
  hour: number
  voiceFile: string
  greeting: string
  description: string
}

export function getPreciseTimeSlot(): PreciseTimeSlot {
  const hour = new Date().getHours()
  
  // スプレッドシート準拠の詳細時間帯分類
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

export function getAkariVoiceByTime(): string {
  const timeSlot = getPreciseTimeSlot()
  
  // 実際のファイル名に基づく音声選択
  const voiceMapping: Record<PreciseTimeSlot, string> = {
    very_late: 'akari_very_late.wav',
    morning_early: 'akari_morning_early.wav',
    morning: 'akari_morning.wav',
    morning_late: 'akari_morning_late.wav',
    lunch: 'akari_lunch.wav',
    afternoon: 'akari_afternoon.wav',
    snack: 'akari_snack.wav',
    evening: 'akari_evening.wav',
    dinner: 'akari_dinner.wav',
    night: 'akari_night.wav',
    late: 'akari_late.wav'
  }
  
  return voiceMapping[timeSlot]
}

export function getPreciseTimeGreeting(): string {
  const timeSlot = getPreciseTimeSlot()
  
  // スプレッドシート準拠のテキスト挨拶
  const greetings: Record<PreciseTimeSlot, string> = {
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
  
  return greetings[timeSlot]
}

export function getPreciseTimeInfo(): PreciseTimeInfo {
  const now = new Date()
  const hour = now.getHours()
  const timeSlot = getPreciseTimeSlot()
  const voiceFile = getAkariVoiceByTime()
  const greeting = getPreciseTimeGreeting()
  
  const descriptions: Record<PreciseTimeSlot, string> = {
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
  
  return {
    timeSlot,
    hour,
    voiceFile,
    greeting,
    description: descriptions[timeSlot]
  }
}

export function debugPreciseTimeSystem(): void {
  const info = getPreciseTimeInfo()
  const now = new Date()
  
  console.log('🎯 Precise Time Voice System Debug')
  console.log('=' .repeat(60))
  console.log(`Current Time: ${now.toLocaleString('ja-JP')}`)
  console.log(`Current Hour: ${info.hour}`)
  console.log(`Time Slot: ${info.timeSlot}`)
  console.log(`Description: ${info.description}`)
  console.log(`Selected Voice: ${info.voiceFile}`)
  console.log(`Greeting Text: "${info.greeting}"`)
  console.log('')
  
  console.log('📋 ALL PRECISE TIME SLOTS:')
  const allSlots: PreciseTimeSlot[] = [
    'very_late', 'morning_early', 'morning', 'morning_late', 
    'lunch', 'afternoon', 'snack', 'evening', 
    'dinner', 'night', 'late'
  ]
  
  allSlots.forEach(slot => {
    const testInfo = {
      timeSlot: slot,
      voiceFile: getVoiceForSlot(slot),
      description: getDescriptionForSlot(slot)
    }
    
    const current = slot === info.timeSlot ? ' ← CURRENT' : ''
    console.log(`${testInfo.description} → ${testInfo.voiceFile}${current}`)
  })
  
  console.log('=' .repeat(60))
}

// Helper functions for debug
function getVoiceForSlot(slot: PreciseTimeSlot): string {
  const mapping: Record<PreciseTimeSlot, string> = {
    very_late: 'akari_very_late.wav',
    morning_early: 'akari_morning_early.wav',
    morning: 'akari_morning.wav',
    morning_late: 'akari_morning_late.wav',
    lunch: 'akari_lunch.wav',
    afternoon: 'akari_afternoon.wav',
    snack: 'akari_snack.wav',
    evening: 'akari_evening.wav',
    dinner: 'akari_dinner.wav',
    night: 'akari_night.wav',
    late: 'akari_late.wav'
  }
  return mapping[slot]
}

function getDescriptionForSlot(slot: PreciseTimeSlot): string {
  const descriptions: Record<PreciseTimeSlot, string> = {
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
  return descriptions[slot]
}