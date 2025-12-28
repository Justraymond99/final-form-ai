import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useGenerationHistory } from "@/hooks/useGenerationHistory";
import { ChefHat, Loader2, X } from "lucide-react";
import { MultiWeekNutritionDisplay } from "@/components/MultiWeekNutritionDisplay";
import { Button as ShadButton } from "@/components/ui/button";
import { useRateLimitStatus } from "@/hooks/useRateLimitStatus";
import { RateLimitIndicator } from "@/components/RateLimitIndicator";
import { AI_RATE_LIMITS } from "@/lib/rateLimitConfig";

export const NutritionGenerator = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const { saveGeneration } = useGenerationHistory();
  const { updateRateLimitFromResponse, handleRateLimitError, getRateLimitInfo } = useRateLimitStatus();
  
  const [goal, setGoal] = useState("");
  const [targetCalories, setTargetCalories] = useState("2000");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [cookingTime, setCookingTime] = useState("30");
  const [budgetRange, setBudgetRange] = useState("moderate");
  const [programLength, setProgramLength] = useState("1");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const rateLimitInfo = getRateLimitInfo('ai-nutrition-generator');
  const maxRequests = AI_RATE_LIMITS['ai-nutrition-generator']?.maxRequests || 15;

  const goalOptions = [
    "Weight Loss", "Weight Gain", "Muscle Building", "Maintenance", "Athletic Performance", "General Health"
  ];

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "Low Carb", "High Protein", "Gluten Free", "Dairy Free"
  ];

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    if (checked) {
      setDietaryPreferences([...dietaryPreferences, dietary]);
    } else {
      setDietaryPreferences(dietaryPreferences.filter(d => d !== dietary));
    }
  };

  const generateNutritionPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate nutrition plans",
        variant: "destructive",
      });
      return;
    }

    if (!goal || !targetCalories) {
      toast({
        title: "Missing information",
        description: "Please select your goal and target calories",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await supabase.functions.invoke('ai-nutrition-generator', {
        body: {
          targetCalories: parseInt(targetCalories),
          goal,
          dietaryPreferences,
          allergies: allergies.split(',').map(a => a.trim()).filter(a => a),
          cookingTime,
          budgetRange,
          additionalNotes,
          programLength: parseInt(programLength)
        }
      });

      // Update rate limit status from response headers if available
      if (response.data?.remaining !== undefined) {
        updateRateLimitFromResponse(
          new Response(null, {
            headers: {
              'X-RateLimit-Remaining': response.data.remaining?.toString() || '0',
              'X-RateLimit-Reset': response.data.resetAt || ''
            }
          }),
          'ai-nutrition-generator'
        );
      }

      if (response.error) {
        // Check if it's a rate limit error
        if (response.error.message?.includes('429') || response.data?.error?.includes('rate limit')) {
          handleRateLimitError(response.data || {}, 'ai-nutrition-generator');
          return;
        }
        throw response.error;
      }

      setGeneratedPlan(response.data);
      
      // Save to generation history
      await saveGeneration('nutrition', response.data, `${goal} Meal Plan`, {
        targetCalories: parseInt(targetCalories),
        goal,
        dietaryPreferences,
        programLength: parseInt(programLength)
      });
      
      toast({
        title: "Nutrition plan generated!",
        description: "Your personalized meal program is ready.",
      });
    } catch (error: any) {
      console.error('Error generating nutrition plan:', error);
      
      // Handle rate limit from error response
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        handleRateLimitError(error, 'ai-nutrition-generator');
        return;
      }
      
      toast({
        title: "Generation failed",
        description: "Unable to generate nutrition plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMealToLog = async (meal: any) => {
    if (!user) return;

    try {
      const foodLogEntries = meal.items?.map((item: any) => ({
        user_id: user.id,
        food_name: item.name,
        quantity: parseFloat(item.quantity?.toString().split(' ')[0]) || 1,
        unit: item.unit || 'serving',
        meal_type: meal.meal_type || 'meal',
        calories: item.calories || 0,
        protein_g: item.protein_g || 0,
        carbs_g: item.carbs_g || 0,
        fat_g: item.fat_g || 0,
        logged_at: new Date().toISOString()
      })) || [];

      const { error } = await supabase
        .from('food_logs')
        .insert(foodLogEntries);

      if (error) throw error;

      toast({
        title: "Meal added!",
        description: `${meal.name || 'Meal'} has been added to your food log.`,
      });
    } catch (error) {
      console.error('Error adding meal to log:', error);
      toast({
        title: "Failed to add meal",
        description: "There was an error adding the meal to your log.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Nutrition Generator
          </CardTitle>
          <CardDescription>
            Generate personalized meal plans with progressive nutrition optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rateLimitInfo && (
            <RateLimitIndicator
              remaining={rateLimitInfo.remaining}
              maxRequests={maxRequests}
              resetAt={rateLimitInfo.resetAt}
              endpoint="ai-nutrition-generator"
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="goal">Primary Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select your nutrition goal" />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((option) => (
                  <SelectItem key={option} value={option.toLowerCase().replace(' ', '_')}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Target Calories/Day</Label>
              <Input
                id="calories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                min={1200}
                max={4000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooking-time">Max Cooking Time (min)</Label>
              <Select value={cookingTime} onValueChange={setCookingTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program-length">Program Length</Label>
              <Select value={programLength} onValueChange={setProgramLength}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Week</SelectItem>
                  <SelectItem value="4">4 Weeks</SelectItem>
                  <SelectItem value="8">8 Weeks</SelectItem>
                  <SelectItem value="12">12 Weeks</SelectItem>
                  <SelectItem value="16">16 Weeks</SelectItem>
                  <SelectItem value="18">18 Weeks</SelectItem>
                  <SelectItem value="24">24 Weeks</SelectItem>
                  <SelectItem value="36">36 Weeks</SelectItem>
                  <SelectItem value="48">48 Weeks</SelectItem>
                  <SelectItem value="52">52 Weeks (1 Year)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dietary Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map((dietary) => (
                <div key={dietary} className="flex items-center space-x-2">
                  <Checkbox
                    id={dietary}
                    checked={dietaryPreferences.includes(dietary)}
                    onCheckedChange={(checked) => handleDietaryChange(dietary, checked as boolean)}
                  />
                  <Label htmlFor={dietary} className="text-sm">
                    {dietary}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements, allergies, or preferences..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          <Button 
            onClick={generateNutritionPlan} 
            className="w-full" 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <ChefHat className="h-4 w-4 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPlan && (
        <div className="relative">
          <ShadButton
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={() => setGeneratedPlan(null)}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </ShadButton>
          <MultiWeekNutritionDisplay 
            nutritionPlan={generatedPlan}
            onSave={(name: string, description: string) => {
              console.log('Saving plan:', name, description);
            }}
            onAddMealToLog={handleAddMealToLog}
          />
        </div>
      )}
    </div>
  );
};