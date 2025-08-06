import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const exerciseDatabase: ExerciseTemplate[] = [
    { id: "1", name: "Bench Press", muscle: "Chest", sets: 3, reps: "8-10" },
    { id: "2", name: "Incline Dumbbell Press", muscle: "Chest", sets: 3, reps: "10-12" },
    { id: "3", name: "Overhead Press", muscle: "Shoulders", sets: 3, reps: "6-8" },
    { id: "4", name: "Lateral Raises", muscle: "Shoulders", sets: 3, reps: "12-15" },
    { id: "5", name: "Tricep Dips", muscle: "Triceps", sets: 3, reps: "10-12" },
    { id: "6", name: "Close-Grip Bench Press", muscle: "Triceps", sets: 3, reps: "8-10" },
    { id: "7", name: "Squats", muscle: "Legs", sets: 3, reps: "8-10" },
    { id: "8", name: "Deadlifts", muscle: "Back", sets: 3, reps: "5-6" },
    { id: "9", name: "Pull-ups", muscle: "Back", sets: 3, reps: "8-12" },
    { id: "10", name: "Barbell Rows", muscle: "Back", sets: 3, reps: "8-10" },
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

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      toast({ title: "Error", description: "Please enter a workout name" });
      return;
    }
    if (selectedExercises.length === 0) {
      toast({ title: "Error", description: "Please add at least one exercise" });
      return;
    }

    // Here you would save to database/storage
    toast({ 
      title: "Workout Saved!", 
      description: `"${workoutName}" saved with ${selectedExercises.length} exercises` 
    });
    navigate("/workouts");
  };

  const getMuscleColor = (muscle: string) => {
    const colors: Record<string, string> = {
      "Chest": "bg-red-500/10 text-red-500 border-red-500/20",
      "Shoulders": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "Triceps": "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "Back": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Legs": "bg-green-500/10 text-green-500 border-green-500/20",
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
          <Button onClick={saveWorkout} size="sm">
            Save
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