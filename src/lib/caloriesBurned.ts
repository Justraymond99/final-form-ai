// MET (Metabolic Equivalent of Task) values for different exercise types
// MET represents the energy cost of physical activities
// 1 MET = resting metabolic rate (~1 kcal/kg/hour)

export const exerciseMETs: Record<string, number> = {
  // Cardio
  walking: 3.5,
  jogging: 7.0,
  running: 9.8,
  cycling: 7.5,
  swimming: 8.0,
  rowing: 7.0,
  jumping_jacks: 8.0,
  burpees: 8.0,
  mountain_climbers: 8.0,
  high_knees: 8.0,
  jump_rope: 11.0,
  
  // Strength training
  weight_training: 5.0,
  strength: 5.0,
  hypertrophy: 5.0,
  bodyweight: 4.0,
  resistance: 5.0,
  
  // Specific exercises
  squats: 5.0,
  deadlifts: 6.0,
  bench_press: 5.0,
  pull_ups: 8.0,
  push_ups: 8.0,
  lunges: 5.0,
  plank: 3.0,
  
  // HIIT & Circuits
  hiit: 9.0,
  circuit: 8.0,
  tabata: 9.0,
  crossfit: 9.0,
  
  // Flexibility & Recovery
  yoga: 3.0,
  stretching: 2.5,
  pilates: 3.0,
  foam_rolling: 2.0,
  
  // Sports
  boxing: 9.0,
  martial_arts: 10.0,
  basketball: 8.0,
  soccer: 7.0,
  tennis: 7.0,
  
  // Default
  general: 5.0,
};

// Intensity multipliers
const intensityMultipliers: Record<string, number> = {
  light: 0.75,
  low: 0.75,
  beginner: 0.8,
  moderate: 1.0,
  medium: 1.0,
  intermediate: 1.0,
  high: 1.25,
  intense: 1.25,
  advanced: 1.3,
  extreme: 1.5,
};

interface CalorieCalculationParams {
  durationMinutes: number;
  exerciseType?: string;
  intensity?: string;
  weightKg?: number;
  exerciseCount?: number;
}

/**
 * Calculate estimated calories burned during a workout
 * Formula: Calories = MET × weight(kg) × duration(hours) × intensity
 */
export function calculateCaloriesBurned({
  durationMinutes,
  exerciseType = 'general',
  intensity = 'moderate',
  weightKg = 70, // Default to 70kg if not provided
  exerciseCount = 1,
}: CalorieCalculationParams): number {
  // Get MET value for exercise type
  const normalizedType = exerciseType.toLowerCase().replace(/[^a-z_]/g, '_');
  let met = exerciseMETs[normalizedType] || exerciseMETs.general;
  
  // Adjust MET based on exercise count (more exercises = higher intensity)
  if (exerciseCount > 5) {
    met *= 1.1;
  } else if (exerciseCount > 8) {
    met *= 1.2;
  }
  
  // Get intensity multiplier
  const normalizedIntensity = intensity.toLowerCase();
  const intensityMult = intensityMultipliers[normalizedIntensity] || 1.0;
  
  // Calculate calories
  // Formula: MET × weight(kg) × duration(hours) × intensity
  const durationHours = durationMinutes / 60;
  const calories = met * weightKg * durationHours * intensityMult;
  
  return Math.round(calories);
}

/**
 * Calculate calories for a specific exercise set
 */
export function calculateSetCalories(
  exerciseName: string,
  sets: number,
  reps: number | string,
  restSeconds: number,
  weightKg = 70
): number {
  const normalizedName = exerciseName.toLowerCase().replace(/[^a-z_]/g, '_');
  const met = exerciseMETs[normalizedName] || exerciseMETs.general;
  
  // Parse reps (could be "8-12" or just "10")
  const repsNum = typeof reps === 'string' 
    ? parseInt(reps.split('-')[0]) || 10 
    : reps;
  
  // Estimate time per set (reps × ~3 seconds per rep + rest)
  const timePerSetSeconds = (repsNum * 3) + restSeconds;
  const totalMinutes = (sets * timePerSetSeconds) / 60;
  
  const durationHours = totalMinutes / 60;
  const calories = met * weightKg * durationHours;
  
  return Math.round(calories);
}

/**
 * Get a formatted string for calories burned
 */
export function formatCaloriesBurned(calories: number): string {
  if (calories < 100) {
    return `${calories} cal`;
  }
  return `${Math.round(calories / 10) * 10} cal`;
}

/**
 * Get calorie burn rate per minute for an exercise type
 */
export function getCaloriesPerMinute(
  exerciseType: string,
  intensity: string = 'moderate',
  weightKg: number = 70
): number {
  const normalizedType = exerciseType.toLowerCase().replace(/[^a-z_]/g, '_');
  const met = exerciseMETs[normalizedType] || exerciseMETs.general;
  const intensityMult = intensityMultipliers[intensity.toLowerCase()] || 1.0;
  
  // MET × weight / 60 = calories per minute
  return Math.round((met * weightKg * intensityMult) / 60 * 10) / 10;
}
