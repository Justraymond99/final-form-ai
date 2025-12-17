import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useGenerationHistory } from "@/hooks/useGenerationHistory";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Loader2, X } from "lucide-react";
import { MultiWeekWorkoutDisplay } from "@/components/MultiWeekWorkoutDisplay";

interface WorkoutGeneratorProps {
  onWorkoutGenerated?: (workout: any) => void;
}

export const WorkoutGenerator = ({ onWorkoutGenerated }: WorkoutGeneratorProps) => {
  const { user } = useSecureAuth();
  // Always allow access - paywall removed for testing
  const hasPremiumAccess = true;
  const { startWorkout: createWorkoutSession } = useWorkouts();
  const { saveGeneration } = useGenerationHistory();
  const navigate = useNavigate();
  
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState("30");
  const [difficulty, setDifficulty] = useState("");
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const [programLength, setProgramLength] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");

  // Normalize a single-workout plan into a multi-week shape expected by the display
  const normalizePlan = (p: any) => {
    if (!p || (p as any).weekly_plans) return p;
    const toExercise = (e: any) => ({
      exercise: e?.exercise || e?.name || 'Exercise',
      sets: e?.sets ?? 1,
      reps: e?.reps ?? (e?.duration_seconds ? `${e.duration_seconds}s` : '8-12'),
      rest_seconds: e?.rest_seconds ?? 0,
      instructions: e?.instructions || e?.tips || e?.benefits || ''
    });
    return {
      name: p.name,
      description: p.description,
      difficulty: p.difficulty,
      weeks: 1,
      weekly_plans: [
        {
          focus: p.type || 'Workout',
          description: p.notes || p.description,
          workouts: [
            {
              day: 'Day 1',
              workout_name: p.name,
              duration: p.estimated_duration || p.duration || Number(duration) || 30,
              type: p.type,
              target_muscles: p.target_muscles || [],
              exercises: [
                ...(Array.isArray(p.warm_up) ? p.warm_up.map(toExercise) : []),
                ...(Array.isArray(p.main_exercises) ? p.main_exercises.map(toExercise) : []),
                ...(Array.isArray(p.cool_down) ? p.cool_down.map(toExercise) : []),
              ],
            },
          ],
        },
      ],
      progression_notes: p.progression_tips || p.notes,
    };
  };

  const workoutTypes = [
    "Strength Training", "Cardio", "HIIT", "Yoga", "Pilates", "Functional", "Bodyweight", "Mixed"
  ];


  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

  const muscleGroups = [
    "Chest", "Back", "Shoulders", "Arms", "Legs", "Glutes", "Core", "Full Body"
  ];

  const equipmentOptions = [
    "None (Bodyweight)", "Dumbbells", "Barbell", "Resistance Bands", "Pull-up Bar", 
    "Kettlebells", "Cable Machine", "Gym Access", "Home Gym Setup"
  ];

  const commonInjuries = [
    "Lower Back", "Knee", "Shoulder", "Wrist", "Ankle", "Hip", "Neck", "Elbow"
  ];

  const handleMuscleToggle = (muscle: string) => {
    setTargetMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleEquipmentToggle = (equip: string) => {
    setEquipment(prev => 
      prev.includes(equip) 
        ? prev.filter(e => e !== equip)
        : [...prev, equip]
    );
  };

  const handleInjuryToggle = (injury: string) => {
    setInjuries(prev => 
      prev.includes(injury) 
        ? prev.filter(i => i !== injury)
        : [...prev, injury]
    );
  };

  const generateWorkout = async () => {
    console.log("Generate workout called", { user, workoutType, difficulty });
    
    if (!user) {
      toast.error("Please sign in to generate workouts");
      return;
    }

    if (!workoutType || !difficulty) {
      toast.error("Please select workout type and difficulty level");
      return;
    }

    setIsGenerating(true);

    try {
      // Ensure we pass the auth token explicitly to the edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      console.log("Invoking ai-workout-generator...", { hasToken: Boolean(accessToken) });

      const { data, error } = await supabase.functions.invoke('ai-workout-generator', {
        body: {
          workoutType,
          duration: parseInt(duration),
          difficulty,
          targetMuscles,
          equipment,
          injuries,
          preferences,
          programLength: parseInt(programLength)
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      console.log("Function response:", { data, error });

      if (error) {
        console.error("Function error:", error);
        const msg = (error as any)?.message || "Failed to generate workout";
        toast.error(msg);
        return;
      }

      const plan = (data as any)?.workout ?? data;
      setGeneratedWorkout(plan);
      setWorkoutName(plan?.name || `${workoutType} Program`);
      
      // Save to generation history
      await saveGeneration('workout', plan, plan?.name || `${workoutType} Program`, {
        workoutType,
        duration: parseInt(duration),
        difficulty,
        targetMuscles,
        equipment,
        programLength: parseInt(programLength)
      });
      
      toast.success("Workout program generated successfully!");
      onWorkoutGenerated?.(plan);
    } catch (error: any) {
      console.error('Workout generation error:', error);
      const msg = error?.message || "An error occurred while generating your workout";
      if (msg.includes('Rate limit')) {
        toast.error('AI rate limit exceeded. Please try again in a minute.');
      } else if (msg.includes('AI credits')) {
        toast.error('AI credits exhausted. Please try again later.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartWorkout = async (workout: any) => {
    if (!workout) return;

    try {
      const workoutSession = {
        name: workout.workout_name || workout.name,
        exercises_data: workout.exercises || [],
        duration_minutes: workout.duration || parseInt(duration),
      };

      localStorage.setItem('currentWorkout', JSON.stringify(workoutSession));
      
      toast.success("Starting workout...");
      navigate('/workout-session');
    } catch (error) {
      console.error('Error starting workout:', error);
      toast.error("Failed to start workout");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Workout Generator
          </CardTitle>
          <CardDescription>
            Generate personalized workout programs with progressive overload and variety.
          </CardDescription>
        </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workout-type">Workout Type</Label>
              <Select value={workoutType} onValueChange={setWorkoutType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="program-length">Program Length</Label>
                <Select value={programLength} onValueChange={setProgramLength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Week</SelectItem>
                    <SelectItem value="4">4 Weeks</SelectItem>
                    <SelectItem value="8">8 Weeks</SelectItem>
                    <SelectItem value="12">12 Weeks</SelectItem>
                    <SelectItem value="16">16 Weeks</SelectItem>
                    <SelectItem value="24">24 Weeks</SelectItem>
                    <SelectItem value="36">36 Weeks</SelectItem>
                    <SelectItem value="52">52 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Target Muscle Groups</Label>
              <div className="grid grid-cols-2 gap-3">
                {muscleGroups.map((muscle) => (
                  <div key={muscle} className="flex items-center space-x-2">
                    <Checkbox
                      id={muscle}
                      checked={targetMuscles.includes(muscle)}
                      onCheckedChange={() => handleMuscleToggle(muscle)}
                    />
                    <Label htmlFor={muscle} className="text-sm">
                      {muscle}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences">Additional Preferences</Label>
              <Textarea
                id="preferences"
                placeholder="Any specific preferences, goals, or notes..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="min-h-20"
              />
            </div>

            <Button 
              onClick={generateWorkout} 
              className="w-full" 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Program...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Program
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedWorkout && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setGeneratedWorkout(null)}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <MultiWeekWorkoutDisplay 
              workoutPlan={normalizePlan(generatedWorkout)}
              onSave={(name: string, description: string) => {
                setWorkoutName(name);
                setWorkoutDescription(description);
                setShowSaveDialog(true);
              }}
              onStartWorkout={handleStartWorkout}
            />
          </div>
        )}
      </div>
  );
};