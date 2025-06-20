// 🧪 時間帯判定テストユーティリティ - 統一システム対応

import { getUnifiedTimeSlot, getUnifiedGreetingText, getUnifiedTimeDescription, UnifiedTimeSlot } from '@/lib/unified-time-system'

// 時間帯判定ヘルパー関数
function getTimeSlotForHour(hour: number): UnifiedTimeSlot {
  if (hour >= 1 && hour < 5) return 'very_late'
  if (hour >= 5 && hour < 7) return 'morning_early'
  if (hour >= 7 && hour < 9) return 'morning'
  if (hour >= 9 && hour < 11) return 'morning_late'
  if (hour >= 11 && hour < 13) return 'lunch'
  if (hour >= 13 && hour < 15) return 'afternoon'
  if (hour >= 15 && hour < 17) return 'snack'
  if (hour >= 17 && hour < 19) return 'evening'
  if (hour >= 19 && hour < 21) return 'dinner'
  if (hour >= 21 && hour < 23) return 'night'
  return 'late'
}

export interface TimeSlotTestResult {
  hour: number
  timeSlot: string
  greeting: string
  description: string
  expectedVoiceFile: string
  isCurrentHour: boolean
}

export function testAllTimeSlots(): TimeSlotTestResult[] {
  const currentHour = new Date().getHours()
  const testHours = [0, 1, 2, 5, 6, 9, 11, 12, 15, 17, 18, 20, 21, 22, 23]
  
  return testHours.map(hour => {
    // 統一システムを使用
    const timeSlot = getTimeSlotForHour(hour)
    const greeting = getUnifiedGreetingText(timeSlot)
    const description = getUnifiedTimeDescription(timeSlot)
    const expectedVoiceFile = `akari_${timeSlot}.wav`
    
    return {
      hour,
      timeSlot,
      greeting,
      description,
      expectedVoiceFile,
      isCurrentHour: hour === currentHour
    }
  })
}

export function testCurrentTimeSlot(): TimeSlotTestResult {
  const now = new Date()
  const hour = now.getHours()
  const timeSlot = getUnifiedTimeSlot()
  const greeting = getUnifiedGreetingText(timeSlot)
  const description = getUnifiedTimeDescription(timeSlot)
  const expectedVoiceFile = `akari_${timeSlot}.wav`
  
  return {
    hour,
    timeSlot,
    greeting,
    description,
    expectedVoiceFile,
    isCurrentHour: true
  }
}

export function debugTimeSlotSystem(): void {
  console.log('🧪 Time Slot System Test')
  console.log('=' .repeat(60))
  
  const currentTest = testCurrentTimeSlot()
  
  console.log('📍 CURRENT TIME STATUS:')
  console.log(`Current Time: ${new Date().toLocaleString('ja-JP')}`)
  console.log(`Current Hour: ${currentTest.hour}`)
  console.log(`Detected Time Slot: ${currentTest.timeSlot}`)
  console.log(`Text Greeting: "${currentTest.greeting}"`)
  console.log(`Expected Voice: ${currentTest.expectedVoiceFile}`)
  console.log(`Description: ${currentTest.description}`)
  
  console.log('\n📋 ALL TIME SLOTS TEST:')
  const allTests = testAllTimeSlots()
  
  allTests.forEach(test => {
    const marker = test.isCurrentHour ? '👉 ' : '   '
    console.log(`${marker}${String(test.hour).padStart(2, '0')}:00 → ${test.timeSlot.padEnd(9)} | ${test.description}`)
    console.log(`${marker}     Text: "${test.greeting.substring(0, 20)}..."`)
    console.log(`${marker}     Voice: ${test.expectedVoiceFile}`)
    if (test.isCurrentHour) {
      console.log(`${marker}     ⭐ CURRENT TIME ⭐`)
    }
    console.log('')
  })
  
  console.log('🔍 VALIDATION (統一システム):')
  const veryLateHours = allTests.filter(t => t.timeSlot === 'very_late')
  const morningEarlyHours = allTests.filter(t => t.timeSlot === 'morning_early')
  const morningHours = allTests.filter(t => t.timeSlot === 'morning')
  const morningLateHours = allTests.filter(t => t.timeSlot === 'morning_late')
  const lunchHours = allTests.filter(t => t.timeSlot === 'lunch')
  const afternoonHours = allTests.filter(t => t.timeSlot === 'afternoon')
  const snackHours = allTests.filter(t => t.timeSlot === 'snack')
  const eveningHours = allTests.filter(t => t.timeSlot === 'evening')
  const dinnerHours = allTests.filter(t => t.timeSlot === 'dinner')
  const nightHours = allTests.filter(t => t.timeSlot === 'night')
  const lateHours = allTests.filter(t => t.timeSlot === 'late')
  
  console.log(`Very Late (1:00-4:59): Hours ${veryLateHours.map(t => t.hour).join(', ')}`)
  console.log(`Morning Early (5:00-6:59): Hours ${morningEarlyHours.map(t => t.hour).join(', ')}`)
  console.log(`Morning (7:00-8:59): Hours ${morningHours.map(t => t.hour).join(', ')}`)
  console.log(`Morning Late (9:00-10:59): Hours ${morningLateHours.map(t => t.hour).join(', ')}`)
  console.log(`Lunch (11:00-12:59): Hours ${lunchHours.map(t => t.hour).join(', ')}`)
  console.log(`Afternoon (13:00-14:59): Hours ${afternoonHours.map(t => t.hour).join(', ')}`)
  console.log(`Snack (15:00-16:59): Hours ${snackHours.map(t => t.hour).join(', ')}`)
  console.log(`Evening (17:00-18:59): Hours ${eveningHours.map(t => t.hour).join(', ')}`)
  console.log(`Dinner (19:00-20:59): Hours ${dinnerHours.map(t => t.hour).join(', ')}`)
  console.log(`Night (21:00-22:59): Hours ${nightHours.map(t => t.hour).join(', ')}`)
  console.log(`Late (23:00-0:59): Hours ${lateHours.map(t => t.hour).join(', ')}`)
  
  console.log('=' .repeat(60))
}

// 便利な実行関数
export const runTimeSlotTest = () => {
  debugTimeSlotSystem()
}