import { Plus, Play, Clock, TrendingUp, Dumbbell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwipeableNavigation } from "@/components/SwipeableNavigation";
import { WorkoutGenerator } from "@/components/WorkoutGenerator";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Workouts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates, recentWorkouts: dbRecentWorkouts, startWorkout } = useWorkouts();

  // Format recent workouts for display
  const recentWorkouts = dbRecentWorkouts.map(workout => ({
    id: workout.id,
    name: workout.name,
    duration: `${workout.duration_minutes || 30} min`,
    exercises: workout.exercises_data ? Object.keys(workout.exercises_data).length : 0,
    lastPerformed: new Date(workout.started_at).toLocaleDateString()
  }));

  // Format templates for display
  const workoutTemplates = templates.map(template => ({
    id: template.id,
    name: template.name,
    type: template.type,
    exercises: Array.isArray(template.exercises) ? template.exercises.length : 0,
    difficulty: template.difficulty
  }));

  const handleStartWorkout = async (workoutId: string) => {
    const result = await startWorkout(workoutId);
    if (result?.success) {
      toast({ title: "Workout Started!", description: "Let's get moving!" });
      navigate("/workout-session");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Workouts
          </h1>
          <p className="text-muted-foreground">Build strength, track progress</p>
        </div>

        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              My Workouts
            </TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-16 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={() => navigate("/workout-session")}
              >
                <div className="flex flex-col items-center gap-1">
                  <Play className="h-5 w-5" />
                  <span className="text-sm">Start Quick Workout</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 border-primary/20 hover:bg-primary/5"
                onClick={() => navigate("/workout-builder")}
              >
                <div className="flex flex-col items-center gap-1">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Create Template</span>
                </div>
              </Button>
            </div>

            {/* Recent Workouts */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Workouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWorkouts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p>No recent workouts yet!</p>
                    <p className="text-xs mt-1">Complete your first workout to see it here</p>
                  </div>
                ) : (
                  recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{workout.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{workout.duration}</span>
                          <span>•</span>
                          <span>{workout.exercises} exercises</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {workout.lastPerformed}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Workout Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workoutTemplates.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p>No workout templates yet!</p>
                    <p className="text-xs mt-1">Create your first template to get started</p>
                  </div>
                ) : (
                  workoutTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => handleStartWorkout(template.id)}
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.exercises} exercises • {template.difficulty}</p>
                      </div>
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        {template.type}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-generator">
            <WorkoutGenerator 
              onWorkoutGenerated={(workout) => {
                toast({
                  title: "Workout Generated!",
                  description: "Your personalized workout is ready to start",
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      <SwipeableNavigation />
    </div>
  );
};

export default Workouts;