// 時間帯判定システム

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';   // 5:00-11:59
  if (hour >= 12 && hour < 17) return 'afternoon'; // 12:00-16:59  
  if (hour >= 17 && hour < 22) return 'evening';   // 17:00-21:59
  return 'night'; // 22:00-4:59
}

export function getTimeSlotGreeting(timeSlot: TimeSlot): string {
  const greetings = {
    morning: 'おはよう！今日も一緒に頑張りましょう〜♪',
    afternoon: 'こんにちは〜！元気にしてましたか？',
    evening: 'こんばんは！今日はどんな一日でしたか？',
    night: 'もうこんな時間...大丈夫ですか？'
  };
  
  return greetings[timeSlot];
}

export function getTimeSlotDescription(timeSlot: TimeSlot): string {
  const descriptions = {
    morning: '朝 (5:00-11:59)',
    afternoon: '昼 (12:00-16:59)',
    evening: '夕 (17:00-21:59)',
    night: '夜 (22:00-4:59)'
  };
  
  return descriptions[timeSlot];
}

export function getTimeSlotForHour(hour: number): TimeSlot {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function getAllTimeSlots(): TimeSlot[] {
  return ['morning', 'afternoon', 'evening', 'night'];
}

export function debugTimeSystem(): void {
  const now = new Date();
  const hour = now.getHours();
  const currentSlot = getCurrentTimeSlot();
  
  console.log('🕒 Time System Debug:');
  console.log('=' .repeat(50));
  console.log(`Current Time: ${now.toLocaleString('ja-JP')}`);
  console.log(`Current Hour: ${hour}`);
  console.log(`Current Time Slot: ${currentSlot}`);
  console.log(`Greeting: "${getTimeSlotGreeting(currentSlot)}"`);
  console.log(`Description: ${getTimeSlotDescription(currentSlot)}`);
  
  console.log('\n📋 All Time Slots:');
  getAllTimeSlots().forEach(slot => {
    console.log(`  ${slot}: ${getTimeSlotDescription(slot)}`);
    console.log(`    Greeting: "${getTimeSlotGreeting(slot)}"`);
  });
  
  console.log('\n🧪 Test Hours:');
  [6, 9, 13, 15, 18, 20, 23, 2].forEach(testHour => {
    const slot = getTimeSlotForHour(testHour);
    console.log(`  ${testHour}:00 → ${slot} (${getTimeSlotDescription(slot)})`);
  });
}