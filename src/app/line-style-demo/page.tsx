'use client'

import { useState } from 'react'
import { responseLengthManager } from '@/lib/response-length-manager'

export default function LINEStyleDemoPage() {
  const [userMessage, setUserMessage] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)

  const analyzeMessage = () => {
    if (!userMessage.trim()) return
    
    const result = responseLengthManager.analyzeUserMessage(userMessage)
    const context = {
      messageCount: 5,
      lastMessages: ['こんにちは', 'ダイエット相談'],
      userRequestedDetails: result.requestsDetails,
      currentTopic: result.keywords[0] || null,
      relationshipLevel: 1
    }
    
    const config = responseLengthManager.determineResponseMode(result, context)
    
    setAnalysis({
      userAnalysis: result,
      context,
      config,
      instruction: responseLengthManager.generateResponseInstruction(config, 'minato', result)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💬 LINEスタイル会話システムデモ
          </h1>
          <p className="text-gray-600 mb-8">
            ユーザーメッセージを分析して、適切な応答長さとスタイルを決定します
          </p>

          {/* 入力エリア */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テストメッセージを入力
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="例: ダイエットについて詳しく教えて"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={analyzeMessage}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                分析
              </button>
            </div>
          </div>

          {/* クイックテスト */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">クイックテスト</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'ダイエットしたい',
                'ダイエットについて詳しく教えて',
                'なぜ痩せないの？',
                'プロテインって何？',
                'プロテインの効果を詳しく説明して',
                'ありがとう！'
              ].map((msg) => (
                <button
                  key={msg}
                  onClick={() => {
                    setUserMessage(msg)
                    setTimeout(() => {
                      const result = responseLengthManager.analyzeUserMessage(msg)
                      const context = {
                        messageCount: 5,
                        lastMessages: ['こんにちは', 'ダイエット相談'],
                        userRequestedDetails: result.requestsDetails,
                        currentTopic: result.keywords[0] || null,
                        relationshipLevel: 1
                      }
                      const config = responseLengthManager.determineResponseMode(result, context)
                      setAnalysis({
                        userAnalysis: result,
                        context,
                        config,
                        instruction: responseLengthManager.generateResponseInstruction(config, 'minato', result)
                      })
                    }, 100)
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* 分析結果 */}
          {analysis && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📊 ユーザーメッセージ分析</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">詳細要求:</span> 
                    <span className={analysis.userAnalysis.requestsDetails ? 'text-red-600' : 'text-green-600'}>
                      {analysis.userAnalysis.requestsDetails ? 'あり' : 'なし'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">質問:</span> 
                    <span className={analysis.userAnalysis.isQuestion ? 'text-blue-600' : 'text-gray-600'}>
                      {analysis.userAnalysis.isQuestion ? 'はい' : 'いいえ'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">複雑さ:</span> 
                    <span className={analysis.userAnalysis.complexity === 'complex' ? 'text-orange-600' : 'text-green-600'}>
                      {analysis.userAnalysis.complexity === 'complex' ? '複雑' : 'シンプル'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">キーワード:</span> 
                    <span className="text-purple-600">
                      {analysis.userAnalysis.keywords.join(', ') || 'なし'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">⚙️ 応答設定</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">モード:</span> 
                    <span className={analysis.config.mode === 'short' ? 'text-blue-600' : 'text-orange-600'}>
                      {analysis.config.mode === 'short' ? 'SHORT (簡潔)' : 'DETAILED (詳細)'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">目標文字数:</span> 
                    <span className="text-gray-600">{analysis.config.targetLength}文字</span>
                  </div>
                  <div>
                    <span className="font-medium">最大文字数:</span> 
                    <span className="text-gray-600">{analysis.config.maxLength}文字</span>
                  </div>
                  <div>
                    <span className="font-medium">スタイル:</span> 
                    <span className="text-gray-600">{analysis.config.style}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">📝 生成指示</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                  {analysis.instruction}
                </pre>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 期待される応答例</h3>
                <div className="space-y-3">
                  {analysis.config.mode === 'short' ? (
                    <div>
                      <div className="font-medium text-gray-700">SHORT応答例 (minatoキャラクター):</div>
                      <div className="bg-white p-3 rounded border text-sm">
                        {userMessage.includes('ダイエット') && !analysis.userAnalysis.requestsDetails && (
                          <span className="text-gray-800">「はぁ？まずは食事記録つけろよ」</span>
                        )}
                        {userMessage.includes('詳しく') && (
                          <span className="text-gray-800">「...まあ教えてやる。タンパク質を体重×1.5g摂れ」</span>
                        )}
                        {userMessage.includes('ありがとう') && (
                          <span className="text-gray-800">「...べ、別に褒めてるわけじゃないからな」</span>
                        )}
                        {!userMessage.includes('ダイエット') && !userMessage.includes('詳しく') && !userMessage.includes('ありがとう') && (
                          <span className="text-gray-800">「はぁ？...まあ、話くらいは聞いてやる」</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-700">DETAILED応答例:</div>
                      <div className="bg-white p-3 rounded border text-sm">
                        <span className="text-gray-800">
                          「詳細要求が検出されたため、より詳しい説明が提供されます（200文字程度）。ただし段階的に説明し、一度に全てを伝えることは避けます。」
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}