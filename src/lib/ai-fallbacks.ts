// Fallback responses for AI features when API is unavailable

export interface FallbackWorkout {
  name: string;
  description: string;
  type: string;
  difficulty: string;
  estimated_duration: number;
  target_muscles: string[];
  equipment_needed: string[];
  warm_up: Array<{
    exercise: string;
    duration_seconds: number;
    instructions: string;
  }>;
  main_exercises: Array<{
    exercise: string;
    sets: number;
    reps: string | number;
    rest_seconds: number;
    instructions: string;
  }>;
  cool_down: Array<{
    exercise: string;
    duration_seconds: number;
    instructions: string;
  }>;
  notes: string;
}

export const fallbackWorkouts: Record<string, FallbackWorkout> = {
  strength_beginner: {
    name: "Beginner Full Body Strength",
    description: "A balanced workout targeting all major muscle groups with basic movements.",
    type: "strength",
    difficulty: "beginner",
    estimated_duration: 30,
    target_muscles: ["chest", "back", "legs", "shoulders", "core"],
    equipment_needed: ["bodyweight"],
    warm_up: [
      { exercise: "Arm Circles", duration_seconds: 30, instructions: "Circle arms forward then backward" },
      { exercise: "Leg Swings", duration_seconds: 30, instructions: "Swing each leg forward and back" },
      { exercise: "Marching in Place", duration_seconds: 60, instructions: "Lift knees high, pump arms" }
    ],
    main_exercises: [
      { exercise: "Push-ups (or Knee Push-ups)", sets: 3, reps: "8-12", rest_seconds: 60, instructions: "Lower chest to floor, push back up" },
      { exercise: "Bodyweight Squats", sets: 3, reps: "12-15", rest_seconds: 60, instructions: "Sit back, keep chest up, drive through heels" },
      { exercise: "Plank Hold", sets: 3, reps: "20-30 seconds", rest_seconds: 45, instructions: "Keep body straight, engage core" },
      { exercise: "Glute Bridges", sets: 3, reps: "12-15", rest_seconds: 45, instructions: "Squeeze glutes at top, lower slowly" },
      { exercise: "Superman Hold", sets: 3, reps: "10-12", rest_seconds: 45, instructions: "Lift arms and legs, squeeze back" }
    ],
    cool_down: [
      { exercise: "Child's Pose", duration_seconds: 30, instructions: "Sit back on heels, arms extended" },
      { exercise: "Standing Quad Stretch", duration_seconds: 30, instructions: "Hold each leg for 15 seconds" },
      { exercise: "Chest Stretch", duration_seconds: 30, instructions: "Arms behind, open chest" }
    ],
    notes: "Focus on form over speed. Rest as needed between exercises."
  },
  hiit_intermediate: {
    name: "HIIT Cardio Blast",
    description: "High-intensity intervals to boost metabolism and burn calories.",
    type: "hiit",
    difficulty: "intermediate",
    estimated_duration: 25,
    target_muscles: ["full body", "cardio"],
    equipment_needed: ["bodyweight"],
    warm_up: [
      { exercise: "Jumping Jacks", duration_seconds: 45, instructions: "Full range of motion" },
      { exercise: "High Knees", duration_seconds: 45, instructions: "Drive knees up, pump arms" },
      { exercise: "Butt Kicks", duration_seconds: 30, instructions: "Kick heels to glutes" }
    ],
    main_exercises: [
      { exercise: "Burpees", sets: 4, reps: "30 seconds work, 15 rest", rest_seconds: 15, instructions: "Drop, push-up, jump up" },
      { exercise: "Mountain Climbers", sets: 4, reps: "30 seconds work, 15 rest", rest_seconds: 15, instructions: "Alternate driving knees to chest" },
      { exercise: "Jump Squats", sets: 4, reps: "30 seconds work, 15 rest", rest_seconds: 15, instructions: "Squat down, explode up" },
      { exercise: "Plank Jacks", sets: 4, reps: "30 seconds work, 15 rest", rest_seconds: 15, instructions: "Jump feet out and in while in plank" },
      { exercise: "Speed Skaters", sets: 4, reps: "30 seconds work, 15 rest", rest_seconds: 15, instructions: "Lateral hops, touch floor" }
    ],
    cool_down: [
      { exercise: "Standing Forward Fold", duration_seconds: 30, instructions: "Let head hang, relax" },
      { exercise: "Pigeon Pose", duration_seconds: 60, instructions: "30 seconds each side" },
      { exercise: "Deep Breathing", duration_seconds: 60, instructions: "4 counts in, 4 counts out" }
    ],
    notes: "Push hard during work intervals, but listen to your body."
  },
  strength_advanced: {
    name: "Advanced Push-Pull-Legs",
    description: "Challenging compound movements for experienced lifters.",
    type: "strength",
    difficulty: "advanced",
    estimated_duration: 60,
    target_muscles: ["chest", "back", "shoulders", "legs", "arms"],
    equipment_needed: ["dumbbells", "barbell", "bench", "pull-up bar"],
    warm_up: [
      { exercise: "Dynamic Stretching", duration_seconds: 120, instructions: "Arm swings, leg swings, torso twists" },
      { exercise: "Light Cardio", duration_seconds: 180, instructions: "Jump rope or jogging" }
    ],
    main_exercises: [
      { exercise: "Barbell Squats", sets: 4, reps: "6-8", rest_seconds: 180, instructions: "Full depth, drive through heels" },
      { exercise: "Bench Press", sets: 4, reps: "6-8", rest_seconds: 150, instructions: "Control descent, explosive push" },
      { exercise: "Pull-ups", sets: 4, reps: "8-10", rest_seconds: 120, instructions: "Full range, chin over bar" },
      { exercise: "Romanian Deadlifts", sets: 3, reps: "8-10", rest_seconds: 120, instructions: "Hinge at hips, feel hamstring stretch" },
      { exercise: "Overhead Press", sets: 3, reps: "8-10", rest_seconds: 120, instructions: "Lock out at top, control down" },
      { exercise: "Barbell Rows", sets: 3, reps: "8-10", rest_seconds: 90, instructions: "Pull to lower chest, squeeze back" }
    ],
    cool_down: [
      { exercise: "Full Body Stretching", duration_seconds: 180, instructions: "Hit all major muscle groups" },
      { exercise: "Foam Rolling", duration_seconds: 120, instructions: "Focus on sore areas" }
    ],
    notes: "Proper warm-up sets before working weight. Focus on progressive overload."
  }
};

export const fallbackMealPlans = {
  weight_loss: {
    name: "Balanced Weight Loss Plan",
    description: "A calorie-controlled meal plan with high protein to support fat loss.",
    daily_calories: 1800,
    macros: { protein_g: 150, carbs_g: 150, fat_g: 60 },
    meals: [
      { meal_type: "breakfast", name: "Greek Yogurt with Berries", calories: 350, protein_g: 25, carbs_g: 35, fat_g: 10 },
      { meal_type: "lunch", name: "Grilled Chicken Salad", calories: 450, protein_g: 40, carbs_g: 25, fat_g: 18 },
      { meal_type: "dinner", name: "Salmon with Roasted Vegetables", calories: 550, protein_g: 45, carbs_g: 30, fat_g: 22 },
      { meal_type: "snack", name: "Protein Shake with Almonds", calories: 300, protein_g: 30, carbs_g: 15, fat_g: 12 },
      { meal_type: "snack", name: "Apple with Peanut Butter", calories: 150, protein_g: 4, carbs_g: 20, fat_g: 8 }
    ]
  },
  muscle_gain: {
    name: "Muscle Building Plan",
    description: "High protein, calorie surplus for muscle growth.",
    daily_calories: 2800,
    macros: { protein_g: 200, carbs_g: 300, fat_g: 80 },
    meals: [
      { meal_type: "breakfast", name: "Oatmeal with Eggs and Avocado", calories: 600, protein_g: 35, carbs_g: 55, fat_g: 25 },
      { meal_type: "lunch", name: "Chicken Rice Bowl", calories: 700, protein_g: 50, carbs_g: 80, fat_g: 15 },
      { meal_type: "dinner", name: "Steak with Sweet Potato", calories: 750, protein_g: 55, carbs_g: 60, fat_g: 25 },
      { meal_type: "snack", name: "Protein Shake with Banana", calories: 400, protein_g: 40, carbs_g: 50, fat_g: 8 },
      { meal_type: "snack", name: "Cottage Cheese with Nuts", calories: 350, protein_g: 25, carbs_g: 15, fat_g: 20 }
    ]
  }
};

export const fallbackChatResponses: Record<string, string> = {
  greeting: "Hi! I'm your AI fitness assistant. I can help with workout advice, nutrition tips, and motivation. What would you like to focus on today?",
  workout: "Great question about workouts! For best results, aim for 3-4 strength training sessions per week, focusing on compound movements like squats, deadlifts, and presses. Make sure to progressively increase weight or reps over time.",
  nutrition: "Nutrition is key to reaching your goals! Focus on getting enough protein (0.7-1g per pound of bodyweight), eating plenty of vegetables, and staying hydrated. What specific nutrition question do you have?",
  motivation: "Remember, consistency beats perfection! Every workout counts, even the short ones. Focus on showing up regularly, and the results will follow. You've got this!",
  recovery: "Rest is when your muscles grow! Aim for 7-9 hours of sleep, stay hydrated, and consider active recovery like walking or light stretching on off days.",
  default: "Thanks for your question! While I process that, here's a tip: focus on progressive overload in your workouts and consistency in your nutrition. These two factors drive the majority of results."
};

// Get a fallback workout based on type and difficulty
export function getFallbackWorkout(type?: string, difficulty?: string): FallbackWorkout {
  const key = `${type || 'strength'}_${difficulty || 'beginner'}`;
  return fallbackWorkouts[key] || fallbackWorkouts.strength_beginner;
}

// Get a fallback chat response based on message content
export function getFallbackChatResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return fallbackChatResponses.greeting;
  }
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('training')) {
    return fallbackChatResponses.workout;
  }
  if (lower.includes('food') || lower.includes('eat') || lower.includes('diet') || lower.includes('nutrition')) {
    return fallbackChatResponses.nutrition;
  }
  if (lower.includes('motivation') || lower.includes('tired') || lower.includes('give up')) {
    return fallbackChatResponses.motivation;
  }
  if (lower.includes('rest') || lower.includes('recovery') || lower.includes('sore') || lower.includes('sleep')) {
    return fallbackChatResponses.recovery;
  }
  
  return fallbackChatResponses.default;
}

// Get a fallback meal plan based on goal
export function getFallbackMealPlan(goal?: string) {
  if (goal?.includes('muscle') || goal?.includes('gain') || goal?.includes('bulk')) {
    return fallbackMealPlans.muscle_gain;
  }
  return fallbackMealPlans.weight_loss;
}
