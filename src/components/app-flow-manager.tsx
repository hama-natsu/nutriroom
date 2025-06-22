'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Character } from '@/lib/characters'
import { UserNameInput } from './user-name-input'
import { CharacterSelection } from './character-selection'
import { CharacterPrototype } from './character-prototype'
import { AuthGuard } from './auth/AuthGuard'
import { useAuth } from './auth/AuthProvider'
import { createClient } from '@/lib/supabase-client'

type AppFlow = 'name-input' | 'character-selection' | 'chat-room' | 'profile-check'

interface UserData {
  name: string
  selectedCharacter: Character | null
}

export function AppFlowManager() {
  const [currentFlow, setCurrentFlow] = useState<AppFlow>('profile-check')
  const [userData, setUserData] = useState<UserData>({
    name: '',
    selectedCharacter: null
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth()

  // 初期化時にプロフィール完了状態をチェック
  useEffect(() => {
    const checkProfileAndLoadData = async () => {
      // 認証ローディング中は待機
      if (authLoading) return
      
      try {
        // 認証済みユーザーの場合のみプロフィールチェック
        if (user) {
          // プロフィール完了状態をチェック
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('profile_completed, full_name')
            .eq('user_id', user.id)
            .single()

          if (!profile?.profile_completed) {
            // プロフィール未完了の場合はプロフィール設定ページへ
            router.push('/profile-setup')
            return
          }
        }

        // ローカルストレージからユーザーデータを復元
        const savedUserData = localStorage.getItem('nutriroom-user-data')
        if (savedUserData) {
          try {
            const parsed = JSON.parse(savedUserData)
            setUserData(parsed)
            
            // データが完全にある場合はチャットルームに直接移動
            if (parsed.name && parsed.selectedCharacter) {
              setCurrentFlow('chat-room')
            } else if (parsed.name) {
              setCurrentFlow('character-selection')
            } else {
              setCurrentFlow('name-input')
            }
          } catch (error) {
            console.error('Failed to parse saved user data:', error)
            localStorage.removeItem('nutriroom-user-data')
            setCurrentFlow('name-input')
          }
        } else {
          setCurrentFlow('name-input')
        }
      } catch (error) {
        console.error('Profile check error:', error)
        setCurrentFlow('name-input')
      } finally {
        setLoading(false)
      }
    }

    checkProfileAndLoadData()
  }, [router, supabase, user, authLoading])

  // ユーザーデータをローカルストレージに保存
  const saveUserData = (newData: Partial<UserData>) => {
    const updatedData = { ...userData, ...newData }
    setUserData(updatedData)
    localStorage.setItem('nutriroom-user-data', JSON.stringify(updatedData))
  }

  // 名前入力完了
  const handleNameSubmit = (name: string) => {
    saveUserData({ name })
    setCurrentFlow('character-selection')
  }

  // キャラクター選択完了
  const handleCharacterSelect = (character: Character) => {
    saveUserData({ selectedCharacter: character })
    setCurrentFlow('chat-room')
  }

  // 戻る処理
  const handleBackToNameInput = () => {
    setCurrentFlow('name-input')
  }

  const handleBackToCharacterSelection = () => {
    setCurrentFlow('character-selection')
  }

  // データリセット（デバッグ用）
  const handleReset = () => {
    localStorage.removeItem('nutriroom-user-data')
    setUserData({ name: '', selectedCharacter: null })
    setCurrentFlow('name-input')
  }

  // ローディング画面
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">プロフィールを確認中...</p>
        </div>
      </div>
    )
  }

  // 認証ガードでラップ
  return (
    <AuthGuard>
      {renderFlow()}
    </AuthGuard>
  )

  function renderFlow() {
    // フロー表示
    switch (currentFlow) {
    case 'profile-check':
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">プロフィールを確認中...</p>
          </div>
        </div>
      )

    case 'name-input':
      return (
        <div>
          <UserNameInput onNameSubmit={handleNameSubmit} />
          
          {/* デバッグ用リセットボタン */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4">
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
              >
                🔄 リセット
              </button>
            </div>
          )}
        </div>
      )

    case 'character-selection':
      return (
        <div>
          <CharacterSelection
            userName={userData.name}
            onBack={handleBackToNameInput}
            onCharacterSelect={handleCharacterSelect}
          />
          
          {/* デバッグ用リセットボタン */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4">
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
              >
                🔄 リセット
              </button>
            </div>
          )}
        </div>
      )

    case 'chat-room':
      return (
        <div>
          {userData.selectedCharacter ? (
            <CharacterPrototype 
              characterId={userData.selectedCharacter.id}
              userName={userData.name}
              onBack={handleBackToCharacterSelection} 
            />
          ) : (
            // キャラクターが選択されていない場合のフォールバック
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
              <div className="text-center">
                <div className="text-6xl mb-4">❗</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  キャラクターが選択されていません
                </h1>
                <p className="text-gray-600 mb-6">
                  AI栄養士を選択してください
                </p>
                <button
                  onClick={handleBackToCharacterSelection}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                >
                  キャラクター選択に戻る
                </button>
              </div>
              
              {/* デバッグ用リセットボタン */}
              {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4">
                  <button
                    onClick={handleReset}
                    className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🔄 リセット
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-gray-600">不明なフローです</p>
          </div>
        </div>
      )
    }
  }
}