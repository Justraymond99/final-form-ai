import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  Target,
  Flame,
  Droplets,
  Clock,
  Star,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeeklyInsights {
  summary: string;
  grade: string;
  highlights: Array<{ type: string; text: string }>;
  stats: {
    workoutsCompleted: number;
    totalMinutes: number;
    caloriesBurned: number;
    consistency: string;
    comparedToLastWeek?: string;
  };
  weeklyGoals: Array<{ goal: string; priority: string; reason?: string }>;
  focusAreas: Array<{ area: string; tip: string; impact?: string }>;
  nutritionTips?: string[];
  recoveryTips?: string[];
  motivationalQuote: string;
  nextWeekPlan?: {
    recommendedWorkouts: number;
    focusMuscleGroups: string[];
    restDays: number;
    keyPriority: string;
  };
}

const gradeColors: Record<string, string> = {
  "A+": "bg-green-500",
  "A": "bg-green-500",
  "B": "bg-blue-500",
  "C": "bg-yellow-500",
  "D": "bg-red-500",
};

const highlightIcons: Record<string, React.ReactNode> = {
  positive: <TrendingUp className="h-4 w-4 text-green-500" />,
  improvement: <Target className="h-4 w-4 text-yellow-500" />,
  warning: <TrendingDown className="h-4 w-4 text-red-500" />,
};

export const WeeklyCoachInsights = () => {
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [rawStats, setRawStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-weekly-coach');
      
      if (error) throw error;
      
      setInsights(data.insights);
      setRawStats(data.rawStats);
    } catch (error) {
      console.error('Error fetching weekly insights:', error);
      toast({
        title: "Couldn't load weekly insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Weekly Coach
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${gradeColors[insights.grade] || 'bg-muted'} text-white`}>
              Grade: {insights.grade}
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchInsights}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm">{insights.summary}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-bold">{insights.stats.workoutsCompleted}</p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{insights.stats.totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Flame className="h-4 w-4 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-bold">{insights.stats.caloriesBurned}</p>
            <p className="text-xs text-muted-foreground">Cal Burned</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Target className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{insights.stats.consistency}</p>
            <p className="text-xs text-muted-foreground">Consistent</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-1.5">
          {insights.highlights.slice(0, expanded ? undefined : 2).map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {highlightIcons[h.type] || <Star className="h-4 w-4" />}
              <span>{h.text}</span>
            </div>
          ))}
        </div>

        {/* Weekly Goals */}
        {expanded && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals for This Week
              </p>
              {insights.weeklyGoals.map((goal, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded-lg border text-sm ${
                    goal.priority === 'high' 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  <p className="font-medium">{goal.goal}</p>
                  {goal.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5">{goal.reason}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Focus Areas</p>
              {insights.focusAreas.map((focus, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{focus.area}:</span>{" "}
                  <span className="text-muted-foreground">{focus.tip}</span>
                </div>
              ))}
            </div>

            {/* Next Week Plan */}
            {insights.nextWeekPlan && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="font-medium text-sm mb-2">Next Week's Plan</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Workouts:</span>{" "}
                    {insights.nextWeekPlan.recommendedWorkouts}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rest Days:</span>{" "}
                    {insights.nextWeekPlan.restDays}
                  </div>
                </div>
                <p className="text-xs mt-2">
                  <span className="text-muted-foreground">Key Priority:</span>{" "}
                  {insights.nextWeekPlan.keyPriority}
                </p>
              </div>
            )}
          </>
        )}

        {/* Expand/Collapse */}
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show Less" : "Show More"}
          <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>

        {/* Motivational Quote */}
        <p className="text-center text-sm italic text-muted-foreground border-t pt-3">
          "{insights.motivationalQuote}"
        </p>
      </CardContent>
    </Card>
  );
};
