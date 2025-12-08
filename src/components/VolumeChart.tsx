import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays, startOfWeek } from "date-fns";

interface VolumeDataPoint {
  week: string;
  totalVolume: number;
  avgWeight: number;
  totalSets: number;
}

export const VolumeChart = () => {
  const { user } = useSecureAuth();

  const { data: volumeData, isLoading } = useQuery({
    queryKey: ["volume-over-time", user?.id],
    queryFn: async (): Promise<VolumeDataPoint[]> => {
      if (!user) return [];

      const thirtyDaysAgo = subDays(new Date(), 90);

      const { data: sessions } = await supabase
        .from("workout_sessions")
        .select("started_at, exercises_data")
        .eq("user_id", user.id)
        .gte("started_at", thirtyDaysAgo.toISOString())
        .not("completed_at", "is", null)
        .order("started_at", { ascending: true });

      if (!sessions) return [];

      // Group by week
      const weeklyData: Record<string, { volume: number; weight: number; sets: number; count: number }> = {};

      sessions.forEach((session) => {
        const weekStart = startOfWeek(new Date(session.started_at), { weekStartsOn: 1 });
        const weekKey = format(weekStart, "MMM d");

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { volume: 0, weight: 0, sets: 0, count: 0 };
        }

        const exercises = session.exercises_data as any[];
        exercises?.forEach((ex) => {
          const sets = ex.completedSets || ex.sets || 1;
          const reps = parseInt(ex.reps) || 0;
          const weight = parseFloat(ex.weight) || 0;

          weeklyData[weekKey].volume += sets * reps * weight;
          weeklyData[weekKey].weight += weight;
          weeklyData[weekKey].sets += sets;
          weeklyData[weekKey].count += 1;
        });
      });

      return Object.entries(weeklyData).map(([week, data]) => ({
        week,
        totalVolume: Math.round(data.volume),
        avgWeight: data.count > 0 ? Math.round(data.weight / data.count) : 0,
        totalSets: data.sets,
      }));
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Volume Over Time
        </CardTitle>
        <CardDescription>Track your total training volume (sets × reps × weight)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : volumeData && volumeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "totalVolume") return [`${value.toLocaleString()} kg`, "Volume"];
                  if (name === "totalSets") return [value, "Total Sets"];
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalVolume"
                name="Volume (kg)"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalSets"
                name="Sets"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No workout data yet. Complete some workouts to see volume trends!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
