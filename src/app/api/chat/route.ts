import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { characterId, message, conversationHistory } = await request.json()

    // 入力バリデーション
    if (!characterId || !message) {
      return NextResponse.json(
        { error: 'キャラクターIDとメッセージは必須です' },
        { status: 400 }
      )
    }

    // Gemini APIを使用してレスポンスを生成
    const response = await generateResponse(characterId, message, conversationHistory)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API エラー:', error)
    
    return NextResponse.json(
      { error: 'チャット処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}