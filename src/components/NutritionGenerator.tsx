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
import { PremiumGate } from "@/components/PremiumGate";
import { ChefHat, Loader2 } from "lucide-react";
import { MultiWeekNutritionDisplay } from "@/components/MultiWeekNutritionDisplay";

export const NutritionGenerator = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  
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
      const { data, error } = await supabase.functions.invoke('ai-nutrition-generator', {
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

      if (error) throw error;

      setGeneratedPlan(data);
      toast({
        title: "Nutrition plan generated!",
        description: "Your personalized meal program is ready.",
      });
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
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
    <PremiumGate 
      feature="AI Nutrition Generator" 
      description="Get personalized multi-week meal plans tailored to your goals, dietary preferences, and budget using advanced AI."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Multi-Week Nutrition Generator
            </CardTitle>
            <CardDescription>
              Generate personalized multi-week meal plans with progressive nutrition optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          <MultiWeekNutritionDisplay 
            nutritionPlan={generatedPlan}
            onSave={(name: string, description: string) => {
              console.log('Saving plan:', name, description);
            }}
            onAddMealToLog={handleAddMealToLog}
          />
        )}
      </div>
    </PremiumGate>
  );
};