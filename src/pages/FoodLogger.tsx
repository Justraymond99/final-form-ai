import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, Minus, Star, Clock, Sparkles, X, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useFavoriteFoods } from "@/hooks/useFavoriteFoods";
import { useProfile } from "@/hooks/useProfile";

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
  const { profile } = useProfile();
  const { searches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoriteFoods();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [isLogging, setIsLogging] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (user && selectedMeal) {
      loadAISuggestions();
    }
  }, [selectedMeal, user]);

  const loadAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-food-suggestions', {
        body: { 
          userProfile: profile,
          mealType: selectedMeal 
        }
      });

      if (error) throw error;

      setAiSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Add to recent searches
    if (query.trim()) {
      addRecentSearch(query.trim());
    }

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
        sugar: 0,
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

  const handleFavoriteToggle = async (food: FoodItem) => {
    if (isFavorite(food.name, food.brand)) {
      const fav = favorites.find(f => f.food_name === food.name && f.brand === food.brand);
      if (fav) {
        await removeFavorite(fav.id);
      }
    } else {
      await addFavorite({
        food_name: food.name,
        brand: food.brand || null,
        food_id: food.id,
        calories: food.calories,
        protein_g: food.protein,
        carbs_g: food.carbs,
        fat_g: food.fat,
        fiber_g: food.fiber,
        sodium_mg: food.sodium,
        image_url: null,
      });
    }
  };

  const selectFoodFromSuggestion = async (suggestionName: string) => {
    // Search for the suggested food
    setSearchQuery(suggestionName);
    await searchFoods(suggestionName);
  };

  const displayedFoods = searchResults;

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
            <div className="grid grid-cols-4 gap-2 mb-3">
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
            <BarcodeScanner 
              onFoodFound={(foodData) => {
                setSelectedFood({
                  id: foodData.barcode,
                  name: foodData.food_name || foodData.name,
                  brand: foodData.brand,
                  calories: foodData.calories || 0,
                  protein: foodData.protein_g || 0,
                  carbs: foodData.carbs_g || 0,
                  fat: foodData.fat_g || 0,
                  fiber: foodData.fiber_g || 0,
                  sugar: foodData.sugar_g || 0,
                  sodium: foodData.sodium_mg || 0,
                  servingSize: "1",
                  servingUnit: "serving",
                  barcode: foodData.barcode
                });
              }}
            />
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

        {/* AI Suggestions */}
        {!selectedFood && aiSuggestions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Suggestions for {selectedMeal}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadAISuggestions}
                  disabled={loadingAI}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingAI ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading AI suggestions...
                </div>
              ) : (
                aiSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => selectFoodFromSuggestion(suggestion.name)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{suggestion.name}</h4>
                        {suggestion.brand && (
                          <p className="text-xs text-muted-foreground">{suggestion.brand}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                      </div>
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Favorites */}
        {!selectedFood && favorites.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Your Favorites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {favorites.slice(0, 6).map((fav) => {
                  const favFood: FoodItem = {
                    id: fav.id,
                    name: fav.food_name,
                    brand: fav.brand || undefined,
                    calories: Number(fav.calories) || 0,
                    protein: Number(fav.protein_g) || 0,
                    carbs: Number(fav.carbs_g) || 0,
                    fat: Number(fav.fat_g) || 0,
                    fiber: Number(fav.fiber_g) || 0,
                    sugar: 0,
                    sodium: Number(fav.sodium_mg) || 0,
                    servingSize: "100",
                    servingUnit: "g"
                  };
                  
                  return (
                    <div
                      key={fav.id}
                      className="p-2 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors"
                      onClick={() => setSelectedFood(favFood)}
                    >
                      <h4 className="font-medium text-sm truncate">{fav.food_name}</h4>
                      {fav.brand && (
                        <p className="text-xs text-muted-foreground truncate">{fav.brand}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{fav.calories} cal</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Searches */}
        {!selectedFood && searches.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {searches.slice(0, 8).map((search, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      setSearchQuery(search);
                      searchFoods(search);
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Food Search */}
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search foods (brands, fast food, generic)..."
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
              <div className="text-center py-4 text-muted-foreground text-sm">
                Searching food databases (USDA & branded items)...
              </div>
            )}
            {displayedFoods.map((food) => (
              <div
                key={food.id}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedFood?.id === food.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border/30 hover:bg-accent/5"
                }`}
              >
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{food.name}</h3>
                    {food.brand && (
                      <p className="text-sm text-muted-foreground">{food.brand}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {food.servingSize}{food.servingUnit} - {food.calories} cal
                    </p>
                  </div>
                  <div className="text-right text-sm flex items-start gap-2">
                    <div>
                      <div className="font-medium">{food.calories} cal</div>
                      <div className="text-muted-foreground">
                        P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(food);
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          isFavorite(food.name, food.brand) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
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
                Type at least 3 characters to search food databases
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodLogger;