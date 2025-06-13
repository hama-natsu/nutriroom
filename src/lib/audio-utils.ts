'use client'

// 🎯 音声プロバイダー選択ロジック（ElevenLabs最優先）

interface VoiceMapping {
  [key: string]: string
}

// キャラクター別音声IDマッピング
const voiceMapping: VoiceMapping = {
  'minato': 'bqpOyYNUu11tjjvRUbKn',    // Yamato
  'akari': 'RBnMinrYKeccY3vaUxlZ',     // Sakura Suzuki
  'yuki': '8EkOjt4xTPGMclNlh1pk',      // Morioki
  'riku': 'GKDaBI8TKSBJVhsCLD6n',      // Asashi
  'mao': '4lOQ7A2l7HPuG7UIHiKA',       // Kyoko
  'satsuki': '7t2ZyEiayA71HXxCzkln',   // Harmony
  'sora': 'LNzr3u01PIEDg0fRlvE7'       // Ichiro
}

// ElevenLabs音声生成関数
async function generateWithElevenLabs(text: string, characterId: string): Promise<Blob> {
  const voiceId = voiceMapping[characterId] || voiceMapping['akari'] // デフォルトはakari

  console.log('🔊 ElevenLabs Request:', {
    characterId,
    voiceId,
    textLength: text.length,
    apiKeyExists: !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
  })

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('🚨 ElevenLabs API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
  }

  const blob = await response.blob()
  console.log('✅ ElevenLabs Success:', {
    characterId,
    blobSize: blob.size,
    blobType: blob.type
  })

  return blob
}

// Google TTS音声生成関数（フォールバック）
async function generateWithGoogleTTS(text: string, characterId: string): Promise<Blob> {
  console.log('🔊 Google TTS Request:', {
    characterId,
    textLength: text.length
  })

  const response = await fetch('/api/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      characterId,
      voiceConfig: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-C',
        gender: 'MALE',
        pitch: -2.0,
        speakingRate: 0.9,
        volumeGainDb: 2.0
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('🚨 Google TTS API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    throw new Error(`Google TTS API error: ${response.status} - ${errorText}`)
  }

  const blob = await response.blob()
  console.log('✅ Google TTS Success:', {
    characterId,
    blobSize: blob.size,
    blobType: blob.type
  })

  return blob
}

// 🎯 メイン音声生成関数（優先度：ElevenLabs > Google TTS）
export async function generateVoice(text: string, characterId: string): Promise<Blob> {
  const startTime = Date.now()
  
  console.log('🎵 Voice Generation Started:', {
    characterId,
    textLength: text.length,
    timestamp: new Date().toISOString()
  })

  try {
    // ✅ ElevenLabsを最優先に設定
    if (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY && 
        !process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY.includes('your_elevenlabs_api_key')) {
      
      console.log('🚀 Using ElevenLabs (Priority 1)')
      
      try {
        const blob = await generateWithElevenLabs(text, characterId)
        const duration = Date.now() - startTime
        
        console.log('🎉 Voice Generation Completed (ElevenLabs):', {
          characterId,
          duration: `${duration}ms`,
          provider: 'ElevenLabs',
          success: true
        })
        
        return blob
      } catch (elevenLabsError) {
        console.warn('⚠️ ElevenLabs failed, falling back to Google TTS:', elevenLabsError)
        
        // ElevenLabsが失敗した場合のフォールバック
        const blob = await generateWithGoogleTTS(text, characterId)
        const duration = Date.now() - startTime
        
        console.log('🎉 Voice Generation Completed (Google TTS Fallback):', {
          characterId,
          duration: `${duration}ms`,
          provider: 'Google TTS (ElevenLabs fallback)',
          success: true
        })
        
        return blob
      }
    } else {
      console.log('🔑 ElevenLabs API key not available, using Google TTS (Priority 2)')
      
      const blob = await generateWithGoogleTTS(text, characterId)
      const duration = Date.now() - startTime
      
      console.log('🎉 Voice Generation Completed (Google TTS):', {
        characterId,
        duration: `${duration}ms`,
        provider: 'Google TTS (direct)',
        success: true
      })
      
      return blob
    }
  } catch (error) {
    const duration = Date.now() - startTime
    
    console.error('❌ Voice Generation Failed:', {
      characterId,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error),
      success: false
    })
    
    throw error
  }
}

// 🎯 音声再生関数
export async function playVoice(text: string, characterId: string): Promise<boolean> {
  try {
    const audioBlob = await generateVoice(text, characterId)
    
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    // 音声再生の Promise 化
    return new Promise((resolve, reject) => {
      audio.onloadeddata = () => {
        console.log('🎵 Audio loaded successfully for character:', characterId)
      }
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl) // メモリリーク防止
        console.log('🔇 Audio playback completed for character:', characterId)
        resolve(true)
      }
      
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl)
        console.error('❌ Audio playback failed:', e)
        reject(new Error('Audio playback failed'))
      }
      
      audio.play().catch(reject)
    })
  } catch (error) {
    console.error('❌ Voice playback failed:', error)
    return false
  }
}

// デバッグ用関数（開発環境用）
export const debugAudioSystem = () => {
  console.log('🔍 Audio System Debug Info:')
  console.log('=' .repeat(50))
  console.log('ElevenLabs API Key:', !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY)
  console.log('ElevenLabs Valid:', process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY && 
                                   !process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY.includes('your_elevenlabs_api_key'))
  console.log('Google TTS Endpoint:', '/api/text-to-speech available')
  console.log('Current Provider Priority: ElevenLabs > Google TTS')
  console.log('Available Characters:', Object.keys(voiceMapping).join(', '))
  console.log('=' .repeat(50))
}