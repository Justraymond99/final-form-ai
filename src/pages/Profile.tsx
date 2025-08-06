import { Settings, Target, User, Edit3, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const goals = [
    { id: 1, title: "Lose 10 lbs", target: 10, current: 6, unit: "lbs", type: "weight" },
    { id: 2, title: "Bench 200 lbs", target: 200, current: 185, unit: "lbs", type: "strength" },
    { id: 3, title: "Run 5K under 25min", target: 25, current: 27, unit: "min", type: "cardio" },
  ];

  const preferences = [
    { label: "Units", value: "Imperial (lbs, ft)" },
    { label: "Workout Reminders", value: "Daily at 6:00 PM" },
    { label: "Rest Day Reminders", value: "Enabled" },
    { label: "Privacy", value: "Friends only" },
  ];

  const stats = [
    { label: "Member Since", value: "Oct 2024" },
    { label: "Total Workouts", value: "47" },
    { label: "Current Streak", value: "7 days" },
    { label: "Best Streak", value: "12 days" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-muted-foreground">Your fitness journey</p>
        </div>

        {/* Profile Info */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">John Doe</h2>
                <p className="text-muted-foreground">john.doe@email.com</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Level 5
                  </Badge>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    🔥 7 day streak
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast({ title: "Edit Profile", description: "Profile editor opened! ✏️" })}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Current Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-accent" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {preferences.map((pref, index) => (
              <div key={index}>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">{pref.label}</span>
                  <span className="text-sm text-muted-foreground">{pref.value}</span>
                </div>
                {index < preferences.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => toast({ title: "Edit Profile", description: "Profile editor opened! ✏️" })}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => toast({ title: "App Settings", description: "Settings panel opened! ⚙️" })}
            >
              <Settings className="h-4 w-4 mr-2" />
              App Settings
            </Button>
            <Separator />
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => toast({ title: "Sign Out", description: "Logging out... See you soon! 👋" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Profile;