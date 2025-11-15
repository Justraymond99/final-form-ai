import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Brain, 
  Camera, 
  TrendingUp, 
  Heart, 
  Zap, 
  Target,
  Clock,
  User,
  Activity,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'analysis' | 'planning' | 'coaching' | 'health';
  isPremium: boolean;
}

export const AdvancedAIFeatures = () => {
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const [activeTab, setActiveTab] = useState('analysis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null);

  const aiFeatures: AIFeature[] = [
    {
      id: 'progress-analysis',
      title: 'Progress Photo Analysis',
      description: 'AI analyzes your progress photos to track muscle growth, fat loss, and posture improvements.',
      icon: <Camera className="w-6 h-6" />,
      category: 'analysis',
      isPremium: false
    },
    {
      id: 'workout-optimization',
      title: 'Workout Optimization',
      description: 'Dynamically adjusts your workouts based on performance data and recovery metrics.',
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'planning',
      isPremium: false
    },
    {
      id: 'injury-prevention',
      title: 'Injury Prevention AI',
      description: 'Analyzes movement patterns and suggests modifications to prevent injuries.',
      icon: <Heart className="w-6 h-6" />,
      category: 'health',
      isPremium: false
    },
    {
      id: 'ai-coach',
      title: 'Personal AI Coach',
      description: 'Real-time coaching with personalized motivation and form corrections.',
      icon: <Brain className="w-6 h-6" />,
      category: 'coaching',
      isPremium: false
    },
    {
      id: 'recovery-optimization',
      title: 'Recovery Optimization',
      description: 'AI-powered recovery plans based on sleep, stress, and workout intensity.',
      icon: <Zap className="w-6 h-6" />,
      category: 'health',
      isPremium: false
    },
    {
      id: 'goal-prediction',
      title: 'Goal Achievement Prediction',
      description: 'Predicts when you\'ll reach your goals and adjusts plans accordingly.',
      icon: <Target className="w-6 h-6" />,
      category: 'analysis',
      isPremium: false
    }
  ];

  const handleFeatureActivation = async (feature: AIFeature) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-feature-activation', {
        body: {
          feature_id: feature.id,
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "AI Feature Activated! 🤖",
        description: `${feature.title} is now active and learning from your data.`,
      });

    } catch (error) {
      toast({
        title: "Activation Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePersonalizedInsights = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights-generator', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      toast({
        title: "AI Insights Generated! ✨",
        description: "Check your dashboard for personalized recommendations.",
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate insights at this time.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredFeatures = aiFeatures.filter(feature => feature.category === activeTab);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Advanced AI Features
        </h1>
        <p className="text-muted-foreground mt-2">
          Unlock the full power of AI-driven fitness optimization
        </p>
      </div>

      {/* AI Insights Panel */}
      <Card className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Insights Dashboard
          </CardTitle>
          <CardDescription>
            Get personalized insights based on your fitness data and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Workout Analysis</h3>
              <p className="text-sm text-muted-foreground">AI-powered form and performance insights</p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold">Progress Prediction</h3>
              <p className="text-sm text-muted-foreground">Forecasting your fitness journey</p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <User className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold">Personalization</h3>
              <p className="text-sm text-muted-foreground">Tailored recommendations just for you</p>
            </div>
          </div>
          <Button 
            onClick={generatePersonalizedInsights}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Generating...' : 'Generate AI Insights'}
          </Button>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Free
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  
                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Learn More
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {feature.icon}
                            {feature.title}
                          </DialogTitle>
                          <DialogDescription>
                            Detailed information about this AI feature
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>{feature.description}</p>
                          
                          {feature.id === 'progress-analysis' && (
                            <div className="space-y-2">
                              <h4 className="font-semibold">How it works:</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Upload progress photos weekly</li>
                                <li>• AI analyzes muscle definition and body composition</li>
                                <li>• Tracks changes in posture and symmetry</li>
                                <li>• Provides detailed progress reports</li>
                              </ul>
                            </div>
                          )}
                          
                          {feature.id === 'ai-coach' && (
                            <div className="space-y-2">
                              <h4 className="font-semibold">Features include:</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Real-time form corrections</li>
                                <li>• Personalized motivational messages</li>
                                <li>• Adaptive workout modifications</li>
                                <li>• Voice-guided exercise instructions</li>
                              </ul>
                            </div>
                          )}
                          
                          <Button 
                            onClick={() => handleFeatureActivation(feature)}
                            disabled={isProcessing}
                            className="w-full"
                          >
                            {isProcessing ? 'Activating...' : 'Activate Feature'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};