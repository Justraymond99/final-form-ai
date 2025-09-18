import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";

interface ManualCalorieDialogProps {
  currentCalories: number;
  onUpdateCalories: () => void;
}

export const ManualCalorieDialog = ({ currentCalories, onUpdateCalories }: ManualCalorieDialogProps) => {
  const [open, setOpen] = useState(false);
  const [calories, setCalories] = useState(currentCalories.toString());
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();
  const { user } = useSecureAuth();

  const handleSave = async () => {
    const calorieCount = parseInt(calories);
    if (isNaN(calorieCount) || calorieCount < 0) {
      toast({ title: "Invalid input", description: "Please enter a valid number of calories", variant: "destructive" });
      return;
    }
    
    if (!user) return;
    
    setIsLogging(true);
    try {
      // Add manual calorie entry to food_logs
      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          food_name: "Manual Entry",
          quantity: 1,
          unit: "serving",
          calories: calorieCount,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0,
          sugar_g: 0,
          sodium_mg: 0,
          meal_type: "manual",
          logged_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: "Calories logged!", description: `Added ${calorieCount} calories manually` });
      onUpdateCalories();
      setOpen(false);
    } catch (error) {
      console.error('Error logging calories:', error);
      toast({ title: "Error", description: "Failed to log calories", variant: "destructive" });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Flame className="w-4 h-4" />
          Add Calories
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Manual Calories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="calories">Calories to Add</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Enter calorie amount"
              min="0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLogging}>
              {isLogging ? "Adding..." : "Add Calories"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};