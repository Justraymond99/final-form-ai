import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Check, X, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import { formatLabel } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  restTime: number;
  instructions?: string;
}

const WorkoutSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const [workoutName, setWorkoutName] = useState("Workout");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentRestExercise, setCurrentRestExercise] = useState<{ name: string; restTime: number } | null>(null);
  const [workoutStartTime] = useState(Date.now());
  const [isFinishing, setIsFinishing] = useState(false);
  const [expandedInstructions, setExpandedInstructions] = useState<string | null>(null);

  // Load workout from localStorage on mount
  useEffect(() => {
    const storedWorkout = localStorage.getItem('currentWorkout');
    console.log('Loading workout from localStorage:', storedWorkout);
    
    if (storedWorkout) {
      try {
        const workout = JSON.parse(storedWorkout);
        console.log('Parsed workout:', workout);
        setWorkoutName(workout.name || "Workout");
        
        // Get exercises array - could be in exercises_data or exercises field
        const exercisesArray = workout.exercises_data || workout.exercises || [];
        console.log('Exercises array:', exercisesArray);
        
        if (Array.isArray(exercisesArray) && exercisesArray.length > 0) {
          const convertedExercises = exercisesArray.map((ex: any, index: number) => {
            console.log(`Converting exercise ${index}:`, ex);
            
            // Parse reps - could be "8-12", "10", or just a number
            const repsStr = String(ex.reps || ex.target_reps || "10");
            const repsNum = parseInt(repsStr.split("-")[0]) || 10;
            
            // Number of sets - default to 3 if not specified
            const numSets = Number(ex.sets) || Number(ex.target_sets) || 3;
            
            // Create set objects with the correct reps
            const sets: Set[] = Array.from({ length: numSets }, (_, i) => ({
              id: `${index}-${i}`,
              reps: repsNum,
              weight: 0,
              completed: false
            }));

            return {
              id: String(index),
              name: formatLabel(ex.exercise || ex.name || `Exercise ${index + 1}`),
              sets,
              restTime: Number(ex.rest_seconds) || Number(ex.rest) || 90,
              instructions: ex.instructions || ex.notes || ""
            };
          });
          
          console.log('Converted exercises:', convertedExercises);
          
          if (convertedExercises.length > 0) {
            setExercises(convertedExercises);
          } else {
            setExercises([createEmptyExercise()]);
          }
        } else {
          console.log('No exercises found, using empty exercise');
          setExercises([createEmptyExercise()]);
        }
        
        // Clear from localStorage after loading
        localStorage.removeItem('currentWorkout');
      } catch (error) {
        console.error('Error loading workout:', error);
        setExercises([createEmptyExercise()]);
      }
    } else {
      // No stored workout, start with empty exercise
      setExercises([createEmptyExercise()]);
    }
  }, []);

  const createEmptyExercise = (): Exercise => ({
    id: Date.now().toString(),
    name: "New Exercise",
    sets: [{ id: "1", reps: 10, weight: 0, completed: false }],
    restTime: 90
  });

  const addExercise = () => {
    setExercises([...exercises, createEmptyExercise()]);
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, name } : exercise
    ));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: Set = {
          id: Date.now().toString(),
          reps: lastSet?.reps || 10,
          weight: lastSet?.weight || 0,
          completed: false
        };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      }
      return exercise;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId && exercise.sets.length > 1) {
        return { ...exercise, sets: exercise.sets.filter(s => s.id !== setId) };
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
    const exercise = exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    const wasCompleted = set?.completed;

    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => 
            s.id === setId ? { ...s, completed: !s.completed } : s
          )
        };
      }
      return ex;
    }));

    // Start rest timer only when completing a set (not uncompleting)
    if (!wasCompleted && exercise) {
      setCurrentRestExercise({ name: exercise.name, restTime: exercise.restTime });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletedSets = () => {
    return exercises.reduce((total, ex) => 
      total + ex.sets.filter(s => s.completed).length, 0
    );
  };

  const getTotalSets = () => {
    return exercises.reduce((total, ex) => total + ex.sets.length, 0);
  };

  const finishWorkout = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save workouts" });
      return;
    }

    setIsFinishing(true);
    try {
      const durationMinutes = Math.floor((Date.now() - workoutStartTime) / 60000);
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: workoutName,
          started_at: new Date(workoutStartTime).toISOString(),
          completed_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          exercises_data: JSON.parse(JSON.stringify(exercises))
        });

      if (error) throw error;

      toast({ 
        title: "Workout Complete!", 
        description: `Great job! ${getCompletedSets()}/${getTotalSets()} sets completed in ${formatTime(durationMinutes * 60)}` 
      });
      
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
    <div className="min-h-screen bg-background text-foreground p-4 pb-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/workouts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1 mx-2">
            <h1 className="text-lg font-bold truncate">{workoutName}</h1>
            <p className="text-xs text-muted-foreground">
              {getCompletedSets()}/{getTotalSets()} sets completed
            </p>
          </div>
          <Button size="sm" variant="default" onClick={finishWorkout} disabled={isFinishing}>
            {isFinishing ? "..." : "Finish"}
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                <Input
                  value={exercise.name}
                  onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                  className="font-semibold text-base border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                />
              </CardTitle>
              {exercise.instructions && (
                <Collapsible 
                  open={expandedInstructions === exercise.id}
                  onOpenChange={(open) => setExpandedInstructions(open ? exercise.id : null)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 mr-1" />
                      {expandedInstructions === exercise.id ? "Hide tips" : "Show tips"}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                      {exercise.instructions}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Sets Table Header */}
              <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Set</span>
                <span className="text-center">Reps</span>
                <span className="text-center">Weight</span>
                <span className="text-center">Done</span>
                <span></span>
              </div>
              
              {/* Sets */}
              {exercise.sets.map((set, index) => (
                <div 
                  key={set.id} 
                  className={`grid grid-cols-5 gap-2 items-center p-1 rounded ${set.completed ? 'bg-primary/10' : ''}`}
                >
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <Input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                    className="h-8 text-center text-sm"
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseInt(e.target.value) || 0)}
                    className="h-8 text-center text-sm"
                    placeholder="0"
                  />
                  <Button
                    size="sm"
                    variant={set.completed ? "default" : "outline"}
                    onClick={() => completeSet(exercise.id, set.id)}
                    className="h-8 w-8 p-0"
                  >
                    {set.completed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-30" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSet(exercise.id, set.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    disabled={exercise.sets.length <= 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {/* Add Set Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => addSet(exercise.id)}
                className="w-full h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
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
