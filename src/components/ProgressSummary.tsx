import { useState } from "react";
import { CalendarDays, TrendingUp, Dumbbell, Flame, Droplets, Footprints, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";

interface SummaryData {
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalVolume: number;
  totalCaloriesLogged: number;
  avgDailyCalories: number;
  totalWaterMl: number;
  totalSteps: number;
  weightChange: number | null;
  highlights: string[];
}

export const ProgressSummary = () => {
  const { user } = useSecureAuth();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  const getDateRange = (type: "weekly" | "monthly") => {
    const now = new Date();
    if (type === "weekly") {
      return {
        start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
      };
    }
    return {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
    };
  };

  const { data: summary, isLoading } = useQuery({
    queryKey: ["progress-summary", user?.id, period],
    queryFn: async (): Promise<SummaryData> => {
      if (!user) throw new Error("Not authenticated");
      
      const { start, end } = getDateRange(period);
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      // Fetch workout sessions
      const { data: workouts } = await supabase
        .from("workout_sessions")
        .select("duration_minutes, exercises_data")
        .eq("user_id", user.id)
        .gte("started_at", start.toISOString())
        .lte("started_at", end.toISOString())
        .not("completed_at", "is", null);

      // Calculate volume (sets × reps × weight)
      let totalVolume = 0;
      workouts?.forEach((w) => {
        const exercises = w.exercises_data as any[];
        exercises?.forEach((ex) => {
          const sets = ex.completedSets || ex.sets || 0;
          const reps = parseInt(ex.reps) || 0;
          const weight = parseFloat(ex.weight) || 0;
          totalVolume += sets * reps * weight;
        });
      });

      // Fetch daily tracking
      const { data: dailyTracking } = await supabase
        .from("daily_tracking")
        .select("calories_consumed, water_intake_ml, steps")
        .eq("user_id", user.id)
        .gte("date", startStr)
        .lte("date", endStr);

      // Fetch body measurements for weight change
      const { data: startWeight } = await supabase
        .from("body_measurements")
        .select("weight_kg")
        .eq("user_id", user.id)
        .lte("date", startStr)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      const { data: endWeight } = await supabase
        .from("body_measurements")
        .select("weight_kg")
        .eq("user_id", user.id)
        .lte("date", endStr)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      const totalCalories = dailyTracking?.reduce((sum, d) => sum + (d.calories_consumed || 0), 0) || 0;
      const totalWater = dailyTracking?.reduce((sum, d) => sum + (d.water_intake_ml || 0), 0) || 0;
      const totalSteps = dailyTracking?.reduce((sum, d) => sum + (d.steps || 0), 0) || 0;
      const daysWithData = dailyTracking?.filter(d => d.calories_consumed && d.calories_consumed > 0).length || 1;

      const weightChange = startWeight?.weight_kg && endWeight?.weight_kg 
        ? Number(endWeight.weight_kg) - Number(startWeight.weight_kg) 
        : null;

      // Generate highlights
      const highlights: string[] = [];
      const workoutCount = workouts?.length || 0;
      if (workoutCount >= 5) highlights.push("💪 Great workout consistency!");
      if (totalVolume > 10000) highlights.push("🏋️ Impressive volume lifted!");
      if (totalSteps > 50000) highlights.push("🚶 Excellent step count!");
      if (weightChange && weightChange < 0) highlights.push("📉 Weight trending down!");

      return {
        totalWorkouts: workoutCount,
        totalDurationMinutes: workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0,
        totalVolume,
        totalCaloriesLogged: totalCalories,
        avgDailyCalories: Math.round(totalCalories / daysWithData),
        totalWaterMl: totalWater,
        totalSteps,
        weightChange,
        highlights,
      };
    },
    enabled: !!user,
  });

  if (!user) return null;

  const { start, end } = getDateRange(period);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Progress Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Last Week</TabsTrigger>
            <TabsTrigger value="monthly">Last Month</TabsTrigger>
          </TabsList>

          <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border/30 bg-background/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Dumbbell className="h-3 w-3" />
                    Workouts
                  </div>
                  <p className="text-2xl font-bold text-primary mt-1">{summary?.totalWorkouts || 0}</p>
                  <p className="text-xs text-muted-foreground">{summary?.totalDurationMinutes || 0} min total</p>
                </div>

                <div className="p-3 rounded-lg border border-border/30 bg-background/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <TrendingUp className="h-3 w-3" />
                    Volume
                  </div>
                  <p className="text-2xl font-bold text-accent mt-1">
                    {((summary?.totalVolume || 0) / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">kg lifted</p>
                </div>

                <div className="p-3 rounded-lg border border-border/30 bg-background/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Flame className="h-3 w-3" />
                    Calories
                  </div>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {((summary?.totalCaloriesLogged || 0) / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">~{summary?.avgDailyCalories || 0}/day</p>
                </div>

                <div className="p-3 rounded-lg border border-border/30 bg-background/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Footprints className="h-3 w-3" />
                    Steps
                  </div>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {((summary?.totalSteps || 0) / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">total steps</p>
                </div>
              </div>

              {/* Weight Change */}
              {summary?.weightChange !== null && (
                <div className="p-3 rounded-lg border border-border/30 bg-background/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weight Change</span>
                  <Badge variant={summary.weightChange <= 0 ? "default" : "secondary"}>
                    {summary.weightChange > 0 ? "+" : ""}{summary.weightChange.toFixed(1)} kg
                  </Badge>
                </div>
              )}

              {/* Highlights */}
              {summary?.highlights && summary.highlights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {summary.highlights.map((h, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
