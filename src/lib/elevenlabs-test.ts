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

// ブラウザコンソール用エクスポート
if (typeof window !== 'undefined') {
  (window as any).elevenLabsTest = {
    runFullTest: runFullElevenLabsTest,
    testConfiguration: testElevenLabsConfiguration,
    testNameGeneration: testNameGeneration,
    testBasicVoice: testBasicVoiceGeneration,
    testNameGreeting: testNameGreeting,
    testCharacter: testCharacterVoice
  }
  
  console.log('🎯 ElevenLabs test functions available in window.elevenLabsTest')
  console.log('💡 Try: window.elevenLabsTest.runFullTest()')
}