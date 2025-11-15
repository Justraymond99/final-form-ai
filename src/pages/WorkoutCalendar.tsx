import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useScheduledWorkouts } from "@/hooks/useScheduledWorkouts";
import { Navigation } from "@/components/Navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const WorkoutCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { templates } = useWorkouts();
  const { scheduledWorkouts, scheduleWorkout, loading } = useScheduledWorkouts();

  const workoutsOnDate = selectedDate
    ? scheduledWorkouts.filter(
        (w) => format(new Date(w.scheduled_date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      )
    : [];

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTemplate) return;

    try {
      await scheduleWorkout(selectedTemplate, selectedDate);
      toast({
        title: "Workout scheduled! 📅",
        description: `Added to ${format(selectedDate, "MMMM d, yyyy")}`,
      });
      setDialogOpen(false);
      setSelectedTemplate("");
    } catch (error) {
      toast({
        title: "Error scheduling workout",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Workout Calendar</h1>
          <p className="text-muted-foreground">Plan your workouts and stay on track</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Schedule
              </CardTitle>
              <CardDescription>Select a date to view or schedule workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-md border pointer-events-auto")}
                modifiers={{
                  scheduled: scheduledWorkouts.map((w) => new Date(w.scheduled_date)),
                }}
                modifiersStyles={{
                  scheduled: {
                    backgroundColor: "hsl(var(--primary) / 0.2)",
                    fontWeight: "bold",
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Workouts on Selected Date */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                    </CardTitle>
                    <CardDescription>
                      {workoutsOnDate.length} workout{workoutsOnDate.length !== 1 ? "s" : ""} scheduled
                    </CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={!selectedDate}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Workout</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Workout</label>
                          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a workout..." />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleSchedule}
                          disabled={!selectedTemplate || loading}
                          className="w-full"
                        >
                          Schedule Workout
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {workoutsOnDate.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No workouts scheduled for this day</p>
                    <p className="text-sm mt-1">Click "Add" to schedule one</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workoutsOnDate.map((workout) => {
                      const template = templates.find((t) => t.id === workout.workout_template_id);
                      return (
                        <div
                          key={workout.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            workout.completed
                              ? "bg-success/10 border-success"
                              : "bg-card border-border"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{template?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {template?.estimated_duration} min • {template?.difficulty}
                              </p>
                            </div>
                            {workout.completed && (
                              <Check className="h-5 w-5 text-success" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default WorkoutCalendar;
