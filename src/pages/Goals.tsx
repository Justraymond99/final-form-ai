import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { CreateCustomGoalDialog } from "@/components/CreateCustomGoalDialog";
import { useCustomGoals } from "@/hooks/useCustomGoals";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { 
  Target, 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Award,
  RotateCcw
} from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Goals = () => {
  const { user } = useSecureAuth();
  const { goals: customGoals, loading, updateGoal, deleteGoal } = useCustomGoals();
  const { toast } = useToast();
  const [presetGoals, setPresetGoals] = useState<any[]>([]);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [progressInput, setProgressInput] = useState("");

  // Fetch preset goals
  useEffect(() => {
    const fetchPresetGoals = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPresetGoals(data || []);
      } catch (error) {
        console.error('Error fetching preset goals:', error);
      }
    };

    fetchPresetGoals();
  }, [user]);

  const handleUpdateProgress = async (goal: any, newValue: number) => {
    const isCompleted = newValue >= goal.target_value;
    
    if (goal.isPreset) {
      // Update preset goal in goals table
      try {
        const { error } = await supabase
          .from('goals')
          .update({
            current_value: newValue,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', goal.id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Refresh preset goals
        const { data, error: fetchError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!fetchError) {
          setPresetGoals(data || []);
        }

        toast({
          title: "Progress Updated",
          description: isCompleted ? "Congratulations! Goal completed! 🎉" : "Goal progress updated successfully"
        });
      } catch (error) {
        console.error('Error updating preset goal:', error);
        toast({
          title: "Error",
          description: "Failed to update progress",
          variant: "destructive"
        });
      }
    } else {
      // Update custom goal
      const result = await updateGoal(goal.id, {
        current_value: newValue,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      });

      if (result.success) {
        toast({
          title: "Progress Updated",
          description: isCompleted ? "Congratulations! Goal completed! 🎉" : "Goal progress updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update progress",
          variant: "destructive"
        });
      }
    }

    setUpdateDialogOpen(false);
    setProgressInput("");
  };

  const handleDeleteGoal = async (goalId: string) => {
    const result = await deleteGoal(goalId);
    if (result.success) {
      toast({ title: "Goal Deleted", description: "Goal has been removed" });
    } else {
      toast({ title: "Error", description: "Failed to delete goal", variant: "destructive" });
    }
  };

  const handleMarkComplete = async (goal: any) => {
    const result = await updateGoal(goal.id, {
      current_value: goal.target_value,
      completed: true,
      completed_at: new Date().toISOString()
    });

    if (result.success) {
      toast({
        title: "Goal Completed! 🎉",
        description: `Congratulations on completing "${goal.title}"!`
      });
    }
  };

  const handleResetGoal = async (goal: any) => {
    const result = await updateGoal(goal.id, {
      current_value: 0,
      completed: false,
      completed_at: null
    });

    if (result.success) {
      toast({ title: "Goal Reset", description: "Goal progress has been reset to zero" });
    }
  };

  const openUpdateDialog = (goal: any) => {
    setSelectedGoal(goal);
    setProgressInput(goal.current_value.toString());
    setUpdateDialogOpen(true);
  };

  const activeGoals = customGoals.filter(goal => !goal.completed);
  const completedGoals = customGoals.filter(goal => goal.completed);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Goals
          </h1>
          <p className="text-muted-foreground">Track and achieve your ambitions</p>
        </div>

        {/* Create Goal Action */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <CreateCustomGoalDialog />
            </div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Active Goals ({activeGoals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border border-border/30 bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm font-medium">
                          {goal.current_value} / {goal.target_value} {goal.unit}
                        </p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {goal.goal_type}
                        </Badge>
                      </div>
                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <ProgressBar 
                    value={Math.min((goal.current_value / goal.target_value) * 100, 100)}
                    className="h-3"
                  />
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpdateDialog(goal)}
                      className="flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkComplete(goal)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Completed Goals ({completedGoals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        {goal.title}
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          {goal.target_value} {goal.unit} achieved!
                        </p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {goal.goal_type}
                        </Badge>
                      </div>
                      {goal.completed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed: {new Date(goal.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <ProgressBar value={100} className="h-3" />
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResetGoal(goal)}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {customGoals.length === 0 && !loading && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground mb-6">
                Set your first goal and start tracking your progress!
              </p>
              <CreateCustomGoalDialog />
            </CardContent>
          </Card>
        )}

        {/* Update Progress Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
            </DialogHeader>
            {selectedGoal && (
              <div className="space-y-4">
                <div>
                  <Label>Goal: {selectedGoal.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    Target: {selectedGoal.target_value} {selectedGoal.unit}
                  </p>
                </div>
                <div>
                  <Label htmlFor="progress">Current Progress</Label>
                  <Input
                    id="progress"
                    type="number"
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    placeholder="Enter current value"
                    min="0"
                    max={selectedGoal.target_value}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleUpdateProgress(selectedGoal, parseInt(progressInput))}
                    disabled={!progressInput || isNaN(parseInt(progressInput))}
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Navigation />
    </div>
  );
};

export default Goals;