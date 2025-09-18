import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Play, 
  Clock, 
  Users, 
  ChefHat, 
  Dumbbell, 
  BookOpen, 
  Video,
  Filter,
  Star,
  Download
} from 'lucide-react';

interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  muscleGroups: string[];
  thumbnailUrl: string;
  videoUrl: string;
  instructor: string;
  views: number;
  rating: number;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  dietaryTags: string[];
  calories: number;
  protein: number;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  rating: number;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  author: string;
  publishDate: string;
  tags: string[];
  imageUrl: string;
  content: string;
  rating: number;
}

export const ContentLibrary = () => {
  const [activeTab, setActiveTab] = useState('exercises');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample data (in real app, this would come from API/database)
  const [exercises] = useState<ExerciseVideo[]>([
    {
      id: '1',
      title: 'Perfect Push-Up Form',
      description: 'Master the fundamental push-up with proper form and variations.',
      duration: '5:30',
      difficulty: 'Beginner',
      category: 'Strength',
      muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
      thumbnailUrl: '',
      videoUrl: '',
      instructor: 'Sarah Johnson',
      views: 15420,
      rating: 4.8
    },
    {
      id: '2',
      title: 'HIIT Cardio Blast',
      description: '20-minute high-intensity workout to boost your metabolism.',
      duration: '20:15',
      difficulty: 'Intermediate',
      category: 'Cardio',
      muscleGroups: ['Full Body'],
      thumbnailUrl: '',
      videoUrl: '',
      instructor: 'Mike Chen',
      views: 23840,
      rating: 4.9
    },
    {
      id: '3',
      title: 'Yoga Flow for Flexibility',
      description: 'Gentle yoga sequence to improve flexibility and mobility.',
      duration: '15:00',
      difficulty: 'Beginner',
      category: 'Flexibility',
      muscleGroups: ['Full Body'],
      thumbnailUrl: '',
      videoUrl: '',
      instructor: 'Emma Wilson',
      views: 18960,
      rating: 4.7
    }
  ]);

  const [recipes] = useState<Recipe[]>([
    {
      id: '1',
      title: 'High-Protein Chicken Bowl',
      description: 'Delicious and nutritious bowl packed with lean protein and vegetables.',
      prepTime: 15,
      cookTime: 25,
      servings: 2,
      difficulty: 'Easy',
      cuisine: 'Mediterranean',
      dietaryTags: ['High Protein', 'Gluten Free', 'Low Carb'],
      calories: 485,
      protein: 42,
      imageUrl: '',
      ingredients: [
        '300g chicken breast',
        '1 cup quinoa',
        '200g mixed vegetables',
        '2 tbsp olive oil',
        'Herbs and spices'
      ],
      instructions: [
        'Season and cook chicken breast',
        'Prepare quinoa according to package instructions',
        'Sauté vegetables with olive oil',
        'Assemble bowl and serve'
      ],
      rating: 4.6
    },
    {
      id: '2',
      title: 'Post-Workout Smoothie',
      description: 'Perfect blend of protein and carbs for muscle recovery.',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      difficulty: 'Easy',
      cuisine: 'International',
      dietaryTags: ['High Protein', 'Vegan Option', 'Quick'],
      calories: 320,
      protein: 28,
      imageUrl: '',
      ingredients: [
        '1 banana',
        '1 cup plant milk',
        '1 scoop protein powder',
        '1 tbsp peanut butter',
        'Ice cubes'
      ],
      instructions: [
        'Add all ingredients to blender',
        'Blend until smooth',
        'Serve immediately'
      ],
      rating: 4.8
    }
  ]);

  const [articles] = useState<Article[]>([
    {
      id: '1',
      title: 'The Science of Muscle Building',
      excerpt: 'Understanding the biological processes behind muscle growth and how to optimize your training.',
      category: 'Fitness Science',
      readTime: 8,
      author: 'Dr. Alex Martinez',
      publishDate: '2024-01-15',
      tags: ['Muscle Building', 'Science', 'Training'],
      imageUrl: '',
      content: 'Full article content would go here...',
      rating: 4.7
    },
    {
      id: '2',
      title: 'Meal Timing for Athletes',
      excerpt: 'When and what to eat before, during, and after workouts for optimal performance.',
      category: 'Nutrition',
      readTime: 6,
      author: 'Jennifer Liu',
      publishDate: '2024-01-12',
      tags: ['Nutrition', 'Performance', 'Timing'],
      imageUrl: '',
      content: 'Full article content would go here...',
      rating: 4.5
    }
  ]);

  const filteredContent = (content: any[], type: string) => {
    return content.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        matchesCategory = item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                         item.cuisine?.toLowerCase() === selectedCategory.toLowerCase();
      }
      
      return matchesSearch && matchesCategory;
    });
  };

  const renderExerciseCard = (exercise: ExerciseVideo) => (
    <Card key={exercise.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <Play className="w-12 h-12 text-muted-foreground" />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">{exercise.title}</h3>
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <Star className="w-3 h-3 fill-yellow-600" />
            {exercise.rating}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {exercise.description}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">{exercise.difficulty}</Badge>
          <Badge variant="outline" className="text-xs">{exercise.category}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {exercise.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {exercise.views.toLocaleString()}
          </div>
        </div>
        <div className="space-y-2">
          <Button size="sm" className="w-full">
            <Play className="w-3 h-3 mr-1" />
            Watch Now
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Download className="w-3 h-3 mr-1" />
            Save for Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderRecipeCard = (recipe: Recipe) => (
    <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <ChefHat className="w-12 h-12 text-muted-foreground" />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">{recipe.title}</h3>
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <Star className="w-3 h-3 fill-yellow-600" />
            {recipe.rating}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {recipe.description}
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold">{recipe.calories}</div>
            <div className="text-muted-foreground">Calories</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold">{recipe.protein}g</div>
            <div className="text-muted-foreground">Protein</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold">{recipe.prepTime + recipe.cookTime}m</div>
            <div className="text-muted-foreground">Total</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.dietaryTags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full">View Recipe</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>{recipe.title}</DialogTitle>
                <DialogDescription>{recipe.description}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{recipe.prepTime}min</div>
                      <div className="text-muted-foreground">Prep</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{recipe.cookTime}min</div>
                      <div className="text-muted-foreground">Cook</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{recipe.servings}</div>
                      <div className="text-muted-foreground">Servings</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{recipe.difficulty}</div>
                      <div className="text-muted-foreground">Level</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Ingredients</h4>
                    <ul className="space-y-1 text-sm">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Instructions</h4>
                    <ol className="space-y-2 text-sm">
                      {recipe.instructions.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="w-full">
            Add to Meal Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderArticleCard = (article: Article) => (
    <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">{article.category}</Badge>
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <Star className="w-3 h-3 fill-yellow-600" />
            {article.rating}
          </div>
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>By {article.author}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTime} min read
          </div>
        </div>
        <Button size="sm" className="w-full">Read Article</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Library</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search exercises, recipes, articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Exercise Videos
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            Healthy Recipes
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent(exercises, 'exercise').map(renderExerciseCard)}
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent(recipes, 'recipe').map(renderRecipeCard)}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent(articles, 'article').map(renderArticleCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};