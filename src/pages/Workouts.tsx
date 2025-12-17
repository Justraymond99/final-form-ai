import { useState } from "react";
import { Plus, Play, Clock, TrendingUp, Dumbbell, Sparkles, Trash2, Calendar, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLabel } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { WorkoutGenerator } from "@/components/WorkoutGenerator";
import { WorkoutScheduler } from "@/components/WorkoutScheduler";
import { MultiWeekWorkoutDisplay } from "@/components/MultiWeekWorkoutDisplay";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useMultiWeekPlans } from "@/hooks/useMultiWeekPlans";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Workouts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates, recentWorkouts: dbRecentWorkouts, startWorkout, deleteTemplate } = useWorkouts();
  const { workoutPlans, deleteMultiWeekPlan, fetchMultiWeekPlans, loading: plansLoading } = useMultiWeekPlans();
  const [showScheduler, setShowScheduler] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("workouts");

  // Format recent workouts for display
  const recentWorkouts = dbRecentWorkouts.map(workout => ({
    id: workout.id,
    name: workout.name || "Workout",
    duration: `${workout.duration_minutes || 30} min`,
    exercises: Array.isArray(workout.exercises_data) ? workout.exercises_data.length : 0,
    lastPerformed: new Date(workout.started_at).toLocaleDateString()
  }));

  // Format templates for display
  const workoutTemplates = templates.map(template => ({
    id: template.id,
    name: template.name,
    type: template.type,
    exercises: Array.isArray(template.exercises) ? template.exercises.length : 0,
    difficulty: template.difficulty,
    scheduled_days: (template as any).scheduled_days || []
  }));

  const handleStartWorkout = async (workoutId: string) => {
    const result = await startWorkout(workoutId);
    if (result?.success) {
      toast({ title: "Workout Started!", description: "Let's get moving!" });
      navigate("/workout-session");
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    console.log('Deleting template:', templateId);
    const result = await deleteTemplate(templateId);
    console.log('Delete result:', result);
    if (result?.success) {
      toast({ title: "Template Deleted", description: `"${templateName}" has been removed.` });
    } else {
      toast({ title: "Error", description: result?.error?.toString() || "Failed to delete template", variant: "destructive" });
    }
  };
  const handleDeletePlan = async (planId: string, planName: string) => {
    const result = await deleteMultiWeekPlan(planId, 'workout');
    if (result?.success) {
      toast({ title: "Plan Deleted", description: `"${planName}" has been removed.` });
    } else {
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Workouts
          </h1>
          <p className="text-muted-foreground">Build strength, track progress</p>
        </div>

        <Tabs defaultValue="workouts" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              My Workouts
              {workoutPlans.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {workoutPlans.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-6">
            {/* Saved Programs - Now First & Prominent */}
            {workoutPlans.length > 0 && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Saved Programs
                    <Badge variant="secondary" className="ml-auto">{workoutPlans.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {workoutPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-medium">{plan.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{plan.weeks} weeks</span>
                          <span>•</span>
                          <span>{formatLabel(plan.difficulty)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Program?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{plan.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePlan(plan.id, plan.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {plan.weeks}W
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-16 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={async () => {
                  const result = await startWorkout("");
                  if (result?.success) {
                    toast({ title: "Quick Workout Started!", description: "Let's get moving!" });
                    navigate("/workout-session");
                  }
                }}
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
                    <div key={template.id} className="space-y-3">
                      <div
                        className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => handleStartWorkout(template.id)}
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.exercises} exercises • {formatLabel(template.difficulty)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowScheduler(showScheduler === template.id ? null : template.id);
                            }}
                          >
                            Schedule
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{template.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTemplate(template.id, template.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Badge variant="outline" className="border-accent/30 text-accent">
                            {formatLabel(template.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      {showScheduler === template.id && (
                        <WorkoutScheduler
                          workoutId={template.id}
                          workoutName={template.name}
                          currentSchedule={template.scheduled_days || []}
                          onScheduleUpdated={() => {
                            setShowScheduler(null);
                            window.location.reload(); // Refresh to get updated data
                          }}
                        />
                      )}
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
              onWorkoutSaved={() => {
                fetchMultiWeekPlans();
                setActiveTab("workouts");
                toast({ title: "Program Saved!", description: "View it in My Workouts tab" });
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Plan Detail Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-4">
            <DialogHeader>
              <DialogTitle className="truncate">{selectedPlan?.name}</DialogTitle>
            </DialogHeader>
            {selectedPlan && (
              <MultiWeekWorkoutDisplay 
                workoutPlan={selectedPlan}
                onStartWorkout={(workout) => {
                  localStorage.setItem('currentWorkout', JSON.stringify({
                    name: workout.workout_name || workout.name,
                    exercises_data: workout.exercises || [],
                    duration_minutes: workout.duration || 30,
                  }));
                  toast({ title: "Starting workout...", description: "Let's go!" });
                  navigate('/workout-session');
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Workouts;