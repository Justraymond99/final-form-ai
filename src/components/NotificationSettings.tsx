import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Dumbbell, Droplets, Utensils, Trophy, Sparkles } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  workoutReminders: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  achievementNotifications: boolean;
  motivationalMessages: boolean;
}

export const NotificationSettings = () => {
  const { toast } = useToast();
  const { 
    isSupported, 
    permission, 
    isLoading, 
    requestPermission, 
    sendLocalNotification 
  } = usePushNotifications();
  
  const { 
    settings: capacitorSettings, 
    updateSettings: updateCapacitorSettings,
    scheduleHydrationReminder 
  } = useNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    workoutReminders: true,
    mealReminders: true,
    hydrationReminders: true,
    achievementNotifications: true,
    motivationalMessages: true
  });

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // Save preferences when changed
  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('notification_preferences', JSON.stringify(updated));

    // Also update Capacitor settings for mobile
    if (key in capacitorSettings) {
      updateCapacitorSettings({ [key]: value });
    }

    toast({
      title: "Settings Saved",
      description: `${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}.`,
    });

    // Set up hydration reminders if enabled
    if (key === 'hydrationReminders' && value) {
      scheduleHydrationReminder();
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Send a test notification
      await sendLocalNotification(
        "🎉 Notifications Enabled!",
        "You'll now receive workout reminders and achievement alerts.",
        { tag: 'welcome' }
      );
    }
  };

  const handleTestNotification = async () => {
    const success = await sendLocalNotification(
      "💪 Test Notification",
      "Your notifications are working perfectly!",
      { tag: 'test' }
    );

    if (success) {
      toast({
        title: "Notification Sent",
        description: "Check your notification center!",
      });
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return { label: "Not Supported", variant: "secondary" as const, icon: BellOff };
    }
    if (permission === 'granted') {
      return { label: "Enabled", variant: "default" as const, icon: Bell };
    }
    if (permission === 'denied') {
      return { label: "Blocked", variant: "destructive" as const, icon: BellOff };
    }
    return { label: "Not Set", variant: "secondary" as const, icon: Bell };
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Stay on track with reminders and achievements
            </CardDescription>
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Test Notifications */}
        {isSupported && (
          <div className="flex gap-3">
            {permission !== 'granted' ? (
              <Button 
                onClick={handleEnableNotifications}
                disabled={isLoading || permission === 'denied'}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                {permission === 'denied' ? 'Blocked in Settings' : 'Enable Notifications'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleTestNotification}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
            )}
          </div>
        )}

        {permission === 'denied' && (
          <p className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-lg">
            Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications.
          </p>
        )}

        {/* Notification Categories */}
        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="workout-reminders" className="text-sm font-medium">
                    Workout Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Scheduled workout notifications
                  </p>
                </div>
              </div>
              <Switch
                id="workout-reminders"
                checked={preferences.workoutReminders}
                onCheckedChange={(v) => updatePreference('workoutReminders', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <Label htmlFor="meal-reminders" className="text-sm font-medium">
                    Meal Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Breakfast, lunch, and dinner alerts
                  </p>
                </div>
              </div>
              <Switch
                id="meal-reminders"
                checked={preferences.mealReminders}
                onCheckedChange={(v) => updatePreference('mealReminders', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <Label htmlFor="hydration-reminders" className="text-sm font-medium">
                    Hydration Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Every 2 hours from 8 AM to 8 PM
                  </p>
                </div>
              </div>
              <Switch
                id="hydration-reminders"
                checked={preferences.hydrationReminders}
                onCheckedChange={(v) => updatePreference('hydrationReminders', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <Label htmlFor="achievement-notifications" className="text-sm font-medium">
                    Achievement Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Celebrate when you unlock badges
                  </p>
                </div>
              </div>
              <Switch
                id="achievement-notifications"
                checked={preferences.achievementNotifications}
                onCheckedChange={(v) => updatePreference('achievementNotifications', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <Label htmlFor="motivational-messages" className="text-sm font-medium">
                    Motivational Messages
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Daily inspiration and tips
                  </p>
                </div>
              </div>
              <Switch
                id="motivational-messages"
                checked={preferences.motivationalMessages}
                onCheckedChange={(v) => updatePreference('motivationalMessages', v)}
              />
            </div>
          </div>
        )}

        {!isSupported && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Push notifications are not supported in this browser. Try using Chrome, Firefox, or Edge on desktop, or install the app on your mobile device.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
