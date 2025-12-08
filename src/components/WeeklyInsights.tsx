import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Flame,
  Dumbbell,
  Utensils,
  Droplets,
  Target,
  Award,
  Calendar
} from "lucide-react";

interface InsightData {
  label: string;
  current: number;
  previous: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

export const WeeklyInsights = () => {
  const { user } = useSecureAuth();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['weekly-insights', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date();
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

      // This week's workouts
      const { data: thisWeekWorkouts } = await supabase
        .from('workout_sessions')
        .select('id, duration_minutes')
        .eq('user_id', user.id)
        .gte('started_at', thisWeekStart.toISOString())
        .not('completed_at', 'is', null);

      // Last week's workouts
      const { data: lastWeekWorkouts } = await supabase
        .from('workout_sessions')
        .select('id, duration_minutes')
        .eq('user_id', user.id)
        .gte('started_at', lastWeekStart.toISOString())
        .lt('started_at', thisWeekStart.toISOString())
        .not('completed_at', 'is', null);

      // This week's calories
      const { data: thisWeekFood } = await supabase
        .from('food_logs')
        .select('calories')
        .eq('user_id', user.id)
        .gte('logged_at', thisWeekStart.toISOString());

      // Last week's calories
      const { data: lastWeekFood } = await supabase
        .from('food_logs')
        .select('calories')
        .eq('user_id', user.id)
        .gte('logged_at', lastWeekStart.toISOString())
        .lt('logged_at', thisWeekStart.toISOString());

      // This week's water
      const { data: thisWeekWater } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .gte('date', thisWeekStart.toISOString().split('T')[0]);

      // Last week's water
      const { data: lastWeekWater } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .gte('date', lastWeekStart.toISOString().split('T')[0])
        .lt('date', thisWeekStart.toISOString().split('T')[0]);

      // Weight change
      const { data: weights } = await supabase
        .from('body_measurements')
        .select('weight_kg, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(2);

      const thisWeekWorkoutCount = thisWeekWorkouts?.length || 0;
      const lastWeekWorkoutCount = lastWeekWorkouts?.length || 0;
      
      const thisWeekDuration = thisWeekWorkouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
      const lastWeekDuration = lastWeekWorkouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
      
      const thisWeekCalories = thisWeekFood?.reduce((sum, f) => sum + (f.calories || 0), 0) || 0;
      const lastWeekCalories = lastWeekFood?.reduce((sum, f) => sum + (f.calories || 0), 0) || 0;
      
      const thisWeekWaterMl = thisWeekWater?.reduce((sum, w) => sum + (w.amount_ml || 0), 0) || 0;
      const lastWeekWaterMl = lastWeekWater?.reduce((sum, w) => sum + (w.amount_ml || 0), 0) || 0;

      const currentWeight = weights?.[0]?.weight_kg ? parseFloat(weights[0].weight_kg as any) : null;
      const previousWeight = weights?.[1]?.weight_kg ? parseFloat(weights[1].weight_kg as any) : null;

      return {
        workouts: { current: thisWeekWorkoutCount, previous: lastWeekWorkoutCount },
        duration: { current: thisWeekDuration, previous: lastWeekDuration },
        calories: { current: thisWeekCalories, previous: lastWeekCalories },
        water: { current: Math.round(thisWeekWaterMl / 1000), previous: Math.round(lastWeekWaterMl / 1000) },
        weight: { current: currentWeight, previous: previousWeight },
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: <TrendingUp className="h-4 w-4" />, color: "text-green-500", label: "up" };
    if (current < previous) return { icon: <TrendingDown className="h-4 w-4" />, color: "text-red-500", label: "down" };
    return { icon: <Minus className="h-4 w-4" />, color: "text-muted-foreground", label: "same" };
  };

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const insightCards: InsightData[] = [
    {
      label: "Workouts",
      current: insights.workouts.current,
      previous: insights.workouts.previous,
      unit: "sessions",
      icon: <Dumbbell className="h-5 w-5" />,
      color: "text-primary"
    },
    {
      label: "Training Time",
      current: insights.duration.current,
      previous: insights.duration.previous,
      unit: "min",
      icon: <Flame className="h-5 w-5" />,
      color: "text-orange-500"
    },
    {
      label: "Calories Logged",
      current: insights.calories.current,
      previous: insights.calories.previous,
      unit: "kcal",
      icon: <Utensils className="h-5 w-5" />,
      color: "text-green-500"
    },
    {
      label: "Hydration",
      current: insights.water.current,
      previous: insights.water.previous,
      unit: "L",
      icon: <Droplets className="h-5 w-5" />,
      color: "text-blue-500"
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          This Week vs Last Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {insightCards.map((insight) => {
            const trend = getTrend(insight.current, insight.previous);
            const percentChange = getPercentChange(insight.current, insight.previous);
            
            return (
              <div 
                key={insight.label}
                className="p-3 rounded-lg border bg-card/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={insight.color}>{insight.icon}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${trend.color}`}
                  >
                    {trend.icon}
                    {percentChange !== 0 && `${Math.abs(percentChange)}%`}
                  </Badge>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {insight.current.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {insight.unit}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {insight.label}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  vs {insight.previous.toLocaleString()} last week
                </div>
              </div>
            );
          })}
        </div>

        {/* Weight Change */}
        {insights.weight.current && (
          <div className="p-3 rounded-lg border bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Weight</span>
              </div>
              {insights.weight.previous && (
                <Badge 
                  variant="outline"
                  className={insights.weight.current < insights.weight.previous ? "text-green-500" : "text-yellow-500"}
                >
                  {insights.weight.current < insights.weight.previous ? (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(insights.weight.current - insights.weight.previous).toFixed(1)} kg
                </Badge>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold">
              {insights.weight.current.toFixed(1)} kg
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
          <Award className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-sm text-muted-foreground">
            {insights.workouts.current >= insights.workouts.previous 
              ? "Great job! You're matching or beating last week's effort! 💪"
              : "You've got this! Let's push a bit more this week! 🚀"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
