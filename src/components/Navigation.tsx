import { cn } from "@/lib/utils";
import { Home, Dumbbell, Apple, Calendar, Trophy, User } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "workouts", label: "Workouts", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "progress", label: "Progress", icon: Calendar },
    { id: "achievements", label: "Awards", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className={cn(
              "w-5 h-5 transition-transform duration-200",
              activeTab === tab.id && "scale-110"
            )} />
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="w-4 h-0.5 bg-primary rounded-full mt-1" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};