import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";
import { Sparkles, Clock, Target, Dumbbell, AlertCircle, CheckCircle2 } from "lucide-react";

interface WorkoutGeneratorProps {
  onWorkoutGenerated?: (workout: any) => void;
}

export const WorkoutGenerator = ({ onWorkoutGenerated }: WorkoutGeneratorProps) => {
  const { user } = useSecureAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  
  // Form state
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState("30");
  const [difficulty, setDifficulty] = useState("");
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");

  const workoutTypes = [
    "Strength Training", "Cardio", "HIIT", "Yoga", "Pilates", "Functional", "Bodyweight", "Mixed"
  ];

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

  const muscleGroups = [
    "Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Glutes", "Full Body"
  ];

  const equipmentOptions = [
    "Bodyweight Only", "Dumbbells", "Barbell", "Resistance Bands", "Pull-up Bar", 
    "Kettlebell", "Medicine Ball", "Yoga Mat", "Foam Roller", "Gym Machine"
  ];

  const commonInjuries = [
    "Lower Back Pain", "Knee Issues", "Shoulder Impingement", "Wrist Pain", 
    "Ankle Problems", "Hip Tightness", "Neck Pain", "Previous Surgery"
  ];

  const handleMuscleGroupToggle = (muscle: string) => {
    setTargetMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleEquipmentToggle = (item: string) => {
    setEquipment(prev => 
      prev.includes(item) 
        ? prev.filter(e => e !== item)
        : [...prev, item]
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
      const { data, error } = await supabase.functions.invoke('ai-workout-generator', {
        body: {
          userId: user.id,
          workoutType,
          duration: parseInt(duration),
          difficulty: difficulty.toLowerCase(),
          targetMuscles,
          equipment,
          injuries,
          preferences
        }
      });

      if (error) {
        console.error('Error generating workout:', error);
        toast.error("Failed to generate workout. Please try again.");
        return;
      }

      setGeneratedWorkout(data.workout);
      onWorkoutGenerated?.(data.workout);
      toast.success("AI workout generated successfully!");

    } catch (error) {
      console.error('Workout generation error:', error);
      toast.error("An error occurred while generating your workout");
    } finally {
      setIsGenerating(false);
    }
  };

  const startWorkout = () => {
    if (generatedWorkout) {
      // Create a new workout session with the AI-generated workout
      const workoutData = {
        name: generatedWorkout.name,
        exercises: generatedWorkout.main_exercises,
        warm_up: generatedWorkout.warm_up,
        cool_down: generatedWorkout.cool_down
      };
      
      // Store in localStorage for the workout session
      localStorage.setItem('pendingWorkout', JSON.stringify(workoutData));
      window.location.href = '/workout-session';
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
            Get a personalized workout designed specifically for your goals, fitness level, and available equipment.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Workout Type */}
          <div className="space-y-2">
            <Label htmlFor="workout-type">Workout Type *</Label>
            <Select value={workoutType} onValueChange={setWorkoutType}>
              <SelectTrigger>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                {workoutTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration and Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="10"
                max="120"
                placeholder="30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Muscle Groups */}
          <div className="space-y-2">
            <Label>Target Muscle Groups</Label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((muscle) => (
                <Badge
                  key={muscle}
                  variant={targetMuscles.includes(muscle) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleMuscleGroupToggle(muscle)}
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>

          {/* Available Equipment */}
          <div className="space-y-2">
            <Label>Available Equipment</Label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((item) => (
                <Badge
                  key={item}
                  variant={equipment.includes(item) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleEquipmentToggle(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Injuries/Limitations */}
          <div className="space-y-2">
            <Label>Injuries or Limitations</Label>
            <div className="flex flex-wrap gap-2">
              {commonInjuries.map((injury) => (
                <Badge
                  key={injury}
                  variant={injuries.includes(injury) ? "destructive" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleInjuryToggle(injury)}
                >
                  {injury}
                </Badge>
              ))}
            </div>
          </div>

          {/* Additional Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Additional Preferences</Label>
            <Textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Any specific preferences, goals, or requirements..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={generateWorkout}
            disabled={isGenerating || !workoutType || !difficulty}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Your Perfect Workout...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Workout
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Workout Display */}
      {generatedWorkout && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {generatedWorkout.name}
            </CardTitle>
            <CardDescription>{generatedWorkout.description}</CardDescription>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {generatedWorkout.estimated_duration} min
              </Badge>
              <Badge variant="outline">
                <Target className="w-3 h-3 mr-1" />
                {generatedWorkout.difficulty}
              </Badge>
              <Badge variant="outline">
                <Dumbbell className="w-3 h-3 mr-1" />
                {generatedWorkout.type}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Warm-up */}
            {generatedWorkout.warm_up && generatedWorkout.warm_up.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Warm-up</h4>
                <div className="space-y-2">
                  {generatedWorkout.warm_up.map((exercise: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{exercise.exercise}</span>
                        <Badge variant="outline">{exercise.duration_seconds}s</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                      {exercise.tips && (
                        <p className="text-xs text-primary mt-1">💡 {exercise.tips}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Main Exercises */}
            <div>
              <h4 className="font-semibold mb-2">Main Workout</h4>
              <div className="space-y-3">
                {generatedWorkout.main_exercises?.map((exercise: any, index: number) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{exercise.exercise}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{exercise.sets} sets</Badge>
                        <Badge variant="outline">{exercise.reps} reps</Badge>
                        <Badge variant="outline">{exercise.rest_seconds}s rest</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{exercise.instructions}</p>
                    {exercise.modifications && (
                      <p className="text-xs text-primary">🔄 {exercise.modifications}</p>
                    )}
                    {exercise.target_muscles && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exercise.target_muscles.map((muscle: string) => (
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

            <Separator />

            {/* Cool-down */}
            {generatedWorkout.cool_down && generatedWorkout.cool_down.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Cool-down</h4>
                <div className="space-y-2">
                  {generatedWorkout.cool_down.map((exercise: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{exercise.exercise}</span>
                        <Badge variant="outline">{exercise.duration_seconds}s</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                      {exercise.benefits && (
                        <p className="text-xs text-green-600 mt-1">✨ {exercise.benefits}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes and Tips */}
            {(generatedWorkout.notes || generatedWorkout.progression_tips) && (
              <>
                <Separator />
                <div className="space-y-2">
                  {generatedWorkout.notes && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-amber-800">Safety Notes</h5>
                          <p className="text-sm text-amber-700">{generatedWorkout.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {generatedWorkout.progression_tips && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-blue-800">Progression Tips</h5>
                          <p className="text-sm text-blue-700">{generatedWorkout.progression_tips}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={startWorkout} className="flex-1">
                Start This Workout
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedWorkout(null)}
              >
                Generate New Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};