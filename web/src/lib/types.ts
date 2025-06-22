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
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          owner_id: string
          status: Database["public"]["Enums"]["status"]
          title: string | null
          user_description: string | null
          user_expected_result: string | null
          user_experience_level: string | null
          user_min_per_day: number
          user_num_weeks: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
          user_description?: string | null
          user_expected_result?: string | null
          user_experience_level?: string | null
          user_min_per_day?: number
          user_num_weeks?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
          user_description?: string | null
          user_expected_result?: string | null
          user_experience_level?: string | null
          user_min_per_day?: number
          user_num_weeks?: number
        }
        Relationships: []
      }
      references: {
        Row: {
          created_at: string
          id: string
          order_index: number
          section_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index: number
          section_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          section_id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "references_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          content_md: string | null
          course_id: string
          created_at: string
          description: string | null
          id: string
          next_section_id: string | null
          order_index: number
          previous_section_id: string | null
          reading_time_min: number
          status: Database["public"]["Enums"]["status"]
          title: string | null
          week_id: string
        }
        Insert: {
          content_md?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          next_section_id?: string | null
          order_index: number
          previous_section_id?: string | null
          reading_time_min?: number
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
          week_id: string
        }
        Update: {
          content_md?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          next_section_id?: string | null
          order_index?: number
          previous_section_id?: string | null
          reading_time_min?: number
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_next_section_id_fkey"
            columns: ["next_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_previous_section_id_fkey"
            columns: ["previous_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      weeks: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          learning_objectives: string[]
          order_index: number
          status: Database["public"]["Enums"]["status"]
          title: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          learning_objectives?: string[]
          order_index: number
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          learning_objectives?: string[]
          order_index?: number
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weeks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_course: {
        Args: {
          _title: string
          _description: string
          _weeks: Json
          _user_id: string
          _user_description?: string
          _user_expected_result?: string
          _user_experience_level?: string
          _user_min_per_day?: number
          _user_num_weeks?: number
        }
        Returns: Json
      }
    }
    Enums: {
      status: "RUNNING" | "DONE"
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
    Enums: {
      status: ["RUNNING", "DONE"],
    },
  },
} as const
