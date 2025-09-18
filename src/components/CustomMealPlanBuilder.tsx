import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PremiumGate } from "@/components/PremiumGate";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, ChefHat } from "lucide-react";

interface MealItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayPlan {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
}

export const CustomMealPlanBuilder = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [currentDay, setCurrentDay] = useState(1);
  const [dayPlans, setDayPlans] = useState<Record<number, DayPlan>>({
    1: { breakfast: [], lunch: [], dinner: [], snacks: [] }
  });
  const [newItem, setNewItem] = useState<Partial<MealItem>>({
    name: "",
    quantity: 1,
    unit: "serving",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [selectedMeal, setSelectedMeal] = useState<keyof DayPlan>("breakfast");
  const [loading, setLoading] = useState(false);

  const addMealItem = () => {
    if (!newItem.name || !newItem.calories) {
      toast({
        title: "Error",
        description: "Please fill in meal name and calories",
        variant: "destructive"
      });
      return;
    }

    const item: MealItem = {
      id: Date.now().toString(),
      name: newItem.name!,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || "serving",
      calories: newItem.calories || 0,
      protein: newItem.protein || 0,
      carbs: newItem.carbs || 0,
      fat: newItem.fat || 0
    };

    setDayPlans(prev => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        [selectedMeal]: [...(prev[currentDay]?.[selectedMeal] || []), item]
      }
    }));

    setNewItem({
      name: "",
      quantity: 1,
      unit: "serving",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });

    toast({
      title: "Success",
      description: "Meal item added to plan"
    });
  };

  const removeMealItem = (dayNum: number, mealType: keyof DayPlan, itemId: string) => {
    setDayPlans(prev => ({
      ...prev,
      [dayNum]: {
        ...prev[dayNum],
        [mealType]: prev[dayNum][mealType].filter(item => item.id !== itemId)
      }
    }));
  };

  const addDay = () => {
    const nextDay = Math.max(...Object.keys(dayPlans).map(Number)) + 1;
    setDayPlans(prev => ({
      ...prev,
      [nextDay]: { breakfast: [], lunch: [], dinner: [], snacks: [] }
    }));
    setCurrentDay(nextDay);
  };

  const saveMealPlan = async () => {
    if (!user || !planName) {
      toast({
        title: "Error",
        description: "Please enter a plan name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          name: planName,
          description: planDescription,
          plan_data: dayPlans as any,
          target_calories: Object.values(dayPlans).reduce((total, day) => 
            total + Object.values(day).flat().reduce((dayTotal, item) => dayTotal + item.calories, 0), 0
          ) / Object.keys(dayPlans).length,
          goal: "custom"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Custom meal plan "${planName}" saved successfully!`
      });

      // Reset form
      setPlanName("");
      setPlanDescription("");
      setDayPlans({ 1: { breakfast: [], lunch: [], dinner: [], snacks: [] } });
      setCurrentDay(1);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to save meal plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDayTotals = (day: DayPlan) => {
    const allItems = [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks];
    return {
      calories: allItems.reduce((sum, item) => sum + item.calories, 0),
      protein: allItems.reduce((sum, item) => sum + item.protein, 0),
      carbs: allItems.reduce((sum, item) => sum + item.carbs, 0),
      fat: allItems.reduce((sum, item) => sum + item.fat, 0)
    };
  };

  return (
    <PremiumGate 
      feature="Custom Meal Plan Builder" 
      description="Create your own personalized meal plans with detailed nutritional tracking and multi-day planning."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Custom Meal Plan Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="My Custom Meal Plan"
                />
              </div>
              <div>
                <Label htmlFor="planDescription">Description</Label>
                <Input
                  id="planDescription"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Brief description of your plan"
                />
              </div>
            </div>

            {/* Day Navigation */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Days:</span>
              {Object.keys(dayPlans).map(day => (
                <Button
                  key={day}
                  variant={currentDay === Number(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDay(Number(day))}
                >
                  Day {day}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={addDay}>
                <Plus className="h-4 w-4" />
                Add Day
              </Button>
            </div>

            {/* Current Day Totals */}
            {dayPlans[currentDay] && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Day {currentDay} Totals</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    {(() => {
                      const totals = getDayTotals(dayPlans[currentDay]);
                      return (
                        <>
                          <div className="text-center">
                            <div className="font-medium">{totals.calories}</div>
                            <div className="text-muted-foreground">Calories</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{totals.protein}g</div>
                            <div className="text-muted-foreground">Protein</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{totals.carbs}g</div>
                            <div className="text-muted-foreground">Carbs</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{totals.fat}g</div>
                            <div className="text-muted-foreground">Fat</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Meal Item */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Meal Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Meal Type</Label>
                    <Select value={selectedMeal} onValueChange={(value: keyof DayPlan) => setSelectedMeal(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Food Name *</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Grilled Chicken Breast"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select value={newItem.unit} onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serving">serving</SelectItem>
                        <SelectItem value="grams">grams</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                        <SelectItem value="cup">cup</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Calories *</Label>
                    <Input
                      type="number"
                      value={newItem.calories}
                      onChange={(e) => setNewItem(prev => ({ ...prev, calories: parseFloat(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      value={newItem.protein}
                      onChange={(e) => setNewItem(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      value={newItem.carbs}
                      onChange={(e) => setNewItem(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input
                      type="number"
                      value={newItem.fat}
                      onChange={(e) => setNewItem(prev => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <Button onClick={addMealItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Day {currentDay}
                </Button>
              </CardContent>
            </Card>

            {/* Current Day Meals */}
            {dayPlans[currentDay] && (
              <div className="space-y-4">
                {Object.entries(dayPlans[currentDay]).map(([mealType, items]) => (
                  <Card key={mealType}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize flex items-center justify-between">
                        {mealType}
                        <Badge variant="secondary">
                          {items.reduce((sum, item) => sum + item.calories, 0)} cal
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {items.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No items added</p>
                      ) : (
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantity} {item.unit} • {item.calories} cal • 
                                  P: {item.protein}g C: {item.carbs}g F: {item.fat}g
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMealItem(currentDay, mealType as keyof DayPlan, item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Save Plan */}
            <Button 
              onClick={saveMealPlan} 
              disabled={loading || !planName} 
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Custom Meal Plan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PremiumGate>
  );
};