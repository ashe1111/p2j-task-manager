export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          username: string
          xp: number
          level: number
          ai_personality: string
          daily_goal_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          username?: string
          xp?: number
          level?: number
          ai_personality?: string
          daily_goal_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string
          xp?: number
          level?: number
          ai_personality?: string
          daily_goal_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: string
          status: string
          scheduled_date: string
          scheduled_time: string | null
          completed_at: string | null
          xp_reward: number
          ai_generated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: string
          status?: string
          scheduled_date: string
          scheduled_time?: string | null
          completed_at?: string | null
          xp_reward?: number
          ai_generated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: string
          status?: string
          scheduled_date?: string
          scheduled_time?: string | null
          completed_at?: string | null
          xp_reward?: number
          ai_generated?: boolean
          created_at?: string
        }
      }
      daily_moods: {
        Row: {
          id: string
          user_id: string
          mood: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string
          date?: string
          created_at?: string
        }
      }
      weekly_reports: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          completion_rate: number
          total_tasks: number
          completed_tasks: number
          xp_earned: number
          ai_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          week_end: string
          completion_rate?: number
          total_tasks?: number
          completed_tasks?: number
          xp_earned?: number
          ai_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          completion_rate?: number
          total_tasks?: number
          completed_tasks?: number
          xp_earned?: number
          ai_summary?: string | null
          created_at?: string
        }
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
  }
}