import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Clock, Crown, Sparkles } from "lucide-react";

export const TrialCountdown = () => {
  const { isInTrial, hasPremiumAccess, subscribed, trialEndDate } = useSubscription();
  const navigate = useNavigate();

  const getTrialDaysLeft = () => {
    if (!trialEndDate) return 0;
    const now = new Date();
    const end = new Date(trialEndDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Show nothing if not in trial or not premium
  if (!hasPremiumAccess) return null;
  
  // Show crown for subscribed users
  if (subscribed && !isInTrial) {
    return (
      <Badge 
        onClick={() => navigate("/pricing")}
        className="bg-gradient-to-r from-primary to-accent text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
      >
        <Crown className="h-3 w-3 mr-1" />
        Pro
      </Badge>
    );
  }

  // Show trial countdown
  if (isInTrial) {
    const daysLeft = getTrialDaysLeft();
    const isUrgent = daysLeft <= 2;
    
    return (
      <Badge 
        onClick={() => navigate("/pricing")}
        className={`cursor-pointer hover:opacity-90 transition-opacity ${
          isUrgent 
            ? "bg-destructive text-destructive-foreground animate-pulse" 
            : "bg-gradient-to-r from-primary to-accent text-primary-foreground"
        }`}
      >
        <Clock className="h-3 w-3 mr-1" />
        {daysLeft} {daysLeft === 1 ? "day" : "days"} left
      </Badge>
    );
  }

  return null;
};

// Compact version for navigation bar
export const TrialCountdownCompact = () => {
  const { isInTrial, hasPremiumAccess, subscribed, trialEndDate } = useSubscription();
  const navigate = useNavigate();

  const getTrialDaysLeft = () => {
    if (!trialEndDate) return 0;
    const now = new Date();
    const end = new Date(trialEndDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Subscribed non-trial users see pro badge
  if (subscribed && !isInTrial) {
    return (
      <div 
        onClick={() => navigate("/pricing")}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 cursor-pointer"
      >
        <Crown className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium text-primary">Pro</span>
      </div>
    );
  }

  // Trial users see countdown
  if (isInTrial && hasPremiumAccess) {
    const daysLeft = getTrialDaysLeft();
    const isUrgent = daysLeft <= 2;
    
    return (
      <div 
        onClick={() => navigate("/pricing")}
        className={`flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer ${
          isUrgent 
            ? "bg-destructive/10 animate-pulse" 
            : "bg-primary/10"
        }`}
      >
        <Sparkles className={`h-3 w-3 ${isUrgent ? "text-destructive" : "text-primary"}`} />
        <span className={`text-xs font-medium ${isUrgent ? "text-destructive" : "text-primary"}`}>
          {daysLeft}d trial
        </span>
      </div>
    );
  }

  // Free users see upgrade prompt
  if (!hasPremiumAccess) {
    return (
      <div 
        onClick={() => navigate("/pricing")}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
      >
        <Sparkles className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Try Pro</span>
      </div>
    );
  }

  return null;
};