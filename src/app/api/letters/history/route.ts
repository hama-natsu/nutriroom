// 🎯 NutriRoom Phase 3 Step 2: お手紙履歴取得API
// GET /api/letters/history?characterId=akari&limit=10

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
    // 既存のSupabaseクライアント使用
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 🚨 緊急修正: 認証状態確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication required for letter history:', authError?.message)
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        letters: []
      }, { status: 401 })
    }
    
    // URLパラメータ取得
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId') || 'akari'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('📜 Fetching letter history for:', { 
      characterId, 
      limit, 
      offset, 
      userId: user.id.substring(0, 8) + '...',
      timestamp: new Date().toISOString() 
    })
    
    // 🚨 セキュリティ修正: ユーザーIDでフィルタリング
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
      return NextResponse.json({
        success: false,
        error: 'Database error',
        letters: []
      }, { status: 500 })
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

    console.log(`✅ Retrieved ${formattedLetters.length} letters for user ${user.id.substring(0, 8) + '...'} / character ${characterId}`)
    console.log('📊 Letter query results:', {
      userId: user.id.substring(0, 8) + '...',
      characterId,
      found: formattedLetters.length,
      limit,
      offset,
      hasMore: formattedLetters.length === limit,
      latestDate: formattedLetters[0]?.date || 'none',
      letterIds: formattedLetters.map(l => l.id.substring(0, 8) + '...').slice(0, 3)
    })

    // デバッグ用：取得したお手紙の順序確認
    console.log('📋 取得したお手紙の順序確認:')
    formattedLetters.forEach((letter, index) => {
      console.log(`  ${index}: ${letter.date} (作成: ${letter.createdAt}) - "${letter.preview}"`)
    })
    
    if (formattedLetters.length > 1) {
      const firstDate = new Date(formattedLetters[0].date)
      const lastDate = new Date(formattedLetters[formattedLetters.length - 1].date)
      console.log('📅 日付順序確認:', {
        first: formattedLetters[0].date,
        last: formattedLetters[formattedLetters.length - 1].date,
        isDescending: firstDate >= lastDate ? '✅ 正しい順序 (新→古)' : '❌ 逆順序 (古→新)'
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        letters: formattedLetters,
        pagination: {
          total: formattedLetters.length,
          limit,
          offset,
          hasMore: formattedLetters.length === limit
        },
        characterId,
        debug: {
          queryTimestamp: new Date().toISOString(),
          databaseResultCount: letters?.length || 0,
          formattedResultCount: formattedLetters.length
        }
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
    // 既存のSupabaseクライアント使用
    const supabase = createClient(supabaseUrl, supabaseKey)

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

      // daily_summariesに挿入（一時的にuser_id固定）
      const { data: insertResult, error: insertError } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: '00000000-0000-0000-0000-000000000000', // 一時的な固定値
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
        characterId
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