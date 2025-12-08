import { z } from 'zod';

// Common validation schemas using Zod for type-safe validation

// User profile schema
export const profileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(13).max(120).optional(),
  weight_kg: z.number().min(20).max(500).optional(),
  height_cm: z.number().int().min(50).max(300).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goal: z.enum(['lose_weight', 'maintain', 'gain_muscle', 'improve_fitness']).optional(),
  fitness_goals: z.array(z.string()).max(10).optional(),
  dietary_preferences: z.array(z.string()).max(10).optional(),
  dietary_restrictions: z.array(z.string()).max(10).optional(),
  allergies: z.array(z.string()).max(20).optional(),
});

// Food log schema
export const foodLogSchema = z.object({
  food_name: z.string().min(1).max(200),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  quantity: z.number().positive().max(10000),
  unit: z.string().min(1).max(50),
  calories: z.number().min(0).max(50000).optional(),
  protein_g: z.number().min(0).max(1000).optional(),
  carbs_g: z.number().min(0).max(1000).optional(),
  fat_g: z.number().min(0).max(1000).optional(),
  fiber_g: z.number().min(0).max(500).optional(),
  barcode: z.string().max(50).optional(),
  brand: z.string().max(100).optional(),
});

// Water log schema
export const waterLogSchema = z.object({
  amount_ml: z.number().int().positive().max(10000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Goal schema
export const goalSchema = z.object({
  title: z.string().min(1).max(100),
  goal_type: z.string().min(1).max(50),
  target_value: z.number().positive().max(1000000),
  unit: z.string().min(1).max(50),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().max(500).optional(),
});

// Workout template schema
export const workoutTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimated_duration: z.number().int().positive().max(480).optional(),
  exercises: z.array(z.object({
    name: z.string().min(1).max(100),
    sets: z.number().int().positive().max(20).optional(),
    reps: z.union([z.string(), z.number()]).optional(),
    rest: z.number().int().min(0).max(600).optional(),
    weight: z.number().min(0).max(2000).optional(),
    notes: z.string().max(200).optional(),
  })).max(50),
});

// AI workout request schema
export const aiWorkoutRequestSchema = z.object({
  workoutType: z.string().max(50).optional(),
  duration: z.number().int().positive().max(180).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  targetMuscles: z.array(z.string().max(50)).max(10).optional(),
  equipment: z.array(z.string().max(50)).max(20).optional(),
  goals: z.array(z.string().max(100)).max(5).optional(),
  injuries: z.array(z.string().max(100)).max(10).optional(),
  preferences: z.string().max(500).optional(),
});

// AI generated workout response schema
export const aiWorkoutResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_duration: z.number(),
  target_muscles: z.array(z.string()),
  equipment_needed: z.array(z.string()),
  warm_up: z.array(z.object({
    exercise: z.string(),
    duration_seconds: z.number(),
    instructions: z.string(),
    tips: z.string().optional(),
  })),
  main_exercises: z.array(z.object({
    exercise: z.string(),
    sets: z.number(),
    reps: z.union([z.string(), z.number()]),
    rest_seconds: z.number(),
    instructions: z.string(),
    modifications: z.string().optional(),
    target_muscles: z.array(z.string()).optional(),
  })),
  cool_down: z.array(z.object({
    exercise: z.string(),
    duration_seconds: z.number(),
    instructions: z.string(),
    benefits: z.string().optional(),
  })),
  notes: z.string().optional(),
  progression_tips: z.string().optional(),
});

// AI meal plan response schema
export const aiMealPlanResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  daily_calories: z.number(),
  macros: z.object({
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
  }),
  meals: z.array(z.object({
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    name: z.string(),
    calories: z.number(),
    protein_g: z.number().optional(),
    carbs_g: z.number().optional(),
    fat_g: z.number().optional(),
    ingredients: z.array(z.string()).optional(),
    instructions: z.string().optional(),
  })),
});

// Helper function to validate and parse data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return { success: false, errors };
}

// Sanitize string input (remove potential XSS)
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : 
        item
      );
    }
  }
  
  return result;
}
