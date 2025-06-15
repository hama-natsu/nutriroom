// 🎯 Supabase統合エクスポート
// NutriRoom Phase 2.3: セッション管理基盤の統一インターフェース

// クライアント
export { supabase, checkAuth, getCurrentUserId, debugAuth } from './client'

// セッション管理
export {
  startSession,
  endSession,
  endActiveSessionsForUser,
  getCurrentActiveSession,
  getUserSessions,
  addConversationLog,
  getSessionConversationLogs,
  getTodayConversationLogs,
  getSessionStats
} from './sessions'

// 日次サマリー管理
export {
  getTodaySummary,
  updateDailySummary,
  updateSummaryFromConversations,
  setLetterContent,
  getUserDailySummaries,
  debugDailySummary
} from './summaries'

// 型定義
export type {
  Database,
  UserSession,
  UserSessionInsert,
  UserSessionUpdate,
  ConversationLog,
  ConversationLogInsert,
  ConversationLogUpdate,
  DailySummary,
  DailySummaryInsert,
  DailySummaryUpdate,
  SessionStats,
  DailyStats,
  ConversationAnalysis,
  LetterGenerationData
} from '@/types/database'