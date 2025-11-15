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
      achievements: {
        Row: {
          achievement_type: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string
          icon: string
          id: string
          target_value: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description: string
          icon: string
          id?: string
          target_value?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string
          icon?: string
          id?: string
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          arms_cm: number | null
          body_fat_percent: number | null
          chest_cm: number | null
          created_at: string
          date: string
          hips_cm: number | null
          id: string
          notes: string | null
          thighs_cm: number | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arms_cm?: number | null
          body_fat_percent?: number | null
          chest_cm?: number | null
          created_at?: string
          date?: string
          hips_cm?: number | null
          id?: string
          notes?: string | null
          thighs_cm?: number | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arms_cm?: number | null
          body_fat_percent?: number | null
          chest_cm?: number | null
          created_at?: string
          date?: string
          hips_cm?: number | null
          id?: string
          notes?: string | null
          thighs_cm?: number | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      custom_goals: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          target_date: string | null
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          target_date?: string | null
          target_value: number
          title: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          target_date?: string | null
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          calories_consumed: number | null
          created_at: string
          date: string
          id: string
          meditation_minutes: number | null
          steps: number | null
          streak_count: number | null
          updated_at: string
          user_id: string
          water_glasses: number | null
          workout_completed: boolean | null
        }
        Insert: {
          calories_consumed?: number | null
          created_at?: string
          date: string
          id?: string
          meditation_minutes?: number | null
          steps?: number | null
          streak_count?: number | null
          updated_at?: string
          user_id: string
          water_glasses?: number | null
          workout_completed?: boolean | null
        }
        Update: {
          calories_consumed?: number | null
          created_at?: string
          date?: string
          id?: string
          meditation_minutes?: number | null
          steps?: number | null
          streak_count?: number | null
          updated_at?: string
          user_id?: string
          water_glasses?: number | null
          workout_completed?: boolean | null
        }
        Relationships: []
      }
      daily_tracking: {
        Row: {
          calories_consumed: number | null
          created_at: string
          date: string
          id: string
          meditation_minutes: number | null
          steps: number | null
          updated_at: string
          user_id: string
          water_intake_ml: number | null
          workout_completed: boolean | null
          workout_streak: number | null
        }
        Insert: {
          calories_consumed?: number | null
          created_at?: string
          date?: string
          id?: string
          meditation_minutes?: number | null
          steps?: number | null
          updated_at?: string
          user_id: string
          water_intake_ml?: number | null
          workout_completed?: boolean | null
          workout_streak?: number | null
        }
        Update: {
          calories_consumed?: number | null
          created_at?: string
          date?: string
          id?: string
          meditation_minutes?: number | null
          steps?: number | null
          updated_at?: string
          user_id?: string
          water_intake_ml?: number | null
          workout_completed?: boolean | null
          workout_streak?: number | null
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          barcode: string | null
          brand: string | null
          calories: number | null
          calories_per_unit: number | null
          carbs: number | null
          carbs_g: number | null
          fat: number | null
          fat_g: number | null
          fiber: number | null
          fiber_g: number | null
          food_item_id: string | null
          food_name: string
          id: string
          logged_at: string
          meal_type: string
          protein: number | null
          protein_g: number | null
          quantity: number
          sodium: number | null
          sodium_mg: number | null
          sugar_g: number | null
          unit: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories?: number | null
          calories_per_unit?: number | null
          carbs?: number | null
          carbs_g?: number | null
          fat?: number | null
          fat_g?: number | null
          fiber?: number | null
          fiber_g?: number | null
          food_item_id?: string | null
          food_name: string
          id?: string
          logged_at?: string
          meal_type: string
          protein?: number | null
          protein_g?: number | null
          quantity: number
          sodium?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          unit: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories?: number | null
          calories_per_unit?: number | null
          carbs?: number | null
          carbs_g?: number | null
          fat?: number | null
          fat_g?: number | null
          fiber?: number | null
          fiber_g?: number | null
          food_item_id?: string | null
          food_name?: string
          id?: string
          logged_at?: string
          meal_type?: string
          protein?: number | null
          protein_g?: number | null
          quantity?: number
          sodium?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          goal_type: string
          id: string
          target_date: string | null
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          goal_type: string
          id?: string
          target_date?: string | null
          target_value: number
          title: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          goal_type?: string
          id?: string
          target_date?: string | null
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          fat_g: number | null
          fiber_g: number | null
          food_name: string
          id: string
          instructions: string | null
          meal_plan_id: string
          meal_type: string
          protein_g: number | null
          quantity: number
          sodium_mg: number | null
          sugar_g: number | null
          unit: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name: string
          id?: string
          instructions?: string | null
          meal_plan_id: string
          meal_type: string
          protein_g?: number | null
          quantity: number
          sodium_mg?: number | null
          sugar_g?: number | null
          unit: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name?: string
          id?: string
          instructions?: string | null
          meal_plan_id?: string
          meal_type?: string
          protein_g?: number | null
          quantity?: number
          sodium_mg?: number | null
          sugar_g?: number | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          description: string | null
          dietary_preferences: Json | null
          goal: string | null
          id: string
          is_active: boolean | null
          name: string
          plan_data: Json
          target_calories: number | null
          target_carbs: number | null
          target_fat: number | null
          target_protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dietary_preferences?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          plan_data?: Json
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dietary_preferences?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          plan_data?: Json
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      multi_week_nutrition_plans: {
        Row: {
          created_at: string
          description: string | null
          goal: string
          id: string
          name: string
          updated_at: string
          user_id: string
          weekly_plans: Json
          weeks: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          weekly_plans?: Json
          weeks?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          goal?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          weekly_plans?: Json
          weeks?: number
        }
        Relationships: []
      }
      multi_week_workout_plans: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          id: string
          name: string
          updated_at: string
          user_id: string
          weekly_plans: Json
          weeks: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          weekly_plans?: Json
          weeks?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          weekly_plans?: Json
          weeks?: number
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          notification_type: string
          scheduled_for: string
          sent: boolean | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          notification_type: string
          scheduled_for: string
          sent?: boolean | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          notification_type?: string
          scheduled_for?: string
          sent?: boolean | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          notes: string | null
          recorded_at: string
          reps: number
          updated_at: string
          user_id: string
          weight_kg: number
          workout_session_id: string | null
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          notes?: string | null
          recorded_at?: string
          reps: number
          updated_at?: string
          user_id: string
          weight_kg: number
          workout_session_id?: string | null
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          reps?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[] | null
          budget_preference: string | null
          created_at: string
          daily_calorie_goal: number | null
          daily_carb_goal: number | null
          daily_fat_goal: number | null
          daily_protein_goal: number | null
          date_of_birth: string | null
          dietary_preferences: string[] | null
          dietary_restrictions: string[] | null
          display_name: string | null
          email: string | null
          fitness_goals: string[] | null
          food_preferences: Json | null
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          organic_preference: boolean | null
          preferred_stores: string[] | null
          target_calories_per_day: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_protein_g: number | null
          target_weight_kg: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          budget_preference?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          daily_carb_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          email?: string | null
          fitness_goals?: string[] | null
          food_preferences?: Json | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          organic_preference?: boolean | null
          preferred_stores?: string[] | null
          target_calories_per_day?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_protein_g?: number | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          budget_preference?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          daily_carb_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          email?: string | null
          fitness_goals?: string[] | null
          food_preferences?: Json | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          organic_preference?: boolean | null
          preferred_stores?: string[] | null
          target_calories_per_day?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_protein_g?: number | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      scheduled_workouts: {
        Row: {
          completed: boolean | null
          completed_session_id: string | null
          created_at: string
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          updated_at: string
          user_id: string
          workout_template_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_session_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          updated_at?: string
          user_id: string
          workout_template_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_session_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          updated_at?: string
          user_id?: string
          workout_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_workouts_completed_session_id_fkey"
            columns: ["completed_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_workouts_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string | null
          blocked: boolean | null
          created_at: string
          endpoint: string | null
          expires_at: string
          id: string
          ip_address: unknown
          request_count: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          blocked?: boolean | null
          created_at?: string
          endpoint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          blocked?: boolean | null
          created_at?: string
          endpoint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          brand: string | null
          created_at: string
          estimated_price: number | null
          id: string
          image_url: string | null
          is_purchased: boolean | null
          product_id: string | null
          product_name: string
          quantity: number
          shopping_list_id: string
          store_url: string | null
          unit: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          image_url?: string | null
          is_purchased?: boolean | null
          product_id?: string | null
          product_name: string
          quantity?: number
          shopping_list_id: string
          store_url?: string | null
          unit?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          image_url?: string | null
          is_purchased?: boolean | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          shopping_list_id?: string
          store_url?: string | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          store_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          store_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          store_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_intake: {
        Row: {
          date: string
          glasses: number
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          date?: string
          glasses?: number
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          date?: string
          glasses?: number
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          date: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          date?: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          date?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          exercises_data: Json
          id: string
          is_paused: boolean | null
          name: string
          notes: string | null
          paused_at: string | null
          started_at: string
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          exercises_data?: Json
          id?: string
          is_paused?: boolean | null
          name: string
          notes?: string | null
          paused_at?: string | null
          started_at?: string
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          exercises_data?: Json
          id?: string
          is_paused?: boolean | null
          name?: string
          notes?: string | null
          paused_at?: string | null
          started_at?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          estimated_duration: number | null
          exercises: Json
          id: string
          name: string
          scheduled_days: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_duration?: number | null
          exercises?: Json
          id?: string
          name: string
          scheduled_days?: Json | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_duration?: number | null
          exercises?: Json
          id?: string
          name?: string
          scheduled_days?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          difficulty: string
          duration_minutes: number | null
          exercises: Json
          id: string
          is_template: boolean | null
          name: string
          target_muscles: string[] | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty: string
          duration_minutes?: number | null
          exercises: Json
          id?: string
          is_template?: boolean | null
          name: string
          target_muscles?: string[] | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          is_template?: boolean | null
          name?: string
          target_muscles?: string[] | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_achievements: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      cleanup_expired_audit_logs: { Args: never; Returns: undefined }
      create_default_achievements: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      create_default_goals: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      create_default_workout_templates: {
        Args: { user_id_param: string }
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
