import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Progress } from '@/components/ui/progress';
import { 
  Dumbbell, Apple, Target, Trophy, ArrowRight, ArrowLeft, 
  Sparkles, Brain, Calendar, Flame, CheckCircle2 
} from 'lucide-react';

interface OnboardingData {
  goals: string[];
  fitnessLevel: string;
  dietaryPreferences: string[];
  workoutFrequency: string;
  age: number;
  height: number;
  heightFt: number;
  heightIn: number;
  weight: number;
  targetWeight: number;
  displayName: string;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'ft';
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

// Conversion helpers
const lbToKg = (lb: number) => Math.round(lb * 0.453592 * 10) / 10;
const kgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
const ftInToCm = (ft: number, inches: number) => Math.round((ft * 30.48) + (inches * 2.54));
const cmToFtIn = (cm: number) => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, in: inches };
};

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { toast } = useToast();
  const { updateProfile } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    fitnessLevel: '',
    dietaryPreferences: [],
    workoutFrequency: '',
    age: 0,
    height: 0,
    heightFt: 0,
    heightIn: 0,
    weight: 0,
    targetWeight: 0,
    displayName: '',
    weightUnit: 'kg',
    heightUnit: 'cm'
  });

  const steps = [
    {
      title: "Welcome to Final Form AI!",
      subtitle: "Your AI-powered fitness companion",
      icon: <Sparkles className="w-16 h-16 text-primary" />,
    },
    {
      title: "What's your name?",
      subtitle: "Let's make this personal",
      icon: <Trophy className="w-12 h-12 text-secondary" />,
    },
    {
      title: "What are your goals?",
      subtitle: "Select all that apply",
      icon: <Target className="w-12 h-12 text-accent" />,
    },
    {
      title: "About you",
      subtitle: "Help us create your perfect plan",
      icon: <Dumbbell className="w-12 h-12 text-primary" />,
    },
    {
      title: "Dietary preferences",
      subtitle: "Customize your nutrition",
      icon: <Apple className="w-12 h-12 text-green-500" />,
    },
    {
      title: "You're all set!",
      subtitle: "Here's what you can do",
      icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
    }
  ];

  const fitnessGoals = [
    { label: 'Lose Weight', icon: '🔥' },
    { label: 'Build Muscle', icon: '💪' },
    { label: 'Get Stronger', icon: '🏋️' },
    { label: 'Improve Endurance', icon: '🏃' },
    { label: 'Better Health', icon: '❤️' },
    { label: 'Tone Up', icon: '✨' },
    { label: 'Flexibility', icon: '🧘' },
    { label: 'Athletic Performance', icon: '⚡' },
  ];

  const dietaryOptions = [
    { label: 'No restrictions', icon: '🍽️' },
    { label: 'Vegetarian', icon: '🥗' },
    { label: 'Vegan', icon: '🌱' },
    { label: 'Keto', icon: '🥑' },
    { label: 'Paleo', icon: '🥩' },
    { label: 'Low Carb', icon: '🥦' },
    { label: 'Gluten Free', icon: '🌾' },
    { label: 'Dairy Free', icon: '🥛' },
  ];

  const features = [
    { icon: <Brain className="w-6 h-6" />, title: "AI Coach", desc: "Chat with Athena for personalized advice" },
    { icon: <Dumbbell className="w-6 h-6" />, title: "Smart Workouts", desc: "AI-generated training plans" },
    { icon: <Apple className="w-6 h-6" />, title: "Nutrition", desc: "Track meals & get suggestions" },
    { icon: <Calendar className="w-6 h-6" />, title: "Schedule", desc: "Plan your workout week" },
    { icon: <Flame className="w-6 h-6" />, title: "Streaks", desc: "Build habits with daily tracking" },
    { icon: <Trophy className="w-6 h-6" />, title: "Achievements", desc: "Unlock badges as you progress" },
  ];

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleDietaryToggle = (option: string) => {
    setData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(option)
        ? prev.dietaryPreferences.filter(d => d !== option)
        : [...prev.dietaryPreferences, option]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Convert to metric for storage
      const heightCm = data.heightUnit === 'ft' 
        ? ftInToCm(data.heightFt, data.heightIn) 
        : data.height;
      const weightKg = data.weightUnit === 'lb' 
        ? lbToKg(data.weight) 
        : data.weight;
      const targetWeightKg = data.weightUnit === 'lb' 
        ? lbToKg(data.targetWeight) 
        : data.targetWeight;

      await updateProfile({
        display_name: data.displayName,
        activity_level: data.fitnessLevel,
        dietary_restrictions: data.dietaryPreferences,
        fitness_goals: data.goals,
        age: data.age,
        height_cm: heightCm,
        weight_kg: weightKg,
        target_weight_kg: targetWeightKg,
      });
      
      localStorage.setItem('onboarding_completed', 'true');
      
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your personalized fitness journey starts now.",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center animate-scale-in">{steps[0].icon}</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {steps[0].title}
              </h2>
              <p className="text-muted-foreground text-lg">{steps[0].subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:scale-105 transition-transform">
                <Dumbbell className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">AI Workouts</p>
                <p className="text-muted-foreground text-xs mt-1">Personalized training plans that adapt to you</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 hover:scale-105 transition-transform">
                <Apple className="w-10 h-10 text-accent mx-auto mb-3" />
                <p className="font-semibold">Smart Nutrition</p>
                <p className="text-muted-foreground text-xs mt-1">AI meal plans & food tracking</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20 hover:scale-105 transition-transform">
                <Brain className="w-10 h-10 text-secondary mx-auto mb-3" />
                <p className="font-semibold">AI Coach</p>
                <p className="text-muted-foreground text-xs mt-1">Chat with Athena anytime</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl border border-orange-500/20 hover:scale-105 transition-transform">
                <Trophy className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <p className="font-semibold">Track Progress</p>
                <p className="text-muted-foreground text-xs mt-1">See your gains over time</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="flex justify-center mb-4">{steps[1].icon}</div>
              <h2 className="text-2xl font-bold mb-2">{steps[1].title}</h2>
              <p className="text-muted-foreground">{steps[1].subtitle}</p>
            </div>
            <div className="max-w-sm mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Your Name</Label>
                <Input
                  id="name"
                  value={data.displayName}
                  onChange={(e) => setData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your name"
                  className="text-lg h-12"
                  autoFocus
                />
              </div>
              {data.displayName && (
                <p className="text-center text-muted-foreground animate-fade-in">
                  Nice to meet you, <span className="text-primary font-semibold">{data.displayName}</span>! 👋
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="flex justify-center mb-4">{steps[2].icon}</div>
              <h2 className="text-2xl font-bold mb-2">{steps[2].title}</h2>
              <p className="text-muted-foreground">{steps[2].subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fitnessGoals.map(({ label, icon }) => (
                <div
                  key={label}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                    data.goals.includes(label)
                      ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleGoalToggle(label)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {data.goals.includes(label) && (
                      <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Selected: {data.goals.length} goal{data.goals.length !== 1 ? 's' : ''}
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="flex justify-center mb-4">{steps[3].icon}</div>
              <h2 className="text-2xl font-bold mb-2">{steps[3].title}</h2>
              <p className="text-muted-foreground">{steps[3].subtitle}</p>
            </div>
            
            {/* Unit preference toggles */}
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Weight:</span>
                <div className="flex rounded-md overflow-hidden border border-border">
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm transition-colors ${data.weightUnit === 'kg' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    onClick={() => setData(prev => ({ ...prev, weightUnit: 'kg' }))}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm transition-colors ${data.weightUnit === 'lb' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    onClick={() => setData(prev => ({ ...prev, weightUnit: 'lb' }))}
                  >
                    lb
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Height:</span>
                <div className="flex rounded-md overflow-hidden border border-border">
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm transition-colors ${data.heightUnit === 'cm' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    onClick={() => setData(prev => ({ ...prev, heightUnit: 'cm' }))}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm transition-colors ${data.heightUnit === 'ft' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    onClick={() => setData(prev => ({ ...prev, heightUnit: 'ft' }))}
                  >
                    ft/in
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={data.age || ''}
                  onChange={(e) => setData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  placeholder="25"
                />
              </div>
              
              {/* Height input - conditional based on unit */}
              {data.heightUnit === 'cm' ? (
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={data.height || ''}
                    onChange={(e) => setData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    placeholder="175"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Height (ft/in)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={data.heightFt || ''}
                      onChange={(e) => setData(prev => ({ ...prev, heightFt: parseInt(e.target.value) || 0 }))}
                      placeholder="5"
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      value={data.heightIn || ''}
                      onChange={(e) => setData(prev => ({ ...prev, heightIn: parseInt(e.target.value) || 0 }))}
                      placeholder="10"
                      className="w-1/2"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight ({data.weightUnit})</Label>
                <Input
                  id="weight"
                  type="number"
                  value={data.weight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  placeholder={data.weightUnit === 'kg' ? '70' : '154'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-weight">Target Weight ({data.weightUnit})</Label>
                <Input
                  id="target-weight"
                  type="number"
                  value={data.targetWeight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) || 0 }))}
                  placeholder={data.weightUnit === 'kg' ? '65' : '143'}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fitness Level</Label>
                <Select value={data.fitnessLevel} onValueChange={(value) => setData(prev => ({ ...prev, fitnessLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">🌱 Beginner - New to exercise</SelectItem>
                    <SelectItem value="intermediate">💪 Intermediate - Some experience</SelectItem>
                    <SelectItem value="advanced">🔥 Advanced - Regular training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Workout Frequency</Label>
                <Select value={data.workoutFrequency} onValueChange={(value) => setData(prev => ({ ...prev, workoutFrequency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="How often?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-3">2-3 times per week</SelectItem>
                    <SelectItem value="4-5">4-5 times per week</SelectItem>
                    <SelectItem value="6+">6+ times per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="flex justify-center mb-4">{steps[4].icon}</div>
              <h2 className="text-2xl font-bold mb-2">{steps[4].title}</h2>
              <p className="text-muted-foreground">{steps[4].subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.map(({ label, icon }) => (
                <div
                  key={label}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                    data.dietaryPreferences.includes(label)
                      ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleDietaryToggle(label)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {data.dietaryPreferences.includes(label) && (
                      <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="flex justify-center mb-4 animate-scale-in">{steps[5].icon}</div>
              <h2 className="text-2xl font-bold mb-2">
                {data.displayName ? `You're ready, ${data.displayName}!` : steps[5].title}
              </h2>
              <p className="text-muted-foreground">{steps[5].subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/5 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
              <p className="text-sm">
                💡 <span className="font-medium">Pro tip:</span> Tap the chat bubble in the bottom right to talk to Athena!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return data.displayName.trim().length > 0;
      case 2:
        return data.goals.length > 0;
      case 3:
        const hasHeight = data.heightUnit === 'cm' ? data.height > 0 : (data.heightFt > 0 || data.heightIn > 0);
        return data.age > 0 && hasHeight && data.weight > 0 && data.fitnessLevel;
      case 4:
        return data.dietaryPreferences.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {renderStep()}
          
          <div className="flex justify-between mt-8 gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isCompleting}
              className="flex items-center gap-2 flex-1 max-w-xs"
            >
              {isCompleting ? (
                "Setting up..."
              ) : currentStep === steps.length - 1 ? (
                <>
                  Start My Journey
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
