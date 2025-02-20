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
      schools: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      essay_prompts: {
        Row: {
          id: string
          school_id: string
          prompt: string
          word_count: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          prompt: string
          word_count: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          prompt?: string
          word_count?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          auth0_user_id: string
          email: string
          credits_remaining: number
          created_at: string
        }
        Insert: {
          id?: string
          auth0_user_id: string
          email: string
          credits_remaining?: number
          created_at?: string
        }
        Update: {
          id?: string
          auth0_user_id?: string
          email?: string
          credits_remaining?: number
          created_at?: string
        }
      }
      essays: {
        Row: {
          id: string
          profile_id: string
          school_id: string | null
          prompt: string
          essay_content: string
          word_count: number
          is_personal_statement: boolean
          feedback_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          school_id?: string | null
          prompt: string
          essay_content: string
          word_count: number
          is_personal_statement: boolean
          feedback_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          school_id?: string | null
          prompt?: string
          essay_content?: string
          word_count?: number
          is_personal_statement?: boolean
          feedback_status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
