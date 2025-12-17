import { useState } from "react";
import { Search, ChefHat, Clock, Users, Flame, Plus, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatLabel } from "@/lib/utils";

const Recipes = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // New recipe form
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: '',
    instructions: '',
    prep_time_minutes: '',
    cook_time_minutes: '',
    servings: '4',
    calories_per_serving: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    dietary_tags: [] as string[],
    difficulty: 'medium',
  });

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`is_public.eq.true,user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createRecipeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const ingredients = newRecipe.ingredients
        .split('\n')
        .filter(line => line.trim())
        .map(line => ({ text: line.trim() }));

      const { error } = await supabase.from('recipes').insert({
        user_id: user.id,
        name: newRecipe.name.trim(),
        description: newRecipe.description.trim() || null,
        ingredients,
        instructions: newRecipe.instructions.trim(),
        prep_time_minutes: newRecipe.prep_time_minutes ? parseInt(newRecipe.prep_time_minutes) : null,
        cook_time_minutes: newRecipe.cook_time_minutes ? parseInt(newRecipe.cook_time_minutes) : null,
        servings: parseInt(newRecipe.servings) || 4,
        calories_per_serving: newRecipe.calories_per_serving ? parseFloat(newRecipe.calories_per_serving) : null,
        protein_g: newRecipe.protein_g ? parseFloat(newRecipe.protein_g) : null,
        carbs_g: newRecipe.carbs_g ? parseFloat(newRecipe.carbs_g) : null,
        fat_g: newRecipe.fat_g ? parseFloat(newRecipe.fat_g) : null,
        dietary_tags: newRecipe.dietary_tags,
        difficulty: newRecipe.difficulty,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({ title: "Recipe created successfully!" });
      setShowCreateDialog(false);
      setNewRecipe({
        name: '', description: '', ingredients: '', instructions: '',
        prep_time_minutes: '', cook_time_minutes: '', servings: '4',
        calories_per_serving: '', protein_g: '', carbs_g: '', fat_g: '',
        dietary_tags: [], difficulty: 'medium',
      });
    },
    onError: (error) => {
      toast({ title: "Failed to create recipe", description: error.message, variant: "destructive" });
    },
  });

  const filteredRecipes = recipes?.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDietary = dietaryFilter === 'all' || 
                          recipe.dietary_tags?.includes(dietaryFilter);
    
    return matchesSearch && matchesDietary;
  });

  const toggleDietaryTag = (tag: string) => {
    setNewRecipe(prev => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter(t => t !== tag)
        : [...prev.dietary_tags, tag]
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Recipe Database</h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Recipe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Recipe Name*</Label>
                  <Input
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                    placeholder="Grilled Chicken Salad"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                    placeholder="A healthy and delicious meal..."
                  />
                </div>
                <div>
                  <Label>Ingredients* (one per line)</Label>
                  <Textarea
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                    placeholder="2 chicken breasts&#10;4 cups mixed greens&#10;1 tbsp olive oil"
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <Label>Instructions*</Label>
                  <Textarea
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                    placeholder="1. Preheat grill...&#10;2. Season chicken...&#10;3. Assemble salad..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      value={newRecipe.prep_time_minutes}
                      onChange={(e) => setNewRecipe({ ...newRecipe, prep_time_minutes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cook Time (min)</Label>
                    <Input
                      type="number"
                      value={newRecipe.cook_time_minutes}
                      onChange={(e) => setNewRecipe({ ...newRecipe, cook_time_minutes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Calories</Label>
                    <Input
                      type="number"
                      value={newRecipe.calories_per_serving}
                      onChange={(e) => setNewRecipe({ ...newRecipe, calories_per_serving: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      value={newRecipe.protein_g}
                      onChange={(e) => setNewRecipe({ ...newRecipe, protein_g: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      value={newRecipe.carbs_g}
                      onChange={(e) => setNewRecipe({ ...newRecipe, carbs_g: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input
                      type="number"
                      value={newRecipe.fat_g}
                      onChange={(e) => setNewRecipe({ ...newRecipe, fat_g: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={newRecipe.difficulty} onValueChange={(v: any) => setNewRecipe({ ...newRecipe, difficulty: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dietary Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein', 'keto', 'paleo'].map(tag => (
                      <Badge
                        key={tag}
                        variant={newRecipe.dietary_tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleDietaryTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => createRecipeMutation.mutate()}
                  disabled={!newRecipe.name || !newRecipe.ingredients || !newRecipe.instructions || createRecipeMutation.isPending}
                  className="w-full"
                >
                  {createRecipeMutation.isPending ? "Creating..." : "Create Recipe"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Dietary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipes</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                  <SelectItem value="low-carb">Low-Carb</SelectItem>
                  <SelectItem value="high-protein">High-Protein</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : filteredRecipes && filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    {recipe.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {recipe.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recipe.dietary_tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {recipe.servings} servings
                    </span>
                  </div>
                  {recipe.calories_per_serving && (
                    <div className="flex items-center gap-1 text-sm">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {recipe.calories_per_serving} cal/serving
                    </div>
                  )}
                  <Badge variant="outline">
                    {formatLabel(recipe.difficulty)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No recipes found</p>
              <p className="text-muted-foreground">
                {searchTerm || dietaryFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "Add your first recipe to get started!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedRecipe.description && (
                  <p className="text-muted-foreground">{selectedRecipe.description}</p>
                )}

                <div className="flex gap-4 flex-wrap">
                  {selectedRecipe.prep_time_minutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Prep: {selectedRecipe.prep_time_minutes} min</span>
                    </div>
                  )}
                  {selectedRecipe.cook_time_minutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Cook: {selectedRecipe.cook_time_minutes} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{selectedRecipe.servings} servings</span>
                  </div>
                </div>

                {selectedRecipe.dietary_tags && selectedRecipe.dietary_tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Dietary Information</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.dietary_tags.map((tag: string) => (
                        <Badge key={tag} className="capitalize">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedRecipe.calories_per_serving || selectedRecipe.protein_g || selectedRecipe.carbs_g || selectedRecipe.fat_g) && (
                  <div>
                    <h3 className="font-semibold mb-2">Nutrition (per serving)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedRecipe.calories_per_serving && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{selectedRecipe.calories_per_serving}</div>
                          <div className="text-sm text-muted-foreground">Calories</div>
                        </div>
                      )}
                      {selectedRecipe.protein_g && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{selectedRecipe.protein_g}g</div>
                          <div className="text-sm text-muted-foreground">Protein</div>
                        </div>
                      )}
                      {selectedRecipe.carbs_g && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{selectedRecipe.carbs_g}g</div>
                          <div className="text-sm text-muted-foreground">Carbs</div>
                        </div>
                      )}
                      {selectedRecipe.fat_g && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{selectedRecipe.fat_g}g</div>
                          <div className="text-sm text-muted-foreground">Fat</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Ingredients</h3>
                  <ul className="space-y-1">
                    {selectedRecipe.ingredients.map((ingredient: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{ingredient.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {selectedRecipe.instructions}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default Recipes;
