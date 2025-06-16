// 🎯 NutriRoom Phase 2.4: Gemini 1.5 Pro「今日のお手紙」システム
// Google Gemini 1.5 Pro統合 - 無料枠大・日本語得意・会話分析最適

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

// Geminiクライアント初期化
const initializeGeminiClient = (): GoogleGenerativeAI | null => {
  try {
    // 複数の環境変数名をサポート
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                   process.env.GEMINI_API_KEY || 
                   process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
                   process.env.GOOGLE_AI_API_KEY
    
    if (!apiKey) {
      console.error('❌ Gemini API key not found. Set GEMINI_API_KEY or GOOGLE_AI_API_KEY')
      return null
    }

    if (apiKey === 'your_gemini_api_key_here' || apiKey === 'your_google_ai_api_key_here') {
      console.warn('⚠️ Using placeholder API key - this will not work in production')
      return null
    }

    console.log('🚀 Initializing Gemini 1.5 Pro client...')
    const genAI = new GoogleGenerativeAI(apiKey)
    console.log('✅ Gemini client initialized successfully')
    
    return genAI
  } catch (error) {
    console.error('❌ Failed to initialize Gemini client:', error)
    return null
  }
}

// Geminiクライアントインスタンス
const genAI = initializeGeminiClient()

// Gemini 1.5 Proモデル取得
export const getGeminiModel = (): GenerativeModel | null => {
  if (!genAI) {
    console.error('❌ Gemini client not available')
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,          // 創造性とのバランス
        topK: 40,                  // 高品質な応答
        topP: 0.8,                 // 適度な多様性
        maxOutputTokens: 2048,     // お手紙に十分な長さ
      }
    })
    
    console.log('✅ Gemini 1.5 Pro model loaded')
    return model
  } catch (error) {
    console.error('❌ Failed to load Gemini model:', error)
    return null
  }
}

// Gemini利用可能性チェック
export const isGeminiAvailable = (): boolean => {
  return genAI !== null
}

// デバッグ用Gemini情報表示
export const debugGeminiSetup = (): void => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
                 process.env.GOOGLE_AI_API_KEY
  
  console.log('🔍 Gemini Setup Debug:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'not found',
    isPlaceholder: apiKey === 'your_gemini_api_key_here' || apiKey === 'your_google_ai_api_key_here',
    environmentVars: {
      NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      NEXT_PUBLIC_GOOGLE_AI_API_KEY: !!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
      GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY
    },
    clientAvailable: isGeminiAvailable(),
    modelReady: !!getGeminiModel()
  })
}

// エクスポート
export { genAI }
export default getGeminiModel