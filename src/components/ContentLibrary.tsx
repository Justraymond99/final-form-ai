import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { 
  Utensils, 
  Users, 
  Search,
  Sparkles,
  RefreshCw,
  ChefHat
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Recipe {
  id: string;
  title: string;
  category: string;
  area: string;
  instructions: string;
  image: string;
  ingredients: Array<{
    name: string;
    measure: string;
  }>;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export const ContentLibrary = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async (category?: string, searchTerm?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-recipes', {
        body: { 
          category: category || 'Chicken',
          searchTerm,
          count: 12 
        }
      });

      if (error) throw error;
      setRecipes(data.recipes || []);
      if (!searchTerm && !category) {
        toast({
          title: "Recipes Loaded! 🍳",
          description: `Found ${data.recipes?.length || 0} delicious recipes.`,
        });
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: "Failed to Load Recipes",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadRecipes(undefined, searchTerm);
  };

  const recipeCategories = ['Chicken', 'Beef', 'Vegetarian', 'Seafood', 'Dessert', 'Breakfast'];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Recipe Library
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover healthy and delicious recipes
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={() => loadRecipes()} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {recipeCategories.map((category) => (
          <Button
            key={category}
            variant="outline"
            size="sm"
            onClick={() => loadRecipes(category)}
            disabled={loading}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-background/80">
                {recipe.category}
              </Badge>
            </div>
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">{recipe.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ChefHat className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{recipe.area}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  {recipe.ingredients.length} ingredients
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {recipe.calories && (
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="overflow-hidden">
                    <div className="font-bold text-primary truncate">{recipe.calories}</div>
                    <div className="text-muted-foreground">Cal</div>
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-green-600 truncate">{recipe.protein}g</div>
                    <div className="text-muted-foreground">Protein</div>
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-blue-600 truncate">{recipe.carbs}g</div>
                    <div className="text-muted-foreground">Carbs</div>
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-orange-600 truncate">{recipe.fat}g</div>
                    <div className="text-muted-foreground">Fat</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  {selectedRecipe.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedRecipe.category} • {selectedRecipe.area}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title}
                    className="w-full rounded-lg"
                  />
                  
                  {selectedRecipe.calories && (
                    <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedRecipe.calories}</div>
                        <div className="text-sm text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedRecipe.protein}g</div>
                        <div className="text-sm text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedRecipe.carbs}g</div>
                        <div className="text-sm text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedRecipe.fat}g</div>
                        <div className="text-sm text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <ScrollArea className="h-40 mb-4">
                    <ul className="space-y-1">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm">
                          {ingredient.measure} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                  
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <ScrollArea className="h-60">
                    <p className="text-sm whitespace-pre-line">{selectedRecipe.instructions}</p>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-lg">Fetching delicious recipes...</span>
          </div>
        </div>
      )}
    </div>
  );
};