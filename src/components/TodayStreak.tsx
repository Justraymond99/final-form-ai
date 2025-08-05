import { Badge } from "@/components/ui/badge";
import { Flame, Calendar } from "lucide-react";

interface TodayStreakProps {
  currentStreak: number;
  isActiveToday: boolean;
}

export const TodayStreak = ({ currentStreak, isActiveToday }: TodayStreakProps) => {
  return (
    <div className="bg-card border border-card-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Daily Streak</span>
        </div>
        <Badge 
          variant={isActiveToday ? "default" : "secondary"}
          className={isActiveToday ? "bg-primary text-primary-foreground" : ""}
        >
          {isActiveToday ? "Active" : "Incomplete"}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">days</div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">This week</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  day <= 5 
                    ? "bg-primary text-primary-foreground" 
                    : day === 6 
                    ? "bg-primary/50 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {day <= 5 ? "✓" : day === 6 ? "?" : ""}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {!isActiveToday && (
        <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
          <p className="text-xs text-primary font-medium">
            Complete your workout to keep the streak alive! 🔥
          </p>
        </div>
      )}
    </div>
  );
};