import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { 
  BookOpen, 
  Utensils, 
  Clock, 
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

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  readTime: number;
  tags: string[];
  author: string;
  publishedAt: string;
}

export const ContentLibrary = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<Recipe | Article | null>(null);

  useEffect(() => {
    loadInitialContent();
  }, []);

  const loadInitialContent = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRecipes(),
        loadArticles()
      ]);
    } catch (error) {
      console.error('Error loading initial content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async (category?: string, searchTerm?: string) => {
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
    }
  };

  const loadArticles = async (topic?: string, category?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-fitness-articles', {
        body: { 
          topic,
          category,
          count: 8 
        }
      });

      if (error) throw error;
      setArticles(data.articles || []);
      if (!topic && !category) {
        toast({
          title: "Articles Generated! 📚",
          description: `Generated ${data.articles?.length || 0} fresh fitness articles.`,
        });
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: "Failed to Generate Articles",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    if (activeTab === 'recipes') {
      loadRecipes(undefined, searchTerm);
    } else {
      loadArticles(searchTerm);
    }
  };

  const refreshContent = () => {
    if (activeTab === 'recipes') {
      loadRecipes();
    } else {
      loadArticles();
    }
  };

  const recipeCategories = ['Chicken', 'Beef', 'Vegetarian', 'Seafood', 'Dessert', 'Breakfast'];
  const articleCategories = ['Nutrition Tips', 'Workout Guides', 'Recovery & Rest', 'Mental Health'];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Content Library
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover recipes and fitness articles powered by TheMealDB & AI
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder={activeTab === 'recipes' ? 'Search recipes...' : 'Search topics...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={refreshContent} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recipes">
            <Utensils className="w-4 h-4 mr-2" />
            Recipes
          </TabsTrigger>
          <TabsTrigger value="articles">
            <BookOpen className="w-4 h-4 mr-2" />
            Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="mt-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedContent(recipe)}>
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-background/80">
                    {recipe.category}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />
                      {recipe.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {recipe.ingredients.length} ingredients
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {recipe.calories && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <div className="font-bold text-primary">{recipe.calories}</div>
                        <div className="text-muted-foreground">Cal</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-600">{recipe.protein}g</div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-600">{recipe.carbs}g</div>
                        <div className="text-muted-foreground">Carbs</div>
                      </div>
                      <div>
                        <div className="font-bold text-orange-600">{recipe.fat}g</div>
                        <div className="text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="mt-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {articleCategories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => loadArticles(undefined, category)}
                disabled={loading}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedContent(article)}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {article.readTime} min
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      by {article.author}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedContent && 'ingredients' in selectedContent ? (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  {selectedContent.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedContent.category} • {selectedContent.area}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <img 
                    src={selectedContent.image} 
                    alt={selectedContent.title}
                    className="w-full rounded-lg"
                  />
                  
                  {selectedContent.calories && (
                    <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedContent.calories}</div>
                        <div className="text-sm text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedContent.protein}g</div>
                        <div className="text-sm text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedContent.carbs}g</div>
                        <div className="text-sm text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedContent.fat}g</div>
                        <div className="text-sm text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <ScrollArea className="h-40 mb-4">
                    <ul className="space-y-1">
                      {selectedContent.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm">
                          {ingredient.measure} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                  
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <ScrollArea className="h-60">
                    <p className="text-sm whitespace-pre-line">{selectedContent.instructions}</p>
                  </ScrollArea>
                </div>
              </div>
            </div>
          ) : selectedContent ? (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {selectedContent.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <Badge>{selectedContent.category}</Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedContent.readTime} min read
                  </span>
                  <span>by {selectedContent.author}</span>
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="mt-6 max-h-96">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-line">{selectedContent.content}</div>
                </div>
              </ScrollArea>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedContent.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-lg">
              {activeTab === 'recipes' ? 'Fetching delicious recipes...' : 'Generating fresh articles...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};