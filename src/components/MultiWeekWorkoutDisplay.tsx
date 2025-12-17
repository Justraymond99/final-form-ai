import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {workoutPlan.name}
          </CardTitle>
          <div className="text-muted-foreground">{workoutPlan.description}</div>
          
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">
              <Calendar className="w-3 h-3 mr-1" />
              {weeks} {weeks === 1 ? 'Week' : 'Weeks'}
            </Badge>
            <Badge variant="secondary">
              <Target className="w-3 h-3 mr-1" />
              {workoutPlan.difficulty || 'Custom'}
            </Badge>
            <Badge variant="secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Progressive
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{weeks}</div>
              <div className="text-sm text-muted-foreground">{weeks === 1 ? 'Week' : 'Weeks'}</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{totalWorkouts}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {totalHours > 0 ? `${totalHours}h` : `${totalMinutes}m`}
              </div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <Tabs defaultValue="week-1" className="w-full">
            <TabsList className="flex flex-wrap gap-1 h-auto">
              {weeklyPlans.map((_: any, index: number) => (
                <TabsTrigger 
                  key={`week-${index + 1}`} 
                  value={`week-${index + 1}`}
                  className="text-xs"
                >
                  Week {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {weeklyPlans.map((week: any, index: number) => (
              <TabsContent key={`week-${index + 1}`} value={`week-${index + 1}`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Week {index + 1}: {week.focus}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {week.description || `Focus: ${week.focus}`}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {week.workouts?.map((workout: any, workoutIndex: number) => (
                        <AccordionItem key={workoutIndex} value={`workout-${workoutIndex}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{workout.day}</Badge>
                                <span className="font-medium">{workout.workout_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{workout.duration}min</span>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartWorkout(workout);
                                  }}
                                  className="ml-2"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </Button>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              <div className="flex gap-2">
                                <Badge variant="secondary">{workout.type}</Badge>
                                <Badge variant="outline">
                                  <Dumbbell className="h-3 w-3 mr-1" />
                                  {workout.target_muscles?.join(', ') || 'Full Body'}
                                </Badge>
                              </div>
                              
                              {workout.exercises && workout.exercises.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Exercises:</h4>
                                  {workout.exercises.map((exercise: any, exerciseIndex: number) => (
                                    <div key={exerciseIndex} className="p-3 bg-muted rounded-lg">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">{exercise.exercise}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {exercise.sets} sets × {exercise.reps} reps
                                          </p>
                                          {exercise.instructions && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {exercise.instructions}
                                            </p>
                                          )}
                                        </div>
                                        {exercise.rest_seconds && (
                                          <Badge variant="outline" className="text-xs">
                                            {exercise.rest_seconds}s rest
                                          </Badge>
                                        )}
                                      </div>
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