'use client'

import { useEffect } from 'react'
import { generateVoice, playVoice, debugAudioSystem } from '@/lib/audio-utils'

// グローバル型定義
declare global {
  interface Window {
    elevenLabsTest: (text?: string, character?: string) => Promise<void>
    debugAudio: () => void
    testAudioPriority: () => Promise<void>
    generateVoiceTest: (text: string, characterId: string) => Promise<Blob>
  }
}

export default function GlobalAudioTestLoader() {
  useEffect(() => {
    // 🎯 基本テスト関数をグローバルに登録
    window.elevenLabsTest = async (
      text: string = "こんにちは、テストです", 
      character: string = "akari"
    ) => {
      try {
        console.log('🧪 ElevenLabs Test Starting...')
        console.log(`📝 Text: "${text}"`)
        console.log(`🎭 Character: ${character}`)
        
        const audioBlob = await generateVoice(text, character)
        
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onloadeddata = () => {
          console.log('✅ ElevenLabs Test: Audio loaded successfully')
        }
        
        audio.onerror = (e) => {
          console.error('❌ ElevenLabs Test: Audio playback failed', e)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onended = () => {
          console.log('🔇 ElevenLabs Test: Audio playback completed')
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
        console.log('🔊 ElevenLabs Test: Playing audio...')
        
      } catch (error) {
        console.error('❌ ElevenLabs Test Failed:', error)
      }
    }

    // 🎯 デバッグ情報表示関数
    window.debugAudio = () => {
      debugAudioSystem()
    }

    // 🎯 音声プロバイダー優先度テスト
    window.testAudioPriority = async () => {
      console.log('🔍 Testing Audio Provider Priority...')
      console.log('=' .repeat(60))
      
      const testTexts = [
        { text: "短いテスト", character: "minato", description: "Short text test" },
        { text: "これは中程度の長さのテストです。音声生成がうまく動作するかを確認します。", character: "akari", description: "Medium text test" },
        { text: "これは非常に長いテキストのテストです。".repeat(10), character: "yuki", description: "Long text test" }
      ]
      
      for (const testCase of testTexts) {
        console.log(`\n📋 ${testCase.description}:`)
        console.log(`🎭 Character: ${testCase.character}`)
        console.log(`📝 Text length: ${testCase.text.length} chars`)
        
        try {
          const startTime = Date.now()
          const blob = await generateVoice(testCase.text, testCase.character)
          const duration = Date.now() - startTime
          
          console.log(`✅ Success: ${duration}ms, Blob size: ${blob.size} bytes`)
        } catch (error) {
          console.error(`❌ Failed:`, error)
        }
      }
      
      console.log('\n🏁 Priority test completed')
    }

    // 🎯 直接音声生成テスト（Blobを返す）
    window.generateVoiceTest = async (text: string, characterId: string): Promise<Blob> => {
      console.log('🎵 Direct voice generation test:', { text: text.substring(0, 30), characterId })
      return await generateVoice(text, characterId)
    }

    // 起動時にデバッグ情報を表示
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log('🎯 Global Audio Test Functions Loaded:')
        console.log('  - window.elevenLabsTest(text?, character?)')
        console.log('  - window.debugAudio()')
        console.log('  - window.testAudioPriority()')
        console.log('  - window.generateVoiceTest(text, characterId)')
        console.log('')
        window.debugAudio()
      }, 1000)
    }
  }, [])

  return null
}