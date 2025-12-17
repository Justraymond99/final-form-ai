import { Trophy, Award, Star, Target, Flame, Zap, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { useAchievements } from "@/hooks/useAchievements";

const Awards = () => {
  const { achievements, getCompletedAchievements, getRecentAchievements, loading } = useAchievements();

  const completedAchievements = getCompletedAchievements();
  const recentAchievements = getRecentAchievements();

  const categories = [
    {
      id: "first_time",
      name: "First Time",
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: "workout_streak",
      name: "Workouts", 
      icon: Trophy,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: "nutrition_streak",
      name: "Nutrition",
      icon: Target,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      id: "hydration",
      name: "Hydration",
      icon: Flame,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ];

  const getAchievementsByCategory = (categoryId: string) => {
    return achievements.filter(achievement => {
      if (categoryId === "first_time") {
        return ["first_workout", "first_food_log", "first_water_log", "first_full_day"].includes(achievement.achievement_type);
      }
      return achievement.achievement_type === categoryId;
    });
  };

  const getIconEmoji = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'star': '⭐',
      'dumbbell': '💪',
      'flame': '🔥',
      'trophy': '🏆',
      'target': '🎯',
      'droplets': '💧',
      'utensils': '🍽️',
      'calendar': '📅',
      'waves': '🌊',
      'trending-up': '📈',
      'award': '🏅',
      'zap': '⚡',
      'crown': '👑'
    };
    return iconMap[iconName] || '🎖️';
  };

  const stats = {
    totalEarned: completedAchievements.length,
    totalAvailable: achievements.length,
    recentEarned: recentAchievements.length,
    points: completedAchievements.length * 100 // 100 points per achievement
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "text-gray-500 border-gray-500/30";
      case "Rare": return "text-blue-500 border-blue-500/30";
      case "Epic": return "text-purple-500 border-purple-500/30";
      case "Legendary": return "text-orange-500 border-orange-500/30";
      default: return "text-gray-500 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Awards
          </h1>
          <p className="text-muted-foreground">Celebrate your achievements</p>
        </div>

        {/* Stats Overview */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalEarned}</div>
                <div className="text-sm text-muted-foreground">Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{stats.points}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Achievement Progress</span>
                <span className="text-primary">{stats.totalEarned} / {stats.totalAvailable}</span>
              </div>
              <Progress value={(stats.totalEarned / stats.totalAvailable) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        <Tabs defaultValue="first_time" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto bg-card/50 border border-border/50 rounded-lg p-1">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex flex-col gap-1 py-3 px-2 rounded-md data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <IconComponent className={`h-4 w-4 ${category.color}`} />
                  <span className="text-xs">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground">Loading achievements...</div>
              ) : (
                getAchievementsByCategory(category.id).map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`
                      border-border/50 backdrop-blur-sm transition-all duration-300
                      ${achievement.completed 
                        ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/30' 
                        : 'bg-card/50 hover:bg-accent/5'
                      }
                    `}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`
                          text-3xl p-2 rounded-lg
                          ${achievement.completed ? 'bg-primary/10' : 'bg-muted/50 grayscale'}
                        `}>
                          {getIconEmoji(achievement.icon)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-semibold ${achievement.completed ? 'text-primary' : ''}`}>
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs border-primary/30 text-primary"
                            >
                              {achievement.completed ? 'Earned' : 'In Progress'}
                            </Badge>
                          </div>
                          
                          {achievement.completed ? (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-primary" />
                              <span className="text-sm text-primary font-medium">
                                Earned {achievement.completed_at ? new Date(achievement.completed_at).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {achievement.current_value} / {achievement.target_value}
                                </span>
                              </div>
                              <Progress 
                                value={(achievement.current_value / achievement.target_value) * 100} 
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Recent Achievements */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No achievements earned yet!</p>
                <p className="text-xs mt-1">Complete activities to unlock your first achievements</p>
              </div>
            ) : (
              recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20"
                >
                  <div className="text-2xl">{getIconEmoji(achievement.icon)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-primary">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.completed_at ? new Date(achievement.completed_at).toLocaleDateString() : 'Recently earned'}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    Earned
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Awards;