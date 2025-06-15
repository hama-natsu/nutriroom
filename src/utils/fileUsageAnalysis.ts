// 🔍 NutriRoom ファイル使用状況分析レポート

export interface FileUsageReport {
  category: 'active' | 'fallback' | 'unused' | 'unknown'
  fileName: string
  usedBy: string[]
  reasoning: string
  safeToDelete: boolean
}

export interface VoiceFileAnalysis {
  activeFiles: string[]
  fallbackFiles: string[]
  unusedFiles: string[]
  totalFiles: number
  deletionCandidates: string[]
}

// スプレッドシート準拠のakari音声ファイル（使用中）
const AKARI_ACTIVE_FILES = [
  'akari_very_late.wav',      // 超深夜 (1:00-4:59)
  'akari_morning_early.wav',  // 早朝 (5:00-6:59)
  'akari_morning.wav',        // 朝 (7:00-8:59)
  'akari_morning_late.wav',   // 朝遅め (9:00-10:59)
  'akari_lunch.wav',          // 昼食 (11:00-12:59)
  'akari_afternoon.wav',      // 午後 (13:00-14:59)
  'akari_snack.wav',          // おやつ (15:00-16:59)
  'akari_evening.wav',        // 夕方 (17:00-18:59)
  'akari_dinner.wav',         // 夕食 (19:00-20:59)
  'akari_night.wav',          // 夜 (21:00-22:59)
  'akari_late.wav',           // 深夜 (23:00-0:59)
  
  // 感情・機能音声
  'akari_agreement.wav',
  'akari_encouragement.wav',
  'akari_surprise.wav',
  'akari_thinking.wav',
  'akari_support.wav',
  'akari_thanks.wav',
  'akari_understanding.wav',
  'akari_empathy.wav',
  'akari_effort.wav',
  'akari_cheer.wav',
  'akari_great.wav',
  'akari_nice.wav',
  'akari_positeve.wav', // [typo maintained as in original]
  'akari_no_problem.wav',
  'akari_sorry.wav',
  'akari_welcome.wav',
  
  // 季節音声
  'akari_spring.wav',
  'akari_summer.wav',
  'akari_autumn.wav',
  'akari_winter.wav',
  
  // キャッチフレーズ
  'akari_catchphrase_1.wav',
  'akari_catchphrase_2.wav',
  'akari_catchphrase_3.wav',
  'akari_catchphrase_4.wav'
]

// フォールバック専用ファイル
const FALLBACK_FILES = [
  'default.wav'  // 最終フォールバック
]

// レガシー・プレフィックスなし音声ファイル（他キャラクター・旧システム用）
const LEGACY_PREFIX_LESS_FILES = [
  // 時間帯パターン音声（他キャラクター用）
  'morning_early.wav',
  'morning_normal.wav',
  'morning_cheerful.wav',
  'afternoon_normal.wav',
  'evening_normal.wav',
  'evening_gentle.wav',
  'night_normal.wav',
  'night_calm.wav'
]

// 存在するが使用されていない可能性があるファイル
const POTENTIALLY_UNUSED_FILES = [
  // 他キャラクター用の古いパターンファイル
  ...LEGACY_PREFIX_LESS_FILES
]

export function analyzeVoiceFileUsage(): VoiceFileAnalysis {
  return {
    activeFiles: AKARI_ACTIVE_FILES,
    fallbackFiles: FALLBACK_FILES,
    unusedFiles: POTENTIALLY_UNUSED_FILES,
    totalFiles: AKARI_ACTIVE_FILES.length + FALLBACK_FILES.length + POTENTIALLY_UNUSED_FILES.length,
    deletionCandidates: POTENTIALLY_UNUSED_FILES
  }
}

export function generateFileUsageReport(): FileUsageReport[] {
  const report: FileUsageReport[] = []
  
  // アクティブファイル
  AKARI_ACTIVE_FILES.forEach(fileName => {
    report.push({
      category: 'active',
      fileName,
      usedBy: ['precise-time-voice.ts', 'voice-player.ts'],
      reasoning: 'スプレッドシート準拠のakari専用音声システムで使用中',
      safeToDelete: false
    })
  })
  
  // フォールバックファイル
  FALLBACK_FILES.forEach(fileName => {
    report.push({
      category: 'fallback',
      fileName,
      usedBy: ['voice-player.ts', 'voiceSelection.ts'],
      reasoning: '最終フォールバック音声として重要',
      safeToDelete: false
    })
  })
  
  // 未使用候補ファイル
  POTENTIALLY_UNUSED_FILES.forEach(fileName => {
    report.push({
      category: 'unused',
      fileName,
      usedBy: ['voiceSelection.ts (legacy fallback)'],
      reasoning: 'レガシーシステム用。akariは正確な時間帯システムを使用するため不要',
      safeToDelete: true
    })
  })
  
  return report
}

export function getSafeToDeleteFiles(): string[] {
  return generateFileUsageReport()
    .filter(report => report.safeToDelete)
    .map(report => report.fileName)
}

export function getStepByStepDeletionPlan(): { step: number; files: string[]; description: string }[] {
  return [
    {
      step: 1,
      files: ['evening_normal.wav', 'evening_gentle.wav'],
      description: '夕方音声ファイル - akari_evening.wavで代替済み'
    },
    {
      step: 2,
      files: ['night_normal.wav', 'night_calm.wav'],
      description: '夜音声ファイル - akari_night.wav/akari_late.wav/akari_very_late.wavで代替済み'
    },
    {
      step: 3,
      files: ['morning_early.wav', 'morning_normal.wav', 'morning_cheerful.wav'],
      description: '朝音声ファイル - akari_morning_early.wav/akari_morning.wav/akari_morning_late.wavで代替済み'
    },
    {
      step: 4,
      files: ['afternoon_normal.wav'],
      description: '午後音声ファイル - akari_afternoon.wav/akari_snack.wavで代替済み'
    }
  ]
}

export function debugFileUsage(): void {
  console.log('🔍 NutriRoom Voice File Usage Analysis')
  console.log('=' .repeat(60))
  
  const analysis = analyzeVoiceFileUsage()
  
  console.log('📊 SUMMARY:')
  console.log(`Total Files: ${analysis.totalFiles}`)
  console.log(`Active Files: ${analysis.activeFiles.length}`)
  console.log(`Fallback Files: ${analysis.fallbackFiles.length}`)
  console.log(`Unused Files: ${analysis.unusedFiles.length}`)
  console.log(`Deletion Candidates: ${analysis.deletionCandidates.length}`)
  console.log('')
  
  console.log('✅ ACTIVE FILES (DO NOT DELETE):')
  analysis.activeFiles.forEach(file => console.log(`  - ${file}`))
  console.log('')
  
  console.log('🔄 FALLBACK FILES (DO NOT DELETE):')
  analysis.fallbackFiles.forEach(file => console.log(`  - ${file}`))
  console.log('')
  
  console.log('🗑️ SAFE TO DELETE:')
  analysis.deletionCandidates.forEach(file => console.log(`  - ${file}`))
  console.log('')
  
  console.log('📋 DELETION PLAN:')
  const plan = getStepByStepDeletionPlan()
  plan.forEach(step => {
    console.log(`Step ${step.step}: ${step.description}`)
    step.files.forEach(file => console.log(`  - ${file}`))
    console.log('')
  })
  
  console.log('⚠️ RECOMMENDATION:')
  console.log('- akari専用システムが正常動作中のため、プレフィックスなしファイルは安全に削除可能')
  console.log('- 念のため段階的削除を推奨（各ステップ後にテスト実行）')
  console.log('- default.wavは最終フォールバックのため保持必須')
  console.log('=' .repeat(60))
}