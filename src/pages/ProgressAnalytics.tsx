import { useState } from "react";
import { TrendingUp, Calendar, Award, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ProgressSummary } from "@/components/ProgressSummary";
import { VolumeChart } from "@/components/VolumeChart";

const ProgressAnalytics = () => {
  const { user } = useSecureAuth();
  const [timeRange, setTimeRange] = useState("30");

  // Weight trend data
  const { data: weightData } = useQuery({
    queryKey: ['weight-trend', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return [];
      
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('body_measurements')
        .select('date, weight_kg')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      
      return data?.filter(d => d.weight_kg != null).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: parseFloat(d.weight_kg as any),
      })) || [];
    },
    enabled: !!user,
  });

  // Workout volume data
  const { data: workoutVolumeData } = useQuery({
    queryKey: ['workout-volume', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return [];
      
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('started_at, duration_minutes, exercises_data')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: true });

      if (error) throw error;

      // Group by week
      const weeklyData: { [key: string]: { duration: number, workouts: number } } = {};
      
      data?.forEach(session => {
        const date = new Date(session.started_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { duration: 0, workouts: 0 };
        }
        
        weeklyData[weekKey].duration += session.duration_minutes || 0;
        weeklyData[weekKey].workouts += 1;
      });

      return Object.entries(weeklyData).map(([week, data]) => ({
        week,
        duration: data.duration,
        workouts: data.workouts,
      }));
    },
    enabled: !!user,
  });

  // Body measurements trend
  const { data: measurementsData } = useQuery({
    queryKey: ['measurements-trend', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return [];
      
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return data?.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        chest: d.chest_cm ? parseFloat(d.chest_cm as any) : null,
        waist: d.waist_cm ? parseFloat(d.waist_cm as any) : null,
        arms: d.arms_cm ? parseFloat(d.arms_cm as any) : null,
      })).filter(d => d.chest || d.waist || d.arms) || [];
    },
    enabled: !!user,
  });

  // Nutrition trends
  const { data: nutritionData } = useQuery({
    queryKey: ['nutrition-trend', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return [];
      
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('daily_tracking')
        .select('date, calories_consumed')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return data?.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: d.calories_consumed || 0,
      })) || [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Progress Analytics</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Progress Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <ProgressSummary />
          <VolumeChart />
        </div>

        <Tabs defaultValue="weight" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="weight">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weight Trend
                </CardTitle>
                <CardDescription>Track your weight changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                {weightData && weightData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No weight data available. Start tracking in Body Measurements!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Workout Volume
                </CardTitle>
                <CardDescription>Weekly workout duration and frequency</CardDescription>
              </CardHeader>
              <CardContent>
                {workoutVolumeData && workoutVolumeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workoutVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="duration" 
                        fill="hsl(var(--primary))" 
                        name="Duration (min)"
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="workouts" 
                        fill="hsl(var(--accent))" 
                        name="Workouts"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No workout data available. Complete some workouts to see analytics!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="measurements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Body Measurements
                </CardTitle>
                <CardDescription>Track changes in body composition</CardDescription>
              </CardHeader>
              <CardContent>
                {measurementsData && measurementsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={measurementsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {measurementsData.some(d => d.chest) && (
                        <Line 
                          type="monotone" 
                          dataKey="chest" 
                          stroke="hsl(var(--primary))" 
                          name="Chest (cm)"
                        />
                      )}
                      {measurementsData.some(d => d.waist) && (
                        <Line 
                          type="monotone" 
                          dataKey="waist" 
                          stroke="hsl(var(--accent))" 
                          name="Waist (cm)"
                        />
                      )}
                      {measurementsData.some(d => d.arms) && (
                        <Line 
                          type="monotone" 
                          dataKey="arms" 
                          stroke="hsl(var(--secondary))" 
                          name="Arms (cm)"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No measurement data available. Add measurements to track progress!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card>
              <CardHeader>
                <CardTitle>Daily Calorie Intake</CardTitle>
                <CardDescription>Monitor your nutrition consistency</CardDescription>
              </CardHeader>
              <CardContent>
                {nutritionData && nutritionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No nutrition data available. Start logging food to see trends!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </div>
  );
};

export default ProgressAnalytics;
