'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

interface LetterTestResult {
  success: boolean
  letter?: {
    content: string
    characterId: string
    generatedAt: string
    wordCount: number
  }
  conversationSummary?: {
    todayMessages: number
    lastActivity: string | null
    topics: string[]
  }
  debugInfo?: {
    hasUserProfile: boolean
    conversationExists: boolean
    generationTime: number
    geminiUsed: boolean
  }
  error?: string
}

interface SystemStatus {
  letterTestApi: 'loading' | 'available' | 'error'
  letterGenerationApi: 'loading' | 'available' | 'error'
  geminiApi: 'loading' | 'available' | 'error'
  supabaseConnection: 'loading' | 'available' | 'error'
}

export default function LettersDebugPage() {
  const { user } = useAuth()
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    letterTestApi: 'loading',
    letterGenerationApi: 'loading',
    geminiApi: 'loading',
    supabaseConnection: 'loading'
  })
  const [testResults, setTestResults] = useState<{
    akari?: LetterTestResult
    minato?: LetterTestResult
  }>({})
  const [isGenerating, setIsGenerating] = useState(false)

  // システム状態確認
  useEffect(() => {
    const checkSystemStatus = async () => {
      // Letter Test API確認
      try {
        const testResponse = await fetch('/api/generate-letter-test')
        setSystemStatus(prev => ({
          ...prev,
          letterTestApi: testResponse.ok ? 'available' : 'error'
        }))
      } catch {
        setSystemStatus(prev => ({ ...prev, letterTestApi: 'error' }))
      }

      // 他のAPI確認も同様に実装
      setSystemStatus(prev => ({
        ...prev,
        letterGenerationApi: 'available', // 仮
        geminiApi: 'available', // 仮
        supabaseConnection: 'available' // 仮
      }))
    }

    checkSystemStatus()
  }, [])

  // テスト実行
  const runLetterTest = async (characterId: 'akari' | 'minato') => {
    setIsGenerating(true)
    console.log(`🧪 Running letter test for ${characterId}...`)

    try {
      const response = await fetch('/api/generate-letter-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          userId: user?.id || 'debug-test-user',
          includeDebugInfo: true
        })
      })

      const result: LetterTestResult = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [characterId]: result
      }))

      if (result.success) {
        console.log(`✅ ${characterId} test successful:`, result)
      } else {
        console.error(`❌ ${characterId} test failed:`, result.error)
      }
    } catch (error) {
      console.error(`❌ ${characterId} test error:`, error)
      setTestResults(prev => ({
        ...prev,
        [characterId]: {
          success: false,
          error: error instanceof Error ? error.message : 'Network error'
        }
      }))
    } finally {
      setIsGenerating(false)
    }
  }

  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            デバッグページ
          </h1>
          <p className="text-gray-500">
            このページは開発環境でのみ利用可能です
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 NutriRoom お手紙システム デバッグ
          </h1>
          <p className="text-gray-600">
            お手紙生成システムの動作確認とテスト機能
          </p>
          {user && (
            <p className="text-sm text-blue-600 mt-2">
              ログイン中: {user.id.substring(0, 8)}...
            </p>
          )}
        </div>

        {/* システム状態 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📊 システム状態
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([key, status]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${
                  status === 'available'
                    ? 'border-green-200 bg-green-50'
                    : status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    status === 'available'
                      ? 'bg-green-200 text-green-800'
                      : status === 'error'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* テスト実行 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🧪 お手紙生成テスト
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* あかり */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-pink-600">
                  🌸 あかり
                </h3>
                <button
                  onClick={() => runLetterTest('akari')}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '生成中...' : 'テスト実行'}
                </button>
              </div>
              
              {testResults.akari && (
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded ${
                      testResults.akari.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="font-semibold">
                      {testResults.akari.success ? '✅ 成功' : '❌ 失敗'}
                    </div>
                    {testResults.akari.error && (
                      <div className="text-red-600 text-sm mt-1">
                        {testResults.akari.error}
                      </div>
                    )}
                  </div>
                  
                  {testResults.akari.letter && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        文字数: {testResults.akari.letter.wordCount}文字 |
                        生成時刻: {new Date(testResults.akari.letter.generatedAt).toLocaleTimeString()}
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                        {testResults.akari.letter.content.substring(0, 200)}
                        {testResults.akari.letter.content.length > 200 && '...'}
                      </div>
                    </div>
                  )}
                  
                  {testResults.akari.conversationSummary && (
                    <div className="text-sm text-gray-600">
                      今日の会話: {testResults.akari.conversationSummary.todayMessages}件 |
                      トピック: {testResults.akari.conversationSummary.topics.join(', ') || 'なし'}
                    </div>
                  )}
                  
                  {testResults.akari.debugInfo && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>プロフィール: {testResults.akari.debugInfo.hasUserProfile ? 'あり' : 'なし'}</div>
                      <div>会話データ: {testResults.akari.debugInfo.conversationExists ? 'あり' : 'なし'}</div>
                      <div>Gemini使用: {testResults.akari.debugInfo.geminiUsed ? 'あり' : 'なし'}</div>
                      <div>生成時間: {testResults.akari.debugInfo.generationTime}ms</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* みなと */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  ⚔️ みなと
                </h3>
                <button
                  onClick={() => runLetterTest('minato')}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '生成中...' : 'テスト実行'}
                </button>
              </div>
              
              {testResults.minato && (
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded ${
                      testResults.minato.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="font-semibold">
                      {testResults.minato.success ? '✅ 成功' : '❌ 失敗'}
                    </div>
                    {testResults.minato.error && (
                      <div className="text-red-600 text-sm mt-1">
                        {testResults.minato.error}
                      </div>
                    )}
                  </div>
                  
                  {testResults.minato.letter && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        文字数: {testResults.minato.letter.wordCount}文字 |
                        生成時刻: {new Date(testResults.minato.letter.generatedAt).toLocaleTimeString()}
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                        {testResults.minato.letter.content.substring(0, 200)}
                        {testResults.minato.letter.content.length > 200 && '...'}
                      </div>
                    </div>
                  )}
                  
                  {testResults.minato.conversationSummary && (
                    <div className="text-sm text-gray-600">
                      今日の会話: {testResults.minato.conversationSummary.todayMessages}件 |
                      トピック: {testResults.minato.conversationSummary.topics.join(', ') || 'なし'}
                    </div>
                  )}
                  
                  {testResults.minato.debugInfo && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>プロフィール: {testResults.minato.debugInfo.hasUserProfile ? 'あり' : 'なし'}</div>
                      <div>会話データ: {testResults.minato.debugInfo.conversationExists ? 'あり' : 'なし'}</div>
                      <div>Gemini使用: {testResults.minato.debugInfo.geminiUsed ? 'あり' : 'なし'}</div>
                      <div>生成時間: {testResults.minato.debugInfo.generationTime}ms</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📝 使用方法
          </h3>
          <ul className="space-y-2 text-blue-700 text-sm">
            <li>• <strong>テスト実行:</strong> 各キャラクターのボタンでお手紙生成をテスト</li>
            <li>• <strong>会話データ:</strong> 今日のチャット履歴から自動的に内容を生成</li>
            <li>• <strong>デバッグ情報:</strong> プロフィール有無、Gemini使用状況を確認</li>
            <li>• <strong>開発専用:</strong> 本番環境では非表示</li>
          </ul>
        </div>
      </div>
    </div>
  )
}