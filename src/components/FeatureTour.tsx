import { useState, useEffect } from "react";
import { X, ArrowRight, Sparkles, MessageCircle, Dumbbell, Apple, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  position: "center" | "bottom-right";
}

interface FeatureTourProps {
  onComplete: () => void;
}

export const FeatureTour = ({ onComplete }: FeatureTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: TourStep[] = [
    {
      title: "Meet Athena, Your AI Coach",
      description: "Tap the chat bubble anytime to get personalized fitness advice, workout tips, and motivation!",
      icon: <MessageCircle className="w-8 h-8 text-primary" />,
      position: "bottom-right",
    },
    {
      title: "Quick Actions",
      description: "Log water, meals, steps, and meditation right from your dashboard. Build streaks by staying consistent!",
      icon: <Sparkles className="w-8 h-8 text-accent" />,
      position: "center",
    },
    {
      title: "AI Workouts",
      description: "Generate personalized workout plans based on your goals. Find them in the Workouts tab!",
      icon: <Dumbbell className="w-8 h-8 text-secondary" />,
      position: "center",
    },
    {
      title: "Track Your Nutrition",
      description: "Log meals, scan barcodes, and get AI meal plan suggestions in the Nutrition section.",
      icon: <Apple className="w-8 h-8 text-green-500" />,
      position: "center",
    },
    {
      title: "Earn Achievements",
      description: "Complete goals and unlock badges as you progress. Check your Awards page to see them all!",
      icon: <Trophy className="w-8 h-8 text-orange-500" />,
      position: "center",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("feature_tour_completed", "true");
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className={`
        w-full max-w-md mx-4 shadow-2xl border-primary/20
        ${step.position === "bottom-right" ? "fixed bottom-24 right-4 w-80" : ""}
      `}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              {step.icon}
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="text-xl font-bold mb-2">{step.title}</h3>
          <p className="text-muted-foreground mb-6">{step.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip tour
              </Button>
              <Button size="sm" onClick={handleNext} className="gap-1">
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
