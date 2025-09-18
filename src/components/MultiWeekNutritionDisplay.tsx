import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  TrendingUp,
  Coffee,
  Sun,
  Moon
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
        weeks: nutritionPlan.weeks,
        goal: nutritionPlan.goal,
        weekly_plans: nutritionPlan.weekly_plans
      });

      if (result.success) {
        toast({
          title: "Program saved!",
          description: "Your multi-week nutrition program has been saved.",
        });
        setShowSaveDialog(false);
        setPlanName("");
        setPlanDescription("");
        onSave?.(planName, planDescription);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save nutrition program",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getMealIcon = (mealName: string) => {
    const meal = mealName.toLowerCase();
    if (meal.includes('breakfast')) return Coffee;
    if (meal.includes('lunch')) return Sun;
    if (meal.includes('dinner')) return Moon;
    return Utensils;
  };

  if (!nutritionPlan) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Program
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Nutrition Program</DialogTitle>
                  <DialogDescription>
                    Save this {nutritionPlan.weeks}-week nutrition program for future use.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="program-name">Program Name</Label>
                    <Input
                      id="program-name"
                      placeholder="e.g., 12-Week Transformation Plan"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program-description">Description (Optional)</Label>
                    <Textarea
                      id="program-description"
                      placeholder="Describe your nutrition program..."
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
                      onClick={handleSave}
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
                          Save Program
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

      {/* Program Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {nutritionPlan.name}
          </CardTitle>
          <div className="text-muted-foreground">{nutritionPlan.description}</div>
          
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">
              <Calendar className="w-3 h-3 mr-1" />
              {nutritionPlan.weeks} Weeks
            </Badge>
            <Badge variant="secondary">
              <Target className="w-3 h-3 mr-1" />
              {nutritionPlan.goal}
            </Badge>
            <Badge variant="secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Progressive
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Program Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{nutritionPlan.weeks}</div>
              <div className="text-sm text-muted-foreground">Weeks</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-500">
                {nutritionPlan.average_calories || '2000'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Calories/Day</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {nutritionPlan.weekly_plans?.length * 7 || nutritionPlan.weeks * 7}
              </div>
              <div className="text-sm text-muted-foreground">Total Meal Plans</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">
                {nutritionPlan.weekly_plans?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Shopping Lists</div>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <Tabs defaultValue="week-1" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              {nutritionPlan.weekly_plans?.map((week: any, index: number) => (
                <TabsTrigger 
                  key={`week-${index + 1}`} 
                  value={`week-${index + 1}`}
                  className="text-xs"
                >
                  Week {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {nutritionPlan.weekly_plans?.map((week: any, index: number) => (
              <TabsContent key={`week-${index + 1}`} value={`week-${index + 1}`}>
                <div className="space-y-6">
                  {/* Week Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Week {index + 1}: {week.focus}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Target: {week.daily_calories} calories/day • {week.description || week.focus}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Daily Meal Plans */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        Daily Meal Plans
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {week.meal_plans?.map((day: any, dayIndex: number) => (
                          <AccordionItem key={dayIndex} value={`day-${dayIndex}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <span className="font-medium">{day.day}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {day.total_calories || week.daily_calories} cal
                                  </Badge>
                                  <Badge variant="outline">
                                    {day.meals?.length || 3} meals
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-4">
                                {day.meals?.map((meal: any, mealIndex: number) => {
                                  const MealIcon = getMealIcon(meal.name);
                                  return (
                                    <div key={mealIndex} className="p-4 border rounded-lg">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <MealIcon className="h-4 w-4" />
                                          <span className="font-medium">{meal.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="secondary">
                                            {meal.calories} cal
                                          </Badge>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onAddMealToLog?.(meal)}
                                          >
                                            Add to Log
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      {meal.foods && meal.foods.length > 0 && (
                                        <div className="space-y-2">
                                          <h5 className="text-sm font-medium">Ingredients:</h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {meal.foods.map((food: any, foodIndex: number) => (
                                              <div key={foodIndex} className="text-sm p-2 bg-muted rounded">
                                                <span className="font-medium">{food.name}</span>
                                                <span className="text-muted-foreground ml-2">
                                                  {food.quantity} ({food.calories} cal)
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {meal.instructions && (
                                        <div className="mt-3 pt-3 border-t">
                                          <h5 className="text-sm font-medium mb-2">Instructions:</h5>
                                          <p className="text-sm text-muted-foreground">{meal.instructions}</p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>

                  {/* Weekly Shopping List */}
                  {week.shopping_list && week.shopping_list.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Weekly Shopping List
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {week.shopping_list.map((category: any, categoryIndex: number) => (
                            <div key={categoryIndex} className="space-y-3">
                              <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                                {category.category}
                              </h4>
                              <div className="space-y-2">
                                {category.items?.map((item: any, itemIndex: number) => (
                                  <div key={itemIndex} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                                    <span>{item.name}</span>
                                    <div className="text-right">
                                      <div className="text-xs text-muted-foreground">{item.quantity}</div>
                                      <div className="font-medium">{item.estimatedCost}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Nutrition Tips */}
          {nutritionPlan.nutrition_tips && nutritionPlan.nutrition_tips.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Nutrition Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {nutritionPlan.nutrition_tips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};