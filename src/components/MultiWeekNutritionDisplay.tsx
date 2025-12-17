import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMultiWeekPlans } from "@/hooks/useMultiWeekPlans";
import { 
  Calendar, 
  Target, 
  ShoppingCart, 
  Utensils, 
  Apple,
  Save, 
  Loader2,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Plus
} from "lucide-react";

interface MultiWeekNutritionDisplayProps {
  nutritionPlan: any;
  onSave?: (name: string, description: string) => void;
  onAddMealToLog?: (meal: any) => void;
}

export const MultiWeekNutritionDisplay = ({ 
  nutritionPlan, 
  onSave, 
  onAddMealToLog 
}: MultiWeekNutritionDisplayProps) => {
  const { toast } = useToast();
  const { saveMultiWeekNutritionPlan } = useMultiWeekPlans();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Extract the actual plan from the response
  const plan = nutritionPlan?.nutritionPlan || nutritionPlan;

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your nutrition program",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveMultiWeekNutritionPlan({
        name: planName,
        description: planDescription,
        weeks: plan.weeks || 1,
        goal: plan.goal || 'general',
        weekly_plans: plan
      });

      if (result.success) {
        toast({
          title: "Program saved!",
          description: "Your nutrition program has been saved.",
        });
        setShowSaveDialog(false);
        setPlanName("");
        setPlanDescription("");
        onSave?.(planName, planDescription);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save nutrition program",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMeal = (mealType: string, meal: any) => {
    const mealData = {
      name: meal.name,
      meal_type: mealType,
      calories: meal.calories,
      items: meal.items?.map((item: string) => ({
        name: item,
        calories: Math.round(meal.calories / (meal.items?.length || 1)),
        protein_g: Math.round((meal.protein || 0) / (meal.items?.length || 1)),
        carbs_g: Math.round((meal.carbs || 0) / (meal.items?.length || 1)),
        fat_g: Math.round((meal.fat || 0) / (meal.items?.length || 1)),
      })) || []
    };
    onAddMealToLog?.(mealData);
  };

  if (!plan || plan.error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {plan?.error || "No nutrition plan generated yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const sampleDay = plan.sampleDay;
  const macros = plan.macros || { protein: 150, carbs: 200, fat: 65 };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Nutrition Plan</DialogTitle>
                <DialogDescription>
                  Save this {plan.weeks}-week nutrition plan for future use.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program-name">Plan Name</Label>
                  <Input
                    id="program-name"
                    placeholder="e.g., My Meal Plan"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-description">Description</Label>
                  <Textarea
                    id="program-description"
                    placeholder="Describe your plan..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || !planName.trim()} className="flex-1">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Your Nutrition Plan
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">
              <Calendar className="w-3 h-3 mr-1" />
              {plan.weeks} Week{plan.weeks > 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary">
              <Target className="w-3 h-3 mr-1" />
              {plan.dailyCalories} cal/day
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Macro Targets */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{macros.protein}g</div>
              <div className="text-sm text-muted-foreground">Protein</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{macros.carbs}g</div>
              <div className="text-sm text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{macros.fat}g</div>
              <div className="text-sm text-muted-foreground">Fat</div>
            </div>
          </div>

          {/* Sample Day Meals */}
          {sampleDay && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Sample Day
              </h3>
              
              {/* Breakfast */}
              {sampleDay.breakfast && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">{sampleDay.breakfast.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sampleDay.breakfast.calories} cal • P:{sampleDay.breakfast.protein}g C:{sampleDay.breakfast.carbs}g F:{sampleDay.breakfast.fat}g
                          </p>
                          {sampleDay.breakfast.items && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {sampleDay.breakfast.items.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleAddMeal('breakfast', sampleDay.breakfast)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lunch */}
              {sampleDay.lunch && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="font-medium">{sampleDay.lunch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sampleDay.lunch.calories} cal • P:{sampleDay.lunch.protein}g C:{sampleDay.lunch.carbs}g F:{sampleDay.lunch.fat}g
                          </p>
                          {sampleDay.lunch.items && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {sampleDay.lunch.items.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleAddMeal('lunch', sampleDay.lunch)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dinner */}
              {sampleDay.dinner && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{sampleDay.dinner.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sampleDay.dinner.calories} cal • P:{sampleDay.dinner.protein}g C:{sampleDay.dinner.carbs}g F:{sampleDay.dinner.fat}g
                          </p>
                          {sampleDay.dinner.items && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {sampleDay.dinner.items.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleAddMeal('dinner', sampleDay.dinner)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Snacks */}
              {sampleDay.snacks && sampleDay.snacks.length > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Apple className="h-4 w-4 text-green-500" />
                      <p className="font-medium">Snacks</p>
                    </div>
                    <div className="space-y-2">
                      {sampleDay.snacks.map((snack: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{snack.name}</span>
                          <span className="text-muted-foreground">{snack.calories} cal</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Shopping List */}
          {plan.shoppingList && plan.shoppingList.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Shopping List
              </h3>
              <div className="flex flex-wrap gap-2">
                {plan.shoppingList.map((item: string, i: number) => (
                  <Badge key={i} variant="outline">{item}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Variations */}
          {plan.weeklyVariations && plan.weeklyVariations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Weekly Focus</h3>
              <div className="space-y-2">
                {plan.weeklyVariations.map((week: any, i: number) => (
                  <div key={i} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Week {week.week}: {week.focus}</p>
                    {week.tip && <p className="text-sm text-muted-foreground">{week.tip}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {plan.tips && plan.tips.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Apple className="h-4 w-4" />
                Tips
              </h3>
              <div className="space-y-2">
                {plan.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};