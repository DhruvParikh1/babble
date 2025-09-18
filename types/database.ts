// File: types/database.ts
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          user_id: string
          original_text: string
          processed_text: string | null
          status: 'processing' | 'completed' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_text: string
          processed_text?: string | null
          status?: 'processing' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_text?: string
          processed_text?: string | null
          status?: 'processing' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      processed_items: {
        Row: {
          id: string
          user_id: string
          transcription_id: string
          category_id: string | null
          content: string
          item_type: 'reminder' | 'task' | 'note' | 'contact_action'
          calendar_event_id: string | null
          due_date: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transcription_id: string
          category_id?: string | null
          content: string
          item_type: 'reminder' | 'task' | 'note' | 'contact_action'
          calendar_event_id?: string | null
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transcription_id?: string
          category_id?: string | null
          content?: string
          item_type?: 'reminder' | 'task' | 'note' | 'contact_action'
          calendar_event_id?: string | null
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          google_calendar_connected: boolean
          google_calendar_refresh_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          google_calendar_connected?: boolean
          google_calendar_refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          google_calendar_connected?: boolean
          google_calendar_refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}