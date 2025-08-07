import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ExerciseTemplate {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
}

const WorkoutBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const exerciseDatabase: ExerciseTemplate[] = [
    // Chest
    { id: "1", name: "Bench Press", muscle: "Chest", sets: 3, reps: "8-10" },
    { id: "2", name: "Incline Dumbbell Press", muscle: "Chest", sets: 3, reps: "10-12" },
    { id: "3", name: "Decline Bench Press", muscle: "Chest", sets: 3, reps: "8-10" },
    { id: "4", name: "Dumbbell Flyes", muscle: "Chest", sets: 3, reps: "12-15" },
    { id: "5", name: "Cable Crossovers", muscle: "Chest", sets: 3, reps: "12-15" },
    { id: "6", name: "Push-ups", muscle: "Chest", sets: 3, reps: "15-20" },
    { id: "7", name: "Incline Barbell Press", muscle: "Chest", sets: 3, reps: "8-10" },
    { id: "8", name: "Chest Dips", muscle: "Chest", sets: 3, reps: "10-15" },
    
    // Shoulders
    { id: "9", name: "Overhead Press", muscle: "Shoulders", sets: 3, reps: "6-8" },
    { id: "10", name: "Lateral Raises", muscle: "Shoulders", sets: 3, reps: "12-15" },
    { id: "11", name: "Front Raises", muscle: "Shoulders", sets: 3, reps: "12-15" },
    { id: "12", name: "Rear Delt Flyes", muscle: "Shoulders", sets: 3, reps: "15-20" },
    { id: "13", name: "Arnold Press", muscle: "Shoulders", sets: 3, reps: "10-12" },
    { id: "14", name: "Face Pulls", muscle: "Shoulders", sets: 3, reps: "15-20" },
    { id: "15", name: "Upright Rows", muscle: "Shoulders", sets: 3, reps: "10-12" },
    { id: "16", name: "Pike Push-ups", muscle: "Shoulders", sets: 3, reps: "8-12" },
    
    // Triceps
    { id: "17", name: "Tricep Dips", muscle: "Triceps", sets: 3, reps: "10-12" },
    { id: "18", name: "Close-Grip Bench Press", muscle: "Triceps", sets: 3, reps: "8-10" },
    { id: "19", name: "Tricep Pushdowns", muscle: "Triceps", sets: 3, reps: "12-15" },
    { id: "20", name: "Overhead Tricep Extension", muscle: "Triceps", sets: 3, reps: "10-12" },
    { id: "21", name: "Diamond Push-ups", muscle: "Triceps", sets: 3, reps: "8-12" },
    { id: "22", name: "Skull Crushers", muscle: "Triceps", sets: 3, reps: "10-12" },
    
    // Back
    { id: "23", name: "Deadlifts", muscle: "Back", sets: 3, reps: "5-6" },
    { id: "24", name: "Pull-ups", muscle: "Back", sets: 3, reps: "8-12" },
    { id: "25", name: "Barbell Rows", muscle: "Back", sets: 3, reps: "8-10" },
    { id: "26", name: "Lat Pulldowns", muscle: "Back", sets: 3, reps: "10-12" },
    { id: "27", name: "T-Bar Rows", muscle: "Back", sets: 3, reps: "8-10" },
    { id: "28", name: "Seated Cable Rows", muscle: "Back", sets: 3, reps: "10-12" },
    { id: "29", name: "Single-Arm Dumbbell Rows", muscle: "Back", sets: 3, reps: "10-12" },
    { id: "30", name: "Romanian Deadlifts", muscle: "Back", sets: 3, reps: "8-10" },
    { id: "31", name: "Chin-ups", muscle: "Back", sets: 3, reps: "6-10" },
    { id: "32", name: "Reverse Flyes", muscle: "Back", sets: 3, reps: "12-15" },
    
    // Biceps
    { id: "33", name: "Barbell Curls", muscle: "Biceps", sets: 3, reps: "10-12" },
    { id: "34", name: "Dumbbell Curls", muscle: "Biceps", sets: 3, reps: "10-12" },
    { id: "35", name: "Hammer Curls", muscle: "Biceps", sets: 3, reps: "10-12" },
    { id: "36", name: "Preacher Curls", muscle: "Biceps", sets: 3, reps: "8-10" },
    { id: "37", name: "Cable Curls", muscle: "Biceps", sets: 3, reps: "12-15" },
    { id: "38", name: "21s Curls", muscle: "Biceps", sets: 3, reps: "21" },
    { id: "39", name: "Concentration Curls", muscle: "Biceps", sets: 3, reps: "10-12" },
    
    // Legs - Quads
    { id: "40", name: "Squats", muscle: "Quads", sets: 3, reps: "8-10" },
    { id: "41", name: "Front Squats", muscle: "Quads", sets: 3, reps: "8-10" },
    { id: "42", name: "Leg Press", muscle: "Quads", sets: 3, reps: "12-15" },
    { id: "43", name: "Leg Extensions", muscle: "Quads", sets: 3, reps: "12-15" },
    { id: "44", name: "Bulgarian Split Squats", muscle: "Quads", sets: 3, reps: "10-12" },
    { id: "45", name: "Lunges", muscle: "Quads", sets: 3, reps: "10-12" },
    { id: "46", name: "Goblet Squats", muscle: "Quads", sets: 3, reps: "12-15" },
    
    // Legs - Hamstrings
    { id: "47", name: "Romanian Deadlifts", muscle: "Hamstrings", sets: 3, reps: "8-10" },
    { id: "48", name: "Leg Curls", muscle: "Hamstrings", sets: 3, reps: "12-15" },
    { id: "49", name: "Stiff Leg Deadlifts", muscle: "Hamstrings", sets: 3, reps: "10-12" },
    { id: "50", name: "Good Mornings", muscle: "Hamstrings", sets: 3, reps: "10-12" },
    { id: "51", name: "Single Leg RDLs", muscle: "Hamstrings", sets: 3, reps: "8-10" },
    
    // Glutes
    { id: "52", name: "Hip Thrusts", muscle: "Glutes", sets: 3, reps: "12-15" },
    { id: "53", name: "Glute Bridges", muscle: "Glutes", sets: 3, reps: "15-20" },
    { id: "54", name: "Sumo Deadlifts", muscle: "Glutes", sets: 3, reps: "8-10" },
    { id: "55", name: "Clamshells", muscle: "Glutes", sets: 3, reps: "15-20" },
    { id: "56", name: "Lateral Walks", muscle: "Glutes", sets: 3, reps: "12-15" },
    
    // Calves
    { id: "57", name: "Calf Raises", muscle: "Calves", sets: 4, reps: "15-20" },
    { id: "58", name: "Seated Calf Raises", muscle: "Calves", sets: 4, reps: "15-20" },
    { id: "59", name: "Donkey Calf Raises", muscle: "Calves", sets: 3, reps: "12-15" },
    
    // Core
    { id: "60", name: "Planks", muscle: "Core", sets: 3, reps: "30-60s" },
    { id: "61", name: "Crunches", muscle: "Core", sets: 3, reps: "15-25" },
    { id: "62", name: "Russian Twists", muscle: "Core", sets: 3, reps: "20-30" },
    { id: "63", name: "Mountain Climbers", muscle: "Core", sets: 3, reps: "20-30" },
    { id: "64", name: "Dead Bug", muscle: "Core", sets: 3, reps: "10-15" },
    { id: "65", name: "Bicycle Crunches", muscle: "Core", sets: 3, reps: "20-30" },
    { id: "66", name: "Leg Raises", muscle: "Core", sets: 3, reps: "10-15" },
    { id: "67", name: "Side Planks", muscle: "Core", sets: 3, reps: "20-30s" },
    
    // Cardio
    { id: "68", name: "Burpees", muscle: "Cardio", sets: 3, reps: "10-15" },
    { id: "69", name: "Jump Squats", muscle: "Cardio", sets: 3, reps: "15-20" },
    { id: "70", name: "High Knees", muscle: "Cardio", sets: 3, reps: "30s" },
    { id: "71", name: "Jumping Jacks", muscle: "Cardio", sets: 3, reps: "30s" },
    { id: "72", name: "Battle Ropes", muscle: "Cardio", sets: 3, reps: "30s" },
  ];

  const filteredExercises = exerciseDatabase.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addExercise = (exercise: ExerciseTemplate) => {
    if (!selectedExercises.find(e => e.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== exerciseId));
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      toast({ title: "Error", description: "Please enter a workout name" });
      return;
    }
    if (selectedExercises.length === 0) {
      toast({ title: "Error", description: "Please add at least one exercise" });
      return;
    }
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save workouts" });
      return;
    }

    setIsLoading(true);
    try {
      // Convert selected exercises to the format expected by the database
      const exercises = selectedExercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: 120 // default rest time
      }));

      const { error } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: workoutName.trim(),
          type: 'custom',
          description: `Custom workout with ${selectedExercises.length} exercises`,
          estimated_duration: selectedExercises.length * 5, // rough estimate
          difficulty: 'intermediate',
          exercises: exercises
        });

      if (error) throw error;

      toast({ 
        title: "Workout Saved!", 
        description: `"${workoutName}" saved with ${selectedExercises.length} exercises` 
      });
      navigate("/workouts");
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save workout. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMuscleColor = (muscle: string) => {
    const colors: Record<string, string> = {
      "Chest": "bg-red-500/10 text-red-500 border-red-500/20",
      "Shoulders": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "Triceps": "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "Back": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Biceps": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      "Quads": "bg-green-500/10 text-green-500 border-green-500/20",
      "Hamstrings": "bg-lime-500/10 text-lime-500 border-lime-500/20",
      "Glutes": "bg-pink-500/10 text-pink-500 border-pink-500/20",
      "Calves": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "Core": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "Cardio": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    };
    return colors[muscle] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/workouts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Create Workout</h1>
          <Button onClick={saveWorkout} size="sm" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Workout Name */}
        <Card>
          <CardContent className="p-4">
            <Input
              placeholder="Enter workout name (e.g., Push Day A)"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="text-lg font-medium"
            />
          </CardContent>
        </Card>

        {/* Selected Exercises */}
        {selectedExercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Exercises ({selectedExercises.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedExercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-center justify-between p-2 border border-border/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMuscleColor(exercise.muscle)}>
                      {exercise.muscle}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Exercise Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Exercises</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 border border-border/30 rounded-lg hover:bg-accent/5 cursor-pointer"
                onClick={() => addExercise(exercise)}
              >
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getMuscleColor(exercise.muscle)}>
                    {exercise.muscle}
                  </Badge>
                  {selectedExercises.find(e => e.id === exercise.id) ? (
                    <Badge variant="default">Added</Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutBuilder;