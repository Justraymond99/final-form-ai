import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FileText, Shield } from "lucide-react";

interface AppSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AppSettingsDialog = ({ open, onOpenChange }: AppSettingsDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    workoutReminders: true,
    mealReminders: false,
    units: "metric",
    dataSync: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved!",
      description: "Your app preferences have been updated.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
          <DialogDescription>
            Customize your app experience and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">
                  Push Notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="workout-reminders" className="text-sm">
                  Workout Reminders
                </Label>
                <Switch
                  id="workout-reminders"
                  checked={settings.workoutReminders}
                  onCheckedChange={(checked) => setSettings({...settings, workoutReminders: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="meal-reminders" className="text-sm">
                  Meal Reminders
                </Label>
                <Switch
                  id="meal-reminders"
                  checked={settings.mealReminders}
                  onCheckedChange={(checked) => setSettings({...settings, mealReminders: checked})}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Units */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Units</h3>
            <div className="space-y-2">
              <Label htmlFor="units" className="text-sm">
                Measurement System
              </Label>
              <Select value={settings.units} onValueChange={(value) => setSettings({...settings, units: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Data & Privacy</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-sync" className="text-sm">
                Sync Data Across Devices
              </Label>
              <Switch
                id="data-sync"
                checked={settings.dataSync}
                onCheckedChange={(checked) => setSettings({...settings, dataSync: checked})}
              />
            </div>
          </div>

          <Separator />

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/privacy-policy');
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/terms-of-service');
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};