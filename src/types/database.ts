/**
 * Database types for StackIt Q&A platform
 * Auto-generated from Supabase schema
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          title: string
          description: string
          author_id: string
          tags: string[]
          votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          author_id: string
          tags: string[]
          votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          author_id?: string
          tags?: string[]
          votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          author_id: string
          content: string
          votes: number
          is_accepted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          author_id: string
          content: string
          votes?: number
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          author_id?: string
          content?: string
          votes?: number
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          target_id: string
          target_type: 'question' | 'answer'
          vote_type: 'upvote' | 'downvote'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_id: string
          target_type: 'question' | 'answer'
          vote_type: 'upvote' | 'downvote'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_id?: string
          target_type?: 'question' | 'answer'
          vote_type?: 'upvote' | 'downvote'
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

/**
 * Application-specific types for better type safety
 */
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Answer = Database['public']['Tables']['answers']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']

export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type AnswerInsert = Database['public']['Tables']['answers']['Insert']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

export type QuestionUpdate = Database['public']['Tables']['questions']['Update']
export type AnswerUpdate = Database['public']['Tables']['answers']['Update']
export type VoteUpdate = Database['public']['Tables']['votes']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Extended types for UI components
 */
export interface QuestionWithAuthor extends Question {
  author: Profile
  answer_count: number
}

export interface AnswerWithAuthor extends Answer {
  author: Profile
  user_vote?: Vote | null
}

export interface QuestionWithAnswers extends QuestionWithAuthor {
  answers: AnswerWithAuthor[]
}

/**
 * Form validation types
 */
export interface QuestionFormData {
  title: string
  description: string
  tags: string[]
}

export interface AnswerFormData {
  content: string
}

export interface VoteFormData {
  target_id: string
  target_type: 'question' | 'answer'
  vote_type: 'upvote' | 'downvote'
}

/**
 * API response types
 */
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
} 