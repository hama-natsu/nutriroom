export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          age: number | null
          gender: 'male' | 'female' | 'other' | null
          height: number | null
          weight: number | null
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          goal: 'maintain' | 'lose_weight' | 'gain_weight' | 'build_muscle' | null
          age_group: '20代' | '30代' | '40代' | '50代以上' | null
          goal_type: '体重管理' | '健康維持' | '筋肉増量' | '生活習慣改善' | null
          activity_level_jp: '座り仕事中心' | '軽い運動' | '活発' | 'アスリート' | null
          meal_timing: '規則的' | '不規則' | '夜遅め' | null
          cooking_frequency: '毎日自炊' | '時々' | '外食中心' | 'コンビニ中心' | null
          main_concern: '間食' | '偏食' | '量' | '栄養バランス' | null
          advice_style: 'すぐ実践' | 'じっくり学習' | null
          info_preference: '簡潔' | '詳しく' | null
          profile_completed: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          goal?: 'maintain' | 'lose_weight' | 'gain_weight' | 'build_muscle' | null
          age_group?: '20代' | '30代' | '40代' | '50代以上' | null
          goal_type?: '体重管理' | '健康維持' | '筋肉増量' | '生活習慣改善' | null
          activity_level_jp?: '座り仕事中心' | '軽い運動' | '活発' | 'アスリート' | null
          meal_timing?: '規則的' | '不規則' | '夜遅め' | null
          cooking_frequency?: '毎日自炊' | '時々' | '外食中心' | 'コンビニ中心' | null
          main_concern?: '間食' | '偏食' | '量' | '栄養バランス' | null
          advice_style?: 'すぐ実践' | 'じっくり学習' | null
          info_preference?: '簡潔' | '詳しく' | null
          profile_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          goal?: 'maintain' | 'lose_weight' | 'gain_weight' | 'build_muscle' | null
          age_group?: '20代' | '30代' | '40代' | '50代以上' | null
          goal_type?: '体重管理' | '健康維持' | '筋肉増量' | '生活習慣改善' | null
          activity_level_jp?: '座り仕事中心' | '軽い運動' | '活発' | 'アスリート' | null
          meal_timing?: '規則的' | '不規則' | '夜遅め' | null
          cooking_frequency?: '毎日自炊' | '時々' | '外食中心' | 'コンビニ中心' | null
          main_concern?: '間食' | '偏食' | '量' | '栄養バランス' | null
          advice_style?: 'すぐ実践' | 'じっくり学習' | null
          info_preference?: '簡潔' | '詳しく' | null
          profile_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      foods: {
        Row: {
          id: string
          name: string
          name_en: string | null
          brand: string | null
          category: string
          calories_per_100g: number
          protein_per_100g: number
          carbs_per_100g: number
          fat_per_100g: number
          fiber_per_100g: number | null
          sugar_per_100g: number | null
          sodium_per_100g: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          brand?: string | null
          category: string
          calories_per_100g: number
          protein_per_100g: number
          carbs_per_100g: number
          fat_per_100g: number
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          brand?: string | null
          category?: string
          calories_per_100g?: number
          protein_per_100g?: number
          carbs_per_100g?: number
          fat_per_100g?: number
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          id: string
          user_id: string
          name: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_foods: {
        Row: {
          id: string
          meal_id: string
          food_id: string
          quantity: number
          unit: string
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_id: string
          quantity: number
          unit: string
          created_at?: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_id?: string
          quantity?: number
          unit?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          }
        ]
      }
      nutrition_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          total_calories: number
          total_protein: number
          total_carbs: number
          total_fat: number
          total_fiber: number | null
          total_sugar: number | null
          total_sodium: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_calories: number
          total_protein: number
          total_carbs: number
          total_fat: number
          total_fiber?: number | null
          total_sugar?: number | null
          total_sodium?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_calories?: number
          total_protein?: number
          total_carbs?: number
          total_fat?: number
          total_fiber?: number | null
          total_sugar?: number | null
          total_sodium?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          character_id: string
          date: string
          letter_content: string | null
          main_topics: string[]
          session_count: number
          total_messages: number
          emotions_detected: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          character_id: string
          date?: string
          letter_content?: string | null
          main_topics?: string[]
          session_count?: number
          total_messages?: number
          emotions_detected?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          character_id?: string
          date?: string
          letter_content?: string | null
          main_topics?: string[]
          session_count?: number
          total_messages?: number
          emotions_detected?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          character_id: string
          session_start: string
          session_end: string | null
          heartbeat_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          character_id: string
          session_start?: string
          session_end?: string | null
          heartbeat_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          character_id?: string
          session_start?: string
          session_end?: string | null
          heartbeat_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversation_logs: {
        Row: {
          id: string
          session_id: string
          message_type: 'user' | 'ai'
          message_content: string
          voice_file_used: string | null
          emotion_detected: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          message_type: 'user' | 'ai'
          message_content: string
          voice_file_used?: string | null
          emotion_detected?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          message_type?: 'user' | 'ai'
          message_content?: string
          voice_file_used?: string | null
          emotion_detected?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}