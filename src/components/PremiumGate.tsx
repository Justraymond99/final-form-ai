import { ReactNode, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, Lock, Shield } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
}

export const PremiumGate = ({ children, feature, description }: PremiumGateProps) => {
  const { hasPremiumAccess, loading, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Checking access...</p>
        </CardContent>
      </Card>
    );
  }

  // If user has premium access, show the feature
  if (hasPremiumAccess) {
    return <>{children}</>;
  }

  // Otherwise, show the upgrade prompt
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const url = await createCheckout('monthly');
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
          <Lock className="h-8 w-8 text-background" />
        </div>
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Premium Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-center">
          <Badge variant="secondary" className="mb-2">
            <Sparkles className="h-3 w-3 mr-1" />
            {feature}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {description || "This feature is available exclusively for FitTracker Pro members."}
          </p>
        </div>
        
        <div className="space-y-3 pt-4">
          <Button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isUpgrading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => navigate('/pricing')}
            variant="outline"
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            View All Plans
          </Button>
        </div>

        <div className="bg-background/50 rounded-lg p-4 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            Unlock AI-powered workouts, nutrition plans, and premium features with FitTracker Pro
          </p>
        </div>
      </CardContent>
    </Card>
  );
};