import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { 
  Crown, 
  Sparkles, 
  Gift, 
  Brain, 
  Utensils, 
  TrendingUp,
  MessageCircle,
  Check,
  X
} from "lucide-react";

interface PaywallContextType {
  showPaywall: (feature?: string) => void;
  hidePaywall: () => void;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export const usePaywall = () => {
  const context = useContext(PaywallContext);
  if (!context) {
    throw new Error("usePaywall must be used within PaywallProvider");
  }
  return context;
};

interface PaywallProviderProps {
  children: ReactNode;
}

export const PaywallProvider = ({ children }: PaywallProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>();
  const { hasPremiumAccess } = useSubscription();
  const navigate = useNavigate();

  const showPaywall = useCallback((featureName?: string) => {
    if (hasPremiumAccess) return; // Don't show if already premium
    setFeature(featureName);
    setIsOpen(true);
  }, [hasPremiumAccess]);

  const hidePaywall = useCallback(() => {
    setIsOpen(false);
    setFeature(undefined);
  }, []);

  const handleStartTrial = () => {
    hidePaywall();
    navigate("/pricing");
  };

  const features = [
    { icon: Brain, label: "AI Workout Generator" },
    { icon: Utensils, label: "AI Nutrition Planner" },
    { icon: TrendingUp, label: "Advanced Analytics" },
    { icon: MessageCircle, label: "24/7 AI Coach" },
  ];

  return (
    <PaywallContext.Provider value={{ showPaywall, hidePaywall }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-primary/30 bg-gradient-to-b from-background to-primary/5">
          <button 
            onClick={hidePaywall}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <DialogHeader className="text-center space-y-4 pt-2">
            {/* Trial Badge */}
            <div className="mx-auto">
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1">
                <Gift className="h-3 w-3 mr-1" />
                7-Day Free Trial
              </Badge>
            </div>
            
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-background" />
            </div>
            
            <DialogTitle className="text-2xl font-bold">
              Unlock {feature || "Premium Features"}
            </DialogTitle>
            
            <p className="text-muted-foreground text-sm">
              Get full access to all AI-powered features for 7 days, free.
            </p>
          </DialogHeader>

          {/* Features List */}
          <div className="space-y-3 py-4">
            {features.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">{item.label}</span>
                <Check className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleStartTrial}
              className="w-full bg-gradient-primary hover:opacity-90 text-background h-12 text-base"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              No charge until trial ends. Cancel anytime.
            </p>
            
            <button 
              onClick={hidePaywall}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </PaywallContext.Provider>
  );
};