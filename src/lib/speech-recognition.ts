// 音声認識サービス (Web Speech API)
export interface SpeechRecognitionOutput {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface SpeechRecognitionCallbacks {
  onResult?: (result: SpeechRecognitionOutput) => void
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  onNoMatch?: () => void
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null
  private isListening = false
  private callbacks: SpeechRecognitionCallbacks = {}

  constructor() {
    // ブラウザ環境でのみ初期化
    if (typeof window !== 'undefined') {
      this.initializeRecognition()
    }
  }

  private initializeRecognition(): void {
    // ブラウザサポートチェック
    if (typeof window === 'undefined') {
      console.warn('🎙️ Speech Recognition API is not available in server environment')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('🎙️ Speech Recognition API is not supported in this browser')
      return
    }

    this.recognition = new SpeechRecognition()
    this.setupRecognitionSettings()
    this.setupEventListeners()
    
    console.log('🎙️ Speech Recognition Service initialized')
  }

  private setupRecognitionSettings(): void {
    if (!this.recognition) return

    // 日本語設定
    this.recognition.lang = 'ja-JP'
    
    // 連続認識を有効にする
    this.recognition.continuous = true
    
    // 中間結果も取得する
    this.recognition.interimResults = true
    
    // 自動終了まで長めに設定
    this.recognition.maxAlternatives = 1
  }

  private setupEventListeners(): void {
    if (!this.recognition) return

    // 認識開始
    this.recognition.onstart = () => {
      console.log('🎙️ Speech recognition started')
      this.isListening = true
      this.callbacks.onStart?.()
    }

    // 認識終了
    this.recognition.onend = () => {
      console.log('🎙️ Speech recognition ended')
      this.isListening = false
      this.callbacks.onEnd?.()
    }

    // 認識結果
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const alternative = result[0]
        const transcript = alternative.transcript

        if (result.isFinal) {
          console.log('🎙️ Final transcript:', transcript)
          
          this.callbacks.onResult?.({
            transcript: transcript.trim(),
            confidence: alternative.confidence,
            isFinal: true
          })
        } else {
          console.log('🎙️ Interim transcript:', transcript)
          
          this.callbacks.onResult?.({
            transcript: transcript.trim(),
            confidence: alternative.confidence,
            isFinal: false
          })
        }
      }
    }

    // エラーハンドリング
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🎙️ Speech recognition error:', event.error)
      this.isListening = false
      
      let errorMessage = '音声認識エラーが発生しました'
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = '音声が検出されませんでした'
          break
        case 'audio-capture':
          errorMessage = 'マイクにアクセスできませんでした'
          break
        case 'not-allowed':
          errorMessage = 'マイクの使用が許可されていません'
          break
        case 'network':
          errorMessage = 'ネットワークエラーが発生しました'
          break
        case 'service-not-allowed':
          errorMessage = '音声認識サービスが利用できません'
          break
        case 'bad-grammar':
          errorMessage = '音声認識の設定に問題があります'
          break
        case 'language-not-supported':
          errorMessage = 'この言語はサポートされていません'
          break
      }
      
      this.callbacks.onError?.(errorMessage)
    }

    // マッチしない場合
    this.recognition.onnomatch = () => {
      console.log('🎙️ No speech match found')
      this.callbacks.onNoMatch?.()
    }
  }

  // 音声認識開始
  public startListening(callbacks: SpeechRecognitionCallbacks = {}): boolean {
    if (!this.recognition) {
      callbacks.onError?.('音声認識がサポートされていません')
      return false
    }

    if (this.isListening) {
      console.log('🎙️ Already listening')
      return false
    }

    this.callbacks = callbacks

    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('🎙️ Failed to start speech recognition:', error)
      this.callbacks.onError?.('音声認識の開始に失敗しました')
      return false
    }
  }

  // 音声認識停止
  public stopListening(): void {
    if (!this.recognition || !this.isListening) {
      return
    }

    try {
      this.recognition.stop()
    } catch (error) {
      console.error('🎙️ Failed to stop speech recognition:', error)
    }
  }

  // 音声認識強制終了
  public abortListening(): void {
    if (!this.recognition) {
      return
    }

    try {
      this.recognition.abort()
      this.isListening = false
    } catch (error) {
      console.error('🎙️ Failed to abort speech recognition:', error)
    }
  }

  // ブラウザサポート確認
  public isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    return !!SpeechRecognition
  }

  // 現在の状態確認
  public getIsListening(): boolean {
    return this.isListening
  }

  // マイク権限確認
  public async checkMicrophonePermission(): Promise<{
    granted: boolean
    error?: string
  }> {
    try {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return {
          granted: false,
          error: 'サーバー環境ではマイクアクセスは利用できません'
        }
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          granted: false,
          error: 'このブラウザはマイクアクセスをサポートしていません'
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      })
      
      // すぐにストリームを停止
      stream.getTracks().forEach(track => track.stop())
      
      console.log('🎙️ Microphone permission granted')
      return { granted: true }
      
    } catch (error: unknown) {
      console.error('🎙️ Microphone permission error:', error)
      
      let errorMessage = 'マイクの権限確認に失敗しました'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'マイクの使用が許可されていません'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'マイクが見つかりませんでした'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'マイクが使用中または利用できません'
        }
      }
      
      return {
        granted: false,
        error: errorMessage
      }
    }
  }
}

// シングルトンインスタンス
export const speechRecognitionService = new SpeechRecognitionService()

// TypeScript型定義の拡張
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  grammars: SpeechGrammarList
  interimResults: boolean
  lang: string
  maxAlternatives: number
  serviceURI: string
  start(): void
  stop(): void
  abort(): void
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported'
  message: string
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechGrammarList {
  readonly length: number
  addFromString(string: string, weight?: number): void
  addFromURI(src: string, weight?: number): void
  item(index: number): SpeechGrammar
  [index: number]: SpeechGrammar
}

interface SpeechGrammar {
  src: string
  weight: number
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}