import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaywall } from "@/components/PaywallModal";
import { 
  Brain, 
  Utensils, 
  Sparkles, 
  Lock,
  Dumbbell,
  Calendar,
  TrendingUp,
  Gift
} from "lucide-react";

// Sample blurred content to show what premium features look like
const sampleWorkout = {
  name: "Push Day Power",
  exercises: [
    { name: "Bench Press", sets: "4x8", rest: "90s" },
    { name: "Incline Dumbbell Press", sets: "3x10", rest: "60s" },
    { name: "Cable Flyes", sets: "3x12", rest: "45s" },
    { name: "Overhead Press", sets: "4x8", rest: "90s" },
    { name: "Lateral Raises", sets: "3x15", rest: "30s" },
  ]
};

const sampleMealPlan = {
  name: "High Protein Day",
  meals: [
    { time: "Breakfast", meal: "Greek Yogurt Parfait with berries and granola", cal: "420 cal" },
    { time: "Lunch", meal: "Grilled Chicken Salad with avocado", cal: "580 cal" },
    { time: "Dinner", meal: "Salmon with quinoa and vegetables", cal: "650 cal" },
    { time: "Snack", meal: "Protein shake with banana", cal: "280 cal" },
  ]
};

interface FeaturePreviewCardProps {
  type: "workout" | "meal";
  title?: string;
}

export const FeaturePreviewCard = ({ type, title }: FeaturePreviewCardProps) => {
  const { hasPremiumAccess } = useSubscription();
  const { showPaywall } = usePaywall();

  // If user has premium, don't show preview cards
  if (hasPremiumAccess) return null;

  const handleUnlock = () => {
    showPaywall(type === "workout" ? "AI Workout Generator" : "AI Nutrition Planner");
  };

  if (type === "workout") {
    return (
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card to-primary/5">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none select-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {sampleWorkout.name}
              </CardTitle>
              <Badge variant="secondary">AI Generated</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleWorkout.exercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="font-medium">{exercise.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{exercise.sets}</span>
                  <span>{exercise.rest}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-background" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title || "AI-Generated Workouts"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Personalized routines tailored to your goals
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Gift className="h-3 w-3 mr-1" />
              7-Day Free Trial
            </Badge>
            <Button 
              onClick={handleUnlock}
              className="bg-gradient-primary hover:opacity-90 text-background"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Unlock Now
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Meal plan preview
  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card to-accent/5">
      {/* Blurred Content */}
      <div className="blur-sm pointer-events-none select-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5 text-accent" />
              {sampleMealPlan.name}
            </CardTitle>
            <Badge variant="secondary">AI Generated</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sampleMealPlan.meals.map((meal, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">{meal.time}</Badge>
                <span className="text-sm">{meal.meal}</span>
              </div>
              <span className="text-sm text-muted-foreground">{meal.cal}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Calories</span>
              <span className="text-primary font-semibold">1,930 cal</span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
        <div className="text-center space-y-4 p-6">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title || "AI-Generated Meal Plans"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Custom nutrition tailored to your goals
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Gift className="h-3 w-3 mr-1" />
            7-Day Free Trial
          </Badge>
          <Button 
            onClick={handleUnlock}
            className="bg-gradient-primary hover:opacity-90 text-background"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Unlock Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Compact version for homepage
export const FeaturePreviewCompact = ({ type }: { type: "workout" | "meal" }) => {
  const { hasPremiumAccess } = useSubscription();
  const { showPaywall } = usePaywall();

  if (hasPremiumAccess) return null;

  const config = type === "workout" 
    ? { icon: Brain, label: "AI Workout", color: "text-primary", bgColor: "bg-primary/10" }
    : { icon: Utensils, label: "AI Meal Plan", color: "text-accent", bgColor: "bg-accent/10" };

  return (
    <button
      onClick={() => showPaywall(type === "workout" ? "AI Workout Generator" : "AI Nutrition Planner")}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor} hover:opacity-80 transition-opacity`}
    >
      <config.icon className={`h-4 w-4 ${config.color}`} />
      <span className="text-sm font-medium">{config.label}</span>
      <Lock className="h-3 w-3 text-muted-foreground" />
    </button>
  );
};