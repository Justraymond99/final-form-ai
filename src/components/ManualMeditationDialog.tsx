import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManualMeditationDialogProps {
  onUpdateMeditation: (minutes: number) => void;
  currentMinutes: number;
}

export const ManualMeditationDialog = ({ onUpdateMeditation, currentMinutes }: ManualMeditationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(currentMinutes.toString());
  const { toast } = useToast();

  const handleSave = () => {
    const meditationMinutes = parseInt(minutes);
    if (isNaN(meditationMinutes) || meditationMinutes < 0) {
      toast({ title: "Invalid input", description: "Please enter a valid number of minutes", variant: "destructive" });
      return;
    }
    
    onUpdateMeditation(meditationMinutes);
    toast({ title: "Meditation updated!", description: `Set to ${meditationMinutes} minutes` });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Update Meditation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Meditation Time</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="minutes">Minutes Meditated</Label>
            <Input
              id="minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Enter minutes"
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