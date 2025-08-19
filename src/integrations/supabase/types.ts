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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      client_checkins: {
        Row: {
          checkin_date: string
          client_id: string
          created_at: string
          energy: number | null
          id: string
          mood: number | null
          notes: string | null
          sleep_quality: number | null
          stress_level: number | null
        }
        Insert: {
          checkin_date?: string
          client_id: string
          created_at?: string
          energy?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
        }
        Update: {
          checkin_date?: string
          client_id?: string
          created_at?: string
          energy?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
        }
        Relationships: []
      }
      client_food_logs: {
        Row: {
          client_id: string
          created_at: string
          eaten_at: string
          foods: Json
          id: string
          meal_name: string
          total_calories: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          eaten_at?: string
          foods: Json
          id?: string
          meal_name: string
          total_calories?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          eaten_at?: string
          foods?: Json
          id?: string
          meal_name?: string
          total_calories?: number | null
        }
        Relationships: []
      }
      client_measurements: {
        Row: {
          arms: number | null
          body_fat: number | null
          chest: number | null
          client_id: string
          created_at: string
          height: number | null
          id: string
          measured_at: string
          muscle_mass: number | null
          waist: number | null
          weight: number | null
        }
        Insert: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          client_id: string
          created_at?: string
          height?: number | null
          id?: string
          measured_at?: string
          muscle_mass?: number | null
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          client_id?: string
          created_at?: string
          height?: number | null
          id?: string
          measured_at?: string
          muscle_mass?: number | null
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      client_reports: {
        Row: {
          client_id: string
          created_at: string
          generated_at: string
          id: string
          professional_id: string
          report_data: Json | null
          report_type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          generated_at?: string
          id?: string
          professional_id: string
          report_data?: Json | null
          report_type: string
        }
        Update: {
          client_id?: string
          created_at?: string
          generated_at?: string
          id?: string
          professional_id?: string
          report_data?: Json | null
          report_type?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          muscle_groups: string[] | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name?: string
        }
        Relationships: []
      }
      motivational_phrases: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          phrase: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          phrase: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          phrase?: string
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          client_id: string
          created_at: string
          daily_calories: number | null
          description: string | null
          id: string
          meals: Json | null
          name: string
          professional_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          daily_calories?: number | null
          description?: string | null
          id?: string
          meals?: Json | null
          name: string
          professional_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          daily_calories?: number | null
          description?: string | null
          id?: string
          meals?: Json | null
          name?: string
          professional_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      open: {
        Row: {
          acucares: number | null
          alimento: string | null
          calorias: number | null
          carboidratos: number | null
          created_at: string
          fibras: number | null
          gorduras: number | null
          id: number
          marca: string | null
          porcao: string | null
          proteina: number | null
          sodio: number | null
        }
        Insert: {
          acucares?: number | null
          alimento?: string | null
          calorias?: number | null
          carboidratos?: number | null
          created_at?: string
          fibras?: number | null
          gorduras?: number | null
          id?: number
          marca?: string | null
          porcao?: string | null
          proteina?: number | null
          sodio?: number | null
        }
        Update: {
          acucares?: number | null
          alimento?: string | null
          calorias?: number | null
          carboidratos?: number | null
          created_at?: string
          fibras?: number | null
          gorduras?: number | null
          id?: number
          marca?: string | null
          porcao?: string | null
          proteina?: number | null
          sodio?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      psychology_goals: {
        Row: {
          client_id: string
          created_at: string
          goal_description: string | null
          goal_title: string
          id: string
          professional_id: string
          progress: number | null
          status: string | null
          target_date: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          goal_description?: string | null
          goal_title: string
          id?: string
          professional_id: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          goal_description?: string | null
          goal_title?: string
          id?: string
          professional_id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      psychology_sessions: {
        Row: {
          client_id: string
          created_at: string
          id: string
          mood_after: number | null
          mood_before: number | null
          professional_id: string
          session_date: string
          session_notes: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          professional_id: string
          session_date: string
          session_notes?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          professional_id?: string
          session_date?: string
          session_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      taco: {
        Row: {
          alimento: string | null
          calorias: number | null
          carboidrato: number | null
          created_at: string
          fibras: number | null
          gorduras: number | null
          id: number
          proteina: number | null
          sodio: number | null
        }
        Insert: {
          alimento?: string | null
          calorias?: number | null
          carboidrato?: number | null
          created_at?: string
          fibras?: number | null
          gorduras?: number | null
          id?: number
          proteina?: number | null
          sodio?: number | null
        }
        Update: {
          alimento?: string | null
          calorias?: number | null
          carboidrato?: number | null
          created_at?: string
          fibras?: number | null
          gorduras?: number | null
          id?: number
          proteina?: number | null
          sodio?: number | null
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          exercises: Json | null
          id: string
          name: string
          professional_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          exercises?: Json | null
          id?: string
          name: string
          professional_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          exercises?: Json | null
          id?: string
          name?: string
          professional_id?: string
          status?: string | null
          updated_at?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
