'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// SSRを無効にしてクライアントサイドでのみ読み込み
const MicrophoneButtonExample = dynamic(
  () => import('@/components/microphone-button').then(mod => ({ default: mod.MicrophoneButtonExample })),
  { ssr: false, loading: () => <div>音声コンポーネントを読み込み中...</div> }
)

export default function SpeechDemoPage() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [allTranscripts, setAllTranscripts] = useState<string[]>([])

  const handleTranscript = (text: string, isFinal: boolean) => {
    if (isFinal) {
      setTranscript(prev => prev + text + ' ')
      setAllTranscripts(prev => [...prev, text])
      setInterimTranscript('')
    } else {
      setInterimTranscript(text)
    }
  }

  const handleError = (error: string) => {
    console.error('Speech recognition error:', error)
  }

  const clearAll = () => {
    setTranscript('')
    setInterimTranscript('')
    setAllTranscripts([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎙️ 音声入力機能デモ
          </h1>
          <p className="text-gray-600 mb-8">
            Web Speech APIを使用した日本語音声認識のテストページです
          </p>

          {/* 基本的なマイクボタンデモ */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              基本マイクボタンコンポーネント
            </h2>
            <MicrophoneButtonExample />
          </div>

          {/* カスタムマイクボタンデモ */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              カスタム音声入力テスト
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleTranscript('テスト音声入力', true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                テスト入力
              </button>
              <button
                onClick={() => handleError('テストエラー')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                エラーテスト
              </button>
            </div>
          </div>

          {/* 統合デモ */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              チャット統合デモ
            </h2>
            
            <div className="border rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  クリア
                </button>
              </div>

              {/* 中間結果表示 */}
              {interimTranscript && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">認識中...</div>
                  <div className="text-sm text-blue-800 italic">
                    {interimTranscript}
                  </div>
                </div>
              )}

              {/* テキスト入力エリア */}
              <div className="relative">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="ここに音声入力の結果が表示されます..."
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                  rows={3}
                />
                
                {/* マイクボタン */}
                <div className="absolute right-2 bottom-2">
                  <button
                    onClick={() => {
                      // マイクボタンの代わりに直接音声認識を呼び出す例
                    }}
                    className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center"
                  >
                    🎙️
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 認識履歴 */}
          {allTranscripts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                認識履歴
              </h2>
              <div className="space-y-2">
                {allTranscripts.map((text, index) => (
                  <div
                    key={index}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="text-xs text-green-600 mb-1">
                      {index + 1}. {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-gray-800">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ブラウザサポート情報 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              📱 ブラウザサポート情報
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Chrome/Edge: 完全サポート</li>
              <li>• Safari: iOS 14.5以降でサポート</li>
              <li>• Firefox: 部分サポート（設定で有効化が必要な場合があります）</li>
              <li>• モバイルブラウザ: デバイスとブラウザによって動作が異なります</li>
            </ul>
          </div>

          {/* 使用方法 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              📝 使用方法
            </h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>マイクボタンをクリックして音声入力を開始</li>
              <li>ブラウザからマイクの使用許可を求められたら「許可」を選択</li>
              <li>話すと自動的に日本語が認識されてテキストに変換されます</li>
              <li>再度ボタンをクリックするか、音声認識が自動停止するまで待ちます</li>
              <li>認識されたテキストがテキストエリアに追加されます</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}