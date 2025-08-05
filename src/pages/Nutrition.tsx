import { Camera, Plus, Target, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Nutrition = () => {
  const macros = [
    { name: "Protein", current: 85, target: 120, color: "text-primary", bgColor: "bg-primary" },
    { name: "Carbs", current: 145, target: 200, color: "text-accent", bgColor: "bg-accent" },
    { name: "Fat", current: 45, target: 65, color: "text-secondary", bgColor: "bg-secondary" },
  ];

  const recentMeals = [
    { id: 1, name: "Greek Yogurt Bowl", calories: 320, time: "8:30 AM", type: "Breakfast" },
    { id: 2, name: "Chicken Salad", calories: 450, time: "12:45 PM", type: "Lunch" },
    { id: 3, name: "Protein Shake", calories: 180, time: "3:20 PM", type: "Snack" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Nutrition
          </h1>
          <p className="text-muted-foreground">Fuel your performance</p>
        </div>

        {/* Daily Calories */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--border))"
                    strokeWidth="8"
                    fill="transparent"
                    className="opacity-20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#calorieGradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="75.36"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">1,245</span>
                  <span className="text-sm text-muted-foreground">/ 1,800 cal</span>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Food
                </Button>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macros */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Macros Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {macros.map((macro) => (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{macro.name}</span>
                  <span className={`text-sm ${macro.color}`}>
                    {macro.current}g / {macro.target}g
                  </span>
                </div>
                <Progress 
                  value={(macro.current / macro.target) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Meals */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5 text-accent" />
              Today's Meals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{meal.name}</h3>
                  <p className="text-sm text-muted-foreground">{meal.time}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    {meal.type}
                  </Badge>
                  <p className="text-sm font-medium mt-1">{meal.calories} cal</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Nutrition;