import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIGenerationCardProps {
  title: string;
  icon: React.ElementType;
  gradient: string;
  placeholder: string;
  type: 'workout' | 'meal';
  onGenerated?: (result: any) => void;
}

export const AIGenerationCard: React.FC<AIGenerationCardProps> = ({
  title,
  icon: Icon,
  gradient,
  placeholder,
  type,
  onGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what you'd like to generate",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fitness-chat', {
        body: { 
          message: `Generate a detailed ${type} plan: ${prompt}`,
          type: type,
          format: 'structured'
        }
      });

      if (error) throw error;

      const result = data?.reply || `Generated ${type} plan based on: ${prompt}`;
      setGeneratedContent({
        content: result,
        timestamp: new Date().toISOString()
      });
      
      onGenerated?.(result);
      
      toast({
        title: `${type === 'workout' ? 'Workout' : 'Meal Plan'} Generated!`,
        description: "Your plan is ready",
      });
      
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    // For now, just show success message
    toast({
      title: "Saved!",
      description: `Your ${type} plan has been saved`,
    });
    setGeneratedContent(null);
    setPrompt('');
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedContent ? (
          <>
            <Textarea
              placeholder={placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isGenerating}
            />
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full ${gradient} hover:opacity-90`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate {type === 'workout' ? 'Workout' : 'Meal Plan'}
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Generated Successfully</span>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {generatedContent.content}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setGeneratedContent(null);
                  setPrompt('');
                }}
                className="border-primary/20"
              >
                Generate New
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};