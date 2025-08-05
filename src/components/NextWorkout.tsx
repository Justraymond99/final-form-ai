import { Button } from "@/components/ui/button";
import { Play, Clock, Target } from "lucide-react";

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
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "text-accent";
      case "Intermediate": return "text-primary";
      case "Advanced": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {workoutName}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className={getDifficultyColor(difficulty)}>{difficulty}</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onStart}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
        >
          <Play className="w-4 h-4 mr-2" />
          Start
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Target Muscles</p>
          <div className="flex flex-wrap gap-2">
            {targetMuscles.map((muscle, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
        
        <div className="pt-3 border-t border-card-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last completed:</span>
            <span className="text-foreground font-medium">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};