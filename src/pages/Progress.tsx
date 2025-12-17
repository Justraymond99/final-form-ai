import { Calendar, Trophy, TrendingUp, Award, Target, Camera, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useDailyTracking } from "@/hooks/useDailyTracking";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAchievements } from "@/hooks/useAchievements";
import { useCustomGoals } from "@/hooks/useCustomGoals";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Progress = () => {
  const { user } = useSecureAuth();
  const { data: dailyData } = useDailyTracking();
  const { sessions } = useWorkouts();
  const { achievements, getCompletedAchievements, loading: achievementsLoading } = useAchievements();
  const { goals: customGoals } = useCustomGoals();
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [presetGoals, setPresetGoals] = useState<any[]>([]);

  // Get workout days from actual data
  useEffect(() => {
    const days = sessions
      .filter(session => session.completed_at)
      .map(session => new Date(session.completed_at!).toDateString());
    setWorkoutDays([...new Set(days)] as string[]);
  }, [sessions]);

  // Fetch preset goals
  useEffect(() => {
    const fetchPresetGoals = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPresetGoals(data || []);
      } catch (error) {
        console.error('Error fetching preset goals:', error);
      }
    };

    fetchPresetGoals();
  }, [user]);

  const completedAchievements = getCompletedAchievements();
  
  const stats = [
    { label: "Total Workouts", value: sessions.filter(s => s.completed_at).length.toString(), change: "this month" },
    { label: "Current Streak", value: (dailyData?.workout_streak || 0).toString(), change: "days" },
    { label: "Calories Logged", value: (dailyData?.calories_consumed || 0).toString(), change: "today" },
    { label: "Water Intake", value: Math.round((dailyData?.water_intake_ml || 0) / 250).toString(), change: "glasses" },
  ];

  // Generate calendar for current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.toDateString();
    const isToday = today.toDateString() === dateString;
    const hasWorkout = workoutDays.includes(dateString);
    
    return {
      day,
      hasWorkout,
      isToday
    };
  });

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(today);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Progress
          </h1>
          <p className="text-muted-foreground">Track your journey</p>
        </div>

        {/* Calendar View */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {currentMonthName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`day-header-${index}`} className="text-xs text-muted-foreground p-2 font-medium">
                  {day}
                </div>
              ))}
              {calendarDays.map((date) => (
                <div
                  key={`calendar-day-${date.day}`}
                  className={`
                    relative w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors
                    ${date.isToday ? 'bg-primary text-primary-foreground' : ''}
                    ${date.hasWorkout && !date.isToday ? 'bg-accent/20 text-accent' : ''}
                    ${!date.hasWorkout && !date.isToday ? 'text-muted-foreground' : ''}
                  `}
                >
                  {date.day}
                  {date.hasWorkout && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-muted-foreground">Workout days</span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {workoutDays.length} this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, index) => (
              <div key={`stat-${stat.label.replace(/\s+/g, '-').toLowerCase()}-${index}`} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Progress Photos Link */}
        <Link to="/progress-photos">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Progress Photos</h3>
                    <p className="text-sm text-muted-foreground">Track visual changes over time</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Goals Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Goals */}
            {presetGoals.map((goal) => (
              <div key={`preset-goal-${goal.id}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </p>
                  </div>
                  <Badge variant={goal.completed ? "default" : "outline"} className="text-xs">
                    {goal.completed ? "Complete" : "In Progress"}
                  </Badge>
                </div>
                <ProgressBar 
                  value={Math.min((goal.current_value / goal.target_value) * 100, 100)}
                  className="h-2"
                />
              </div>
            ))}
            
            {/* Custom Goals */}
            {customGoals.map((goal) => (
              <div key={`custom-goal-${goal.id}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </p>
                  </div>
                  <Badge variant={goal.completed ? "default" : "secondary"} className="text-xs">
                    {goal.completed ? "Complete" : "Custom"}
                  </Badge>
                </div>
                <ProgressBar 
                  value={Math.min((goal.current_value / goal.target_value) * 100, 100)}
                  className="h-2"
                />
                {goal.description && (
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                )}
              </div>
            ))}
            
            {presetGoals.length === 0 && customGoals.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                <p>No goals yet!</p>
                <p className="text-xs mt-1">Create custom goals to track your progress</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievementsLoading ? (
              <div className="text-center text-muted-foreground">Loading achievements...</div>
            ) : completedAchievements.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No achievements yet!</p>
                <p className="text-xs mt-1">Complete activities to earn your first achievements</p>
              </div>
            ) : (
              completedAchievements.slice(0, 4).map((achievement) => (
                <div
                  key={`achievement-${achievement.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 transition-colors"
                >
                  <div className="text-2xl">
                    {achievement.icon === 'star' ? '⭐' :
                     achievement.icon === 'dumbbell' ? '💪' :
                     achievement.icon === 'flame' ? '🔥' :
                     achievement.icon === 'trophy' ? '🏆' :
                     achievement.icon === 'target' ? '🎯' :
                     achievement.icon === 'droplets' ? '💧' :
                     achievement.icon === 'utensils' ? '🍽️' :
                     achievement.icon === 'calendar' ? '📅' :
                     achievement.icon === 'waves' ? '🌊' :
                     achievement.icon === 'trending-up' ? '📈' :
                     achievement.icon === 'award' ? '🏅' :
                     achievement.icon === 'zap' ? '⚡' :
                     achievement.icon === 'crown' ? '👑' : '🎖️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-primary">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Award className="h-5 w-5 text-primary" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Progress;