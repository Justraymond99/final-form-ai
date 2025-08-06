import { useState } from "react";
import { Plus, Camera, Mic, Target, TrendingUp, Clock, Utensils, Coffee, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  meal: string;
  time: string;
}

const Nutrition = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const goals: MacroGoals = {
    calories: 2400,
    protein: 150,
    carbs: 240,
    fat: 80
  };

  const [todaysFoods] = useState<FoodEntry[]>([
    {
      id: "1",
      name: "Greek Yogurt with Berries",
      calories: 180,
      protein: 15,
      carbs: 20,
      fat: 6,
      quantity: 1,
      unit: "serving",
      meal: "breakfast",
      time: "8:30 AM"
    },
    {
      id: "2", 
      name: "Chicken Breast",
      calories: 330,
      protein: 62,
      carbs: 0,
      fat: 7,
      quantity: 200,
      unit: "g",
      meal: "lunch",
      time: "12:45 PM"
    },
    {
      id: "3",
      name: "Brown Rice",
      calories: 220,
      protein: 5,
      carbs: 45,
      fat: 2,
      quantity: 200,
      unit: "g",
      meal: "lunch", 
      time: "12:45 PM"
    },
    {
      id: "4",
      name: "Almonds",
      calories: 160,
      protein: 6,
      carbs: 6,
      fat: 14,
      quantity: 28,
      unit: "g",
      meal: "snacks",
      time: "3:20 PM"
    }
  ]);

  const totals = todaysFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remaining = {
    calories: goals.calories - totals.calories,
    protein: goals.protein - totals.protein,
    carbs: goals.carbs - totals.carbs,
    fat: goals.fat - totals.fat
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case "breakfast": return <Coffee className="h-4 w-4" />;
      case "lunch": return <Sun className="h-4 w-4" />;
      case "dinner": return <Moon className="h-4 w-4" />;
      case "snacks": return <Utensils className="h-4 w-4" />;
      default: return <Utensils className="h-4 w-4" />;
    }
  };

  const getMealTotal = (meal: string) => {
    return todaysFoods
      .filter(food => food.meal === meal)
      .reduce((total, food) => total + food.calories, 0);
  };

  const getMealFoods = (meal: string) => {
    return todaysFoods.filter(food => food.meal === meal);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Nutrition
          </h1>
          <p className="text-muted-foreground">Fuel your fitness journey</p>
        </div>

        {/* Daily Summary */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calories */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calories</span>
                <span className="font-medium">
                  {totals.calories} / {goals.calories}
                  <span className="text-muted-foreground ml-1">
                    ({remaining.calories > 0 ? remaining.calories : 0} left)
                  </span>
                </span>
              </div>
              <Progress 
                value={(totals.calories / goals.calories) * 100} 
                className="h-2"
              />
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-500">{totals.protein}g</div>
                <div className="text-muted-foreground">Protein</div>
                <Progress 
                  value={(totals.protein / goals.protein) * 100} 
                  className="h-1 mt-1"
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-green-500">{totals.carbs}g</div>
                <div className="text-muted-foreground">Carbs</div>
                <Progress 
                  value={(totals.carbs / goals.carbs) * 100} 
                  className="h-1 mt-1"
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-yellow-500">{totals.fat}g</div>
                <div className="text-muted-foreground">Fat</div>
                <Progress 
                  value={(totals.fat / goals.fat) * 100} 
                  className="h-1 mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            className="h-16 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            onClick={() => navigate("/food-logger")}
          >
            <div className="flex flex-col items-center gap-1">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Add Food</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 border-primary/20 hover:bg-primary/5"
            onClick={() => toast({ title: "Scan Food", description: "Camera scanning coming soon! 📸" })}
          >
            <div className="flex flex-col items-center gap-1">
              <Camera className="h-5 w-5" />
              <span className="text-sm">Scan Food</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 border-primary/20 hover:bg-primary/5"
            onClick={() => toast({ title: "Voice Log", description: "Voice logging coming soon! 🎤" })}
          >
            <div className="flex flex-col items-center gap-1">
              <Mic className="h-5 w-5" />
              <span className="text-sm">Voice Log</span>
            </div>
          </Button>
        </div>

        {/* Meals */}
        {["breakfast", "lunch", "dinner", "snacks"].map((meal) => (
          <Card key={meal} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMealIcon(meal)}
                  <span className="capitalize">{meal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getMealTotal(meal)} cal
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => navigate("/food-logger")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getMealFoods(meal).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No foods logged</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate("/food-logger")}
                  >
                    Add Food
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getMealFoods(meal).map((food) => (
                    <div key={food.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {food.quantity}{food.unit} • {food.time}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{food.calories} cal</div>
                        <div className="text-muted-foreground">
                          P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Recent Foods */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Recent Foods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Chicken Breast", "Brown Rice", "Greek Yogurt", "Banana"].map((food, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium">{food}</p>
                  <p className="text-sm text-muted-foreground">Tap to add quickly</p>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Nutrition;