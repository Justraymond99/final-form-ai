import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BedDouble, 
  Dumbbell, 
  Droplets, 
  Apple, 
  Brain, 
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRateLimitStatus } from "@/hooks/useRateLimitStatus";
import { RateLimitIndicator } from "@/components/RateLimitIndicator";
import { AI_RATE_LIMITS } from "@/lib/rateLimitConfig";

interface RecoveryData {
  restDayRecommended: boolean;
  recoveryScore: number;
  muscleRecovery: {
    fullyRecovered: string[];
    recovering: string[];
    fatigued: string[];
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
  }>;
  nextWorkoutSuggestion: {
    muscleGroups: string[];
    intensity: string;
    focusAreas: string[];
    avoidMuscles?: string[];
  };
  motivationalMessage?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  active_recovery: <Dumbbell className="h-4 w-4" />,
  nutrition: <Apple className="h-4 w-4" />,
  sleep: <BedDouble className="h-4 w-4" />,
  stretching: <Dumbbell className="h-4 w-4" />,
  hydration: <Droplets className="h-4 w-4" />,
  mental: <Brain className="h-4 w-4" />,
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

export const RecoveryCoach = () => {
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const { toast } = useToast();
  const { updateRateLimitFromResponse, handleRateLimitError, getRateLimitInfo } = useRateLimitStatus();
  
  const rateLimitInfo = getRateLimitInfo('ai-recovery-coach');
  const maxRequests = AI_RATE_LIMITS['ai-recovery-coach']?.maxRequests || 20;

  const fetchRecoveryAnalysis = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('ai-recovery-coach');
      
      // Update rate limit status from response
      if (response.data?.remaining !== undefined) {
        updateRateLimitFromResponse(
          new Response(null, {
            headers: {
              'X-RateLimit-Remaining': response.data.remaining?.toString() || '0',
              'X-RateLimit-Reset': response.data.resetAt || ''
            }
          }),
          'ai-recovery-coach'
        );
      }
      
      if (response.error) {
        if (response.error.message?.includes('429') || response.data?.error?.includes('rate limit')) {
          handleRateLimitError(response.data || {}, 'ai-recovery-coach');
          return;
        }
        throw response.error;
      }
      
      setRecovery(response.data.recovery);
      setCurrentStreak(response.data.currentStreak || 0);
    } catch (error: any) {
      console.error('Error fetching recovery:', error);
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        handleRateLimitError(error, 'ai-recovery-coach');
        return;
      }
      toast({
        title: "Couldn't load recovery data",
        description: "Using default recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecoveryAnalysis();
  }, []);

  const getRecoveryColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recovery Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded-lg animate-pulse" />
            <div className="h-24 bg-muted rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show default state instead of returning null to prevent flickering
  const defaultRecovery: RecoveryData = recovery || {
    restDayRecommended: false,
    recoveryScore: 75,
    muscleRecovery: {
      fullyRecovered: ["Chest", "Back"],
      recovering: ["Legs"],
      fatigued: []
    },
    recommendations: [
      { type: "hydration", title: "Stay Hydrated", description: "Drink at least 8 glasses of water today", priority: "medium" },
      { type: "sleep", title: "Get Rest", description: "Aim for 7-9 hours of quality sleep", priority: "medium" }
    ],
    nextWorkoutSuggestion: {
      muscleGroups: ["Arms", "Shoulders"],
      intensity: "moderate",
      focusAreas: ["Upper body"]
    }
  };

  const displayRecovery = recovery || defaultRecovery;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recovery Coach
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchRecoveryAnalysis}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rateLimitInfo && (
          <RateLimitIndicator
            remaining={rateLimitInfo.remaining}
            maxRequests={maxRequests}
            resetAt={rateLimitInfo.resetAt}
            endpoint="ai-recovery-coach"
          />
        )}
        
        {/* Recovery Score */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Recovery Score</p>
            <p className={`text-3xl font-bold ${getRecoveryColor(displayRecovery.recoveryScore)}`}>
              {displayRecovery.recoveryScore}%
            </p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${displayRecovery.recoveryScore * 2.51} 251`}
                className={getRecoveryColor(displayRecovery.recoveryScore)}
              />
            </svg>
          </div>
        </div>

        {/* Rest Day Alert */}
        {displayRecovery.restDayRecommended && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Rest Day Recommended</p>
              <p className="text-sm text-muted-foreground">
                Your body needs recovery time. A rest day will help you come back stronger.
              </p>
            </div>
          </div>
        )}

        {/* Muscle Recovery Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Muscle Recovery Status</p>
          <div className="flex flex-wrap gap-1.5">
            {displayRecovery.muscleRecovery.fullyRecovered.map(muscle => (
              <Badge key={muscle} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {muscle}
              </Badge>
            ))}
            {displayRecovery.muscleRecovery.recovering.map(muscle => (
              <Badge key={muscle} variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                <Clock className="h-3 w-3 mr-1" />
                {muscle}
              </Badge>
            ))}
            {displayRecovery.muscleRecovery.fatigued.map(muscle => (
              <Badge key={muscle} variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Today's Recovery Tips</p>
          <div className="space-y-2">
            {displayRecovery.recommendations.slice(0, 3).map((rec, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${priorityColors[rec.priority]}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {typeIcons[rec.type] || <Sparkles className="h-4 w-4" />}
                  <span className="font-medium text-sm">{rec.title}</span>
                </div>
                <p className="text-xs opacity-80">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Workout Suggestion */}
        {!displayRecovery.restDayRecommended && displayRecovery.nextWorkoutSuggestion && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="font-medium text-sm mb-2 flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Next Workout Suggestion
            </p>
            <div className="space-y-1 text-xs">
              <p>
                <span className="text-muted-foreground">Focus:</span>{" "}
                {displayRecovery.nextWorkoutSuggestion.muscleGroups.join(", ")}
              </p>
              <p>
                <span className="text-muted-foreground">Intensity:</span>{" "}
                <Badge variant="outline" className="text-xs py-0">
                  {displayRecovery.nextWorkoutSuggestion.intensity}
                </Badge>
              </p>
              {displayRecovery.nextWorkoutSuggestion.avoidMuscles && displayRecovery.nextWorkoutSuggestion.avoidMuscles.length > 0 && (
                <p className="text-yellow-600">
                  Avoid: {displayRecovery.nextWorkoutSuggestion.avoidMuscles.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {displayRecovery.motivationalMessage && (
          <p className="text-center text-sm italic text-muted-foreground pt-2 border-t">
            "{displayRecovery.motivationalMessage}"
          </p>
        )}
      </CardContent>
    </Card>
  );
};
