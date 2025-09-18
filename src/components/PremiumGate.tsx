import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, Lock } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
}

export const PremiumGate = ({ children, feature, description }: PremiumGateProps) => {
  const { hasPremiumAccess, isInTrial } = useSubscription();
  const navigate = useNavigate();

  if (hasPremiumAccess) {
    return <>{children}</>;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
          <Crown className="h-8 w-8 text-background" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Premium Feature</CardTitle>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            FitTracker Pro
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{feature}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="p-4 bg-background/50 rounded-lg border border-border/30">
          <p className="text-sm text-muted-foreground mb-3">
            Unlock this feature with a free 7-day trial
          </p>
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-primary hover:opacity-90 text-background"
          >
            Start Free Trial
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          • 7-day free trial • Cancel anytime • $9.99/month after trial
        </p>
      </CardContent>
    </Card>
  );
};