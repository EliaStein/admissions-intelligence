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
          referral_code_used: string | null
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
          referral_code_used?: string | null
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
          referral_code_used?: string | null
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
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string | null
          referee_email: string
          referral_code: string
          viral_loops_participant_id: string | null
          signup_completed: boolean
          payment_completed: boolean
          reward_given: boolean
          created_at: string
          signup_at: string | null
          payment_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referee_id?: string | null
          referee_email: string
          referral_code: string
          viral_loops_participant_id?: string | null
          signup_completed?: boolean
          payment_completed?: boolean
          reward_given?: boolean
          created_at?: string
          signup_at?: string | null
          payment_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referee_id?: string | null
          referee_email?: string
          referral_code?: string
          viral_loops_participant_id?: string | null
          signup_completed?: boolean
          payment_completed?: boolean
          reward_given?: boolean
          created_at?: string
          signup_at?: string | null
          payment_at?: string | null
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
      essays: {
        Row: {
          id: string
          student_first_name: string
          student_last_name: string
          student_email: string
          student_college: string | null
          selected_prompt: string
          personal_statement: boolean
          essay_content: string
          essay_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_first_name: string
          student_last_name: string
          student_email: string
          student_college?: string | null
          selected_prompt: string
          personal_statement?: boolean
          essay_content: string
          essay_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_first_name?: string
          student_last_name?: string
          student_email?: string
          student_college?: string | null
          selected_prompt?: string
          personal_statement?: boolean
          essay_content?: string
          essay_feedback?: string | null
          created_at?: string
        }
      }
    }
  }
}
