import { Plus, Play, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Workouts = () => {
  const recentWorkouts = [
    { id: 1, name: "Push Workout", duration: "42 min", exercises: 8, lastPerformed: "2 days ago" },
    { id: 2, name: "Pull Workout", duration: "38 min", exercises: 6, lastPerformed: "4 days ago" },
    { id: 3, name: "Leg Day", duration: "55 min", exercises: 10, lastPerformed: "6 days ago" },
  ];

  const templates = [
    { id: 1, name: "5x5 Strength", type: "Strength", exercises: 5 },
    { id: 2, name: "HIIT Cardio", type: "Cardio", exercises: 8 },
    { id: 3, name: "Upper Body Pump", type: "Hypertrophy", exercises: 12 },
  ];

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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-16 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <div className="flex flex-col items-center gap-1">
              <Play className="h-5 w-5" />
              <span className="text-sm">Start Quick Workout</span>
            </div>
          </Button>
          <Button variant="outline" className="h-16 border-primary/20 hover:bg-primary/5">
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
            {recentWorkouts.map((workout) => (
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
            ))}
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
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.exercises} exercises</p>
                </div>
                <Badge variant="outline" className="border-accent/30 text-accent">
                  {template.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Workouts;