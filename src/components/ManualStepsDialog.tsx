import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footprints } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManualStepsDialogProps {
  onUpdateSteps: (steps: number) => void;
  currentSteps: number;
}

export const ManualStepsDialog = ({ onUpdateSteps, currentSteps }: ManualStepsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState(currentSteps.toString());
  const { toast } = useToast();

  const handleSave = () => {
    const stepCount = parseInt(steps);
    if (isNaN(stepCount) || stepCount < 0) {
      toast({ title: "Invalid input", description: "Please enter a valid number of steps", variant: "destructive" });
      return;
    }
    
    onUpdateSteps(stepCount);
    toast({ title: "Steps updated!", description: `Set to ${stepCount.toLocaleString()} steps` });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Footprints className="w-4 h-4" />
          Update Steps
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Step Count</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="steps">Number of Steps</Label>
            <Input
              id="steps"
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="Enter step count"
              min="0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};