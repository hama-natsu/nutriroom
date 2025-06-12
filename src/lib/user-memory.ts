// ユーザー記憶システム（長期記憶基盤）
export interface UserMemory {
  userId: string
  characterRelationships: Record<string, CharacterRelationship>
  healthProfile: HealthProfile
  conversationHistory: ConversationEntry[]
  goals: UserGoal[]
  preferences: UserPreferences
  lastUpdated: Date
  createdAt: Date
}

export interface CharacterRelationship {
  characterId: string
  relationshipLevel: number // 0-3 (stranger to close)
  interactionCount: number
  lastInteraction: Date
  favoriteTopics: string[]
  successfulAdvice: string[]
  personalNotes: string[]
  emotionalHistory: EmotionalInteraction[]
}

export interface HealthProfile {
  age?: number
  gender?: string
  height?: number
  weight?: number
  activityLevel: 'low' | 'moderate' | 'high'
  healthConditions: string[]
  allergies: string[]
  dietaryRestrictions: string[]
  currentConcerns: string[]
  medications: string[]
}

export interface ConversationEntry {
  id: string
  characterId: string
  timestamp: Date
  userMessage: string
  characterResponse: string
  context: 'greeting' | 'advice' | 'followup' | 'casual' | 'concern'
  userMood: 'positive' | 'negative' | 'neutral' | 'confused'
  outcome: 'helpful' | 'unclear' | 'resistant' | 'successful'
  topics: string[]
}

export interface UserGoal {
  id: string
  title: string
  description: string
  targetDate?: Date
  category: 'weight' | 'nutrition' | 'exercise' | 'health' | 'habit'
  priority: 'low' | 'medium' | 'high'
  progress: number // 0-100
  milestones: GoalMilestone[]
  createdWith: string // character ID
  status: 'active' | 'completed' | 'paused' | 'cancelled'
}

export interface GoalMilestone {
  id: string
  description: string
  targetDate: Date
  completed: boolean
  completedDate?: Date
  notes: string
}

export interface UserPreferences {
  preferredCharacters: string[]
  communicationStyle: 'gentle' | 'direct' | 'motivational' | 'scientific'
  responseLength: 'short' | 'medium' | 'detailed'
  notificationPreferences: {
    dailyReminders: boolean
    weeklyCheckins: boolean
    goalDeadlines: boolean
  }
  privacy: {
    shareDataWithCharacters: boolean
    rememberConversations: boolean
    personalizeResponses: boolean
  }
}

export interface EmotionalInteraction {
  timestamp: Date
  userEmotion: string
  characterEmotion: string
  context: string
  outcome: 'positive' | 'negative' | 'neutral'
}

// メモリー管理クラス
export class UserMemoryManager {
  private memories: Map<string, UserMemory> = new Map()

  // ユーザーメモリーの初期化
  initializeUser(userId: string): UserMemory {
    const memory: UserMemory = {
      userId,
      characterRelationships: {},
      healthProfile: {
        activityLevel: 'moderate',
        healthConditions: [],
        allergies: [],
        dietaryRestrictions: [],
        currentConcerns: [],
        medications: []
      },
      conversationHistory: [],
      goals: [],
      preferences: {
        preferredCharacters: [],
        communicationStyle: 'gentle',
        responseLength: 'medium',
        notificationPreferences: {
          dailyReminders: false,
          weeklyCheckins: false,
          goalDeadlines: true
        },
        privacy: {
          shareDataWithCharacters: true,
          rememberConversations: true,
          personalizeResponses: true
        }
      },
      lastUpdated: new Date(),
      createdAt: new Date()
    }

    this.memories.set(userId, memory)
    return memory
  }

  // ユーザーメモリーの取得
  getUserMemory(userId: string): UserMemory | undefined {
    return this.memories.get(userId)
  }

  // 会話記録の追加
  addConversation(
    userId: string,
    characterId: string,
    userMessage: string,
    characterResponse: string,
    context: ConversationEntry['context'],
    userMood: ConversationEntry['userMood'] = 'neutral',
    outcome: ConversationEntry['outcome'] = 'helpful',
    topics: string[] = []
  ): void {
    const memory = this.getUserMemory(userId)
    if (!memory) return

    const conversation: ConversationEntry = {
      id: Date.now().toString(),
      characterId,
      timestamp: new Date(),
      userMessage,
      characterResponse,
      context,
      userMood,
      outcome,
      topics
    }

    memory.conversationHistory.push(conversation)
    
    // 関係性の更新
    this.updateRelationship(userId, characterId, context, outcome)
    
    // 最大保存件数制限（パフォーマンス考慮）
    if (memory.conversationHistory.length > 1000) {
      memory.conversationHistory = memory.conversationHistory.slice(-500)
    }

    memory.lastUpdated = new Date()
    console.log('💭 Conversation added to memory:', { userId, characterId, context, outcome })
  }

  // キャラクターとの関係性更新
  private updateRelationship(
    userId: string,
    characterId: string,
    context: ConversationEntry['context'],
    outcome: ConversationEntry['outcome']
  ): void {
    const memory = this.getUserMemory(userId)
    if (!memory) return

    if (!memory.characterRelationships[characterId]) {
      memory.characterRelationships[characterId] = {
        characterId,
        relationshipLevel: 0,
        interactionCount: 0,
        lastInteraction: new Date(),
        favoriteTopics: [],
        successfulAdvice: [],
        personalNotes: [],
        emotionalHistory: []
      }
    }

    const relationship = memory.characterRelationships[characterId]
    relationship.interactionCount++
    relationship.lastInteraction = new Date()

    // 関係性レベルの向上
    if (outcome === 'successful' || outcome === 'helpful') {
      if (relationship.interactionCount % 10 === 0 && relationship.relationshipLevel < 3) {
        relationship.relationshipLevel++
        console.log(`💝 Relationship level up! ${characterId}: ${relationship.relationshipLevel}`)
      }
    }
  }

  // 健康プロファイルの更新
  updateHealthProfile(userId: string, updates: Partial<HealthProfile>): void {
    const memory = this.getUserMemory(userId)
    if (!memory) return

    memory.healthProfile = { ...memory.healthProfile, ...updates }
    memory.lastUpdated = new Date()
    console.log('🏥 Health profile updated:', updates)
  }

  // 目標の追加
  addGoal(userId: string, goal: Omit<UserGoal, 'id' | 'progress' | 'milestones' | 'status'>): string {
    const memory = this.getUserMemory(userId)
    if (!memory) return ''

    const newGoal: UserGoal = {
      id: Date.now().toString(),
      progress: 0,
      milestones: [],
      status: 'active',
      ...goal
    }

    memory.goals.push(newGoal)
    memory.lastUpdated = new Date()
    console.log('🎯 Goal added:', newGoal.title)
    return newGoal.id
  }

  // 目標の進捗更新
  updateGoalProgress(userId: string, goalId: string, progress: number): void {
    const memory = this.getUserMemory(userId)
    if (!memory) return

    const goal = memory.goals.find(g => g.id === goalId)
    if (goal) {
      goal.progress = Math.max(0, Math.min(100, progress))
      if (goal.progress === 100 && goal.status === 'active') {
        goal.status = 'completed'
        console.log('🎉 Goal completed:', goal.title)
      }
      memory.lastUpdated = new Date()
    }
  }

  // 最近の会話履歴取得
  getRecentConversations(userId: string, characterId?: string, limit: number = 10): ConversationEntry[] {
    const memory = this.getUserMemory(userId)
    if (!memory) return []

    let conversations = memory.conversationHistory
    if (characterId) {
      conversations = conversations.filter(c => c.characterId === characterId)
    }

    return conversations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // キャラクターとの関係性レベル取得
  getRelationshipLevel(userId: string, characterId: string): number {
    const memory = this.getUserMemory(userId)
    if (!memory) return 0

    return memory.characterRelationships[characterId]?.relationshipLevel || 0
  }

  // ユーザーの好みを学習
  learnUserPreferences(userId: string, characterId: string, topics: string[], outcome: string): void {
    const memory = this.getUserMemory(userId)
    if (!memory) return

    const relationship = memory.characterRelationships[characterId]
    if (!relationship) return

    if (outcome === 'helpful' || outcome === 'successful') {
      topics.forEach(topic => {
        if (!relationship.favoriteTopics.includes(topic)) {
          relationship.favoriteTopics.push(topic)
        }
      })
    }

    // 好みのトピック数制限
    if (relationship.favoriteTopics.length > 20) {
      relationship.favoriteTopics = relationship.favoriteTopics.slice(-15)
    }
  }

  // メモリーの永続化（将来的にはDB保存）
  exportMemory(userId: string): string | null {
    const memory = this.getUserMemory(userId)
    if (!memory) return null

    return JSON.stringify(memory, null, 2)
  }

  // メモリーのインポート
  importMemory(userId: string, memoryData: string): boolean {
    try {
      const memory: UserMemory = JSON.parse(memoryData)
      memory.userId = userId
      memory.lastUpdated = new Date()
      this.memories.set(userId, memory)
      console.log('📥 Memory imported for user:', userId)
      return true
    } catch (error) {
      console.error('❌ Failed to import memory:', error)
      return false
    }
  }

  // 統計情報の取得
  getMemoryStats(userId: string): {
    totalConversations: number
    characterInteractions: Record<string, number>
    relationshipLevels: Record<string, number>
    activeGoals: number
    completedGoals: number
  } | null {
    const memory = this.getUserMemory(userId)
    if (!memory) return null

    const characterInteractions: Record<string, number> = {}
    const relationshipLevels: Record<string, number> = {}

    Object.values(memory.characterRelationships).forEach(rel => {
      characterInteractions[rel.characterId] = rel.interactionCount
      relationshipLevels[rel.characterId] = rel.relationshipLevel
    })

    return {
      totalConversations: memory.conversationHistory.length,
      characterInteractions,
      relationshipLevels,
      activeGoals: memory.goals.filter(g => g.status === 'active').length,
      completedGoals: memory.goals.filter(g => g.status === 'completed').length
    }
  }
}

// シングルトンインスタンス
export const userMemoryManager = new UserMemoryManager()

// デバッグ用関数
export const createTestUser = (userId: string = 'test-user'): UserMemory => {
  const memory = userMemoryManager.initializeUser(userId)
  
  // テストデータの追加
  userMemoryManager.addConversation(
    userId,
    'minato',
    'ダイエットを始めたいです',
    '別に君のためじゃないからな...でも、まずは食事記録から始めろ',
    'advice',
    'positive',
    'helpful',
    ['ダイエット', '食事記録']
  )

  userMemoryManager.addGoal(userId, {
    title: '3ヶ月で5kg減量',
    description: '健康的な方法で無理なく減量する',
    category: 'weight',
    priority: 'high',
    createdWith: 'minato'
  })

  console.log('🧪 Test user created with sample data')
  return memory
}