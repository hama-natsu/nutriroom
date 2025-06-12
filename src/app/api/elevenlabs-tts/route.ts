import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { 
  ElevenLabsVoiceConfig, 
  ELEVENLABS_CONFIG,
  elevenLabsVoiceConfigs 
} from '@/lib/elevenlabs-config'

export async function POST(request: NextRequest) {
  // 変数をtry文の外で宣言してcatch文でもアクセス可能にする
  let text = ''
  let characterId = ''
  let voiceConfig: ElevenLabsVoiceConfig | null = null

  try {
    const requestData = await request.json()
    text = requestData.text
    characterId = requestData.characterId
    voiceConfig = requestData.voiceConfig || elevenLabsVoiceConfigs[characterId]

    console.log('🎙️ ElevenLabs TTS Request:', { 
      characterId, 
      textLength: text.length, 
      text: text.substring(0, 50) + '...',
      voiceId: voiceConfig?.voiceId
    })

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

    // APIキー確認
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey || apiKey.includes('your_elevenlabs_api_key')) {
      console.error('❌ ElevenLabs API key not configured')
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 401 }
      )
    }

    // 文字数制限
    if (text.length > ELEVENLABS_CONFIG.MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long (max ${ELEVENLABS_CONFIG.MAX_TEXT_LENGTH} characters)` },
        { status: 400 }
      )
    }

    // ElevenLabs SDKクライアント初期化
    const client = new ElevenLabsClient({
      apiKey: apiKey
    })

    console.log('🔊 Generating voice with ElevenLabs SDK:', {
      characterId,
      voiceId: voiceConfig.voiceId,
      voiceName: voiceConfig.voiceName,
      textPreview: text.substring(0, 30),
      modelId: ELEVENLABS_CONFIG.MODEL_ID,
      voiceSettings: ELEVENLABS_CONFIG.DEFAULT_VOICE_SETTINGS
    })

    // ElevenLabs SDKで音声生成
    const audioStream = await client.textToSpeech.convert(voiceConfig.voiceId, {
      text: text,
      modelId: ELEVENLABS_CONFIG.MODEL_ID,
      voiceSettings: {
        stability: voiceConfig.stability,
        similarityBoost: voiceConfig.similarityBoost
      }
    })

    // ストリームをバッファに変換
    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    const audioBuffer = Buffer.concat(chunks)

    console.log('📦 ElevenLabs audio generation successful:', {
      characterId,
      voiceId: voiceConfig.voiceId,
      voiceName: voiceConfig.voiceName,
      text: text.substring(0, 30),
      audioSize: audioBuffer.byteLength
    })

    // 音声データを返す
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
      }
    })

  } catch (error: unknown) {
    const err = error as Error
    
    console.error('❌ ElevenLabs TTS SDK Error:', {
      characterId: characterId || 'unknown',
      message: err.message,
      name: err.name,
      voiceConfig: voiceConfig || 'not-set',
      textLength: text?.length || 0,
      textPreview: text?.substring(0, 50) || 'empty'
    })

    // ElevenLabs SDKエラーハンドリング
    if (err.message.includes('unauthorized') || err.message.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }
    
    if (err.message.includes('insufficient') || err.message.includes('402')) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    if (err.message.includes('voice') || err.message.includes('422')) {
      return NextResponse.json(
        { error: 'Invalid voice ID or parameters' },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: 'ElevenLabs TTS generation failed' },
      { status: 500 }
    )
  }
}