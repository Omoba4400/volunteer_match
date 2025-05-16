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
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          created_by: string
          created_at: string
          updated_at: string
          cause_type?: string
          image_url?: string
          image_path?: string
          causes: string[]
          status: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          created_by: string
          created_at?: string
          updated_at?: string
          cause_type?: string
          image_url?: string
          image_path?: string
          causes?: string[]
          status?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          cause_type?: string
          image_url?: string
          image_path?: string
          causes?: string[]
          status?: string
        }
        Relationships: []
      }
      admin_approvals: {
        Row: {
          id: string
          opportunity_id: string
          admin_id: string
          status: "pending" | "approved" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          admin_id: string
          status: "pending" | "approved" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          admin_id?: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
        }
        Relationships: []
      }
      organization_profiles: {
        Row: {
          causes: string[] | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          logo: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          causes?: string[] | null
          created_at?: string | null
          description?: string | null
          id: string
          location?: string | null
          logo?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          causes?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          logo?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          profile_complete: boolean | null
          role: string | null
          updated_at: string | null
          profile_picture_url: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          profile_complete?: boolean | null
          role?: string | null
          updated_at?: string | null
          profile_picture_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          profile_complete?: boolean | null
          role?: string | null
          updated_at?: string | null
          profile_picture_url?: string | null
        }
        Relationships: []
      }
      volunteer_profiles: {
        Row: {
          availability: string[] | null
          bio: string | null
          created_at: string | null
          id: string
          interests: string[] | null
          location: string | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability?: string[] | null
          bio?: string | null
          created_at?: string | null
          id: string
          interests?: string[] | null
          location?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability?: string[] | null
          bio?: string | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          opportunity_id: string
          volunteer_id: string
          status: 'pending' | 'accepted' | 'rejected'
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          volunteer_id: string
          status: 'pending' | 'accepted' | 'rejected'
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          volunteer_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          opportunity_id: string | null
          type: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opportunity_id?: string | null
          type: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          opportunity_id?: string | null
          type?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_opportunity: {
        Args: {
          opportunity_id: string
          user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
