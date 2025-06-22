'use client'

import { useAuth } from './AuthProvider'
import { AuthForm } from './AuthForm'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (!user) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🥗 NutriRoom
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI栄養士があなたの健康的な食生活をサポートします
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800">
                <strong>ログインが必要です</strong><br />
                AI栄養士との相談や個別指導を受けるには、アカウントの作成またはログインが必要です。
              </p>
            </div>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  // 認証済みの場合
  return <>{children}</>
}