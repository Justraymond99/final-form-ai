import { Button } from "@/components/ui/button";
import { Play, Plus, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateCustomGoalDialog } from "@/components/CreateCustomGoalDialog";

export const QuickActions = () => {
  const navigate = useNavigate();
  
  const actions = [
    {
      label: "Start Workout",
      icon: Play,
      gradient: "gradient-strength",
      onClick: () => navigate("/workouts")
    },
    {
      label: "Log Food",
      icon: Plus,
      gradient: "gradient-energy",
      onClick: () => navigate("/nutrition")
    },
    {
      label: "Set Goal",
      icon: Target,
      gradient: "gradient-wellness",
      onClick: () => navigate("/profile")
    },
    {
      label: "View Progress",
      icon: TrendingUp,
      gradient: "gradient-hydration",
      onClick: () => navigate("/progress")
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex-col gap-2 border-card-border bg-card hover:bg-card-elevated transition-smooth group"
            onClick={action.onClick}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.gradient}`}>
              <action.icon className="w-5 h-5 text-background" />
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {action.label}
            </span>
          </Button>
        ))}
      </div>
      
      {/* Custom Goals */}
      <div className="pt-4 border-t border-border/30">
        <CreateCustomGoalDialog />
      </div>
    </div>
  );
};