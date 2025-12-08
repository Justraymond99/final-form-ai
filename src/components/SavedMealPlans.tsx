import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMealPlans } from "@/hooks/useMealPlans";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Calendar, Target, Trash2, Play, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

export const SavedMealPlans = () => {
  const { mealPlans, loading, deleteMealPlan, addMealToFoodLog } = useMealPlans();
  const { createShoppingListFromMealPlan } = useShoppingList();
  const { toast } = useToast();
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
  const [addingMeal, setAddingMeal] = useState<string | null>(null);
  const [creatingList, setCreatingList] = useState<string | null>(null);

  const handleCreateShoppingList = async (planId: string, planName: string) => {
    setCreatingList(planId);
    const result = await createShoppingListFromMealPlan(planId, planName);
    
    if (result.success) {
      toast({
        title: "Shopping list created!",
        description: `Grocery list for "${planName}" is ready.`,
      });
    } else {
      toast({
        title: "Failed to create list",
        description: result.error || "Could not generate shopping list",
        variant: "destructive",
      });
    }
    setCreatingList(null);
  };

  const handleDeletePlan = async (planId: string) => {
    setDeletingPlan(planId);
    const result = await deleteMealPlan(planId);
    
    if (result.success) {
      toast({
        title: "Meal plan deleted",
        description: "The meal plan has been removed.",
      });
    } else {
      toast({
        title: "Delete failed",
        description: result.error || "Failed to delete meal plan",
        variant: "destructive",
      });
    }
    setDeletingPlan(null);
  };

  const handleAddMealToLog = async (planId: string, mealType: string, mealName: string) => {
    setAddingMeal(`${planId}-${mealType}`);
    const result = await addMealToFoodLog(planId, mealType);
    
    if (result.success) {
      toast({
        title: "Meal added!",
        description: `${mealName} has been added to your food log.`,
      });
    } else {
      toast({
        title: "Failed to add meal",
        description: result.error || "Could not add meal to food log",
        variant: "destructive",
      });
    }
    setAddingMeal(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (mealPlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Saved Meal Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved meal plans yet</p>
            <p className="text-sm">Generate and save a meal plan to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Saved Meal Plans ({mealPlans.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {mealPlans.map((plan) => {
              const planData = plan.plan_data as any;
              const dailyPlan = planData?.dailyPlan;
              
              return (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {plan.goal && (
                          <Badge variant="secondary">
                            <Target className="h-3 w-3 mr-1" />
                            {plan.goal}
                          </Badge>
                        )}
                        {plan.target_calories && (
                          <Badge variant="outline">
                            {plan.target_calories} cal
                          </Badge>
                        )}
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(plan.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateShoppingList(plan.id, plan.name)}
                        disabled={creatingList === plan.id}
                        title="Create shopping list"
                      >
                        {creatingList === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={deletingPlan === plan.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {deletingPlan === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Nutrition Targets */}
                  {(plan.target_protein || plan.target_carbs || plan.target_fat) && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted rounded-lg">
                      {plan.target_protein && (
                        <div className="text-center">
                          <div className="font-semibold text-blue-500">{plan.target_protein}g</div>
                          <div className="text-xs text-muted-foreground">Protein</div>
                        </div>
                      )}
                      {plan.target_carbs && (
                        <div className="text-center">
                          <div className="font-semibold text-green-500">{plan.target_carbs}g</div>
                          <div className="text-xs text-muted-foreground">Carbs</div>
                        </div>
                      )}
                      {plan.target_fat && (
                        <div className="text-center">
                          <div className="font-semibold text-yellow-500">{plan.target_fat}g</div>
                          <div className="text-xs text-muted-foreground">Fat</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Add Meals */}
                  {dailyPlan?.meals && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Quick Add Meals:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {dailyPlan.meals.slice(0, 4).map((meal: any, index: number) => {
                          const mealType = meal.name.toLowerCase().replace(/\s+/g, '_');
                          const isAdding = addingMeal === `${plan.id}-${mealType}`;
                          
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddMealToLog(plan.id, mealType, meal.name)}
                              disabled={isAdding}
                              className="justify-start"
                            >
                              {isAdding ? (
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3 mr-2" />
                              )}
                              <span className="truncate">
                                {meal.name} ({meal.calories} cal)
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};