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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Clock, Target, Dumbbell, AlertCircle, CheckCircle2, Save, Play, Loader2 } from "lucide-react";

interface WorkoutGeneratorProps {
  onWorkoutGenerated?: (workout: any) => void;
}

export const WorkoutGenerator = ({ onWorkoutGenerated }: WorkoutGeneratorProps) => {
  const { user } = useSecureAuth();
  const { startWorkout: createWorkoutSession } = useWorkouts();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  
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
          difficulty,
          targetMuscles,
          equipment,
          injuries,
          preferences
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedWorkout(data.workout);
        setWorkoutName(data.workout.name || `${workoutType} Workout`);
        toast.success("Workout generated successfully!");
        onWorkoutGenerated?.(data.workout);
      } else {
        throw new Error(data.error || 'Failed to generate workout');
      }
    } catch (error) {
      console.error('Workout generation error:', error);
      toast.error("An error occurred while generating your workout");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!generatedWorkout || !workoutName.trim()) {
      toast.error("Please enter a name for your workout template");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: workoutName,
          description: workoutDescription,
          type: workoutType || 'mixed',
          difficulty: difficulty || 'intermediate',
          estimated_duration: parseInt(duration),
          exercises: generatedWorkout.exercises || []
        });

      if (error) throw error;

      toast.success("Workout template saved successfully!");
      setShowSaveDialog(false);
      setWorkoutName("");
      setWorkoutDescription("");
    } catch (error) {
      console.error('Error saving workout template:', error);
      toast.error("Failed to save workout template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!generatedWorkout) return;

    try {
      const workoutSession = {
        name: generatedWorkout.name || `${workoutType} Workout`,
        exercises_data: generatedWorkout.exercises || [],
        duration_minutes: parseInt(duration),
      };

      // Store workout data in localStorage for the workout session page
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
            Get a personalized workout designed specifically for your goals, fitness level, and available equipment.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Workout Type */}
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

          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
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
          </div>

          {/* Target Muscles */}
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

          {/* Equipment */}
          <div className="space-y-3">
            <Label>Available Equipment</Label>
            <div className="grid grid-cols-1 gap-2">
              {equipmentOptions.map((equip) => (
                <div key={equip} className="flex items-center space-x-2">
                  <Checkbox
                    id={equip}
                    checked={equipment.includes(equip)}
                    onCheckedChange={() => handleEquipmentToggle(equip)}
                  />
                  <Label htmlFor={equip} className="text-sm">
                    {equip}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Injuries/Limitations */}
          <div className="space-y-3">
            <Label>Injuries or Limitations</Label>
            <div className="grid grid-cols-2 gap-3">
              {commonInjuries.map((injury) => (
                <div key={injury} className="flex items-center space-x-2">
                  <Checkbox
                    id={injury}
                    checked={injuries.includes(injury)}
                    onCheckedChange={() => handleInjuryToggle(injury)}
                  />
                  <Label htmlFor={injury} className="text-sm">
                    {injury}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Additional Preferences</Label>
            <Textarea
              id="preferences"
              placeholder="Any specific requests, goals, or preferences for your workout..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={3}
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
                Generating Your Workout...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Workout
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Workout Display */}
      {generatedWorkout && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Workout Template</DialogTitle>
                      <DialogDescription>
                        Save this workout as a template for future use.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="workout-name">Workout Name</Label>
                        <Input
                          id="workout-name"
                          placeholder="e.g., Upper Body Strength"
                          value={workoutName}
                          onChange={(e) => setWorkoutName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workout-description">Description (Optional)</Label>
                        <Textarea
                          id="workout-description"
                          placeholder="Describe your workout..."
                          value={workoutDescription}
                          onChange={(e) => setWorkoutDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowSaveDialog(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveAsTemplate}
                          disabled={isSaving || !workoutName.trim()}
                          className="flex-1"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Template
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button onClick={handleStartWorkout} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workout Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {generatedWorkout.name}
              </CardTitle>
              <CardDescription>{generatedWorkout.description}</CardDescription>
              
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {duration} min
                </Badge>
                <Badge variant="secondary">
                  <Target className="w-3 h-3 mr-1" />
                  {difficulty}
                </Badge>
                <Badge variant="secondary">
                  <Dumbbell className="w-3 h-3 mr-1" />
                  {workoutType}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Warm-up */}
              {generatedWorkout.warm_up && generatedWorkout.warm_up.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Warm-up
                  </h3>
                  <div className="space-y-2">
                    {generatedWorkout.warm_up.map((exercise: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        </div>
                        <Badge variant="outline">
                          {exercise.duration || exercise.sets + ' sets'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Exercises */}
              {generatedWorkout.exercises && generatedWorkout.exercises.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Main Workout
                  </h3>
                  <div className="space-y-3">
                    {generatedWorkout.exercises.map((exercise: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {exercise.sets} sets × {exercise.reps} reps
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {exercise.rest}s rest
                            </div>
                          </div>
                        </div>
                        
                        {exercise.tips && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <strong>Tips:</strong> {exercise.tips}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cool-down */}
              {generatedWorkout.cool_down && generatedWorkout.cool_down.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Cool-down
                  </h3>
                  <div className="space-y-2">
                    {generatedWorkout.cool_down.map((exercise: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        </div>
                        <Badge variant="outline">
                          {exercise.duration || exercise.sets + ' sets'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Notes */}
              {generatedWorkout.safety_notes && (
                <div className="border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                        Safety Notes
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {generatedWorkout.safety_notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};