import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

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

    // 🚀 実際のデータベース保存実装
    console.log('🚀 Profile API: Implementing actual database save')
    
    // Supabaseクライアント作成
    const supabase = createClient()
    
    // 認証されたユーザー取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Profile API: Authentication failed:', authError)
      return NextResponse.json(
        { error: 'Authentication required', details: 'Please sign in to save your profile' },
        { status: 401 }
      )
    }
    
    console.log('✅ Profile API: User authenticated:', user.id.substring(0, 8) + '...')

    // フィールドマッピング実装
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

    // 🎯 実際のデータベース保存処理（既存スキーマに合わせて）
    const profileData = {
      user_id: user.id,
      activity_level: activityLevelMapping[body.activity_level_jp] as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active',
      goal: goalMapping[body.goal_type] as 'maintain' | 'lose_weight' | 'gain_weight' | 'build_muscle',
      profile_completed: true,
      updated_at: new Date().toISOString()
    }
    
    // Phase 5.1データをログに記録（将来のマイグレーション用）
    console.log('📋 Phase 5.1 Profile Data (for future migration):', {
      age_group: body.age_group,
      goal_type: body.goal_type,
      meal_timing: body.meal_timing,
      cooking_frequency: body.cooking_frequency,
      main_concern: body.main_concern,
      advice_style: body.advice_style,
      info_preference: body.info_preference
    })

    console.log('📝 Profile API: Saving to database:', {
      user_id: user.id.substring(0, 8) + '...',
      fields: Object.keys(profileData),
      profile_completed: profileData.profile_completed
    })

    // 実際のデータベース保存実行
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData)
      .select()

    if (error) {
      console.error('❌ Profile API: Database error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      return NextResponse.json(
        { 
          error: 'Database operation failed', 
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Profile API: Profile saved successfully!', {
      user_id: user.id.substring(0, 8) + '...',
      profile_completed: true,
      saved_data: !!data
    })

    // 🎉 実際のデータベース保存成功レスポンス
    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully to database!',
      profile_completed: true,
      user_id: user.id.substring(0, 8) + '...',
      saved_data: data?.[0] || null
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