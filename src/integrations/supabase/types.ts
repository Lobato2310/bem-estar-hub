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
      client_anamnesis: {
        Row: {
          birth_date: string | null
          client_id: string
          created_at: string
          daily_meals_description: string | null
          fitness_objective: string | null
          food_restrictions: string | null
          full_name: string | null
          gender: string | null
          has_cardiac_problems: boolean | null
          has_high_blood_pressure: boolean | null
          has_high_cholesterol: boolean | null
          has_postural_deviation: boolean | null
          height: number | null
          id: string
          is_completed: boolean | null
          meal_times_description: string | null
          physical_activity_time: string | null
          physical_restrictions: string | null
          postural_deviation_description: string | null
          practices_physical_activity: boolean | null
          preferred_foods: string | null
          training_duration_minutes: number | null
          training_frequency_per_week: number | null
          updated_at: string
          weight: number | null
          whatsapp: string | null
        }
        Insert: {
          birth_date?: string | null
          client_id: string
          created_at?: string
          daily_meals_description?: string | null
          fitness_objective?: string | null
          food_restrictions?: string | null
          full_name?: string | null
          gender?: string | null
          has_cardiac_problems?: boolean | null
          has_high_blood_pressure?: boolean | null
          has_high_cholesterol?: boolean | null
          has_postural_deviation?: boolean | null
          height?: number | null
          id?: string
          is_completed?: boolean | null
          meal_times_description?: string | null
          physical_activity_time?: string | null
          physical_restrictions?: string | null
          postural_deviation_description?: string | null
          practices_physical_activity?: boolean | null
          preferred_foods?: string | null
          training_duration_minutes?: number | null
          training_frequency_per_week?: number | null
          updated_at?: string
          weight?: number | null
          whatsapp?: string | null
        }
        Update: {
          birth_date?: string | null
          client_id?: string
          created_at?: string
          daily_meals_description?: string | null
          fitness_objective?: string | null
          food_restrictions?: string | null
          full_name?: string | null
          gender?: string | null
          has_cardiac_problems?: boolean | null
          has_high_blood_pressure?: boolean | null
          has_high_cholesterol?: boolean | null
          has_postural_deviation?: boolean | null
          height?: number | null
          id?: string
          is_completed?: boolean | null
          meal_times_description?: string | null
          physical_activity_time?: string | null
          physical_restrictions?: string | null
          postural_deviation_description?: string | null
          practices_physical_activity?: boolean | null
          preferred_foods?: string | null
          training_duration_minutes?: number | null
          training_frequency_per_week?: number | null
          updated_at?: string
          weight?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
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
      client_updates: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          is_viewed: boolean | null
          professional_id: string
          update_message: string | null
          update_type: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          professional_id: string
          update_message?: string | null
          update_type: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          professional_id?: string
          update_message?: string | null
          update_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          equipment: string | null
          id: string
          instructions: string | null
          muscle_groups: string[] | null
          name: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name?: string
          video_url?: string | null
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
      professional_client_relationships: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          professional_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          professional_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          professional_id?: string
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
      user_subscriptions: {
        Row: {
          assinatura_ativa: boolean
          created_at: string
          data_expiracao: string | null
          data_inicio: string | null
          email: string
          id: string
          mercado_pago_payment_id: string | null
          mercado_pago_status: string | null
          plano: string | null
          updated_at: string
          user_id: string
          valor_pago: number | null
        }
        Insert: {
          assinatura_ativa?: boolean
          created_at?: string
          data_expiracao?: string | null
          data_inicio?: string | null
          email: string
          id?: string
          mercado_pago_payment_id?: string | null
          mercado_pago_status?: string | null
          plano?: string | null
          updated_at?: string
          user_id: string
          valor_pago?: number | null
        }
        Update: {
          assinatura_ativa?: boolean
          created_at?: string
          data_expiracao?: string | null
          data_inicio?: string | null
          email?: string
          id?: string
          mercado_pago_payment_id?: string | null
          mercado_pago_status?: string | null
          plano?: string | null
          updated_at?: string
          user_id?: string
          valor_pago?: number | null
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          client_id: string
          created_at: string
          days_per_week: number | null
          description: string | null
          exercises: Json | null
          id: string
          name: string
          plan_group_id: string | null
          professional_id: string
          status: string | null
          training_day: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          exercises?: Json | null
          id?: string
          name: string
          plan_group_id?: string | null
          professional_id: string
          status?: string | null
          training_day?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          exercises?: Json | null
          id?: string
          name?: string
          plan_group_id?: string | null
          professional_id?: string
          status?: string | null
          training_day?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_current_user_professional: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_professional: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      professional_has_client_access: {
        Args: { client_user_id: string; prof_id: string }
        Returns: boolean
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
