import { useState } from "react";
import { Settings, Target, User, Edit3, LogOut, Ruler, Trophy as TrophyIcon, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AppSettingsDialog } from "@/components/AppSettingsDialog";
import { useProfile } from "@/hooks/useProfile";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";
import { useDailyTracking } from "@/hooks/useDailyTracking";
import { useWorkouts } from "@/hooks/useWorkouts";
import { InternationalizationSetup } from "@/components/InternationalizationSetup";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { toast } = useToast();
  const { profile, loading } = useProfile();
  const { signOut } = useSecureAuth();
  const { data: dailyData } = useDailyTracking();
  const { sessions } = useWorkouts();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  
  // Real goals with starting values of 0
  const goals = [
    { 
      id: 1, 
      title: "Weekly Workouts", 
      target: 3, 
      current: sessions.filter(s => s.completed_at && 
        new Date(s.completed_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length, 
      unit: "workouts", 
      type: "frequency" 
    },
    { 
      id: 2, 
      title: "Daily Water Goal", 
      target: 8, 
      current: Math.round((dailyData?.water_intake_ml || 0) / 250), 
      unit: "glasses", 
      type: "hydration" 
    },
    { 
      id: 3, 
      title: "Monthly Workouts", 
      target: 12, 
      current: sessions.filter(s => s.completed_at && 
        new Date(s.completed_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length, 
      unit: "workouts", 
      type: "monthly" 
    },
  ];

  const preferences = [
    { label: "Units", value: "Imperial (lbs, ft)" },
    { label: "Workout Reminders", value: "Daily at 6:00 PM" },
    { label: "Rest Day Reminders", value: "Enabled" },
    { label: "Privacy", value: "Friends only" },
  ];

  const stats = [
    { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently" },
    { label: "Total Workouts", value: sessions.filter(s => s.completed_at).length.toString() },
    { label: "Current Streak", value: `${dailyData?.workout_streak || 0} days` },
    { label: "Calories Today", value: (dailyData?.calories_consumed || 0).toString() },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
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
                  {profile?.display_name ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile?.display_name || 'User'}</h2>
                <p className="text-muted-foreground">{profile?.email || 'No email'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Level {Math.floor((sessions.filter(s => s.completed_at).length / 10) + 1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    🔥 {dailyData?.workout_streak || 0} day streak
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditDialog(true)}
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

        {/* Progress Tracking */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Track Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/body-measurements")}
            >
              <Ruler className="h-4 w-4 mr-2" />
              Body Measurements
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/personal-records")}
            >
              <TrophyIcon className="h-4 w-4 mr-2" />
              Personal Records
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/progress-photos")}
            >
              <Ruler className="h-4 w-4 mr-2" />
              Progress Photos
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/analytics")}
            >
              <TrophyIcon className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/exercise-library")}
            >
              <Target className="h-4 w-4 mr-2" />
              Exercise Library
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/recipes")}
            >
              <Target className="h-4 w-4 mr-2" />
              Recipes
            </Button>
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
                <Progress 
                  value={Math.min((goal.current / goal.target) * 100, 100)}
                  className="h-2"
                />
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
              onClick={() => setShowEditDialog(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              App Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowLanguage(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Language Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowFeedback(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Feedback
            </Button>
            <Separator />
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Navigation />
      <EditProfileDialog open={showEditDialog} onOpenChange={setShowEditDialog} />
      <AppSettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
      <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />
      
      {/* Language Settings Modal */}
      {showLanguage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <InternationalizationSetup />
            <div className="p-4">
              <Button onClick={() => setShowLanguage(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;