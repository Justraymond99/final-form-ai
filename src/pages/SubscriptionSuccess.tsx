import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Crown, Sparkles, ArrowRight } from "lucide-react";
import { PurchaseCelebration } from "@/components/PurchaseCelebration";

const SubscriptionSuccess = () => {
  const { checkSubscription } = useSubscription();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    // Refresh subscription status after successful payment
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <PurchaseCelebration isOpen={showCelebration} onClose={() => setShowCelebration(false)} />
      <div className="max-w-md mx-auto space-y-8">
        {/* Success Animation */}
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to FitTracker Pro!
          </h1>
          <p className="text-muted-foreground">
            Your subscription is now active and ready to use.
          </p>
        </div>

        {/* Success Card */}
        <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 text-background" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Subscription Activated
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Badge className="bg-primary text-primary-foreground">
              FitTracker Pro
            </Badge>
            <p className="text-sm text-muted-foreground">
              You now have access to all premium features including AI-powered workout and nutrition generation.
            </p>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What's Now Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "AI Workout Generator",
                "AI Nutrition Planner", 
                "Advanced analytics",
                "Custom meal plans",
                "Priority support",
                "Export data",
                "Premium templates"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-2.5 w-2.5 text-background" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/workouts')}
            className="w-full bg-gradient-primary hover:opacity-90 text-background"
          >
            Try AI Workout Generator
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            onClick={() => navigate('/nutrition')}
            variant="outline"
            className="w-full"
          >
            Try AI Nutrition Planner
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <Button 
            onClick={() => navigate('/home')}
            variant="ghost"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Support */}
        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground">
            Need help? Check out our{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => navigate('/pricing')}
            >
              subscription management
            </Button>
            {" "}or contact support.
          </p>
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default SubscriptionSuccess;