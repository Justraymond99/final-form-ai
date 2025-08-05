import { Calendar, Trophy, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Progress = () => {
  const achievements = [
    { id: 1, title: "Week Warrior", description: "7 days streak", icon: "🔥", earned: true },
    { id: 2, title: "Strong Lifter", description: "Bench 200lbs", icon: "💪", earned: true },
    { id: 3, title: "Cardio King", description: "30min cardio", icon: "❤️", earned: false },
    { id: 4, title: "Nutrition Pro", description: "Track 30 days", icon: "🥗", earned: false },
  ];

  const stats = [
    { label: "Total Workouts", value: "47", change: "+3 this week" },
    { label: "Max Bench Press", value: "185 lbs", change: "+10 lbs" },
    { label: "Avg Workout Time", value: "42 min", change: "-5 min" },
    { label: "Calories Burned", value: "12,450", change: "+1,200" },
  ];

  // Mock calendar data
  const calendarDays = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    hasWorkout: Math.random() > 0.6,
    isToday: i === 14
  }));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Progress
          </h1>
          <p className="text-muted-foreground">Track your journey</p>
        </div>

        {/* Calendar View */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              December 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-xs text-muted-foreground p-2 font-medium">
                  {day}
                </div>
              ))}
              {calendarDays.map((date) => (
                <div
                  key={date.day}
                  className={`
                    relative w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors
                    ${date.isToday ? 'bg-primary text-primary-foreground' : ''}
                    ${date.hasWorkout && !date.isToday ? 'bg-accent/20 text-accent' : ''}
                    ${!date.hasWorkout && !date.isToday ? 'text-muted-foreground' : ''}
                  `}
                >
                  {date.day}
                  {date.hasWorkout && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-muted-foreground">Workout days</span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                18 this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-colors
                  ${achievement.earned 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-border/30 opacity-60'
                  }
                `}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.earned && (
                  <Award className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;