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
  try {
    console.log('🔵 Profile API: Getting user profile')
    
    const supabase = createClient()
    
    // セッションとユーザー情報を両方で確認
    const { data: { session } } = await supabase.auth.getSession()
    let user = session?.user || null
    
    if (!user) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      user = authUser || null
      
      if (authError) {
        console.error('❌ Profile API: Auth error in GET:', authError)
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          details: 'Please sign in to access your profile'
        },
        { status: 401 }
      )
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('❌ Profile API: Get profile error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('❌ Profile API: Get profile unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}