import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Calendar, Trophy, Zap, Target } from "lucide-react";

interface TodayStreakProps {
  currentStreak: number;
  isActiveToday: boolean;
}

export const TodayStreak = ({ currentStreak, isActiveToday }: TodayStreakProps) => {
  // Calculate streak milestones
  const nextMilestone = currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : currentStreak < 100 ? 100 : 365;
  const milestoneProgress = (currentStreak / nextMilestone) * 100;
  
  // Get streak level and emoji
  const getStreakLevel = () => {
    if (currentStreak >= 100) return { level: "Legendary", emoji: "🏆", color: "text-yellow-500" };
    if (currentStreak >= 30) return { level: "Champion", emoji: "👑", color: "text-purple-500" };
    if (currentStreak >= 14) return { level: "Warrior", emoji: "⚔️", color: "text-blue-500" };
    if (currentStreak >= 7) return { level: "Fighter", emoji: "💪", color: "text-green-500" };
    if (currentStreak >= 3) return { level: "Starter", emoji: "🔥", color: "text-orange-500" };
    return { level: "Beginner", emoji: "🌱", color: "text-gray-500" };
  };

  const streakLevel = getStreakLevel();

  // Generate week view (last 7 days)
  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });
      const isToday = i === 0;
      const isCompleted = i === 0 ? isActiveToday : i < currentStreak;
      
      days.push({
        name: dayName,
        isToday,
        isCompleted,
        date: date.getDate()
      });
    }
    return days;
  };

  const weekDays = generateWeekDays();

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary via-accent to-secondary p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6" />
              <span className="font-bold text-lg">Daily Streak</span>
            </div>
            <Badge 
              variant={isActiveToday ? "secondary" : "outline"}
              className={isActiveToday ? "bg-white/20 text-white border-white/30" : "bg-red-500/20 text-white border-red-300/30"}
            >
              {isActiveToday ? "✓ Complete" : "Pending"}
            </Badge>
          </div>
          
          {/* Streak count and level */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold mb-1">{currentStreak}</div>
              <div className="text-white/80 text-sm">day{currentStreak !== 1 ? 's' : ''} in a row</div>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-1">{streakLevel.emoji}</div>
              <div className="text-white/90 font-medium">{streakLevel.level}</div>
            </div>
          </div>
        </div>

        {/* Week view */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">This Week</span>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1 font-medium">
                  {day.name}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    day.isCompleted
                      ? day.isToday
                        ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                        : "bg-primary/80 text-primary-foreground"
                      : day.isToday
                      ? "bg-muted border-2 border-primary text-foreground animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {day.isCompleted ? "✓" : day.date}
                </div>
              </div>
            ))}
          </div>

          {/* Progress to next milestone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Next Goal: {nextMilestone} days</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {currentStreak}/{nextMilestone}
              </span>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
          </div>

          {/* Motivational message */}
          <div className="mt-4">
            {!isActiveToday ? (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    Keep your streak alive!
                  </p>
                  <p className="text-xs text-primary/80">
                    Complete today's workout to reach {currentStreak + 1} days
                  </p>
                </div>
              </div>
            ) : currentStreak > 0 && currentStreak % 7 === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <Trophy className="w-4 h-4 text-accent flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-accent">
                    Week milestone achieved! 🎉
                  </p>
                  <p className="text-xs text-accent/80">
                    You've completed {currentStreak} days in a row!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <Flame className="w-4 h-4 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-secondary">
                    Streak is on fire! 🔥
                  </p>
                  <p className="text-xs text-secondary/80">
                    {nextMilestone - currentStreak} more days to reach {nextMilestone}!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};