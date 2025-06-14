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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NutriRoom
            </h1>
            <p className="text-lg text-gray-600">
              7人のAI栄養士があなたの健康をサポート
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            ログアウト
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              あなた専用のAI栄養士を選んでください
            </h2>
            <p className="text-gray-600">
              個性豊かな7人の専門家が、あなたの健康目標達成をサポートします
            </p>
          </div>

          {/* AI栄養士相談メインボタン */}
          <button
            onClick={handleNewAppFlow}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-8 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6"
          >
            <div className="flex items-center justify-center space-x-4">
              <span className="text-3xl">🤖</span>
              <div className="text-center">
                <div className="text-2xl mb-1">AI栄養士と相談を始める</div>
                <div className="text-sm opacity-90">名前入力 → キャラクター選択 → パーソナライズされた栄養指導</div>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </button>
        </div>

        {/* プロトタイプセクション */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            体験版・プロトタイプ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* あかりプロトタイプ */}
            <a
              href="/akari-prototype"
              className="block bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-pink-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👩‍⚕️</span>
                <div>
                  <div className="font-semibold text-gray-900">あかりプロトタイプ</div>
                  <div className="text-sm text-gray-600">VOICEVOX音声 + キャラクター背景</div>
                </div>
              </div>
            </a>

            {/* みなとプロトタイプ */}
            <a
              href="/minato-prototype"
              className="block bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-blue-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <div className="font-semibold text-gray-900">みなとプロトタイプ</div>
                  <div className="text-sm text-gray-600">理論派栄養士の専門指導</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}