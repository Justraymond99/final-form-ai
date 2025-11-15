import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Navigation } from "@/components/Navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  Zap, 
  Brain, 
  Target, 
  Star,
  Crown,
  Shield,
  Sparkles
} from "lucide-react";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { hasPremiumAccess, isInTrial, subscribed, planType, trialEndDate, createCheckout, openCustomerPortal } = useSubscription();
  const { toast } = useToast();

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      const url = await createCheckout(plan);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTrialDaysLeft = () => {
    if (!trialEndDate) return 0;
    const now = new Date();
    const end = new Date(trialEndDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const freeFeatures = [
    "Basic workout logging",
    "Manual food tracking with USDA database",
    "Progress visualization & charts",
    "Daily goal tracking (steps, water, calories)",
    "Achievement badges & streaks",
    "Manual exercise creation",
    "Basic meal planning",
    "Community access"
  ];

  const proFeatures = [
    "Everything in Free, plus:",
    "AI Workout Generator - Custom routines based on your goals",
    "AI Nutrition Planner - Personalized meal plans",
    "AI Recovery Planner - Optimize rest & recovery",
    "AI Fitness Chat - 24/7 personal trainer assistant",
    "Voice food logging with AI parsing",
    "Multi-week workout programs",
    "Multi-week nutrition plans",
    "Advanced analytics & insights",
    "Custom meal plan builder",
    "Premium workout templates",
    "Priority support",
    "Data export (CSV)",
    "Advanced goal tracking with custom goals",
    "Shopping list generation",
    "Recipe recommendations"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start with our free plan and upgrade to unlock AI-powered features for personalized workouts and nutrition.
          </p>
          
          {isInTrial && (
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border border-primary/30">
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <Sparkles className="h-5 w-5" />
                <span>Free Trial Active - {getTrialDaysLeft()} days remaining</span>
              </div>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={!isYearly ? "font-medium" : "text-muted-foreground"}>Monthly</span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span className={isYearly ? "font-medium" : "text-muted-foreground"}>
            Yearly 
            <Badge variant="secondary" className="ml-2">Save 17%</Badge>
          </span>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                disabled
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative border-2 ${hasPremiumAccess ? 'border-primary bg-primary/5' : 'border-primary/50'} backdrop-blur-sm`}>
            {hasPremiumAccess && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Current Plan
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-background" />
              </div>
              <CardTitle className="text-2xl">FitTracker Pro</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  ${isYearly ? '99.99' : '9.99'}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-sm text-green-600">Save $19.89 per year!</p>
                )}
              </div>
              <p className="text-muted-foreground">Unlock AI-powered features</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Everything in Free, plus:</p>
              </div>
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-2.5 w-2.5 text-background" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {hasPremiumAccess ? (
                <div className="space-y-3">
                  {subscribed ? (
                    <Button 
                      onClick={openCustomerPortal}
                      className="w-full"
                      variant="outline"
                    >
                      Manage Subscription
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        🎉 Trial Active - Enjoying Pro features!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTrialDaysLeft()} days remaining
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={() => handleSubscribe(isYearly ? 'yearly' : 'monthly')}
                  className="w-full bg-gradient-primary hover:opacity-90 text-background"
                >
                  Start Free Trial
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ/Features */}
        <div className="mt-16 text-center space-y-8">
          <h2 className="text-2xl font-bold">Why Choose FitTracker Pro?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-gradient-strength rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized workouts and meal plans generated by advanced AI
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-gradient-energy rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold">Goal-Oriented</h3>
              <p className="text-sm text-muted-foreground">
                Advanced tracking and analytics to help you reach your fitness goals faster
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-gradient-wellness rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold">Premium Experience</h3>
              <p className="text-sm text-muted-foreground">
                Access exclusive features, templates, and priority customer support
              </p>
            </div>
          </div>
        </div>

        {/* Trial Info */}
        {!hasPremiumAccess && (
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">🎯 Start Your Free Trial Today</h3>
            <p className="text-sm text-muted-foreground">
              Try all Pro features free for 7 days. No commitment, cancel anytime.
            </p>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Pricing;