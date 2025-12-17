import { Button } from "@/components/ui/button";
import { Play, Clock, Target } from "lucide-react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface NextWorkoutProps {
  workoutName: string;
  estimatedTime: number;
  targetMuscles: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  onStart: () => void;
}

export const NextWorkout = ({ 
  workoutName, 
  estimatedTime, 
  targetMuscles, 
  difficulty,
  onStart 
}: NextWorkoutProps) => {
  const { startWorkout, templates } = useWorkouts();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStartWorkout = async () => {
    // Find the workout template by name
    const template = templates.find(t => t.name === workoutName);
    if (template) {
      const result = await startWorkout(template.id);
      if (result?.success) {
        toast({ title: "Workout Started!", description: "Let's get moving!" });
        navigate("/workout-session");
      }
    } else {
      onStart(); // Fallback to provided onStart
    }
  };
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "text-accent";
      case "Intermediate": return "text-primary";
      case "Advanced": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-4 sm:p-6">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 truncate">
            {workoutName}
          </h3>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={getDifficultyColor(difficulty)}>{difficulty}</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleStartWorkout}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary ml-2 px-3 sm:px-4"
          size="sm"
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Start</span>
          <span className="inline sm:hidden">Go</span>
        </Button>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-foreground mb-2">Target Muscles</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {targetMuscles.slice(0, 3).map((muscle, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 sm:py-1 sm:px-3 bg-muted rounded-full text-xs font-medium text-muted-foreground truncate max-w-[100px]"
              >
                {muscle}
              </span>
            ))}
            {targetMuscles.length > 3 && (
              <span className="px-2 py-0.5 sm:py-1 sm:px-3 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                +{targetMuscles.length - 3}
              </span>
            )}
          </div>
        </div>
        
        <div className="pt-2 sm:pt-3 border-t border-card-border">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Last completed:</span>
            <span className="text-foreground font-medium">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};