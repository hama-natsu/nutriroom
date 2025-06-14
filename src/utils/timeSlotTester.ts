// 🧪 時間帯判定テストユーティリティ

import { getCurrentTimeSlot, getTimeSlotGreeting, getTimeSlotDescription, getTimeSlotForHour } from '@/lib/time-greeting'

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
    const timeSlot = getTimeSlotForHour(hour)
    const greeting = getTimeSlotGreeting(timeSlot)
    const description = getTimeSlotDescription(timeSlot)
    const expectedVoiceFile = `akari_${timeSlot}_normal.wav`
    
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
  const timeSlot = getCurrentTimeSlot()
  const greeting = getTimeSlotGreeting(timeSlot)
  const description = getTimeSlotDescription(timeSlot)
  const expectedVoiceFile = `akari_${timeSlot}_normal.wav`
  
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
  
  console.log('🔍 VALIDATION:')
  const nightHours = allTests.filter(t => t.timeSlot === 'night')
  const morningHours = allTests.filter(t => t.timeSlot === 'morning')
  const afternoonHours = allTests.filter(t => t.timeSlot === 'afternoon')
  const eveningHours = allTests.filter(t => t.timeSlot === 'evening')
  
  console.log(`Night (22:00-05:59): Hours ${nightHours.map(t => t.hour).join(', ')}`)
  console.log(`Morning (06:00-11:59): Hours ${morningHours.map(t => t.hour).join(', ')}`)
  console.log(`Afternoon (12:00-17:59): Hours ${afternoonHours.map(t => t.hour).join(', ')}`)
  console.log(`Evening (18:00-21:59): Hours ${eveningHours.map(t => t.hour).join(', ')}`)
  
  console.log('=' .repeat(60))
}

// 便利な実行関数
export const runTimeSlotTest = () => {
  debugTimeSlotSystem()
}