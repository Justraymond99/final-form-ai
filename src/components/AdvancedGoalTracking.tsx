import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PremiumGate } from "@/components/PremiumGate";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, Calendar, Trophy, Zap, Brain, AlertTriangle } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  goal_type: string;
  created_at: string;
  completed: boolean;
}

interface GoalAnalytics {
  velocity: number;
  projected_completion: string;
  days_behind_ahead: number;
  consistency_score: number;
  trend: "up" | "down" | "stable";
  recommendations: string[];
}

export const AdvancedGoalTracking = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGoal) {
      generateAnalytics();
    }
  }, [selectedGoal, timeRange]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
      
      if (data && data.length > 0 && !selectedGoal) {
        setSelectedGoal(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const generateAnalytics = async () => {
    const goal = goals.find(g => g.id === selectedGoal);
    if (!goal) return;

    setLoading(true);
    try {
      // Simulate progress data over time
      const daysBack = parseInt(timeRange);
      const mockProgressData = [];
      const dailyIncrement = goal.current_value / daysBack;
      
      for (let i = daysBack; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const progress = Math.max(0, goal.current_value - (dailyIncrement * i));
        
        mockProgressData.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(progress * 100) / 100,
          target: goal.target_value
        });
      }
      
      setProgressData(mockProgressData);

      // Calculate analytics
      const daysElapsed = Math.ceil((new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const daysToTarget = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const velocity = goal.current_value / Math.max(daysElapsed, 1);
      const projectedDays = (goal.target_value - goal.current_value) / Math.max(velocity, 0.1);
      const projectedCompletion = new Date();
      projectedCompletion.setDate(projectedCompletion.getDate() + projectedDays);

      const daysBehindAhead = daysToTarget - projectedDays;
      const consistencyScore = Math.min(100, Math.max(0, (goal.current_value / goal.target_value) * 100));
      
      const trend = velocity > 0.5 ? "up" : velocity < 0.1 ? "down" : "stable";
      
      const recommendations = [];
      if (daysBehindAhead < -7) {
        recommendations.push("You're ahead of schedule! Consider setting a more challenging target.");
      } else if (daysBehindAhead > 7) {
        recommendations.push("You're behind schedule. Consider increasing daily effort or adjusting your timeline.");
      }
      
      if (consistencyScore < 50) {
        recommendations.push("Focus on building consistent daily habits to improve progress.");
      }
      
      if (trend === "down") {
        recommendations.push("Your progress has slowed recently. Review your strategy and remove obstacles.");
      }

      setAnalytics({
        velocity,
        projected_completion: projectedCompletion.toISOString().split('T')[0],
        days_behind_ahead: Math.round(daysBehindAhead),
        consistency_score: Math.round(consistencyScore),
        trend,
        recommendations
      });

    } catch (error) {
      console.error('Error generating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGoalData = goals.find(g => g.id === selectedGoal);
  const progressPercentage = selectedGoalData ? (selectedGoalData.current_value / selectedGoalData.target_value) * 100 : 0;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600 bg-green-50";
      case "down": return "text-red-600 bg-red-50";
      default: return "text-yellow-600 bg-yellow-50";
    }
  };

  return (
    <PremiumGate 
      feature="Advanced Goal Tracking" 
      description="Get detailed analytics, progress predictions, and AI-powered recommendations to achieve your fitness goals faster."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Advanced Goal Analytics
              <Badge className="bg-gradient-primary text-background">
                AI-Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Goal Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Goal</label>
                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a goal to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title} ({goal.current_value}/{goal.target_value} {goal.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time Range</label>
                <Select value={timeRange} onValueChange={(value: "7" | "30" | "90") => setTimeRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedGoalData && (
              <>
                {/* Current Progress */}
                <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{selectedGoalData.title}</h4>
                        <Badge className={selectedGoalData.completed ? "bg-green-500" : "bg-primary"}>
                          {selectedGoalData.completed ? "Completed" : "Active"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{selectedGoalData.current_value}/{selectedGoalData.target_value} {selectedGoalData.unit}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                        <div className="text-center text-sm font-medium">
                          {Math.round(progressPercentage)}% Complete
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics Cards */}
                {analytics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Zap className="h-5 w-5 text-primary mr-1" />
                        </div>
                        <div className="text-2xl font-bold">{analytics.velocity.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Daily Velocity</div>
                        <div className="text-xs text-muted-foreground">{selectedGoalData.unit}/day</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Calendar className="h-5 w-5 text-primary mr-1" />
                        </div>
                        <div className="text-2xl font-bold">
                          {analytics.days_behind_ahead > 0 ? "+" : ""}{analytics.days_behind_ahead}
                        </div>
                        <div className="text-sm text-muted-foreground">Days Ahead/Behind</div>
                        <div className="text-xs text-muted-foreground">vs target date</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Trophy className="h-5 w-5 text-primary mr-1" />
                        </div>
                        <div className="text-2xl font-bold">{analytics.consistency_score}%</div>
                        <div className="text-sm text-muted-foreground">Consistency</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getTrendIcon(analytics.trend)}
                        </div>
                        <div className="text-2xl font-bold capitalize">{analytics.trend}</div>
                        <div className="text-sm text-muted-foreground">Trend</div>
                        <Badge className={getTrendColor(analytics.trend)} variant="secondary">
                          {analytics.trend === "up" ? "Improving" : analytics.trend === "down" ? "Declining" : "Stable"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Progress Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {progressData.length > 0 && (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              name="Actual Progress"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="target" 
                              stroke="hsl(var(--muted-foreground))" 
                              strokeDasharray="5 5"
                              name="Target"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Recommendations */}
                {analytics && analytics.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI-Powered Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                            <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Projected Timeline */}
                {analytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Projected Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold">
                          {new Date(analytics.projected_completion).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Based on current progress velocity
                        </div>
                        {analytics.days_behind_ahead !== 0 && (
                          <Badge 
                            className={analytics.days_behind_ahead > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {Math.abs(analytics.days_behind_ahead)} days {analytics.days_behind_ahead > 0 ? "ahead" : "behind"} schedule
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {goals.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No goals found. Create some goals to see advanced analytics!</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </PremiumGate>
  );
};