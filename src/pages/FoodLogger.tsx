import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
  servingUnit: string;
  barcode?: string;
}

interface LoggedFood extends FoodItem {
  quantity: number;
  meal: string;
  timestamp: Date;
}

const FoodLogger = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [isLogging, setIsLogging] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-food', {
        body: { query, page: 0 }
      });

      if (error) throw error;

      const foods = data.foods?.map((food: any) => ({
        id: food.foodId,
        name: food.label,
        brand: food.brand || 'Generic',
        calories: food.nutrients.calories,
        protein: food.nutrients.protein,
        carbs: food.nutrients.carbs,
        fat: food.nutrients.fat,
        fiber: food.nutrients.fiber,
        sugar: 0, // USDA doesn't always have sugar data
        sodium: food.nutrients.sodium,
        servingSize: "100",
        servingUnit: "g"
      })) || [];

      setSearchResults(foods);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast({
        title: "Search Error",
        description: "Failed to search foods. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const foodDatabase: FoodItem[] = [
    {
      id: "1",
      name: "Chicken Breast",
      brand: "Generic",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      servingSize: "100",
      servingUnit: "g"
    },
    {
      id: "2", 
      name: "Brown Rice",
      brand: "Generic",
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      sugar: 0.4,
      sodium: 5,
      servingSize: "100",
      servingUnit: "g"
    },
    {
      id: "3",
      name: "Whole Milk",
      brand: "Generic", 
      calories: 61,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.3,
      fiber: 0,
      sugar: 5.1,
      sodium: 44,
      servingSize: "100",
      servingUnit: "ml"
    },
    {
      id: "4",
      name: "Large Egg",
      brand: "Generic",
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0,
      sugar: 1.1,
      sodium: 124,
      servingSize: "1",
      servingUnit: "egg"
    },
    {
      id: "5",
      name: "Banana",
      brand: "Generic",
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12,
      sodium: 1,
      servingSize: "1",
      servingUnit: "medium"
    },
    {
      id: "6",
      name: "Oats",
      brand: "Quaker",
      calories: 389,
      protein: 16.9,
      carbs: 66,
      fat: 6.9,
      fiber: 10.6,
      sugar: 0,
      sodium: 2,
      servingSize: "100",
      servingUnit: "g"
    },
    {
      id: "7",
      name: "Greek Yogurt",
      brand: "Fage",
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4,
      fiber: 0,
      sugar: 3.6,
      sodium: 36,
      servingSize: "100",
      servingUnit: "g"
    },
    {
      id: "8",
      name: "Almonds",
      brand: "Generic",
      calories: 579,
      protein: 21,
      carbs: 22,
      fat: 50,
      fiber: 12,
      sugar: 4.4,
      sodium: 1,
      servingSize: "100",
      servingUnit: "g"
    },
    {
      id: "9",
      name: "Salmon Fillet",
      brand: "Generic",
      calories: 208,
      protein: 20,
      carbs: 0,
      fat: 13,
      fiber: 0,
      sugar: 0,
      sodium: 89,
      servingSize: "100",
      servingUnit: "g"
    },
    {
      id: "10",
      name: "Avocado",
      brand: "Generic",
      calories: 160,
      protein: 2,
      carbs: 9,
      fat: 15,
      fiber: 7,
      sugar: 0.7,
      sodium: 7,
      servingSize: "1",
      servingUnit: "medium"
    }
  ];

  // Use search results if available, otherwise fallback to local database
  const displayedFoods = searchResults.length > 0 ? searchResults : 
    foodDatabase.filter(food =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const calculateNutrition = (food: FoodItem, qty: number) => {
    return {
      calories: Math.round(food.calories * qty),
      protein: Math.round(food.protein * qty * 10) / 10,
      carbs: Math.round(food.carbs * qty * 10) / 10,
      fat: Math.round(food.fat * qty * 10) / 10,
      fiber: Math.round(food.fiber * qty * 10) / 10,
      sugar: Math.round(food.sugar * qty * 10) / 10,
      sodium: Math.round(food.sodium * qty)
    };
  };

  const logFood = async () => {
    if (!selectedFood || !user) return;
    
    setIsLogging(true);
    try {
      const nutrition = calculateNutrition(selectedFood, quantity);
      
      // Save to food_logs table
      const { error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          food_name: selectedFood.name,
          brand: selectedFood.brand,
          quantity: quantity,
          unit: selectedFood.servingUnit,
          calories: nutrition.calories,
          protein_g: nutrition.protein,
          carbs_g: nutrition.carbs,
          fat_g: nutrition.fat,
          fiber_g: nutrition.fiber,
          sugar_g: nutrition.sugar,
          sodium_mg: nutrition.sodium,
          meal_type: selectedMeal,
          logged_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Food Logged!",
        description: `${quantity}x ${selectedFood.servingSize}${selectedFood.servingUnit} ${selectedFood.name} added to ${selectedMeal}`
      });

      setSelectedFood(null);
      setQuantity(1);
      navigate("/nutrition");
    } catch (error) {
      console.error('Error logging food:', error);
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/nutrition")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Add Food</h1>
          <div className="w-10" />
        </div>

        {/* Meal Selection */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {["breakfast", "lunch", "dinner", "snacks"].map((meal) => (
                <Button
                  key={meal}
                  variant={selectedMeal === meal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMeal(meal)}
                  className="capitalize"
                >
                  {meal}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Food Preview */}
        {selectedFood && (
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                {selectedFood.name}
                <Badge variant="secondary">{selectedFood.brand}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(0.1, quantity - 0.1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 min-w-24 justify-center">
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-16 h-8 text-center"
                      step="0.1"
                      min="0.1"
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedFood.servingUnit}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 0.1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Nutrition Preview */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Calories:</span>
                  <span className="font-medium">{calculateNutrition(selectedFood, quantity).calories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span className="font-medium">{calculateNutrition(selectedFood, quantity).protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs:</span>
                  <span className="font-medium">{calculateNutrition(selectedFood, quantity).carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat:</span>
                  <span className="font-medium">{calculateNutrition(selectedFood, quantity).fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber:</span>
                  <span className="font-medium">{calculateNutrition(selectedFood, quantity).fiber}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Sodium:</span>
                  <span className="font-medium">{calculateNutrition(selectedFood, quantity).sodium}mg</span>
                </div>
              </div>

              <Button onClick={logFood} className="w-full" disabled={isLogging}>
                {isLogging ? "Logging..." : `Add to ${selectedMeal}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Food Search */}
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 3) {
                    searchFoods(e.target.value);
                  } else if (e.target.value.length === 0) {
                    setSearchResults([]);
                  }
                }}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                Searching USDA food database...
              </div>
            )}
            {displayedFoods.map((food) => (
              <div
                key={food.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFood?.id === food.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border/30 hover:bg-accent/5"
                }`}
                onClick={() => setSelectedFood(food)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{food.name}</h3>
                    {food.brand && (
                      <p className="text-sm text-muted-foreground">{food.brand}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {food.servingSize}{food.servingUnit} - {food.calories} cal
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{food.calories} cal</div>
                    <div className="text-muted-foreground">
                      P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {displayedFoods.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No foods found for "{searchQuery}"</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Custom Food
                </Button>
              </div>
            )}
            
            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Type at least 3 characters to search USDA database
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodLogger;