import { ProgressRing } from "@/components/ProgressRing";
import { StatsCard } from "@/components/StatsCard";
import { QuickActions } from "@/components/QuickActions";
import { TodayStreak } from "@/components/TodayStreak";
import { NextWorkout } from "@/components/NextWorkout";
import { SwipeableNavigation } from "@/components/SwipeableNavigation";
import { AIChatbot } from "@/components/AIChatbot";
import { useProfile } from "@/hooks/useProfile";
import { useDailyTracking } from "@/hooks/useDailyTracking";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAuth } from "@/hooks/useAuth";
import { ManualStepsDialog } from "@/components/ManualStepsDialog";
import { ManualMeditationDialog } from "@/components/ManualMeditationDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Flame, 
  Droplets, 
  Brain, 
  Zap, 
  Target,
  TrendingUp,
  Award,
  Clock,
  Dumbbell
} from "lucide-react";

const Index = () => {
  const { profile } = useProfile();
  const { data: dailyData, updateSteps, updateMeditation } = useDailyTracking();
  const { templates } = useWorkouts();
  const [actualCalories, setActualCalories] = useState(0);
  const { user } = useAuth();
  
  // Fetch actual calories from food_logs
  useEffect(() => {
    const fetchCalories = async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      try {
        const { data, error } = await supabase
          .from('food_logs')
          .select('calories')
          .eq('user_id', user.id)
          .gte('logged_at', `${today}T00:00:00`)
          .lt('logged_at', `${today}T23:59:59`);

        if (error) throw error;
        
        const totalCalories = data?.reduce((total, food) => total + (food.calories || 0), 0) || 0;
        setActualCalories(totalCalories);
      } catch (error) {
        console.error('Error fetching calories:', error);
      }
    };

    fetchCalories();
    
    // Refresh calories when page comes into focus
    const handleFocus = () => fetchCalories();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile?.display_name?.split(' ')[0] || 'there';
  
  // Use real data from database - starts at 0 and updates with user activity
  const todayProgress = {
    calories: { 
      current: actualCalories, // Use actual calories from food_logs
      target: 2200 // Default for now
    },
    water: { 
      current: Math.round((dailyData?.water_intake_ml || 0) / 250), // Convert to glasses
      target: 8 
    },
    meditation: { 
      current: dailyData?.meditation_minutes || 0, 
      target: 20 
    },
    steps: { 
      current: dailyData?.steps || 0, 
      target: 10000 
    }
  };

  // Get next workout based on day rotation
  const getDayOfWeek = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const getNextWorkout = () => {
    const today = getDayOfWeek();
    
    // Find workout scheduled for today
    const todaysWorkout = templates.find(template => {
      const scheduledDays = Array.isArray((template as any).scheduled_days) ? (template as any).scheduled_days : [];
      return scheduledDays.includes(today);
    });

    if (todaysWorkout) {
      return {
        name: todaysWorkout.name,
        duration_minutes: todaysWorkout.estimated_duration,
        target_muscles: ["Full Body"], // Default since we don't have this field
        difficulty: todaysWorkout.difficulty
      };
    }

    // Fallback to first template or default
    return templates[0] ? {
      name: templates[0].name,
      duration_minutes: templates[0].estimated_duration,
      target_muscles: ["Full Body"],
      difficulty: templates[0].difficulty
    } : {
      name: "Push Day - Chest & Triceps",
      duration_minutes: 42,
      target_muscles: ["Chest", "Triceps", "Shoulders"],
      difficulty: "Intermediate"
    };
  };

  const nextWorkout = getNextWorkout();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-6 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, {firstName}! 👋</h1>
              <p className="text-muted-foreground">Ready to crush your fitness goals?</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-background">
                {firstName ? firstName[0].toUpperCase() : 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Rings Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Today's Progress</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <ProgressRing
                progress={(todayProgress.calories.current / todayProgress.calories.target) * 100}
                size={100}
                color="hsl(var(--energy))"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {Math.round((todayProgress.calories.current / todayProgress.calories.target) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
              </ProgressRing>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-foreground">
                  {todayProgress.calories.current} / {todayProgress.calories.target}
                </div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing
                progress={(todayProgress.water.current / todayProgress.water.target) * 100}
                size={100}
                color="hsl(var(--hydration))"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {Math.round((todayProgress.water.current / todayProgress.water.target) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Water</div>
                </div>
              </ProgressRing>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-foreground">
                  {todayProgress.water.current} / {todayProgress.water.target}
                </div>
                <div className="text-xs text-muted-foreground">glasses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <StatsCard
                title="Steps Today"
                value={todayProgress.steps.current.toLocaleString()}
                icon={Target}
                gradient="gradient-wellness"
                trend={{ value: 12, isPositive: true }}
              />
              <ManualStepsDialog 
                currentSteps={todayProgress.steps.current} 
                onUpdateSteps={(steps) => updateSteps(steps)} 
              />
            </div>
            <div className="space-y-2">
              <StatsCard
                title="Meditation"
                value={todayProgress.meditation.current}
                unit="min"
                icon={Brain}
                gradient="gradient-hydration"
                trend={{ value: 5, isPositive: true }}
              />
              <ManualMeditationDialog
                currentMinutes={todayProgress.meditation.current}
                onUpdateMeditation={(minutes) => updateMeditation(minutes)}
              />
            </div>
            <StatsCard
              title="Workout Streak"
              value={dailyData?.workout_streak?.toString() || "0"}
              unit="days"
              icon={Flame}
              gradient="gradient-strength"
              trend={{ value: dailyData?.workout_streak || 0, isPositive: true }}
            />
            <StatsCard
              title="Weekly Goal"
              value={Math.round((actualCalories / 2200) * 100).toString()}
              unit="%"
              icon={Award}
              gradient="gradient-energy"
              trend={{ value: 15, isPositive: true }}
            />
          </div>
        </div>

        {/* Streak Section */}
        <div className="mb-8">
          <TodayStreak 
            currentStreak={dailyData?.workout_streak || 0} 
            isActiveToday={dailyData?.workout_completed || false} 
          />
        </div>

        {/* Next Workout */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Up Next</h2>
          <NextWorkout
            workoutName={nextWorkout.name}
            estimatedTime={nextWorkout.duration_minutes}
            targetMuscles={nextWorkout.target_muscles}
            difficulty={nextWorkout.difficulty as "Intermediate" | "Beginner" | "Advanced"}
            onStart={() => console.log("Starting workout...")}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <QuickActions />
        </div>
      </div>
      <SwipeableNavigation />
      <AIChatbot />
    </div>
  );
};

export default Index;
