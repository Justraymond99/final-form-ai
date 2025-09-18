import { useState, useEffect } from "react";
import { Plus, Camera, Mic, Target, TrendingUp, Clock, Utensils, Coffee, Sun, Moon, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwipeableNavigation } from "@/components/SwipeableNavigation";
import { NutritionGenerator } from "@/components/NutritionGenerator";
import { SavedMealPlans } from "@/components/SavedMealPlans";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDailyTracking } from "@/hooks/useDailyTracking";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

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
  const { profile } = useProfile();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todaysFoods, setTodaysFoods] = useState<FoodEntry[]>([]);
  const { data: dailyData, logWater } = useDailyTracking(selectedDate);
  
  const goals: MacroGoals = {
    calories: 2400, // Default values for now
    protein: 150,
    carbs: 240,
    fat: 80
  };

  // Fetch food logs for selected date
  useEffect(() => {
    const fetchFoodLogs = async () => {
      if (!dailyData?.user_id) return;
      
      try {
        const { data, error } = await supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', dailyData.user_id)
          .gte('logged_at', `${selectedDate}T00:00:00`)
          .lt('logged_at', `${selectedDate}T23:59:59`)
          .order('logged_at', { ascending: true });

        if (error) throw error;
        
        const formattedFoods = data?.map(food => ({
          id: food.id,
          name: food.food_name,
          calories: food.calories || 0,
          protein: food.protein_g || 0,
          carbs: food.carbs_g || 0,
          fat: food.fat_g || 0,
          quantity: food.quantity,
          unit: food.unit,
          meal: food.meal_type,
          time: new Date(food.logged_at).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        })) || [];
        
        setTodaysFoods(formattedFoods);
      } catch (error) {
        console.error('Error fetching food logs:', error);
      }
    };

    fetchFoodLogs();
  }, [selectedDate, dailyData?.user_id]);

  // Refresh data when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      // Refetch food logs when page comes back into focus
      if (dailyData?.user_id) {
        const fetchFoodLogs = async () => {
          try {
            const { data, error } = await supabase
              .from('food_logs')
              .select('*')
              .eq('user_id', dailyData.user_id)
              .gte('logged_at', `${selectedDate}T00:00:00`)
              .lt('logged_at', `${selectedDate}T23:59:59`)
              .order('logged_at', { ascending: true });

            if (error) throw error;
            
            const formattedFoods = data?.map(food => ({
              id: food.id,
              name: food.food_name,
              calories: food.calories || 0,
              protein: food.protein_g || 0,
              carbs: food.carbs_g || 0,
              fat: food.fat_g || 0,
              quantity: food.quantity,
              unit: food.unit,
              meal: food.meal_type,
              time: new Date(food.logged_at).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })
            })) || [];
            
            setTodaysFoods(formattedFoods);
          } catch (error) {
            console.error('Error fetching food logs:', error);
          }
        };

        fetchFoodLogs();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedDate, dailyData?.user_id]);

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

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleLogWater = async (amount: number) => {
    const result = await logWater(amount);
    if (result?.success) {
      toast({ title: "Water logged!", description: `Added ${amount}ml to your daily intake` });
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const dateLabel = isToday ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

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
        </div>

        <Tabs defaultValue="tracking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="saved">Saved Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="space-y-6 mt-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDateChange('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-muted-foreground font-medium">{dateLabel}</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDateChange('next')}
                disabled={selectedDate >= new Date().toISOString().split('T')[0]}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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
            <div className="grid grid-cols-4 gap-3">
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
                className="h-16 border-hydration/20 hover:bg-hydration/5"
                onClick={() => handleLogWater(250)}
              >
                <div className="flex flex-col items-center gap-1">
                  <Droplets className="h-5 w-5" />
                  <span className="text-sm">Water</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 border-primary/20 hover:bg-primary/5"
                onClick={() => toast({ title: "Scan Food", description: "Camera scanning coming soon! 📸" })}
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm">Scan</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 border-primary/20 hover:bg-primary/5"
                onClick={() => toast({ title: "Voice Log", description: "Voice logging coming soon! 🎤" })}
              >
                <div className="flex flex-col items-center gap-1">
                  <Mic className="h-5 w-5" />
                  <span className="text-sm">Voice</span>
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
          </TabsContent>

          <TabsContent value="generator" className="mt-6">
            <NutritionGenerator />
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <SavedMealPlans />
          </TabsContent>
        </Tabs>
      </div>
      <SwipeableNavigation />
    </div>
  );
};

export default Nutrition;