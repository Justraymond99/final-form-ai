import { cn } from "@/lib/utils";
import { Home, Dumbbell, Apple, Calendar, Trophy, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { TrialCountdownCompact } from "./TrialCountdown";

export const Navigation = () => {
  const location = useLocation();

  const tabs = [
    { id: "/home", label: "Home", icon: Home },
    { id: "/workouts", label: "Workouts", icon: Dumbbell },
    { id: "/nutrition", label: "Nutrition", icon: Apple },
    { id: "/workout-calendar", label: "Calendar", icon: Calendar },
    { id: "/awards", label: "Awards", icon: Trophy },
    { id: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2 z-50">
      {/* Trial/Pro Badge - Floating above nav */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2">
        <TrialCountdownCompact />
      </div>
      
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.id}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1",
              location.pathname === tab.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className={cn(
              "w-5 h-5 transition-transform duration-200 flex-shrink-0",
              location.pathname === tab.id && "scale-110"
            )} />
            <span className="text-[10px] font-medium truncate">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};