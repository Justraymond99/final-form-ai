import { ProgressRing } from "@/components/ProgressRing";
import { StatsCard } from "@/components/StatsCard";
import { QuickActions } from "@/components/QuickActions";
import { TodayStreak } from "@/components/TodayStreak";
import { NextWorkout } from "@/components/NextWorkout";
import { Navigation } from "@/components/Navigation";
import { AIChatbot } from "@/components/AIChatbot";
import { useProfile } from "@/hooks/useProfile";
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
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile?.display_name?.split(' ')[0] || 'there';
  
  // Reset metrics to start from 0 - user can update manually
  const todayProgress = {
    calories: { current: 0, target: 2200 },
    water: { current: 0, target: 8 },
    meditation: { current: 0, target: 20 },
    steps: { current: 0, target: 10000 }
  };

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
            <StatsCard
              title="Steps Today"
              value={todayProgress.steps.current.toLocaleString()}
              icon={Target}
              gradient="gradient-wellness"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Meditation"
              value={todayProgress.meditation.current}
              unit="min"
              icon={Brain}
              gradient="gradient-hydration"
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Workout Streak"
              value="0"
              unit="days"
              icon={Flame}
              gradient="gradient-strength"
              trend={{ value: 0, isPositive: true }}
            />
            <StatsCard
              title="Weekly Goal"
              value="0"
              unit="%"
              icon={Award}
              gradient="gradient-energy"
              trend={{ value: 0, isPositive: true }}
            />
          </div>
        </div>

        {/* Streak Section */}
        <div className="mb-8">
          <TodayStreak currentStreak={0} isActiveToday={false} />
        </div>

        {/* Next Workout */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Up Next</h2>
          <NextWorkout
            workoutName="Push Day - Chest & Triceps"
            estimatedTime={42}
            targetMuscles={["Chest", "Triceps", "Shoulders"]}
            difficulty="Intermediate"
            onStart={() => console.log("Starting workout...")}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <QuickActions />
        </div>
      </div>
      <Navigation />
      <AIChatbot />
    </div>
  );
};

export default Index;
