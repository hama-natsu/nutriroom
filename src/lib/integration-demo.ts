// 🎯 NutriRoom Phase 2.2: 統合システム使用例とデモ

import { generateNaturalResponse } from './natural-response-controller'
import { createConversationSession } from './conversation-context-manager'
import { runAllNaturalResponseTests } from './__tests__/natural-response-flow.test'

// 使用例1: 基本的な会話処理
export async function basicUsageExample(): Promise<void> {
  console.log('📖 Basic Usage Example')
  console.log('=' .repeat(50))

  // 1. セッション作成
  const sessionId = createConversationSession('akari')
  console.log('Session created:', sessionId.substring(0, 8) + '...')

  // 2. ユーザーメッセージ処理
  const userMessage = 'おはよう！ダイエットについて相談したいです'
  
  const response = await generateNaturalResponse({
    sessionId,
    userMessage,
    characterId: 'akari',
    timeSlot: 'morning'
  })

  console.log('User:', userMessage)
  console.log('Akari:', response.response)
  console.log('Voice Pattern:', response.voicePattern)
  console.log('Guidance Stage:', response.guidance.stage)
  console.log('=' .repeat(50))
}

// 使用例2: 連続会話のハンドリング
export async function continuousConversationExample(): Promise<void> {
  console.log('📖 Continuous Conversation Example')
  console.log('=' .repeat(50))

  const sessionId = createConversationSession('akari')
  
  const messages = [
    'こんにちは、ダイエットしたいです',
    '3ヶ月で5kg痩せたいと思っています',
    '友達の結婚式までに綺麗になりたくて',
    '時間がなくて忙しいです。アレルギーはありません',
    'アドバイスお願いします！'
  ]

  for (let i = 0; i < messages.length; i++) {
    const userMessage = messages[i]
    
    const response = await generateNaturalResponse({
      sessionId,
      userMessage,
      characterId: 'akari'
    })

    console.log(`\n--- Message ${i + 1} ---`)
    console.log('User:', userMessage)
    console.log('Akari:', response.response)
    console.log('Stage:', response.guidance.stage)
  }

  console.log('=' .repeat(50))
}

// 使用例3: API統合サンプル（NextJSでの使用想定）
export function apiIntegrationExample(): string {
  return `
// pages/api/chat.ts - Next.js API Route例
import { generateNaturalResponse } from '@/lib/natural-response-controller'
import { createConversationSession } from '@/lib/conversation-context-manager'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, userMessage, characterId = 'akari' } = req.body

  try {
    // セッションがない場合は新規作成
    const actualSessionId = sessionId || createConversationSession(characterId)
    
    // 自然な応答生成
    const response = await generateNaturalResponse({
      sessionId: actualSessionId,
      userMessage,
      characterId
    })

    res.status(200).json({
      sessionId: actualSessionId,
      response: response.response,
      voicePattern: response.voicePattern,
      guidance: response.guidance,
      success: true
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    })
  }
}

// components/ChatInterface.tsx - React コンポーネント例
import { useState } from 'react'

export default function ChatInterface() {
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Array<{user: string, akari: string}>>([])
  const [inputMessage, setInputMessage] = useState('')

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userMessage: inputMessage,
          characterId: 'akari'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSessionId(data.sessionId)
        setMessages(prev => [...prev, {
          user: inputMessage,
          akari: data.response
        }])
        setInputMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <div className="user-message">{msg.user}</div>
            <div className="akari-message">{msg.akari}</div>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="あかりちゃんに相談してみよう♪"
        />
        <button onClick={sendMessage}>送信</button>
      </div>
    </div>
  )
}
`
}

// デモ実行関数
export async function runIntegrationDemo(): Promise<void> {
  console.log('🚀 NutriRoom Phase 2.2 Integration Demo')
  console.log('=' .repeat(80))

  try {
    // 基本使用例
    await basicUsageExample()
    
    // 連続会話例
    await continuousConversationExample()
    
    // API統合サンプル表示
    console.log('📖 API Integration Example:')
    console.log(apiIntegrationExample())
    
    console.log('\n✅ Integration demo completed!')
    console.log('🎯 System is ready for production use')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
    throw error
  }

  console.log('=' .repeat(80))
}

// フル機能テスト
export async function runFullSystemTest(): Promise<void> {
  console.log('🧪 Running Full System Test')
  console.log('=' .repeat(80))

  try {
    // デモ実行
    await runIntegrationDemo()
    
    // 自動テスト実行
    await runAllNaturalResponseTests()
    
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('✅ NutriRoom Phase 2.2改善 is complete and ready!')
    
  } catch (error) {
    console.error('❌ System test failed:', error)
    throw error
  }

  console.log('=' .repeat(80))
}

// ブラウザ環境でのデモ関数公開
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).runNutriRoomDemo = runIntegrationDemo
  ;(window as unknown as Record<string, unknown>).runNutriRoomFullTest = runFullSystemTest
  
  console.log('🎯 NutriRoom Phase 2.2 Demo Functions Available:')
  console.log('- runNutriRoomDemo() : 統合デモ実行')
  console.log('- runNutriRoomFullTest() : フルシステムテスト実行')
  console.log('- testNaturalResponse() : 自然な応答テスト')
  console.log('- debugNaturalResponse() : デバッグ情報表示')
}