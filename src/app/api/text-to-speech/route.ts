import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { VoiceConfig } from '@/lib/voice-config'

// Google Cloud TTS クライアント
let ttsClient: TextToSpeechClient | null = null

function initTTSClient() {
  if (ttsClient) {
    console.log('🔄 Using existing TTS client')
    return ttsClient
  }

  try {
    // 環境変数からAPIキーを取得
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
    
    console.log('🔑 TTS API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      starts: apiKey?.substring(0, 7) || 'none',
      isPlaceholder: apiKey?.includes('your_google_tts_api_key') || false,
      isValidFormat: apiKey?.startsWith('AIza') || false,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
    
    if (!apiKey) {
      console.error('❌ GOOGLE_CLOUD_TTS_API_KEY is not set in environment variables')
      return null
    }

    if (apiKey.includes('your_google_tts_api_key')) {
      console.warn('⚠️ Using placeholder TTS API key - this will work in demo mode only')
      return null // プレースホルダーの場合はnullを返す
    }

    // APIキーを使用してクライアントを初期化
    console.log('🚀 Initializing Google Cloud TTS client...')
    ttsClient = new TextToSpeechClient({
      apiKey: apiKey
    })

    console.log('✅ Google Cloud TTS client initialized successfully')
    return ttsClient

  } catch (error) {
    console.error('❌ Failed to initialize TTS client:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  // 変数をtry文の外で宣言してcatch文でもアクセス可能にする
  let text = ''
  let characterId = ''
  let voiceConfig: VoiceConfig | null = null

  try {
    const requestData = await request.json()
    text = requestData.text
    characterId = requestData.characterId
    voiceConfig = requestData.voiceConfig

    console.log('🎤 TTS Request:', { characterId, textLength: text.length, text: text.substring(0, 50) })

    // 入力検証
    if (!text || !characterId || !voiceConfig) {
      console.error('❌ Missing required parameters:', {
        hasText: !!text,
        hasCharacterId: !!characterId,
        hasVoiceConfig: !!voiceConfig
      })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // 文字数制限
    if (text.length > 200) {
      return NextResponse.json(
        { error: 'Text too long (max 200 characters)' },
        { status: 400 }
      )
    }

    // TTSクライアント初期化
    const client = initTTSClient()
    
    if (!client) {
      // プレースホルダーAPIキーまたは初期化失敗の場合はダミー音声を返す
      console.log('🎭 Using demo mode - generating silent audio')
      
      // 無音の短いMP3データを生成（デモ用）
      const silentMp3 = Buffer.from([
        // MP3ヘッダー + 無音データの最小構成
        0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ])
      
      return new NextResponse(silentMp3, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': silentMp3.length.toString()
        }
      })
    }

    // SSML対応チェック
    const hasSSMLTags = text.includes('<') && text.includes('>')
    const inputType = hasSSMLTags ? 'ssml' : 'text'
    
    // SSMLの場合は適切にラップ
    const processedInput = hasSSMLTags 
      ? { ssml: `<speak>${text}</speak>` }
      : { text }

    console.log('🎭 Input processing:', {
      hasSSMLTags,
      inputType,
      textPreview: text.substring(0, 100),
      characterId
    })

    // Google Cloud TTS リクエスト構築
    const request_payload = {
      input: processedInput,
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceConfig.gender
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        pitch: voiceConfig.pitch,
        speakingRate: voiceConfig.speakingRate,
        volumeGainDb: voiceConfig.volumeGainDb,
        sampleRateHertz: 24000,
        effectsProfileId: ['telephony-class-application'] // 音質向上
      }
    }

    console.log('🔊 Sending TTS request to Google Cloud:', {
      characterId,
      voice: request_payload.voice,
      audioConfig: request_payload.audioConfig,
      textPreview: text.substring(0, 30),
      fullPayload: JSON.stringify(request_payload, null, 2)
    })

    // TTS API呼び出し
    const [response] = await client.synthesizeSpeech(request_payload)
    
    if (!response.audioContent) {
      throw new Error('No audio content received from TTS API')
    }

    console.log('✅ TTS generation successful:', {
      characterId,
      audioSize: response.audioContent.length,
      text: text.substring(0, 30)
    })

    // 音声データを返す
    return new NextResponse(response.audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.audioContent.length.toString(),
        'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
      }
    })

  } catch (error: unknown) {
    const err = error as { message?: string; code?: number; details?: string; stack?: string; name?: string }
    
    console.error('❌ TTS API Error:', {
      characterId: characterId || 'unknown',
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      details: err.details,
      voiceConfig: voiceConfig || 'not-set',
      textLength: text?.length || 0,
      textPreview: text?.substring(0, 50) || 'empty'
    })

    // エラーの種類に応じて適切なレスポンスを返す
    if (err.code === 3 || err.message?.includes('INVALID_ARGUMENT')) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    if (err.code === 7 || err.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { error: 'Permission denied - check API key' },
        { status: 403 }
      )
    }

    if (err.code === 8 || err.message?.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'Quota exceeded' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}