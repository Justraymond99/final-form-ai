import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Calendar, Clock } from "lucide-react";

interface WorkoutSchedulerProps {
  workoutId: string;
  workoutName: string;
  currentSchedule?: string[];
  onScheduleUpdated: () => void;
}

export const WorkoutScheduler = ({ 
  workoutId, 
  workoutName, 
  currentSchedule = [], 
  onScheduleUpdated 
}: WorkoutSchedulerProps) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(currentSchedule);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useSecureAuth();

  const daysOfWeek = [
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
    { id: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const handleDayToggle = (dayId: string, checked: boolean) => {
    if (checked) {
      setSelectedDays(prev => [...prev, dayId]);
    } else {
      setSelectedDays(prev => prev.filter(day => day !== dayId));
    }
  };

  const handleSaveSchedule = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('workout_templates')
        .update({ 
          scheduled_days: selectedDays 
        })
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Schedule Updated!",
        description: `${workoutName} scheduled for ${selectedDays.length} days`
      });

      onScheduleUpdated();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update workout schedule",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Schedule Workout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground mb-3">{workoutName}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select which days you want to schedule this workout
          </p>
        </div>

        <div className="space-y-3">
          {daysOfWeek.map((day) => (
            <div key={day.id} className="flex items-center space-x-3">
              <Checkbox
                id={day.id}
                checked={selectedDays.includes(day.id)}
                onCheckedChange={(checked) => handleDayToggle(day.id, checked as boolean)}
              />
              <label
                htmlFor={day.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {day.label}
              </label>
            </div>
          ))}
        </div>

        {selectedDays.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Scheduled Days:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDays.map((dayId) => {
                const day = daysOfWeek.find(d => d.id === dayId);
                return (
                  <span 
                    key={dayId}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                  >
                    {day?.short}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            onClick={handleSaveSchedule}
            disabled={isUpdating}
            className="bg-primary hover:bg-primary/90"
          >
            {isUpdating ? "Updating..." : "Save Schedule"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};