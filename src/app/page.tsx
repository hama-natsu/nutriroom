'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { AuthForm } from '@/components/auth-form'
import { CharacterSelection } from '@/components/character-selection'
import { CharacterSelected } from '@/components/character-selected'
import { ChatRoom } from '@/components/chat-room'
import { AppFlowManager } from '@/components/app-flow-manager'
import { supabase } from '@/lib/supabase'
import { Character } from '@/lib/characters'

type ViewState = 'dashboard' | 'character-selection' | 'character-selected' | 'chat' | 'app-flow'

export default function Home() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleCharacterConsultation = () => {
    setCurrentView('character-selection')
  }

  const handleNewAppFlow = () => {
    setCurrentView('app-flow')
  }

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character)
    setCurrentView('character-selected')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedCharacter(null)
  }

  const handleBackFromAppFlow = () => {
    setCurrentView('dashboard')
  }

  const handleBackToSelection = () => {
    setCurrentView('character-selection')
    setSelectedCharacter(null)
  }

  const handleStartChat = () => {
    setCurrentView('chat')
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

  // 新しいアプリフロー画面
  if (currentView === 'app-flow') {
    return <AppFlowManager />
  }

  // キャラクター選択画面
  if (currentView === 'character-selection') {
    return (
      <CharacterSelection
        userName="ユーザー"
        onBack={handleBackToDashboard}
        onCharacterSelect={handleCharacterSelect}
      />
    )
  }

  // キャラクター選択完了画面
  if (currentView === 'character-selected' && selectedCharacter) {
    return (
      <CharacterSelected
        character={selectedCharacter}
        onBack={handleBackToSelection}
        onStartChat={handleStartChat}
      />
    )
  }

  // チャット画面
  if (currentView === 'chat' && selectedCharacter) {
    return (
      <ChatRoom
        character={selectedCharacter}
        onBack={handleBackToDashboard}
      />
    )
  }

  // ダッシュボード画面
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

            {/* AI栄養士と相談ボタン */}
            <div className="mt-8 mb-8 space-y-4">
              <button
                onClick={handleNewAppFlow}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-green-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">✨</span>
                  <div className="text-left">
                    <div className="text-xl">新しいユーザー体験</div>
                    <div className="text-sm opacity-90">名前入力 → キャラクター選択 → 個人化された挨拶</div>
                  </div>
                  <span className="text-xl">→</span>
                </div>
              </button>
              
              <button
                onClick={handleCharacterConsultation}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <div className="text-xl">AI栄養士と相談（旧版）</div>
                    <div className="text-sm opacity-90">7人の専門家があなたをサポート</div>
                  </div>
                  <span className="text-xl">→</span>
                </div>
              </button>
              
              {/* あかりプロトタイプボタン */}
              <a
                href="/akari-prototype"
                className="block w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">👩‍⚕️</span>
                  <div className="text-left">
                    <div className="text-lg">あかりプロトタイプ</div>
                    <div className="text-sm opacity-90">SELFライクなUI + ハイブリッド音声</div>
                  </div>
                  <span className="text-xl">→</span>
                </div>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  食事記録
                </h3>
                <p className="text-gray-600">
                  日々の食事を記録して栄養バランスをチェック
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  栄養分析
                </h3>
                <p className="text-gray-600">
                  摂取した栄養素の詳細な分析とレポート
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
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