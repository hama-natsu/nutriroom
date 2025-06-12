'use client'

// ElevenLabs統合テスト
import { 
  elevenLabsVoiceService,
  testBasicVoiceGeneration,
  testNameGreeting 
} from './elevenlabs-voice-service'
import { 
  elevenLabsVoiceConfigs,
  generateNameGreeting,
  ELEVENLABS_CONFIG 
} from './elevenlabs-config'

// 設定確認テスト
export const testElevenLabsConfiguration = () => {
  console.log('🔧 Testing ElevenLabs Configuration...')
  console.log('=' .repeat(80))
  
  console.log('📋 Config:')
  console.log(`  Model ID: ${ELEVENLABS_CONFIG.MODEL_ID}`)
  console.log(`  Max Text Length: ${ELEVENLABS_CONFIG.MAX_TEXT_LENGTH}`)
  console.log(`  Voice Settings:`, ELEVENLABS_CONFIG.DEFAULT_VOICE_SETTINGS)
  
  console.log('\n🎭 Character Voice IDs:')
  Object.entries(elevenLabsVoiceConfigs).forEach(([charId, config]) => {
    console.log(`  ${charId}: ${config.voiceId} (${config.voiceName})`)
  })
  
  console.log('\n🔑 API Key Check:')
  const hasApiKey = !!process.env.ELEVENLABS_API_KEY
  const isValidKey = hasApiKey && !process.env.ELEVENLABS_API_KEY!.includes('your_elevenlabs_api_key')
  console.log(`  Has API Key: ${hasApiKey}`)
  console.log(`  Is Valid Key: ${isValidKey}`)
  
  if (!isValidKey) {
    console.log('⚠️ Please set ELEVENLABS_API_KEY environment variable')
  }
  
  console.log('\n✅ Configuration test completed')
  return isValidKey
}

// 名前生成テスト
export const testNameGeneration = () => {
  console.log('🧪 Testing Name Generation...')
  console.log('=' .repeat(80))
  
  const testUsers = ['太郎', 'Taro', 'テストユーザー', 'さくら']
  const testCharacters = ['minato', 'akari', 'yuki', 'riku']
  
  testUsers.forEach(userName => {
    console.log(`\n👤 User: ${userName}`)
    testCharacters.forEach(characterId => {
      const greeting = generateNameGreeting(userName, characterId)
      console.log(`  ${characterId}: "${greeting}"`)
    })
  })
  
  console.log('\n✅ Name generation test completed')
}

// 全機能統合テスト
export const runFullElevenLabsTest = async () => {
  console.log('🚀 Running Full ElevenLabs Integration Test...')
  console.log('=' .repeat(80))
  
  // 1. 設定確認
  console.log('\n📋 Step 1: Configuration Check')
  const hasValidConfig = testElevenLabsConfiguration()
  
  if (!hasValidConfig) {
    console.log('❌ Configuration invalid, skipping API tests')
    return false
  }
  
  // 2. 名前生成テスト
  console.log('\n📝 Step 2: Name Generation Test')
  testNameGeneration()
  
  // 3. サポート確認
  console.log('\n🔍 Step 3: Support Check')
  const isSupported = elevenLabsVoiceService.isElevenLabsSupported()
  console.log(`ElevenLabs supported: ${isSupported}`)
  
  if (!isSupported) {
    console.log('❌ ElevenLabs not supported, skipping voice tests')
    return false
  }
  
  // 4. 基本音声生成テスト
  console.log('\n🎵 Step 4: Basic Voice Generation Test')
  const basicTestResult = await testBasicVoiceGeneration('minato')
  console.log(`Basic voice test result: ${basicTestResult ? '✅ PASS' : '❌ FAIL'}`)
  
  // 5. 名前読み上げテスト
  console.log('\n👤 Step 5: Name Greeting Test')
  const nameTestResult = await testNameGreeting('テストユーザー', 'akari')
  console.log(`Name greeting test result: ${nameTestResult ? '✅ PASS' : '❌ FAIL'}`)
  
  const overallResult = basicTestResult && nameTestResult
  console.log(`\n🏁 Overall Test Result: ${overallResult ? '✅ SUCCESS' : '❌ FAILURE'}`)
  
  return overallResult
}

// デバッグ用：個別キャラクターテスト
export const testCharacterVoice = async (characterId: string, text: string = 'こんにちは') => {
  console.log(`🎭 Testing character voice: ${characterId}`)
  console.log(`📝 Text: ${text}`)
  
  const config = elevenLabsVoiceConfigs[characterId]
  if (!config) {
    console.log(`❌ Character ${characterId} not found`)
    return false
  }
  
  console.log(`🎵 Voice config:`, {
    voiceId: config.voiceId,
    voiceName: config.voiceName,
    stability: config.stability,
    similarityBoost: config.similarityBoost
  })
  
  const audioUrl = await elevenLabsVoiceService.generateElevenLabsVoice(text, characterId)
  const success = !!audioUrl
  
  console.log(`Result: ${success ? '✅ SUCCESS' : '❌ FAILURE'}`)
  if (success) {
    console.log(`Audio URL: ${audioUrl!.substring(0, 50)}...`)
  }
  
  return success
}

// デバッグモード管理
let debugMode = false
const debugLogs: string[] = []

const addDebugLog = (message: string) => {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${message}`
  debugLogs.push(logEntry)
  if (debugMode) {
    console.log(`🐛 ${logEntry}`)
  }
  // 最大1000ログまで保持
  if (debugLogs.length > 1000) {
    debugLogs.splice(0, debugLogs.length - 1000)
  }
}

// デバッグ機能
const debugFunctions = {
  showConfig: () => {
    console.log('🔧 ElevenLabs Configuration Debug:')
    console.log('=' .repeat(60))
    console.log('📋 Basic Config:')
    console.log(`  Model ID: ${ELEVENLABS_CONFIG.MODEL_ID}`)
    console.log(`  Max Text Length: ${ELEVENLABS_CONFIG.MAX_TEXT_LENGTH}`)
    console.log(`  Voice Settings:`, ELEVENLABS_CONFIG.DEFAULT_VOICE_SETTINGS)
    
    console.log('\n🔑 Environment:')
    console.log(`  Has API Key: ${!!process.env.ELEVENLABS_API_KEY}`)
    console.log(`  Is Valid Key: ${process.env.ELEVENLABS_API_KEY && !process.env.ELEVENLABS_API_KEY.includes('your_elevenlabs_api_key')}`)
    console.log(`  Browser: ${typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'Server'}`)
    
    console.log('\n🎭 Character Count:', Object.keys(elevenLabsVoiceConfigs).length)
    addDebugLog('Configuration displayed')
  },

  showCharacters: () => {
    console.log('🎭 Character Voice Configurations:')
    console.log('=' .repeat(60))
    Object.entries(elevenLabsVoiceConfigs).forEach(([charId, config]) => {
      console.log(`\n${charId.toUpperCase()}:`)
      console.log(`  🎵 Voice ID: ${config.voiceId}`)
      console.log(`  👤 Voice Name: ${config.voiceName}`)
      console.log(`  📊 Stability: ${config.stability}`)
      console.log(`  🔗 Similarity: ${config.similarityBoost}`)
    })
    addDebugLog('Character configurations displayed')
  },

  testApiKey: () => {
    console.log('🔑 API Key Test:')
    const hasKey = !!process.env.ELEVENLABS_API_KEY
    const isValid = hasKey && process.env.ELEVENLABS_API_KEY ? !process.env.ELEVENLABS_API_KEY.includes('your_elevenlabs_api_key') : false
    
    console.log(`  Has Key: ${hasKey ? '✅' : '❌'}`)
    console.log(`  Is Valid: ${isValid ? '✅' : '❌'}`)
    
    if (hasKey && !isValid) {
      console.log('  ⚠️ API key appears to be placeholder')
    }
    
    if (!hasKey) {
      console.log('  💡 Set ELEVENLABS_API_KEY in your environment')
    }
    
    addDebugLog(`API key test: hasKey=${hasKey}, isValid=${isValid}`)
  },

  clearCache: () => {
    try {
      elevenLabsVoiceService.clearCache()
      console.log('✅ ElevenLabs cache cleared')
      addDebugLog('Cache cleared')
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
      addDebugLog(`Cache clear failed: ${error}`)
    }
  },

  enableDebugMode: () => {
    debugMode = true
    console.log('🐛 Debug mode enabled - verbose logging activated')
    addDebugLog('Debug mode enabled')
  },

  disableDebugMode: () => {
    debugMode = false
    console.log('🔇 Debug mode disabled')
    addDebugLog('Debug mode disabled')
  },

  showLogs: () => {
    console.log('📋 Debug Logs:')
    console.log('=' .repeat(60))
    if (debugLogs.length === 0) {
      console.log('No logs available')
    } else {
      debugLogs.slice(-50).forEach(log => console.log(log))
      console.log(`\n📊 Total logs: ${debugLogs.length} (showing last 50)`)
    }
  }
}

// ユーティリティ機能
const utilityFunctions = {
  listAllCharacters: (): string[] => {
    const characters = Object.keys(elevenLabsVoiceConfigs)
    console.log('🎭 Available Characters:', characters.join(', '))
    addDebugLog(`Listed ${characters.length} characters`)
    return characters
  },

  getCharacterConfig: (characterId: string) => {
    const config = elevenLabsVoiceConfigs[characterId]
    if (config) {
      console.log(`🎭 Config for ${characterId}:`, config)
      addDebugLog(`Retrieved config for ${characterId}`)
    } else {
      console.log(`❌ Character ${characterId} not found`)
      addDebugLog(`Character ${characterId} not found`)
    }
    return config || null
  },

  generateTestText: (length: number): string => {
    const baseText = 'こんにちは。これはテスト用のテキストです。'
    let result = baseText
    
    while (result.length < length) {
      result += ' ' + baseText
    }
    
    result = result.substring(0, length)
    console.log(`📝 Generated ${result.length} character test text`)
    addDebugLog(`Generated test text: ${result.length} chars`)
    return result
  },

  benchmarkVoiceGeneration: async (characterId: string, iterations: number = 3): Promise<void> => {
    console.log(`🏃 Benchmarking voice generation for ${characterId} (${iterations} iterations)`)
    const testText = 'ベンチマークテスト用のテキストです'
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      console.log(`  Run ${i + 1}/${iterations}...`)
      const startTime = Date.now()
      
      try {
        const result = await testCharacterVoice(characterId, testText)
        const duration = Date.now() - startTime
        times.push(duration)
        console.log(`  ✅ Run ${i + 1}: ${duration}ms (${result ? 'success' : 'failed'})`)
      } catch {
        const duration = Date.now() - startTime
        console.log(`  ❌ Run ${i + 1}: ${duration}ms (error)`)
        times.push(duration)
      }
      
      // 次のテストまで1秒待機
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    console.log('\n📊 Benchmark Results:')
    console.log(`  Average: ${avgTime.toFixed(0)}ms`)
    console.log(`  Min: ${minTime}ms`)
    console.log(`  Max: ${maxTime}ms`)
    console.log(`  Times: [${times.join(', ')}]ms`)
    
    addDebugLog(`Benchmark completed: ${characterId}, avg=${avgTime.toFixed(0)}ms`)
  }
}

// ElevenLabsテスト関数インターフェース
interface ElevenLabsTestFunctions {
  runFullTest: () => Promise<boolean>
  testConfiguration: () => boolean
  testNameGeneration: () => void
  testBasicVoice: (characterId?: string) => Promise<boolean>
  testNameGreeting: (userName?: string, characterId?: string) => Promise<boolean>
  testCharacter: (characterId: string, text?: string) => Promise<boolean>
  // デバッグ機能
  debug: {
    showConfig: () => void
    showCharacters: () => void
    testApiKey: () => void
    clearCache: () => void
    enableDebugMode: () => void
    disableDebugMode: () => void
    showLogs: () => void
  }
  // ユーティリティ
  utils: {
    listAllCharacters: () => string[]
    getCharacterConfig: (characterId: string) => unknown
    generateTestText: (length: number) => string
    benchmarkVoiceGeneration: (characterId: string, iterations: number) => Promise<void>
  }
}

// Window型の拡張
declare global {
  interface Window {
    elevenLabsTest?: ElevenLabsTestFunctions
  }
}

// 手動初期化関数
export const initializeElevenLabsTest = () => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ ElevenLabs test functions are only available in browser environment')
    return false
  }

  if (window.elevenLabsTest) {
    console.log('✅ ElevenLabs test functions already initialized')
    return true
  }

  try {
    registerTestFunctions()
    return true
  } catch (error) {
    console.error('❌ Failed to initialize ElevenLabs test functions:', error)
    return false
  }
}

// テスト機能登録
const registerTestFunctions = () => {
  if (typeof window === 'undefined') return
  
  window.elevenLabsTest = {
    // 基本テスト機能
    runFullTest: runFullElevenLabsTest,
    testConfiguration: testElevenLabsConfiguration,
    testNameGeneration: testNameGeneration,
    testBasicVoice: testBasicVoiceGeneration,
    testNameGreeting: testNameGreeting,
    testCharacter: testCharacterVoice,
    
    // デバッグ機能
    debug: debugFunctions,
    
    // ユーティリティ機能
    utils: utilityFunctions
  }
  
  // 登録成功をログ出力
  addDebugLog('Test functions registered to window object')
  
  console.log('🎯 ElevenLabs test functions available in window.elevenLabsTest')
  console.log('')
  console.log('📋 Available Functions:')
  console.log('  🧪 Basic Tests:')
  console.log('    - runFullTest(): Complete test suite')
  console.log('    - testConfiguration(): Check configuration')
  console.log('    - testNameGeneration(): Test name generation')
  console.log('    - testBasicVoice(characterId?): Test basic voice generation')
  console.log('    - testNameGreeting(userName?, characterId?): Test name greeting')
  console.log('    - testCharacter(characterId, text?): Test specific character')
  console.log('')
  console.log('  🐛 Debug Functions:')
  console.log('    - debug.showConfig(): Show configuration')
  console.log('    - debug.showCharacters(): Show character configs')
  console.log('    - debug.testApiKey(): Test API key')
  console.log('    - debug.clearCache(): Clear voice cache')
  console.log('    - debug.enableDebugMode(): Enable verbose logging')
  console.log('    - debug.disableDebugMode(): Disable verbose logging')
  console.log('    - debug.showLogs(): Show debug logs')
  console.log('')
  console.log('  🛠️ Utilities:')
  console.log('    - utils.listAllCharacters(): List available characters')
  console.log('    - utils.getCharacterConfig(characterId): Get character config')
  console.log('    - utils.generateTestText(length): Generate test text')
  console.log('    - utils.benchmarkVoiceGeneration(characterId, iterations?): Benchmark performance')
  console.log('')
  console.log('💡 Quick Start:')
  console.log('  window.elevenLabsTest.runFullTest()')
  console.log('  window.elevenLabsTest.debug.showConfig()')
  console.log('  window.elevenLabsTest.utils.listAllCharacters()')
}

// ブラウザコンソール用自動エクスポート
if (typeof window !== 'undefined') {
  registerTestFunctions()
}