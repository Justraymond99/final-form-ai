import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useNavigate } from "react-router-dom";
import { 
  Gift, 
  Sparkles, 
  Brain, 
  Utensils, 
  TrendingUp,
  Zap,
  ArrowRight
} from "lucide-react";

const NUDGE_SHOWN_KEY = "trial_nudge_shown";

export const OnboardingTrialNudge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSecureAuth();
  const { hasPremiumAccess, loading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    
    // Don't show if already premium
    if (hasPremiumAccess) return;

    // Check if we've already shown the nudge
    const nudgeShown = localStorage.getItem(NUDGE_SHOWN_KEY);
    if (nudgeShown) return;

    // Check if this is a recent signup (within last 5 minutes)
    const userCreatedAt = user.created_at;
    if (userCreatedAt) {
      const createdTime = new Date(userCreatedAt).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      // Show nudge for new users
      if (now - createdTime < fiveMinutes) {
        // Small delay to let the app settle
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem(NUDGE_SHOWN_KEY, "true");
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Also show for users who haven't seen it yet (first app open after feature added)
    // but only if they've been using the app for less than a day
    const userCreated = new Date(user.created_at || Date.now()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - userCreated < oneDay) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(NUDGE_SHOWN_KEY, "true");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, hasPremiumAccess, loading]);

  const handleStartTrial = () => {
    setIsOpen(false);
    navigate("/pricing");
  };

  const handleMaybeLater = () => {
    setIsOpen(false);
  };

  const features = [
    { icon: Brain, label: "AI creates personalized workouts", color: "text-purple-500" },
    { icon: Utensils, label: "Get custom meal plans instantly", color: "text-green-500" },
    { icon: TrendingUp, label: "Track progress with smart insights", color: "text-blue-500" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-primary/30">
        <DialogHeader className="text-center space-y-4">
          {/* Welcome Badge */}
          <div className="mx-auto">
            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1">
              <Gift className="h-3 w-3 mr-1" />
              Welcome Gift
            </Badge>
          </div>
          
          {/* Animated Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
            <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
              <Zap className="h-7 w-7 text-background" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold">
            Unlock Your Full Potential
          </DialogTitle>
          
          <p className="text-muted-foreground">
            Start your <span className="text-primary font-semibold">7-day free trial</span> and experience AI-powered fitness
          </p>
        </DialogHeader>

        {/* Features */}
        <div className="space-y-4 py-6">
          {features.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button 
            onClick={handleStartTrial}
            className="w-full bg-gradient-primary hover:opacity-90 text-background h-12 text-base group"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start Free Trial
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            No credit card required • Cancel anytime
          </p>
          
          <button 
            onClick={handleMaybeLater}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            I'll explore first
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};