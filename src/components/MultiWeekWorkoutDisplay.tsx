import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMultiWeekPlans } from "@/hooks/useMultiWeekPlans";
import { 
  Calendar, 
  Clock, 
  Target, 
  Dumbbell, 
  Play, 
  Save, 
  Loader2,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Info
} from "lucide-react";

interface MultiWeekWorkoutDisplayProps {
  workoutPlan: any;
  onSave?: (name: string, description: string) => void;
  onStartWorkout?: (workout: any) => void;
}

export const MultiWeekWorkoutDisplay = ({ 
  workoutPlan, 
  onSave, 
  onStartWorkout 
}: MultiWeekWorkoutDisplayProps) => {
  const { toast } = useToast();
  const { saveMultiWeekWorkoutPlan } = useMultiWeekPlans();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your workout program",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveMultiWeekWorkoutPlan({
        name: planName,
        description: planDescription,
        weeks: workoutPlan.weeks,
        difficulty: workoutPlan.difficulty,
        weekly_plans: workoutPlan.weekly_plans
      });

      if (result.success) {
        toast({
          title: "Program saved!",
          description: "Your workout program has been saved.",
        });
        setShowSaveDialog(false);
        setPlanName("");
        setPlanDescription("");
        onSave?.(planName, planDescription);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save workout program",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartWorkout = (workout: any) => {
    onStartWorkout?.(workout);
  };

  if (!workoutPlan) {
    return null;
  }

  const weeks = workoutPlan.weeks || workoutPlan.weekly_plans?.length || 1;
  const weeklyPlans = workoutPlan.weekly_plans || [];
  const totalWorkouts = weeklyPlans.reduce((total: number, week: any) => 
    total + (week.workouts?.length || 0), 0);
  const totalMinutes = weeklyPlans.reduce((total: number, week: any) => 
    total + (week.workouts?.reduce((wTotal: number, workout: any) => 
      wTotal + (Number(workout.duration) || 0), 0) || 0), 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  return (
    <div className="space-y-4">
      {/* Save Button */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Program
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Workout Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program-name">Program Name</Label>
                  <Input
                    id="program-name"
                    placeholder="e.g., 8-Week Strength Builder"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-description">Description (Optional)</Label>
                  <Textarea
                    id="program-description"
                    placeholder="Describe your workout program..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || !planName.trim()} className="flex-1">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Program Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>{workoutPlan.name}</span>
          </CardTitle>
          {workoutPlan.description && (
            <p className="text-sm text-muted-foreground">{workoutPlan.description}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {weeks} {weeks === 1 ? "Week" : "Weeks"}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              {formatLabel(workoutPlan.difficulty) || "Custom"}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Progressive
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-bold text-primary">{weeks}</div>
              <div className="text-xs text-muted-foreground">{weeks === 1 ? "Week" : "Weeks"}</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-bold text-blue-500">{totalWorkouts}</div>
              <div className="text-xs text-muted-foreground">Workouts</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-bold text-green-500">
                {totalHours > 0 ? `${totalHours}h` : `${totalMinutes}m`}
              </div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>

          {/* Weekly Tabs */}
          <Tabs defaultValue="week-1" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
              {weeklyPlans.map((_: any, index: number) => (
                <TabsTrigger key={`week-${index + 1}`} value={`week-${index + 1}`} className="text-xs px-2 py-1">
                  W{index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {weeklyPlans.map((week: any, weekIndex: number) => (
              <TabsContent key={`week-${weekIndex + 1}`} value={`week-${weekIndex + 1}`} className="mt-3">
                <div className="space-y-2">
                  {/* Week Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Week {weekIndex + 1}: {formatLabel(week.focus)}</span>
                  </div>
                  {week.description && (
                    <p className="text-xs text-muted-foreground mb-3">{week.description}</p>
                  )}

                  {/* Workout List - Tappable */}
                  <div className="space-y-2">
                    {week.workouts?.map((workout: any, workoutIndex: number) => (
                      <div
                        key={workoutIndex}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setSelectedWorkout({ ...workout, weekNumber: weekIndex + 1 })}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Badge variant="outline" className="text-xs flex-shrink-0">{workout.day}</Badge>
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{formatLabel(workout.workout_name || workout.name)}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {workout.duration}min
                              </span>
                              {workout.exercises?.length > 0 && (
                                <span>• {workout.exercises.length} exercises</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartWorkout(workout);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Progression Notes */}
          {workoutPlan.progression_notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Progression Notes</span>
              </div>
              <p className="text-sm text-muted-foreground">{workoutPlan.progression_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout Detail Dialog */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {selectedWorkout && formatLabel(selectedWorkout.workout_name || selectedWorkout.name)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkout && (
            <ScrollArea className="max-h-[70vh]">
              <div className="p-4 pt-2 space-y-4">
                {/* Workout Info */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Calendar className="h-3 w-3 mr-1" />
                    Week {selectedWorkout.weekNumber} - {selectedWorkout.day}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedWorkout.duration} min
                  </Badge>
                  {selectedWorkout.type && (
                    <Badge variant="outline">{formatLabel(selectedWorkout.type)}</Badge>
                  )}
                </div>

                {/* Target Muscles */}
                {selectedWorkout.target_muscles?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Target Muscles
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedWorkout.target_muscles.map((muscle: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {formatLabel(muscle)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercises - Full Detail */}
                {selectedWorkout.exercises?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Exercises ({selectedWorkout.exercises.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedWorkout.exercises.map((exercise: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg border border-border/30">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-medium text-sm">
                                {index + 1}. {formatLabel(exercise.exercise || exercise.name)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {exercise.sets} sets × {exercise.reps} reps
                                {exercise.rest_seconds > 0 && ` • ${exercise.rest_seconds}s rest`}
                              </p>
                            </div>
                          </div>
                          {exercise.instructions && (
                            <div className="mt-2 p-2 bg-background rounded border border-border/20">
                              <div className="flex items-start gap-2">
                                <Info className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {exercise.instructions}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Start Workout Button */}
                <Button 
                  className="w-full" 
                  onClick={() => {
                    handleStartWorkout(selectedWorkout);
                    setSelectedWorkout(null);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start This Workout
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
