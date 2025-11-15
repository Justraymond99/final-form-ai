-- Seed exercise library with comprehensive exercises
INSERT INTO exercises (name, description, muscle_groups, equipment, difficulty, exercise_type, instructions) VALUES
-- Chest exercises
('Barbell Bench Press', 'Classic compound chest exercise', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'Lie on bench, lower bar to chest, press up explosively'),
('Dumbbell Chest Press', 'Versatile chest builder', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['dumbbells', 'bench'], 'beginner', 'strength', 'Lie on bench with dumbbells, press up and together at top'),
('Push-Ups', 'Bodyweight chest exercise', ARRAY['chest', 'triceps', 'core'], ARRAY['bodyweight'], 'beginner', 'strength', 'Start in plank, lower chest to ground, push back up'),
('Incline Dumbbell Press', 'Upper chest focus', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['dumbbells', 'bench'], 'intermediate', 'strength', 'Set bench to 30-45 degrees, press dumbbells up'),
('Cable Chest Fly', 'Isolation chest exercise', ARRAY['chest'], ARRAY['cables'], 'intermediate', 'strength', 'Pull cables together in front of chest with slight bend in elbows'),

-- Back exercises
('Deadlift', 'Full body compound movement', ARRAY['back', 'legs', 'core'], ARRAY['barbell'], 'advanced', 'strength', 'Hinge at hips, grip bar, stand up by extending hips and knees'),
('Pull-Ups', 'Classic back builder', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], 'intermediate', 'strength', 'Hang from bar, pull body up until chin over bar'),
('Barbell Row', 'Compound back exercise', ARRAY['back', 'biceps'], ARRAY['barbell'], 'intermediate', 'strength', 'Bend at hips, pull bar to lower chest'),
('Lat Pulldown', 'Vertical pulling movement', ARRAY['back', 'biceps'], ARRAY['cables'], 'beginner', 'strength', 'Pull bar down to upper chest while keeping torso upright'),
('Seated Cable Row', 'Horizontal pulling exercise', ARRAY['back', 'biceps'], ARRAY['cables'], 'beginner', 'strength', 'Pull handle to torso, squeeze shoulder blades together'),

-- Leg exercises
('Barbell Squat', 'King of leg exercises', ARRAY['quads', 'glutes', 'core'], ARRAY['barbell', 'rack'], 'intermediate', 'strength', 'Bar on upper back, squat down until thighs parallel, stand up'),
('Romanian Deadlift', 'Hamstring and glute builder', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['barbell'], 'intermediate', 'strength', 'Hinge at hips with slight knee bend, lower bar to shins'),
('Leg Press', 'Machine-based leg exercise', ARRAY['quads', 'glutes'], ARRAY['machine'], 'beginner', 'strength', 'Push platform away with feet, control descent'),
('Walking Lunges', 'Unilateral leg exercise', ARRAY['quads', 'glutes'], ARRAY['dumbbells'], 'beginner', 'strength', 'Step forward into lunge, alternate legs'),
('Leg Curl', 'Hamstring isolation', ARRAY['hamstrings'], ARRAY['machine'], 'beginner', 'strength', 'Curl legs up towards glutes against resistance'),

-- Shoulder exercises
('Overhead Press', 'Primary shoulder builder', ARRAY['shoulders', 'triceps'], ARRAY['barbell'], 'intermediate', 'strength', 'Press bar from shoulders to overhead, lock out arms'),
('Dumbbell Lateral Raise', 'Side delt isolation', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'Raise dumbbells out to sides until parallel with ground'),
('Face Pulls', 'Rear delt and upper back', ARRAY['shoulders', 'back'], ARRAY['cables'], 'beginner', 'strength', 'Pull rope to face, separate handles at end'),
('Arnold Press', 'Complete shoulder developer', ARRAY['shoulders'], ARRAY['dumbbells'], 'intermediate', 'strength', 'Start with palms facing you, rotate and press overhead'),

-- Arm exercises
('Barbell Curl', 'Classic bicep exercise', ARRAY['biceps'], ARRAY['barbell'], 'beginner', 'strength', 'Curl bar up to shoulders, control descent'),
('Tricep Dips', 'Compound tricep movement', ARRAY['triceps', 'chest'], ARRAY['dip bars'], 'intermediate', 'strength', 'Lower body by bending elbows, push back up'),
('Hammer Curls', 'Bicep and forearm builder', ARRAY['biceps', 'forearms'], ARRAY['dumbbells'], 'beginner', 'strength', 'Curl dumbbells with neutral grip'),
('Overhead Tricep Extension', 'Tricep stretch and strength', ARRAY['triceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'Lower weight behind head, extend arms overhead'),

-- Core exercises
('Plank', 'Isometric core exercise', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'Hold straight body position on forearms and toes'),
('Russian Twists', 'Oblique exercise', ARRAY['core', 'obliques'], ARRAY['bodyweight', 'medicine ball'], 'beginner', 'strength', 'Sit with feet elevated, rotate torso side to side'),
('Hanging Leg Raises', 'Lower ab exercise', ARRAY['core'], ARRAY['pull-up bar'], 'intermediate', 'strength', 'Hang from bar, raise legs to 90 degrees'),
('Cable Crunches', 'Weighted ab exercise', ARRAY['core'], ARRAY['cables'], 'beginner', 'strength', 'Kneel and crunch down, pulling cable from overhead'),

-- Cardio exercises
('Running', 'Cardiovascular endurance', ARRAY['legs', 'cardiovascular'], ARRAY['none'], 'beginner', 'cardio', 'Steady state or interval running'),
('Cycling', 'Low impact cardio', ARRAY['legs', 'cardiovascular'], ARRAY['bike'], 'beginner', 'cardio', 'Cycle at various intensities'),
('Rowing', 'Full body cardio', ARRAY['back', 'legs', 'cardiovascular'], ARRAY['rowing machine'], 'intermediate', 'cardio', 'Drive with legs, pull with arms in rowing motion'),
('Jump Rope', 'High intensity cardio', ARRAY['legs', 'cardiovascular'], ARRAY['jump rope'], 'beginner', 'cardio', 'Jump continuously for intervals');
