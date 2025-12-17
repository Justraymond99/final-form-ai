-- Optimize RLS policies to use (select auth.uid()) instead of auth.uid()
-- This prevents the auth function from being re-evaluated for each row

-- achievements
DROP POLICY IF EXISTS "Users can manage their own achievements" ON public.achievements;
CREATE POLICY "Users can manage their own achievements" ON public.achievements
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- custom_goals
DROP POLICY IF EXISTS "Users can manage their own custom goals" ON public.custom_goals;
CREATE POLICY "Users can manage their own custom goals" ON public.custom_goals
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- daily_stats
DROP POLICY IF EXISTS "Users can manage their own daily stats" ON public.daily_stats;
CREATE POLICY "Users can manage their own daily stats" ON public.daily_stats
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- daily_tracking
DROP POLICY IF EXISTS "Users can manage their own daily tracking" ON public.daily_tracking;
CREATE POLICY "Users can manage their own daily tracking" ON public.daily_tracking
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- food_logs
DROP POLICY IF EXISTS "Users can manage their own food logs" ON public.food_logs;
CREATE POLICY "Users can manage their own food logs" ON public.food_logs
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- goals
DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;
CREATE POLICY "Users can manage their own goals" ON public.goals
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- shopping_list_items
DROP POLICY IF EXISTS "Users can manage their own shopping list items" ON public.shopping_list_items;
CREATE POLICY "Users can manage their own shopping list items" ON public.shopping_list_items
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- shopping_lists
DROP POLICY IF EXISTS "Users can manage their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can manage their own shopping lists" ON public.shopping_lists
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- water_intake
DROP POLICY IF EXISTS "Users can manage their own water intake" ON public.water_intake;
CREATE POLICY "Users can manage their own water intake" ON public.water_intake
FOR ALL USING ((select auth.uid()) = user_id);

-- water_logs
DROP POLICY IF EXISTS "Users can manage their own water logs" ON public.water_logs;
CREATE POLICY "Users can manage their own water logs" ON public.water_logs
FOR ALL USING ((select auth.uid()) = user_id);

-- workout_sessions
DROP POLICY IF EXISTS "Users can manage their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can manage their own workout sessions" ON public.workout_sessions
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- workout_templates
DROP POLICY IF EXISTS "Users can manage their own workout templates" ON public.workout_templates;
CREATE POLICY "Users can manage their own workout templates" ON public.workout_templates
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- workouts
DROP POLICY IF EXISTS "Users can manage their own workouts" ON public.workouts;
CREATE POLICY "Users can manage their own workouts" ON public.workouts
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- meal_plans
DROP POLICY IF EXISTS "Users can manage their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can manage their own meal plans" ON public.meal_plans
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- meal_plan_items
DROP POLICY IF EXISTS "Users can manage their own meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can manage their own meal plan items" ON public.meal_plan_items
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));

-- multi_week_nutrition_plans
DROP POLICY IF EXISTS "Users can view their own multi-week nutrition plans" ON public.multi_week_nutrition_plans;
DROP POLICY IF EXISTS "Users can create their own multi-week nutrition plans" ON public.multi_week_nutrition_plans;
DROP POLICY IF EXISTS "Users can update their own multi-week nutrition plans" ON public.multi_week_nutrition_plans;
DROP POLICY IF EXISTS "Users can delete their own multi-week nutrition plans" ON public.multi_week_nutrition_plans;
CREATE POLICY "Users can view their own multi-week nutrition plans" ON public.multi_week_nutrition_plans FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own multi-week nutrition plans" ON public.multi_week_nutrition_plans FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own multi-week nutrition plans" ON public.multi_week_nutrition_plans FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own multi-week nutrition plans" ON public.multi_week_nutrition_plans FOR DELETE USING ((select auth.uid()) = user_id);

-- multi_week_workout_plans
DROP POLICY IF EXISTS "Users can view their own multi-week workout plans" ON public.multi_week_workout_plans;
DROP POLICY IF EXISTS "Users can create their own multi-week workout plans" ON public.multi_week_workout_plans;
DROP POLICY IF EXISTS "Users can update their own multi-week workout plans" ON public.multi_week_workout_plans;
DROP POLICY IF EXISTS "Users can delete their own multi-week workout plans" ON public.multi_week_workout_plans;
CREATE POLICY "Users can view their own multi-week workout plans" ON public.multi_week_workout_plans FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own multi-week workout plans" ON public.multi_week_workout_plans FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own multi-week workout plans" ON public.multi_week_workout_plans FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own multi-week workout plans" ON public.multi_week_workout_plans FOR DELETE USING ((select auth.uid()) = user_id);

-- personal_records
DROP POLICY IF EXISTS "Users can view their own personal records" ON public.personal_records;
DROP POLICY IF EXISTS "Users can insert their own personal records" ON public.personal_records;
DROP POLICY IF EXISTS "Users can update their own personal records" ON public.personal_records;
DROP POLICY IF EXISTS "Users can delete their own personal records" ON public.personal_records;
CREATE POLICY "Users can view their own personal records" ON public.personal_records FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own personal records" ON public.personal_records FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own personal records" ON public.personal_records FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own personal records" ON public.personal_records FOR DELETE USING ((select auth.uid()) = user_id);

-- scheduled_workouts
DROP POLICY IF EXISTS "Users can view their own scheduled workouts" ON public.scheduled_workouts;
DROP POLICY IF EXISTS "Users can insert their own scheduled workouts" ON public.scheduled_workouts;
DROP POLICY IF EXISTS "Users can update their own scheduled workouts" ON public.scheduled_workouts;
DROP POLICY IF EXISTS "Users can delete their own scheduled workouts" ON public.scheduled_workouts;
CREATE POLICY "Users can view their own scheduled workouts" ON public.scheduled_workouts FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own scheduled workouts" ON public.scheduled_workouts FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own scheduled workouts" ON public.scheduled_workouts FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own scheduled workouts" ON public.scheduled_workouts FOR DELETE USING ((select auth.uid()) = user_id);

-- notification_queue
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notification_queue;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notification_queue;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notification_queue;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notification_queue;
CREATE POLICY "Users can view their own notifications" ON public.notification_queue FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own notifications" ON public.notification_queue FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notification_queue FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notification_queue FOR DELETE USING ((select auth.uid()) = user_id);

-- feedback
DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING ((select auth.uid()) = user_id);

-- progress_photos
DROP POLICY IF EXISTS "Users can manage their own progress photos" ON public.progress_photos;
CREATE POLICY "Users can manage their own progress photos" ON public.progress_photos
FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- recipes
DROP POLICY IF EXISTS "Users can view public recipes and their own" ON public.recipes;
DROP POLICY IF EXISTS "Users can create their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
CREATE POLICY "Users can view public recipes and their own" ON public.recipes FOR SELECT USING ((is_public = true) OR ((select auth.uid()) = user_id));
CREATE POLICY "Users can create their own recipes" ON public.recipes FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING ((select auth.uid()) = user_id);

-- workout_timers
DROP POLICY IF EXISTS "Users can manage their own workout timers" ON public.workout_timers;
CREATE POLICY "Users can manage their own workout timers" ON public.workout_timers
FOR ALL USING ((select auth.uid()) = user_id);

-- challenges
DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view their own challenges" ON public.challenges;
CREATE POLICY "Users can create challenges" ON public.challenges FOR INSERT WITH CHECK ((select auth.uid()) = created_by);
CREATE POLICY "Users can update their own challenges" ON public.challenges FOR UPDATE USING ((select auth.uid()) = created_by);
CREATE POLICY "Users can delete their own challenges" ON public.challenges FOR DELETE USING ((select auth.uid()) = created_by);
CREATE POLICY "Users can view their own challenges" ON public.challenges FOR SELECT USING ((select auth.uid()) = created_by);

-- recent_searches
DROP POLICY IF EXISTS "Users can view their own recent searches" ON public.recent_searches;
DROP POLICY IF EXISTS "Users can insert their own recent searches" ON public.recent_searches;
DROP POLICY IF EXISTS "Users can delete their own recent searches" ON public.recent_searches;
CREATE POLICY "Users can view their own recent searches" ON public.recent_searches FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own recent searches" ON public.recent_searches FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own recent searches" ON public.recent_searches FOR DELETE USING ((select auth.uid()) = user_id);

-- generation_history
DROP POLICY IF EXISTS "Users can manage their own generation history" ON public.generation_history;
CREATE POLICY "Users can manage their own generation history" ON public.generation_history
FOR ALL USING (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL))
WITH CHECK (((select auth.uid()) = user_id) AND ((select auth.uid()) IS NOT NULL));