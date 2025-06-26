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
          email: string
          first_name: string
          last_name: string
          role: string
          is_active: boolean
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: string
          is_active?: boolean
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          is_active?: boolean
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
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
      config: {
        Row: {
          id: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
