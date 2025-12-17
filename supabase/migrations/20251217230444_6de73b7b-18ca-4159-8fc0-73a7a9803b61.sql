-- Update the create_default_achievements function to include more achievements
CREATE OR REPLACE FUNCTION public.create_default_achievements(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create if user doesn't have achievements yet
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE user_id = user_id_param) THEN
    INSERT INTO achievements (user_id, achievement_type, title, description, icon, target_value, current_value, completed)
    VALUES
      -- Workout Achievements
      (user_id_param, 'workouts', 'First Workout', 'Complete your first workout', '💪', 1, 0, false),
      (user_id_param, 'workouts', 'Workout Warrior', 'Complete 10 workouts', '🏋️', 10, 0, false),
      (user_id_param, 'workouts', 'Fitness Fanatic', 'Complete 50 workouts', '🔥', 50, 0, false),
      (user_id_param, 'workouts', 'Iron Legend', 'Complete 100 workouts', '🏆', 100, 0, false),
      (user_id_param, 'workouts', 'Unstoppable', 'Complete 250 workouts', '⚡', 250, 0, false),
      
      -- Streak Achievements
      (user_id_param, 'streaks', 'Getting Started', 'Maintain a 3-day workout streak', '🌱', 3, 0, false),
      (user_id_param, 'streaks', 'Week Warrior', 'Maintain a 7-day workout streak', '📅', 7, 0, false),
      (user_id_param, 'streaks', 'Two Week Terror', 'Maintain a 14-day workout streak', '💥', 14, 0, false),
      (user_id_param, 'streaks', 'Monthly Master', 'Maintain a 30-day workout streak', '🎯', 30, 0, false),
      (user_id_param, 'streaks', 'Dedication King', 'Maintain a 60-day workout streak', '👑', 60, 0, false),
      (user_id_param, 'streaks', 'Streak Legend', 'Maintain a 100-day workout streak', '🌟', 100, 0, false),
      
      -- Nutrition Achievements
      (user_id_param, 'nutrition', 'Food Logger', 'Log food for 7 days', '🍎', 7, 0, false),
      (user_id_param, 'nutrition', 'Nutrition Ninja', 'Log food for 30 days', '🥗', 30, 0, false),
      (user_id_param, 'nutrition', 'Macro Master', 'Hit your macro goals 10 times', '📊', 10, 0, false),
      (user_id_param, 'nutrition', 'Calorie Counter', 'Log 1000 meals', '🍽️', 1000, 0, false),
      (user_id_param, 'nutrition', 'Clean Eater', 'Stay within calorie goals for 7 days straight', '✨', 7, 0, false),
      
      -- Hydration Achievements
      (user_id_param, 'hydration', 'Hydration Hero', 'Log water for 7 consecutive days', '💧', 7, 0, false),
      (user_id_param, 'hydration', 'Water Warrior', 'Log water for 30 consecutive days', '🌊', 30, 0, false),
      (user_id_param, 'hydration', 'Hydration Master', 'Drink 8+ glasses daily for a week', '💦', 7, 0, false),
      
      -- Personal Record Achievements
      (user_id_param, 'personal_records', 'PR Breaker', 'Set your first personal record', '🎖️', 1, 0, false),
      (user_id_param, 'personal_records', 'Record Crusher', 'Set 10 personal records', '🏅', 10, 0, false),
      (user_id_param, 'personal_records', 'PR Machine', 'Set 50 personal records', '🥇', 50, 0, false),
      (user_id_param, 'personal_records', 'Strength Legend', 'Set 100 personal records', '💎', 100, 0, false),
      
      -- Workout Duration Achievements
      (user_id_param, 'duration', 'Hour Power', 'Complete 1 hour total workout time', '⏱️', 60, 0, false),
      (user_id_param, 'duration', 'Time Warrior', 'Complete 10 hours total workout time', '⌛', 600, 0, false),
      (user_id_param, 'duration', 'Marathon Trainer', 'Complete 50 hours total workout time', '🕐', 3000, 0, false),
      (user_id_param, 'duration', 'Time Champion', 'Complete 100 hours total workout time', '🏰', 6000, 0, false),
      
      -- Steps Achievements
      (user_id_param, 'steps', 'Step Starter', 'Walk 10,000 steps in a day', '👟', 10000, 0, false),
      (user_id_param, 'steps', 'Daily Walker', 'Walk 10,000 steps for 7 days', '🚶', 7, 0, false),
      (user_id_param, 'steps', 'Marathon Walker', 'Walk 100,000 total steps', '🦶', 100000, 0, false),
      (user_id_param, 'steps', 'Step Legend', 'Walk 1,000,000 total steps', '🌍', 1000000, 0, false),
      
      -- Challenge Achievements
      (user_id_param, 'challenges', 'Challenge Accepted', 'Join your first challenge', '🎪', 1, 0, false),
      (user_id_param, 'challenges', 'Challenge Champion', 'Complete 5 challenges', '🏁', 5, 0, false),
      (user_id_param, 'challenges', 'Challenge Master', 'Complete 20 challenges', '👊', 20, 0, false),
      
      -- Social Achievements
      (user_id_param, 'social', 'Social Butterfly', 'Add your first friend', '🤝', 1, 0, false),
      (user_id_param, 'social', 'Fitness Family', 'Have 10 friends', '👥', 10, 0, false),
      
      -- Body Measurement Achievements
      (user_id_param, 'measurements', 'Progress Tracker', 'Log body measurements 5 times', '📏', 5, 0, false),
      (user_id_param, 'measurements', 'Transformation Journey', 'Log measurements for 12 weeks', '📈', 12, 0, false),
      
      -- Recipe & Meal Plan Achievements
      (user_id_param, 'recipes', 'Recipe Explorer', 'Save your first meal plan', '📖', 1, 0, false),
      (user_id_param, 'recipes', 'Meal Prep Pro', 'Create 10 meal plans', '🍳', 10, 0, false);
  END IF;
END;
$$;