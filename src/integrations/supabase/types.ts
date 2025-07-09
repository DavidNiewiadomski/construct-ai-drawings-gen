export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      approvals: {
        Row: {
          conditions: string | null
          drawing_id: string
          id: string
          reviewer: string
          signature: string | null
          stamp_position_x: number | null
          stamp_position_y: number | null
          status: string
          timestamp: string
        }
        Insert: {
          conditions?: string | null
          drawing_id: string
          id?: string
          reviewer: string
          signature?: string | null
          stamp_position_x?: number | null
          stamp_position_y?: number | null
          status: string
          timestamp?: string
        }
        Update: {
          conditions?: string | null
          drawing_id?: string
          id?: string
          reviewer?: string
          signature?: string | null
          stamp_position_x?: number | null
          stamp_position_y?: number | null
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_drawing_id_fkey"
            columns: ["drawing_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
        ]
      }
      change_history: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          drawing_id: string
          id: string
          reason: string | null
          target_id: string
          target_type: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          drawing_id: string
          id?: string
          reason?: string | null
          target_id: string
          target_type: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          drawing_id?: string
          id?: string
          reason?: string | null
          target_id?: string
          target_type?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_history_drawing_id_fkey"
            columns: ["drawing_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_messages: {
        Row: {
          attachments: string[] | null
          author: string
          comment_id: string
          created_at: string
          id: string
          mentions: string[] | null
          text: string
        }
        Insert: {
          attachments?: string[] | null
          author: string
          comment_id: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          text: string
        }
        Update: {
          attachments?: string[] | null
          author?: string
          comment_id?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_messages_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "review_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_name: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          project_number: string
          status: Database["public"]["Enums"]["project_status"]
          team_members: string[] | null
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          project_number: string
          status?: Database["public"]["Enums"]["project_status"]
          team_members?: string[] | null
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          project_number?: string
          status?: Database["public"]["Enums"]["project_status"]
          team_members?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      review_comments: {
        Row: {
          created_at: string
          created_by: string
          drawing_id: string
          id: string
          position_x: number
          position_y: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          drawing_id: string
          id?: string
          position_x: number
          position_y: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          drawing_id?: string
          id?: string
          position_x?: number
          position_y?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_comments_drawing_id_fkey"
            columns: ["drawing_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          file_name: string
          file_size: number
          file_type: Database["public"]["Enums"]["file_type"]
          file_url: string
          id: string
          metadata: Json | null
          mime_type: string
          processing_status: Database["public"]["Enums"]["processing_status"]
          project_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: Database["public"]["Enums"]["file_type"]
          file_url: string
          id?: string
          metadata?: Json | null
          mime_type: string
          processing_status?: Database["public"]["Enums"]["processing_status"]
          project_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: Database["public"]["Enums"]["file_type"]
          file_url?: string
          id?: string
          metadata?: Json | null
          mime_type?: string
          processing_status?: Database["public"]["Enums"]["processing_status"]
          project_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "engineer" | "reviewer" | "viewer"
      file_type:
        | "contract_drawing"
        | "shop_drawing"
        | "submittal"
        | "specification"
        | "bim_model"
      processing_status: "pending" | "processing" | "completed" | "failed"
      project_status:
        | "draft"
        | "processing"
        | "review"
        | "approved"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "engineer", "reviewer", "viewer"],
      file_type: [
        "contract_drawing",
        "shop_drawing",
        "submittal",
        "specification",
        "bim_model",
      ],
      processing_status: ["pending", "processing", "completed", "failed"],
      project_status: [
        "draft",
        "processing",
        "review",
        "approved",
        "completed",
      ],
    },
  },
} as const
