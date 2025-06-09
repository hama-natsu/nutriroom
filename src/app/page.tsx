'use client'

import { useAuth } from '@/components/auth-provider'
import { AuthForm } from '@/components/auth-form'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const { user, loading } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                NutriRoom へようこそ
              </h1>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                ログアウト
              </button>
            </div>
            
            <div className="text-gray-600">
              <p>こんにちは、{user.email} さん</p>
              <p className="mt-2">栄養管理アプリへようこそ！</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  食事記録
                </h3>
                <p className="text-gray-600">
                  日々の食事を記録して栄養バランスをチェック
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  栄養分析
                </h3>
                <p className="text-gray-600">
                  摂取した栄養素の詳細な分析とレポート
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  目標設定
                </h3>
                <p className="text-gray-600">
                  個人の目標に合わせた栄養計画の作成
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}