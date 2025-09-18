import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";
import { 
  Heart, 
  Moon, 
  Zap, 
  Brain, 
  Clock, 
  Activity, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Utensils,
  BedDouble,
  Waves
} from "lucide-react";

interface AIRecoveryPlannerProps {
  onRecoveryPlanGenerated?: (plan: any) => void;
}

export const AIRecoveryPlanner = ({ onRecoveryPlanGenerated }: AIRecoveryPlannerProps) => {
  const { user } = useSecureAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recoveryPlan, setRecoveryPlan] = useState<any>(null);
  
  // Form state
  const [workoutIntensity, setWorkoutIntensity] = useState("");
  const [musclesWorked, setMusclesWorked] = useState<string[]>([]);
  const [fatigueLevel, setFatigueLevel] = useState([5]);
  const [sleepQuality, setSleepQuality] = useState([7]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [availableTime, setAvailableTime] = useState("30");
  const [preferences, setPreferences] = useState("");

  const intensityLevels = [
    "Light", "Moderate", "High", "Very High", "Extreme"
  ];

  const muscleGroups = [
    "Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Glutes", "Full Body"
  ];

  const handleMuscleToggle = (muscle: string) => {
    setMusclesWorked(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const generateRecoveryPlan = async () => {
    if (!user) {
      toast.error("Please sign in to generate recovery plans");
      return;
    }

    if (!workoutIntensity) {
      toast.error("Please select workout intensity");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-recovery-planner', {
        body: {
          userId: user.id,
          workoutIntensity,
          musclesWorked,
          fatigueLevel: fatigueLevel[0],
          sleepQuality: sleepQuality[0],
          stressLevel: stressLevel[0],
          availableTime: parseInt(availableTime),
          preferences
        }
      });

      if (error) {
        console.error('Error generating recovery plan:', error);
        toast.error("Failed to generate recovery plan. Please try again.");
        return;
      }

      setRecoveryPlan(data.recovery_plan);
      onRecoveryPlanGenerated?.(data.recovery_plan);
      toast.success("AI recovery plan generated successfully!");

    } catch (error) {
      console.error('Recovery plan generation error:', error);
      toast.error("An error occurred while generating your recovery plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const getRecoveryPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            AI Recovery Planner
          </CardTitle>
          <CardDescription>
            Get a personalized recovery plan based on your workout intensity, current state, and recovery goals.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Workout Intensity */}
          <div className="space-y-2">
            <Label htmlFor="workout-intensity">Last Workout Intensity *</Label>
            <Select value={workoutIntensity} onValueChange={setWorkoutIntensity}>
              <SelectTrigger>
                <SelectValue placeholder="How intense was your last workout?" />
              </SelectTrigger>
              <SelectContent>
                {intensityLevels.map((intensity) => (
                  <SelectItem key={intensity} value={intensity}>
                    {intensity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Muscles Worked */}
          <div className="space-y-2">
            <Label>Muscles Worked</Label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((muscle) => (
                <Badge
                  key={muscle}
                  variant={musclesWorked.includes(muscle) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleMuscleToggle(muscle)}
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recovery Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fatigue Level */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Fatigue Level: {fatigueLevel[0]}/10
              </Label>
              <Slider
                value={fatigueLevel}
                onValueChange={setFatigueLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Energized</span>
                <span>Exhausted</span>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Sleep Quality: {sleepQuality[0]}/10
              </Label>
              <Slider
                value={sleepQuality}
                onValueChange={setSleepQuality}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Stress Level: {stressLevel[0]}/10
              </Label>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Relaxed</span>
                <span>Very Stressed</span>
              </div>
            </div>

            {/* Available Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Available Recovery Time (minutes)
              </Label>
              <Select value={availableTime} onValueChange={setAvailableTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Recovery Preferences</Label>
            <Textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Any specific recovery preferences, needs, or constraints..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={generateRecoveryPlan}
            disabled={isGenerating || !workoutIntensity}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Your Recovery Plan...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Generate Recovery Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Recovery Plan Display */}
      {recoveryPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {recoveryPlan.plan_name}
            </CardTitle>
            <CardDescription>{recoveryPlan.overall_assessment}</CardDescription>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getRecoveryPriorityColor(recoveryPlan.recovery_priority)}>
                Priority: {recoveryPlan.recovery_priority?.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                <BedDouble className="w-3 h-3 mr-1" />
                {recoveryPlan.recommended_rest_hours}h recommended rest
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Active Recovery */}
            {recoveryPlan.active_recovery && recoveryPlan.active_recovery.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Active Recovery
                </h4>
                <div className="space-y-3">
                  {recoveryPlan.active_recovery.map((activity: any, index: number) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{activity.activity}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline">{activity.duration_minutes} min</Badge>
                          <Badge variant="secondary">{activity.intensity}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{activity.instructions}</p>
                      <p className="text-xs text-green-600">✨ {activity.benefits}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stretching Routine */}
            {recoveryPlan.stretching_routine && recoveryPlan.stretching_routine.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Waves className="w-4 h-4" />
                    Stretching Routine
                  </h4>
                  <div className="space-y-3">
                    {recoveryPlan.stretching_routine.map((stretch: any, index: number) => (
                      <div key={index} className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{stretch.stretch}</span>
                          <Badge variant="outline">{stretch.duration_seconds}s</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{stretch.instructions}</p>
                        <p className="text-xs text-primary">🔄 {stretch.frequency}</p>
                        {stretch.target_muscles && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {stretch.target_muscles.map((muscle: string) => (
                              <Badge key={muscle} variant="secondary" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Recovery Techniques */}
            {recoveryPlan.recovery_techniques && recoveryPlan.recovery_techniques.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Recovery Techniques
                  </h4>
                  <div className="space-y-3">
                    {recoveryPlan.recovery_techniques.map((technique: any, index: number) => (
                      <div key={index} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{technique.technique}</span>
                          <Badge variant="outline">{technique.duration_minutes} min</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{technique.instructions}</p>
                        <p className="text-xs text-blue-600">⏰ {technique.when_to_use}</p>
                        {technique.equipment_needed !== 'none' && (
                          <p className="text-xs text-gray-500 mt-1">🛠️ Equipment: {technique.equipment_needed}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Nutrition Recommendations */}
            {recoveryPlan.nutrition_recommendations && recoveryPlan.nutrition_recommendations.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Nutrition for Recovery
                  </h4>
                  <div className="space-y-3">
                    {recoveryPlan.nutrition_recommendations.map((nutrition: any, index: number) => (
                      <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs">{nutrition.category}</Badge>
                        </div>
                        <p className="text-sm font-medium mt-2">{nutrition.recommendation}</p>
                        <p className="text-xs text-muted-foreground">⏰ {nutrition.timing}</p>
                        <p className="text-xs text-orange-700 mt-1">💡 {nutrition.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sleep Optimization */}
            {recoveryPlan.sleep_optimization && recoveryPlan.sleep_optimization.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Sleep Optimization
                  </h4>
                  <div className="space-y-2">
                    {recoveryPlan.sleep_optimization.map((tip: any, index: number) => (
                      <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <p className="text-sm font-medium">{tip.tip}</p>
                        <p className="text-xs text-muted-foreground mt-1">{tip.implementation}</p>
                        <p className="text-xs text-purple-700 mt-1">✨ {tip.benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Readiness Assessment */}
            {recoveryPlan.next_workout_readiness && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Workout Readiness
                  </h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium mb-2">
                      Estimated recovery time: {recoveryPlan.next_workout_readiness.estimated_hours} hours
                    </p>
                    
                    {recoveryPlan.next_workout_readiness.readiness_indicators && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-green-700 mb-1">Ready when you feel:</p>
                        <ul className="text-xs text-green-600 space-y-0.5">
                          {recoveryPlan.next_workout_readiness.readiness_indicators.map((indicator: string, index: number) => (
                            <li key={index}>✓ {indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {recoveryPlan.next_workout_readiness.warning_signs && (
                      <div>
                        <p className="text-xs font-medium text-red-700 mb-1">Rest more if you experience:</p>
                        <ul className="text-xs text-red-600 space-y-0.5">
                          {recoveryPlan.next_workout_readiness.warning_signs.map((sign: string, index: number) => (
                            <li key={index}>⚠️ {sign}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Personalized Notes */}
            {recoveryPlan.personalized_notes && (
              <>
                <Separator />
                <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-md">
                  <h5 className="font-medium text-primary mb-2">Personal Recovery Insights</h5>
                  <p className="text-sm">{recoveryPlan.personalized_notes}</p>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setRecoveryPlan(null)}
                className="flex-1"
              >
                Generate New Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};