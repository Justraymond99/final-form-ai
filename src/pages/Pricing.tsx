import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Navigation } from "@/components/Navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Capacitor } from "@capacitor/core";
import { 
  Check, 
  Zap, 
  Brain, 
  Target, 
  Star,
  Crown,
  Shield,
  Sparkles,
  RefreshCw,
  Apple,
  Gift
} from "lucide-react";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { 
    hasPremiumAccess, 
    isInTrial, 
    subscribed, 
    planType, 
    trialEndDate, 
    packages,
    loading,
    purchasePackage,
    restorePurchases 
  } = useSubscription();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);

  const isIOSNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";

  // Show spinner while loading
  if (loading) {
    return <LoadingSpinner />;
  }

  const handlePurchase = async (packageType: 'monthly' | 'yearly') => {
    if (!isIOSNative) {
      toast({
        title: "iOS Only",
        description: "Subscriptions are only available on the iOS app",
        variant: "destructive"
      });
      return;
    }

    // Find the right package
    const pkg = packages.find(p => 
      packageType === 'yearly' 
        ? (p.identifier.includes('annual') || p.identifier.includes('yearly'))
        : (p.identifier.includes('monthly') || p.packageType === 'MONTHLY')
    ) || packages[0]; // Fallback to first package

    if (!pkg) {
      toast({
        title: "Error",
        description: "No subscription packages available",
        variant: "destructive"
      });
      return;
    }

    try {
      setPurchasing(true);
      const success = await purchasePackage(pkg);
      
      if (success) {
        toast({
          title: "Success!",
          description: "Welcome to FitTracker Pro!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!isIOSNative) {
      toast({
        title: "iOS Only",
        description: "Restore is only available on the iOS app",
        variant: "destructive"
      });
      return;
    }

    try {
      setPurchasing(true);
      const restored = await restorePurchases();
      
      if (restored) {
        toast({
          title: "Purchases Restored",
          description: "Your subscription has been restored!",
        });
      } else {
        toast({
          title: "No Purchases Found",
          description: "No previous purchases found to restore.",
        });
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Could not restore purchases. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
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

  // Get prices from RevenueCat packages
  const getPackagePrice = (type: 'monthly' | 'yearly') => {
    const pkg = packages.find(p => 
      type === 'yearly' 
        ? (p.identifier.includes('annual') || p.identifier.includes('yearly'))
        : (p.identifier.includes('monthly') || p.packageType === 'MONTHLY')
    );
    return pkg?.product?.priceString || (type === 'yearly' ? '$79.99' : '$9.99');
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
    "Smart Workout Generator - Custom routines based on your goals",
    "Personalized Nutrition Planner - Tailored meal plans",
    "Recovery Planner - Optimize rest & recovery",
    "Fitness Chat - 24/7 personal trainer assistant",
    "Voice food logging with smart parsing",
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
          {/* Free Trial Banner */}
          {!hasPremiumAccess && (
            <div className="bg-gradient-to-r from-primary via-accent to-secondary p-[1px] rounded-xl">
              <div className="bg-background rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Start Your 7-Day Free Trial
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Try all Pro features free for 7 days. Cancel anytime.
                </p>
              </div>
            </div>
          )}

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
            <Badge variant="secondary" className="ml-2">4 Months Free</Badge>
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
            {/* Trial Badge */}
            {!hasPremiumAccess && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4">
                  <Gift className="h-3 w-3 mr-1" />
                  7-Day Free Trial
                </Badge>
              </div>
            )}
            {hasPremiumAccess && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Current Plan
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-8 pt-6">
              <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-background" />
              </div>
              <CardTitle className="text-2xl">FitTracker Pro</CardTitle>
              <div className="space-y-2">
                {!hasPremiumAccess && (
                  <p className="text-sm font-medium text-primary">
                    Try free for 7 days, then:
                  </p>
                )}
                <div className="text-3xl font-bold">
                  {isYearly ? getPackagePrice('yearly') : getPackagePrice('monthly')}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-sm text-green-600">4 months free with annual billing!</p>
                )}
              </div>
              <p className="text-muted-foreground">Unlock AI-powered features</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Everything in Free, plus:</p>
              </div>
              <ul className="space-y-3 max-h-64 overflow-y-auto">
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
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        <Crown className="h-4 w-4 inline mr-1" />
                        {planType === 'yearly' ? 'Annual' : 'Monthly'} Subscription Active
                      </p>
                    </div>
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
                <div className="space-y-3">
                  <Button 
                    onClick={() => handlePurchase(isYearly ? 'yearly' : 'monthly')}
                    className="w-full bg-gradient-primary hover:opacity-90 text-background"
                    disabled={purchasing || loading || !isIOSNative}
                  >
                    {purchasing ? "Processing..." : "Start 7-Day Free Trial"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    No charge until trial ends. Cancel anytime.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Restore Purchases */}
        {isIOSNative && !hasPremiumAccess && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={handleRestore}
              disabled={purchasing}
              className="text-muted-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${purchasing ? 'animate-spin' : ''}`} />
              Restore Purchases
            </Button>
          </div>
        )}

        {/* FAQ/Features */}
        <div className="mt-16 text-center space-y-8">
          <h2 className="text-2xl font-bold">Why Choose FitTracker Pro?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 gradient-strength rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold">Smart Training</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized workouts and meal plans tailored to your goals
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 gradient-energy rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold">Goal-Oriented</h3>
              <p className="text-sm text-muted-foreground">
                Advanced tracking and analytics to help you reach your fitness goals faster
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 gradient-wellness rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold">Premium Experience</h3>
              <p className="text-sm text-muted-foreground">
                Access exclusive features, templates, and priority customer support
              </p>
            </div>
          </div>
        </div>

        {/* Apple Compliance Notice */}
        <div className="text-center text-xs text-muted-foreground space-y-2 pt-8">
          <p>
            Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
          </p>
          <p>
            Payment will be charged to your Apple ID account at confirmation of purchase.
          </p>
          <p>
            Manage subscriptions in your device's Settings → Apple ID → Subscriptions.
          </p>
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Pricing;