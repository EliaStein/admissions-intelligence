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
    }
  }
}
