'use client'

import { useEffect } from 'react'

export default function ElevenLabsDebugLoader() {
  useEffect(() => {
    // 開発環境またはデバッグモードでテスト機能を読み込み
    const shouldLoadDebug = process.env.NODE_ENV === 'development' || 
                           typeof window !== 'undefined' && window.location.search.includes('debug=true')
    
    if (shouldLoadDebug) {
      import('@/lib/elevenlabs-test').then(({ initializeElevenLabsTest }) => {
        const success = initializeElevenLabsTest()
        if (success) {
          console.log('🎯 ElevenLabs debug functions loaded and registered successfully')
          
          // デバッグパラメータがある場合は自動設定
          if (typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
            setTimeout(() => {
              if (window.elevenLabsTest?.debug) {
                window.elevenLabsTest.debug.enableDebugMode()
                window.elevenLabsTest.debug.showConfig()
              }
            }, 1000)
          }
        }
      }).catch((error) => {
        console.warn('⚠️ Failed to load ElevenLabs debug functions:', error)
      })
    }
  }, [])

  // このコンポーネントは何もレンダリングしない
  return null
}