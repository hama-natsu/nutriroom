// 🎯 NutriRoom Phase 3 Step 2: お手紙履歴取得API
// GET /api/letters/history?characterId=akari&limit=10

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

interface DailySummaryRow {
  id: string
  date: string
  character_id: string
  letter_content: string
  created_at: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId') || 'akari'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('📚 Letter history request:', { 
      userId: user.id.substring(0, 8) + '...', 
      characterId, 
      limit, 
      offset 
    })

    // daily_summariesテーブルからお手紙履歴を取得
    const { data: letters, error: fetchError } = await supabase
      .from('daily_summaries')
      .select(`
        id,
        date,
        character_id,
        letter_content,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .eq('character_id', characterId)
      .not('letter_content', 'is', null)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (fetchError) {
      console.error('❌ Database error:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch letter history' },
        { status: 500 }
      )
    }

    // フォーマット済みレスポンス
    const formattedLetters = (letters || []).map((letter: DailySummaryRow) => ({
      id: letter.id,
      date: letter.date,
      characterId: letter.character_id,
      content: letter.letter_content,
      createdAt: letter.created_at,
      updatedAt: letter.updated_at,
      // 日付表示用のフォーマット
      displayDate: new Date(letter.date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      }),
      // プレビュー用の短縮版
      preview: letter.letter_content 
        ? letter.letter_content.split('\n')[0].substring(0, 50) + '...'
        : 'お手紙内容が見つかりません'
    }))

    // 総数取得（ページネーション用）
    const { count, error: countError } = await supabase
      .from('daily_summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('character_id', characterId)
      .not('letter_content', 'is', null)

    if (countError) {
      console.warn('⚠️ Failed to get total count:', countError)
    }

    console.log(`✅ Retrieved ${formattedLetters.length} letters (total: ${count || 'unknown'})`)

    return NextResponse.json({
      success: true,
      data: {
        letters: formattedLetters,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        },
        characterId
      }
    })

  } catch (error) {
    console.error('❌ Letter history API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 開発用：過去のお手紙を生成するテスト機能
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Only available in development' },
      { status: 403 }
    )
  }

  try {
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { characterId = 'akari', daysBack = 5 } = body

    console.log(`🧪 Generating ${daysBack} test letters for character: ${characterId}`)

    const testLetters = []
    const today = new Date()

    for (let i = 1; i <= daysBack; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]

      const testContent = `${date.toLocaleDateString('ja-JP')}のお手紙

こんにちは！今日も一日お疲れさまでした♪

${i}日前のあなたとの会話を思い出しています。
・お食事の相談をしてくださいましたね
・栄養バランスについてお話しました
・水分補給の大切さをお伝えしました

あなたの健康への意識、とても素晴らしいと思います！
毎日少しずつでも、続けていくことが大切ですからね。

明日も楽しくお話しましょう♪

あかりより 💕

---
テスト生成: ${new Date().toISOString()}`

      // daily_summariesに挿入
      const { data: insertResult, error: insertError } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: user.id,
          character_id: characterId,
          date: dateString,
          letter_content: testContent,
          main_topics: [`${i}日前のテスト話題`],
          session_count: Math.floor(Math.random() * 5) + 1,
          total_messages: Math.floor(Math.random() * 20) + 5,
          emotions_detected: ['happy', 'friendly']
        })
        .select()
        .single()

      if (insertError) {
        console.error(`❌ Failed to insert test letter for ${dateString}:`, insertError)
      } else {
        testLetters.push({
          date: dateString,
          id: insertResult.id,
          content: testContent.substring(0, 100) + '...'
        })
        console.log(`✅ Created test letter for ${dateString}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${testLetters.length} test letters`,
      data: {
        generatedLetters: testLetters,
        characterId,
        userId: user.id.substring(0, 8) + '...'
      }
    })

  } catch (error) {
    console.error('❌ Test letter generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate test letters' },
      { status: 500 }
    )
  }
}