// 時間帯判定システム

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export function getCurrentTimeSlot(): TimeSlot {
  const now = new Date();
  const hour = now.getHours();
  
  // デバッグ情報を追加
  console.log('🕒 Time Slot Debug:', {
    currentTime: now.toLocaleString('ja-JP'),
    hour,
    timestamp: now.toISOString()
  });
  
  if (hour >= 6 && hour < 12) return 'morning';   // 6:00-11:59 (朝)
  if (hour >= 12 && hour < 18) return 'afternoon'; // 12:00-17:59 (昼)
  if (hour >= 18 && hour < 22) return 'evening';   // 18:00-21:59 (夕)
  return 'night'; // 22:00-05:59 (夜)
}

export function getTimeSlotGreeting(timeSlot: TimeSlot): string {
  const greetings = {
    morning: 'おはよう！今日も一緒に頑張りましょう〜♪',
    afternoon: 'こんにちは〜！元気にしてましたか？',
    evening: 'こんばんは！今日はどんな一日でしたか？',
    night: 'こんばんは...遅い時間ですが、大丈夫ですか？'
  };
  
  console.log('💬 Greeting Selection:', {
    timeSlot,
    selectedGreeting: greetings[timeSlot]
  });
  
  return greetings[timeSlot];
}

export function getTimeSlotDescription(timeSlot: TimeSlot): string {
  const descriptions = {
    morning: '朝 (6:00-11:59)',
    afternoon: '昼 (12:00-17:59)',
    evening: '夕 (18:00-21:59)',
    night: '夜 (22:00-05:59)'
  };
  
  return descriptions[timeSlot];
}

export function getTimeSlotForHour(hour: number): TimeSlot {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
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