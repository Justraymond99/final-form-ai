import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  TrendingUp
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
    } catch (error) {
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

  // Normalize the plan to ensure all required properties exist
  const weeks = workoutPlan.weeks || workoutPlan.weekly_plans?.length || 1;
  const weeklyPlans = workoutPlan.weekly_plans || [];
  const totalWorkouts = weeklyPlans.reduce((total: number, week: any) => 
    total + (week.workouts?.length || 0), 0);
  const totalMinutes = weeklyPlans.reduce((total: number, week: any) => 
    total + (week.workouts?.reduce((wTotal: number, workout: any) => 
      wTotal + (Number(workout.duration) || 0), 0) || 0), 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Program
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Workout Program</DialogTitle>
                  <DialogDescription>
                    Save this {weeks}-week workout program for future use.
                  </DialogDescription>
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
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !planName.trim()}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Program
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Program Overview */}
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="truncate">{workoutPlan.name}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{workoutPlan.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
              {weeks} {weeks === 1 ? 'Week' : 'Weeks'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Target className="w-3 h-3 mr-1 flex-shrink-0" />
              {formatLabel(workoutPlan.difficulty) || 'Custom'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
              Progressive
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{weeks}</div>
              <div className="text-xs text-muted-foreground">{weeks === 1 ? 'Week' : 'Weeks'}</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold text-blue-500">{totalWorkouts}</div>
              <div className="text-xs text-muted-foreground">Workouts</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold text-green-500">
                {totalHours > 0 ? `${totalHours}h` : `${totalMinutes}m`}
              </div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <Tabs defaultValue="week-1" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
              {weeklyPlans.map((_: any, index: number) => (
                <TabsTrigger 
                  key={`week-${index + 1}`} 
                  value={`week-${index + 1}`}
                  className="text-xs px-2 py-1"
                >
                  W{index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {weeklyPlans.map((week: any, index: number) => (
              <TabsContent key={`week-${index + 1}`} value={`week-${index + 1}`}>
                <Card className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Week {index + 1}: {week.focus}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {week.description || `Focus: ${week.focus}`}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Accordion type="single" collapsible className="w-full">
                      {week.workouts?.map((workout: any, workoutIndex: number) => (
                        <AccordionItem key={workoutIndex} value={`workout-${workoutIndex}`}>
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center justify-between w-full pr-2 gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Badge variant="outline" className="text-xs flex-shrink-0 px-1.5">{workout.day}</Badge>
                                <span className="font-medium text-xs truncate">{workout.workout_name}</span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">{workout.duration}m</span>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartWorkout(workout);
                                  }}
                                  className="ml-1 h-6 px-2 text-xs"
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">{formatLabel(workout.type)}</Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Dumbbell className="h-3 w-3 mr-1 flex-shrink-0" />
                                  {workout.target_muscles?.slice(0, 2).join(', ') || 'Full Body'}
                                </Badge>
                              </div>
                              
                              {workout.exercises && workout.exercises.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-medium text-xs">Exercises:</h4>
                                  {workout.exercises.map((exercise: any, exerciseIndex: number) => (
                                    <div key={exerciseIndex} className="p-2 bg-muted rounded-lg">
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-xs truncate">{exercise.exercise}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {exercise.sets}×{exercise.reps}
                                          </p>
                                        </div>
                                        {exercise.rest_seconds > 0 && (
                                          <Badge variant="outline" className="text-[10px] flex-shrink-0 px-1">
                                            {exercise.rest_seconds}s
                                          </Badge>
                                        )}
                                      </div>
                                      {exercise.instructions && (
                                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                                          {exercise.instructions}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {workoutPlan.progression_notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progression Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{workoutPlan.progression_notes}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};