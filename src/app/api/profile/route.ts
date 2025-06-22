import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Profile API: Starting profile save request')
    
    const body = await request.json()
    console.log('📋 Profile API: Received data:', {
      keys: Object.keys(body),
      profile_completed: body.profile_completed,
      age_group: body.age_group,
      goal_type: body.goal_type
    })

    // 🚨 緊急対応: 一時的にプロフィール保存機能を無効化してテスト
    console.log('🚨 Profile API: Temporary bypass - returning success without database save')
    
    console.log('📋 Profile API: Received data:', {
      keys: Object.keys(body),
      activity_level_jp: body.activity_level_jp,
      goal_type: body.goal_type
    })

    // マッピング処理のテスト
    const activityLevelMapping: Record<string, string> = {
      '座り仕事中心': 'sedentary',
      '軽い運動': 'lightly_active', 
      '活発': 'very_active',
      'アスリート': 'extremely_active'
    }

    const goalMapping: Record<string, string> = {
      '体重管理': 'lose_weight',
      '健康維持': 'maintain',
      '筋肉増量': 'build_muscle',
      '生活習慣改善': 'maintain'
    }

    const mappedData = {
      activity_level: activityLevelMapping[body.activity_level_jp] || 'sedentary',
      goal: goalMapping[body.goal_type] || 'maintain',
      profile_completed: true
    }

    console.log('✅ Profile API: Field mapping successful:', mappedData)

    // 一時的に成功レスポンスを返す（データベース保存なし）
    return NextResponse.json({
      success: true,
      message: 'Profile mapping test successful (database save temporarily disabled)',
      mapped_data: mappedData,
      original_data: body
    })

  } catch (error) {
    console.error('❌ Profile API: Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // 一時的にGETメソッドも無効化
  return NextResponse.json({
    message: 'GET method temporarily disabled during testing phase'
  })
}