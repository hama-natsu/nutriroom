'use client'

import { useState } from 'react'

interface UserNameInputProps {
  onNameSubmit: (name: string) => void
}

export function UserNameInput({ onNameSubmit }: UserNameInputProps) {
  const [inputName, setInputName] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputName.trim()) {
      setShowConfirmation(true)
    }
  }

  const handleConfirm = () => {
    onNameSubmit(inputName.trim())
  }

  const handleEdit = () => {
    setShowConfirmation(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        {!showConfirmation ? (
          // 名前入力フォーム
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                はじめまして！
              </h1>
              <p className="text-gray-600">
                お名前を教えてください
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                  あなたのお名前
                </label>
                <input
                  id="userName"
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="例: 田中太郎"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/90 backdrop-blur-sm text-lg"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!inputName.trim()}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
              >
                確認する
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                入力した名前は、アシスタントがあなたを呼ぶ際に使用されます
              </p>
            </div>
          </div>
        ) : (
          // 確認画面
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤔</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                確認をお願いします
              </h1>
              <p className="text-gray-600">
                この名前で間違いありませんか？
              </p>
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">お名前</p>
                <p className="text-2xl font-bold text-gray-800">{inputName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium text-lg"
              >
                ✅ はい、この名前で進む
              </button>
              
              <button
                onClick={handleEdit}
                className="w-full py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium text-lg"
              >
                ✏️ 修正する
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                後からアプリ設定で変更することも可能です
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 装飾要素 */}
      <div className="absolute top-10 left-10 text-2xl opacity-20 animate-pulse">✨</div>
      <div className="absolute top-20 right-16 text-3xl opacity-15 animate-bounce">🌟</div>
      <div className="absolute bottom-16 left-20 text-2xl opacity-25 animate-pulse">💫</div>
      <div className="absolute bottom-20 right-10 text-2xl opacity-20 animate-bounce">⭐</div>
    </div>
  )
}