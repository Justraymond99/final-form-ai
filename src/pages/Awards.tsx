import { Trophy, Award, Star, Target, Flame, Zap, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";

const Awards = () => {
  const categories = [
    {
      id: "fitness",
      name: "Fitness",
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: "nutrition",
      name: "Nutrition", 
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: "consistency",
      name: "Consistency",
      icon: Flame,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      id: "milestones",
      name: "Milestones",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ];

  const achievements = {
    fitness: [
      { 
        id: 1, 
        title: "First Workout", 
        description: "Complete your first workout", 
        icon: "💪", 
        earned: true, 
        earnedDate: "Nov 15, 2024",
        rarity: "Common"
      },
      { 
        id: 2, 
        title: "Strength Warrior", 
        description: "Bench press your body weight", 
        icon: "🏋️", 
        earned: true, 
        earnedDate: "Dec 2, 2024",
        rarity: "Rare"
      },
      { 
        id: 3, 
        title: "Cardio King", 
        description: "Complete 30 minutes of cardio", 
        icon: "❤️", 
        earned: false, 
        progress: 22, 
        target: 30,
        rarity: "Common"
      },
      { 
        id: 4, 
        title: "Iron Legend", 
        description: "Deadlift 2x your body weight", 
        icon: "⚡", 
        earned: false, 
        progress: 285, 
        target: 340,
        rarity: "Legendary"
      }
    ],
    nutrition: [
      { 
        id: 5, 
        title: "Macro Master", 
        description: "Hit all macros for 7 days", 
        icon: "🎯", 
        earned: true, 
        earnedDate: "Nov 28, 2024",
        rarity: "Rare"
      },
      { 
        id: 6, 
        title: "Hydration Hero", 
        description: "Drink 8 glasses of water daily for a week", 
        icon: "💧", 
        earned: false, 
        progress: 5, 
        target: 7,
        rarity: "Common"
      },
      { 
        id: 7, 
        title: "Protein Power", 
        description: "Hit protein goals for 30 days", 
        icon: "🥩", 
        earned: false, 
        progress: 18, 
        target: 30,
        rarity: "Epic"
      }
    ],
    consistency: [
      { 
        id: 8, 
        title: "Week Warrior", 
        description: "7-day workout streak", 
        icon: "🔥", 
        earned: true, 
        earnedDate: "Dec 5, 2024",
        rarity: "Common"
      },
      { 
        id: 9, 
        title: "Monthly Master", 
        description: "30-day workout streak", 
        icon: "📅", 
        earned: false, 
        progress: 7, 
        target: 30,
        rarity: "Epic"
      },
      { 
        id: 10, 
        title: "Early Bird", 
        description: "Complete 10 morning workouts", 
        icon: "🌅", 
        earned: false, 
        progress: 3, 
        target: 10,
        rarity: "Rare"
      }
    ],
    milestones: [
      { 
        id: 11, 
        title: "Century Club", 
        description: "Complete 100 workouts", 
        icon: "💯", 
        earned: false, 
        progress: 47, 
        target: 100,
        rarity: "Epic"
      },
      { 
        id: 12, 
        title: "Year One", 
        description: "One year of fitness tracking", 
        icon: "🎂", 
        earned: false, 
        progress: 2, 
        target: 12,
        rarity: "Legendary"
      }
    ]
  };

  const stats = {
    totalEarned: Object.values(achievements).flat().filter(a => a.earned).length,
    totalAvailable: Object.values(achievements).flat().length,
    recentEarned: 3,
    points: 1250
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
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
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
        <Tabs defaultValue="fitness" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary/10"
                >
                  <IconComponent className={`h-4 w-4 ${category.color}`} />
                  <span className="text-xs">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {achievements[category.id as keyof typeof achievements].map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`
                    border-border/50 backdrop-blur-sm transition-all duration-300
                    ${achievement.earned 
                      ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/30' 
                      : 'bg-card/50 hover:bg-accent/5'
                    }
                  `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`
                        text-3xl p-2 rounded-lg
                        ${achievement.earned ? 'bg-primary/10' : 'bg-muted/50 grayscale'}
                      `}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${achievement.earned ? 'text-primary' : ''}`}>
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        
                        {achievement.earned ? (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="text-sm text-primary font-medium">
                              Earned {'earnedDate' in achievement ? achievement.earnedDate : 'Recently'}
                            </span>
                          </div>
                        ) : achievement.progress && achievement.target ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {achievement.progress} / {achievement.target}
                              </span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.target) * 100} 
                              className="h-2"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm">Not started</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
            {Object.values(achievements)
              .flat()
              .filter(a => a.earned)
              .slice(-3)
              .reverse()
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-primary">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{'earnedDate' in achievement ? achievement.earnedDate : 'Recently earned'}</p>
                  </div>
                  <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Awards;