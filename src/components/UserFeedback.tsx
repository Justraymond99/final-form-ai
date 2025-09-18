import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Star, MessageCircle, Bug, Lightbulb, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackData {
  type: string;
  rating?: number;
  message: string;
  feature?: string;
}

export const UserFeedback = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: '',
    message: '',
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, description: 'Something isn\'t working' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, description: 'I have an idea' },
    { value: 'general', label: 'General Feedback', icon: MessageCircle, description: 'Share your thoughts' },
    { value: 'praise', label: 'Compliment', icon: Heart, description: 'I love something!' },
  ];

  const features = [
    'AI Workouts',
    'AI Nutrition',
    'Progress Tracking',
    'Goal Setting',
    'Food Logging',
    'Water Tracking',
    'Achievements',
    'User Interface',
    'Performance',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!feedback.type || !feedback.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a feedback type and add your message.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store feedback in Supabase (you'd need to create a feedback table)
      const feedbackData = {
        user_id: user?.id,
        type: feedback.type,
        rating: feedback.rating,
        message: feedback.message,
        feature: feedback.feature,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        created_at: new Date().toISOString(),
      };

      // For now, we'll just log to console and show success
      // In a real app, you'd save to database
      console.log('User feedback:', feedbackData);

      toast({
        title: "Thank You! 🙏",
        description: "Your feedback helps us make the app better for everyone.",
      });

      // Reset form and close
      setFeedback({ type: '', message: '' });
      setIsOpen(false);

      // Send email notification to team (would be handled by edge function)
      // await supabase.functions.invoke('send-feedback-notification', {
      //   body: feedbackData
      // });

    } catch (error) {
      toast({
        title: "Failed to Submit",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve Final Form AI with your insights and suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <Label>What type of feedback do you have?</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      feedback.type === type.value
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFeedback(prev => ({ ...prev, type: type.value }))}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Rating for general feedback */}
          {feedback.type === 'general' && (
            <div className="space-y-2">
              <Label>How would you rate your overall experience?</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      star <= (hoveredStar || feedback.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Feature selection for bugs and feature requests */}
          {(feedback.type === 'bug' || feedback.type === 'feature') && (
            <div className="space-y-2">
              <Label>Which feature is this about?</Label>
              <Select value={feedback.feature} onValueChange={(value) => setFeedback(prev => ({ ...prev, feature: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a feature" />
                </SelectTrigger>
                <SelectContent>
                  {features.map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label>Tell us more</Label>
            <Textarea
              placeholder={
                feedback.type === 'bug'
                  ? 'Describe what happened and what you expected to happen...'
                  : feedback.type === 'feature'
                  ? 'Describe the feature you\'d like to see and how it would help you...'
                  : 'Share your thoughts, suggestions, or experience...'
              }
              value={feedback.message}
              onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !feedback.type || !feedback.message.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};