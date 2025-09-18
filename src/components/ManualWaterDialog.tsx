import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManualWaterDialogProps {
  onLogWater: (amount: number) => void;
  currentWaterMl: number;
}

export const ManualWaterDialog = ({ onLogWater, currentWaterMl }: ManualWaterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("250");
  const { toast } = useToast();

  const handleLogWater = async () => {
    const waterAmount = parseInt(amount);
    if (isNaN(waterAmount) || waterAmount <= 0) {
      toast({ title: "Invalid input", description: "Please enter a valid water amount", variant: "destructive" });
      return;
    }
    
    await onLogWater(waterAmount);
    setOpen(false);
  };

  const quickAmounts = [250, 500, 750, 1000];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          Log Water
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Water Intake</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (ml)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter water amount in ml"
              min="1"
            />
          </div>
          
          <div>
            <Label>Quick Add</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {quickAmounts.map((qty) => (
                <Button
                  key={qty}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(qty.toString())}
                  className="text-xs"
                >
                  {qty}ml
                </Button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Current: {Math.round(currentWaterMl / 250)} glasses ({currentWaterMl}ml)
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogWater}>
              Log Water
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};