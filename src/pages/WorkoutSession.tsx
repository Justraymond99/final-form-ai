import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useWorkouts } from "@/hooks/useWorkouts";
import { WorkoutTimer } from "@/components/WorkoutTimer";

interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  restTime: number; // seconds
}

const WorkoutSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const { completeWorkout } = useWorkouts();
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      name: "Bench Press",
      sets: [
        { id: "1", reps: 8, weight: 135, completed: false },
        { id: "2", reps: 8, weight: 155, completed: false },
        { id: "3", reps: 6, weight: 175, completed: false },
      ],
      restTime: 180
    }
  ]);
  
  const [currentRestExercise, setCurrentRestExercise] = useState<{ name: string; restTime: number } | null>(null);
  const [workoutStartTime] = useState(Date.now());
  const [isFinishing, setIsFinishing] = useState(false);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "New Exercise",
      sets: [{ id: "1", reps: 0, weight: 0, completed: false }],
      restTime: 120
    };
    setExercises([...exercises, newExercise]);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: Set = {
          id: Date.now().toString(),
          reps: lastSet?.reps || 0,
          weight: lastSet?.weight || 0,
          completed: false
        };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      }
      return exercise;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => 
            set.id === setId ? { ...set, [field]: value } : set
          )
        };
      }
      return exercise;
    }));
  };

  const completeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map(set => 
          set.id === setId ? { ...set, completed: !set.completed } : set
        );
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));

    // Start rest timer
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise) {
      setCurrentRestExercise({ name: exercise.name, restTime: exercise.restTime });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutDuration = () => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    return formatTime(duration);
  };

  const finishWorkout = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save workouts" });
      return;
    }

    setIsFinishing(true);
    try {
      // Create a workout session in the database
      const durationMinutes = Math.floor((Date.now() - workoutStartTime) / 60000);
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: "Quick Workout",
          started_at: new Date(workoutStartTime).toISOString(),
          completed_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          exercises_data: JSON.parse(JSON.stringify(exercises))
        });

      if (error) throw error;

      toast({ 
        title: "Workout Complete!", 
        description: `Great job! You worked out for ${formatTime(durationMinutes * 60)}` 
      });
      
      // Use a timeout to ensure the navigation happens after state updates
      setTimeout(() => {
        navigate("/workouts");
      }, 100);
    } catch (error) {
      console.error('Error saving workout session:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save workout. Please try again." 
      });
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/workouts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">Push Workout</h1>
          </div>
          <Button size="sm" variant="outline" onClick={finishWorkout} disabled={isFinishing}>
            {isFinishing ? "Finishing..." : "Finish"}
          </Button>
        </div>

        {/* Rest Timer */}
        {currentRestExercise && (
          <WorkoutTimer 
            exerciseName={currentRestExercise.name}
            defaultSeconds={currentRestExercise.restTime}
            onComplete={() => {
              setCurrentRestExercise(null);
              toast({ 
                title: "Rest Complete!", 
                description: "Time to start your next set" 
              });
            }}
          />
        )}

        {/* Exercises */}
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Sets Table Header */}
              <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground">
                <span>Set</span>
                <span>Reps</span>
                <span>Weight</span>
                <span>Done</span>
                <span></span>
              </div>
              
              {/* Sets */}
              {exercise.sets.map((set, index) => (
                <div key={set.id} className="grid grid-cols-5 gap-2 items-center">
                  <Badge variant="outline" className="w-fit">
                    {index + 1}
                  </Badge>
                  <Input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseInt(e.target.value) || 0)}
                    className="h-8 text-center"
                    placeholder="0"
                  />
                  <Button
                    size="sm"
                    variant={set.completed ? "default" : "outline"}
                    onClick={() => completeSet(exercise.id, set.id)}
                    className="h-8 w-8 p-0"
                  >
                    {set.completed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {set.completed && "✓"}
                  </span>
                </div>
              ))}
              
              {/* Add Set Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => addSet(exercise.id)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Set
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Add Exercise Button */}
        <Button 
          variant="outline" 
          onClick={addExercise}
          className="w-full h-12"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Exercise
        </Button>
      </div>
    </div>
  );
};

export default WorkoutSession;