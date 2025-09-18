import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useMealPlans } from "@/hooks/useMealPlans";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChefHat, 
  Clock, 
  DollarSign, 
  Target, 
  ShoppingCart,
  Utensils,
  Apple,
  Loader2,
  Lightbulb,
  Save,
  Play
} from "lucide-react";

interface NutritionPlan {
  dailyPlan: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    meals: Array<{
      name: string;
      time: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      foods: Array<{
        name: string;
        quantity: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }>;
      instructions: string;
    }>;
  };
  shoppingList: Array<{
    category: string;
    items: Array<{
      name: string;
      quantity: string;
      estimatedCost: string;
    }>;
  }>;
  mealPrepTips: string[];
  nutritionTips: string[];
}

export const NutritionGenerator = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const { saveMealPlan, addMealToFoodLog } = useMealPlans();
  const [isGenerating, setIsGenerating] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  
  // Form state
  const [goal, setGoal] = useState("");
  const [targetCalories, setTargetCalories] = useState(2000);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [cookingTime, setCookingTime] = useState(30);
  const [budget, setBudget] = useState("moderate");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");

  const goalOptions = [
    "Weight Loss",
    "Weight Gain", 
    "Muscle Building",
    "Maintenance",
    "Athletic Performance",
    "General Health"
  ];

  const dietaryOptions = [
    "Vegetarian",
    "Vegan", 
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low Carb",
    "High Protein",
    "Gluten Free",
    "Dairy Free"
  ];

  const budgetOptions = [
    { value: "low", label: "Budget Friendly" },
    { value: "moderate", label: "Moderate" },
    { value: "premium", label: "Premium" }
  ];

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    if (checked) {
      setDietaryPreferences([...dietaryPreferences, dietary]);
    } else {
      setDietaryPreferences(dietaryPreferences.filter(d => d !== dietary));
    }
  };

  const handleSavePlan = async () => {
    if (!nutritionPlan || !planName.trim()) {
      toast({
        title: "Save failed",
        description: "Please enter a name for your meal plan",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const result = await saveMealPlan(nutritionPlan, planName, planDescription);
    
    if (result.success) {
      toast({
        title: "Meal plan saved!",
        description: "Your personalized meal plan has been saved.",
      });
      setShowSaveDialog(false);
      setPlanName("");
      setPlanDescription("");
    } else {
      toast({
        title: "Save failed",
        description: result.error || "Failed to save meal plan",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleAddMealToLog = async (meal: any) => {
    if (!user) return;

    try {
      // Add each food item from the meal to the food log
      const foodLogEntries = meal.foods.map((food: any) => ({
        user_id: user.id,
        food_name: food.name,
        quantity: parseFloat(food.quantity.split(' ')[0]) || 1,
        unit: food.quantity.split(' ').slice(1).join(' ') || 'serving',
        meal_type: meal.name.toLowerCase().replace(/\s+/g, '_'),
        calories: food.calories,
        protein_g: food.protein,
        carbs_g: food.carbs,
        fat_g: food.fat,
        fiber_g: null,
        sugar_g: null,
        sodium_mg: null,
        logged_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('food_logs')
        .insert(foodLogEntries);

      if (error) throw error;

      toast({
        title: "Meal added!",
        description: `${meal.name} has been added to your food log.`,
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

  const generateNutritionPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate nutrition plans",
        variant: "destructive",
      });
      return;
    }

    if (!goal) {
      toast({
        title: "Goal required",
        description: "Please select your nutrition goal",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-nutrition-generator', {
        body: {
          userId: user.id,
          goal,
          dietaryPreferences,
          allergies: allergies.split(',').map(a => a.trim()).filter(a => a),
          targetCalories,
          mealsPerDay,
          cookingTime,
          budget
        }
      });

      if (error) throw error;

      if (data.success) {
        setNutritionPlan(data.nutritionPlan);
        toast({
          title: "Nutrition plan generated!",
          description: "Your personalized meal plan is ready.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate nutrition plan');
      }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Nutrition Generator
          </CardTitle>
          <CardDescription>
            Get a personalized meal plan tailored to your goals and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Goal Selection */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Calories */}
            <div className="space-y-2">
              <Label htmlFor="calories">Target Calories/Day</Label>
              <Input
                id="calories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                min={1200}
                max={4000}
              />
            </div>

            {/* Meals Per Day */}
            <div className="space-y-2">
              <Label htmlFor="meals">Meals Per Day</Label>
              <Select value={mealsPerDay.toString()} onValueChange={(value) => setMealsPerDay(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Meals</SelectItem>
                  <SelectItem value="4">4 Meals</SelectItem>
                  <SelectItem value="5">5 Meals</SelectItem>
                  <SelectItem value="6">6 Meals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cooking Time */}
            <div className="space-y-2">
              <Label htmlFor="cooking-time">Max Cooking Time (minutes)</Label>
              <Select value={cookingTime.toString()} onValueChange={(value) => setCookingTime(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Level</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dietary Preferences */}
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

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies/Restrictions</Label>
            <Textarea
              id="allergies"
              placeholder="List any food allergies or restrictions (comma separated)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              rows={3}
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
                Generating Your Nutrition Plan...
              </>
            ) : (
              <>
                <ChefHat className="h-4 w-4 mr-2" />
                Generate Nutrition Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Nutrition Plan */}
      {nutritionPlan && (
        <div className="space-y-6">
          {/* Save Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Meal Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Meal Plan</DialogTitle>
                      <DialogDescription>
                        Give your meal plan a name and description to save it for future use.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="plan-name">Plan Name</Label>
                        <Input
                          id="plan-name"
                          placeholder="e.g., High Protein Weight Loss"
                          value={planName}
                          onChange={(e) => setPlanName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plan-description">Description (Optional)</Label>
                        <Textarea
                          id="plan-description"
                          placeholder="Describe your meal plan..."
                          value={planDescription}
                          onChange={(e) => setPlanDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowSaveDialog(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSavePlan}
                          disabled={isSaving || !planName.trim()}
                          className="flex-1"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Plan
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          {/* Daily Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Daily Nutrition Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{nutritionPlan.dailyPlan.targetCalories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{nutritionPlan.dailyPlan.targetProtein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{nutritionPlan.dailyPlan.targetCarbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{nutritionPlan.dailyPlan.targetFat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Daily Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {nutritionPlan.dailyPlan.meals.map((meal, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{meal.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meal.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-semibold">{meal.calories} cal</div>
                            <div className="text-xs text-muted-foreground">
                              P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddMealToLog(meal)}
                            className="ml-2"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Add to Log
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="flex justify-between items-center text-sm">
                            <span>{food.name} ({food.quantity})</span>
                            <span className="text-muted-foreground">{food.calories} cal</span>
                          </div>
                        ))}
                      </div>
                      
                      {meal.instructions && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          <strong>Instructions:</strong> {meal.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Shopping List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nutritionPlan.shoppingList.map((category, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Apple className="h-4 w-4" />
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center text-sm border rounded p-2">
                          <span>{item.name} - {item.quantity}</span>
                          <Badge variant="outline">{item.estimatedCost}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meal Prep Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Meal Prep Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nutritionPlan.mealPrepTips.map((tip, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 mt-1 text-yellow-500 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Nutrition Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Nutrition Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nutritionPlan.nutritionTips.map((tip, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};