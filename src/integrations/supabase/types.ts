export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      client_checkins: {
        Row: {
          back_photo_url: string | null
          belly_circumference: number | null
          checkin_date: string
          checkin_type: string
          client_id: string
          created_at: string
          feedback_date: string | null
          front_photo_url: string | null
          hip_circumference: number | null
          id: string
          left_thigh: number | null
          next_goal: string | null
          nutritionist_feedback: string | null
          observations: string | null
          right_thigh: number | null
          side_photo_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          back_photo_url?: string | null
          belly_circumference?: number | null
          checkin_date: string
          checkin_type: string
          client_id: string
          created_at?: string
          feedback_date?: string | null
          front_photo_url?: string | null
          hip_circumference?: number | null
          id?: string
          left_thigh?: number | null
          next_goal?: string | null
          nutritionist_feedback?: string | null
          observations?: string | null
          right_thigh?: number | null
          side_photo_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          back_photo_url?: string | null
          belly_circumference?: number | null
          checkin_date?: string
          checkin_type?: string
          client_id?: string
          created_at?: string
          feedback_date?: string | null
          front_photo_url?: string | null
          hip_circumference?: number | null
          id?: string
          left_thigh?: number | null
          next_goal?: string | null
          nutritionist_feedback?: string | null
          observations?: string | null
          right_thigh?: number | null
          side_photo_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_food_logs: {
        Row: {
          client_id: string
          created_at: string
          eaten_at: string
          expires_at: string | null
          foods: Json
          id: string
          meal_name: string
          total_calories: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          eaten_at?: string
          expires_at?: string | null
          foods?: Json
          id?: string
          meal_name: string
          total_calories?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          eaten_at?: string
          expires_at?: string | null
          foods?: Json
          id?: string
          meal_name?: string
          total_calories?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      client_goals: {
        Row: {
          client_id: string
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          target_date: string | null
          target_value: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_value?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      client_measurements: {
        Row: {
          arm: number | null
          body_fat_percentage: number | null
          chest: number | null
          client_id: string
          created_at: string
          height: number | null
          hip: number | null
          id: string
          measured_by: string | null
          thigh: number | null
          updated_at: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          arm?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          client_id: string
          created_at?: string
          height?: number | null
          hip?: number | null
          id?: string
          measured_by?: string | null
          thigh?: number | null
          updated_at?: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arm?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          client_id?: string
          created_at?: string
          height?: number | null
          hip?: number | null
          id?: string
          measured_by?: string | null
          thigh?: number | null
          updated_at?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      client_reports: {
        Row: {
          client_id: string
          created_at: string
          id: string
          professional_id: string
          report_text: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          professional_id: string
          report_text: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          professional_id?: string
          report_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          notes: string | null
          reps_completed: number | null
          sets_completed: number | null
          updated_at: string
          weight_used: number | null
          workout_session_id: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          updated_at?: string
          weight_used?: number | null
          workout_session_id: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          updated_at?: string
          weight_used?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          difficulty_level: string | null
          equipment: string | null
          id: string
          instructions: string | null
          muscle_group: string | null
          name: string
          updated_at: string
          video_file_path: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          difficulty_level?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name: string
          updated_at?: string
          video_file_path?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty_level?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name?: string
          updated_at?: string
          video_file_path?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      motivational_phrases: {
        Row: {
          client_id: string
          created_at: string
          id: string
          phrase: string
          professional_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          phrase: string
          professional_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          phrase?: string
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          client_id: string
          created_at: string
          id: string
          meal_description: string | null
          meal_time: string | null
          meal_time_end: string | null
          meal_type: string
          observations: string | null
          professional_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          meal_description?: string | null
          meal_time?: string | null
          meal_time_end?: string | null
          meal_type: string
          observations?: string | null
          professional_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          meal_description?: string | null
          meal_time?: string | null
          meal_time_end?: string | null
          meal_type?: string
          observations?: string | null
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_settings: {
        Row: {
          created_at: string
          psych_password_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          psych_password_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          psych_password_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      psychology_goals: {
        Row: {
          client_id: string
          created_at: string
          goal_period: string | null
          goal_text: string
          id: string
          professional_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          goal_period?: string | null
          goal_text: string
          id?: string
          professional_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          goal_period?: string | null
          goal_text?: string
          id?: string
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      psychology_sessions: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          professional_id: string
          session_date: string
          session_type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          professional_id: string
          session_date: string
          session_type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          professional_id?: string
          session_date?: string
          session_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          client_id: string
          created_at: string
          exercise_name: string
          id: string
          professional_id: string
          sets: string
          updated_at: string
          video_file_path: string | null
          video_url: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          exercise_name: string
          id?: string
          professional_id: string
          sets: string
          updated_at?: string
          video_file_path?: string | null
          video_url?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          exercise_name?: string
          id?: string
          professional_id?: string
          sets?: string
          updated_at?: string
          video_file_path?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          client_id: string
          created_at: string
          difficulty_level: number | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          intensity_level: number | null
          notes: string | null
          start_time: string
          updated_at: string
          workout_plan_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          difficulty_level?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          intensity_level?: number | null
          notes?: string | null
          start_time?: string
          updated_at?: string
          workout_plan_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          difficulty_level?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          intensity_level?: number | null
          notes?: string | null
          start_time?: string
          updated_at?: string
          workout_plan_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_professional: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      purge_expired_food_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_type: "professional" | "client"
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
      user_type: ["professional", "client"],
    },
  },
} as const
