import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Dumbbell, Apple, Target, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingData {
  goals: string[];
  fitnessLevel: string;
  dietaryPreferences: string[];
  workoutFrequency: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { toast } = useToast();
  const { updateProfile } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    fitnessLevel: '',
    dietaryPreferences: [],
    workoutFrequency: '',
    age: 0,
    height: 0,
    weight: 0,
    targetWeight: 0
  });

  const steps = [
    {
      title: "Welcome to Final Form AI!",
      description: "Let's personalize your fitness journey with AI-powered workouts and nutrition.",
      icon: <Trophy className="w-12 h-12 text-primary" />
    },
    {
      title: "What are your fitness goals?",
      description: "Select all that apply to customize your experience.",
      icon: <Target className="w-12 h-12 text-primary" />
    },
    {
      title: "Tell us about yourself",
      description: "This helps us create the perfect plan for you.",
      icon: <Dumbbell className="w-12 h-12 text-primary" />
    },
    {
      title: "Dietary preferences",
      description: "Let's create meal plans that fit your lifestyle.",
      icon: <Apple className="w-12 h-12 text-primary" />
    }
  ];

  const fitnessGoals = [
    'Lose Weight', 'Gain Muscle', 'Improve Endurance', 'Get Stronger',
    'Better Health', 'Tone Up', 'Athletic Performance', 'Flexibility'
  ];

  const dietaryOptions = [
    'No restrictions', 'Vegetarian', 'Vegan', 'Keto', 'Paleo',
    'Mediterranean', 'Low Carb', 'Gluten Free', 'Dairy Free'
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
    try {
      await updateProfile({
        activity_level: data.fitnessLevel,
        dietary_restrictions: data.dietaryPreferences,
        age: data.age,
        height_cm: data.height,
        weight_kg: data.weight,
        target_weight_kg: data.targetWeight,
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
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">{steps[0].icon}</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{steps[0].title}</h2>
              <p className="text-muted-foreground">{steps[0].description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Dumbbell className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium">AI Workouts</p>
                <p className="text-muted-foreground">Personalized training plans</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <Apple className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Smart Nutrition</p>
                <p className="text-muted-foreground">Custom meal plans</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">{steps[1].icon}</div>
              <h2 className="text-2xl font-bold mb-2">{steps[1].title}</h2>
              <p className="text-muted-foreground">{steps[1].description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fitnessGoals.map(goal => (
                <div
                  key={goal}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    data.goals.includes(goal)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleGoalToggle(goal)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={data.goals.includes(goal)} />
                    <span className="text-sm font-medium">{goal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">{steps[2].icon}</div>
              <h2 className="text-2xl font-bold mb-2">{steps[2].title}</h2>
              <p className="text-muted-foreground">{steps[2].description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={data.weight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  placeholder="70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-weight">Target Weight (kg)</Label>
                <Input
                  id="target-weight"
                  type="number"
                  value={data.targetWeight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) || 0 }))}
                  placeholder="65"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fitness Level</Label>
              <Select value={data.fitnessLevel} onValueChange={(value) => setData(prev => ({ ...prev, fitnessLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (New to exercise)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Some experience)</SelectItem>
                  <SelectItem value="advanced">Advanced (Regular training)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Workout Frequency</Label>
              <Select value={data.workoutFrequency} onValueChange={(value) => setData(prev => ({ ...prev, workoutFrequency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How often do you want to work out?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-3">2-3 times per week</SelectItem>
                  <SelectItem value="4-5">4-5 times per week</SelectItem>
                  <SelectItem value="6+">6+ times per week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">{steps[3].icon}</div>
              <h2 className="text-2xl font-bold mb-2">{steps[3].title}</h2>
              <p className="text-muted-foreground">{steps[3].description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dietaryOptions.map(option => (
                <div
                  key={option}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    data.dietaryPreferences.includes(option)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleDietaryToggle(option)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={data.dietaryPreferences.includes(option)} />
                    <span className="text-sm font-medium">{option}</span>
                  </div>
                </div>
              ))}
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
        return data.goals.length > 0;
      case 2:
        return data.age > 0 && data.height > 0 && data.weight > 0 && data.fitnessLevel;
      case 3:
        return data.dietaryPreferences.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
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
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};