import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/database.types'

// ユーザープロフィール型定義
type ProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

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

    // 認証確認（緩和版）
    const supabase = createClient()
    
    // まずセッションを確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Profile API: Session error:', sessionError)
    }
    
    // ユーザー情報を取得（複数の方法で試行）
    let user = session?.user || null
    
    if (!user) {
      console.log('🔄 Profile API: No session user, trying getUser()')
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      user = authUser || null
      
      if (authError) {
        console.error('❌ Profile API: GetUser error:', authError)
      }
    }
    
    if (!user) {
      console.error('❌ Profile API: No authenticated user found')
      return NextResponse.json(
        { 
          error: 'Authentication required', 
          details: 'Please sign in to save your profile',
          sessionExists: !!session,
          sessionError: sessionError?.message
        },
        { status: 401 }
      )
    }

    console.log('✅ Profile API: User authenticated:', user.id.substring(0, 8) + '...')

    // プロフィールデータの準備
    const profileData: ProfileInsert = {
      user_id: user.id,
      age_group: body.age_group,
      goal_type: body.goal_type,
      activity_level_jp: body.activity_level_jp,
      meal_timing: body.meal_timing,
      cooking_frequency: body.cooking_frequency,
      main_concern: body.main_concern,
      advice_style: body.advice_style,
      info_preference: body.info_preference,
      profile_completed: true
    }

    console.log('📝 Profile API: Prepared profile data:', profileData)

    // データベースに保存
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
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Profile API: Profile saved successfully:', {
      user_id: user.id.substring(0, 8) + '...',
      profile_completed: true,
      data_returned: !!data
    })

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      profile_completed: true
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