// 🎯 NutriRoom Phase 2.3: データベース型定義
// Supabaseテーブル構造に対応したTypeScript型

export interface Database {
  public: {
    Tables: {
      user_sessions: {
        Row: UserSession
        Insert: UserSessionInsert
        Update: UserSessionUpdate
      }
      conversation_logs: {
        Row: ConversationLog
        Insert: ConversationLogInsert
        Update: ConversationLogUpdate
      }
      daily_summaries: {
        Row: DailySummary
        Insert: DailySummaryInsert
        Update: DailySummaryUpdate
      }
    }
  }
}

// 1. ユーザーセッション型定義
export interface UserSession {
  id: string
  user_id: string
  character_id: string
  start_time: string
  end_time: string | null
  session_status: 'active' | 'completed' | 'interrupted'
  created_at: string
  updated_at: string
}

export interface UserSessionInsert {
  id?: string
  user_id: string
  character_id: string
  start_time?: string
  end_time?: string | null
  session_status?: 'active' | 'completed' | 'interrupted'
  created_at?: string
  updated_at?: string
}

export interface UserSessionUpdate {
  id?: string
  user_id?: string
  character_id?: string
  start_time?: string
  end_time?: string | null
  session_status?: 'active' | 'completed' | 'interrupted'
  created_at?: string
  updated_at?: string
}

// 2. 会話ログ型定義
export interface ConversationLog {
  id: string
  session_id: string
  message_type: 'user' | 'ai'
  message_content: string
  voice_file_used: string | null
  emotion_detected: string | null
  timestamp: string
  created_at: string
}

export interface ConversationLogInsert {
  id?: string
  session_id: string
  message_type: 'user' | 'ai'
  message_content: string
  voice_file_used?: string | null
  emotion_detected?: string | null
  timestamp?: string
  created_at?: string
}

export interface ConversationLogUpdate {
  id?: string
  session_id?: string
  message_type?: 'user' | 'ai'
  message_content?: string
  voice_file_used?: string | null
  emotion_detected?: string | null
  timestamp?: string
  created_at?: string
}

// 3. 日次サマリー型定義
export interface DailySummary {
  id: string
  user_id: string
  date: string
  character_id: string
  letter_content: string | null
  main_topics: string[]
  session_count: number
  total_messages: number
  emotions_detected: string[]
  created_at: string
  updated_at: string
}

export interface DailySummaryInsert {
  id?: string
  user_id: string
  date?: string
  character_id: string
  letter_content?: string | null
  main_topics?: string[]
  session_count?: number
  total_messages?: number
  emotions_detected?: string[]
  created_at?: string
  updated_at?: string
}

export interface DailySummaryUpdate {
  id?: string
  user_id?: string
  date?: string
  character_id?: string
  letter_content?: string | null
  main_topics?: string[]
  session_count?: number
  total_messages?: number
  emotions_detected?: string[]
  created_at?: string
  updated_at?: string
}

// 4. セッション統計型定義
export interface SessionStats {
  total_sessions: number
  active_sessions: number
  completed_sessions: number
  average_session_duration: number
  most_used_character: string
}

// 5. 日次統計型定義
export interface DailyStats {
  date: string
  session_count: number
  message_count: number
  characters_used: string[]
  main_emotions: string[]
  letter_generated: boolean
}

// 6. 会話分析結果型定義
export interface ConversationAnalysis {
  session_id: string
  total_messages: number
  user_messages: number
  ai_messages: number
  emotions_detected: string[]
  main_topics: string[]
  session_duration: number
  voice_files_used: string[]
}

// 7. お手紙生成用データ型定義
export interface LetterGenerationData {
  user_id: string
  character_id: string
  date: string
  conversations: ConversationLog[]
  session_stats: SessionStats
  emotions_summary: Record<string, number>
  topics_summary: string[]
}