import { useState } from "react";
import { Users, Trophy, MessageCircle, Heart, Share2, TrendingUp, Crown, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { SocialFeatures } from "@/components/SocialFeatures";
import { useToast } from "@/hooks/use-toast";

const Social = () => {
  const { toast } = useToast();
  const leaderboard = [
    { id: 1, name: "Alex Johnson", workouts: 24, rank: 1, streak: 12 },
    { id: 2, name: "Sarah Chen", workouts: 22, rank: 2, streak: 8 },
    { id: 3, name: "Mike Wilson", workouts: 20, rank: 3, streak: 15 },
    { id: 4, name: "You", workouts: 18, rank: 4, streak: 7 },
    { id: 5, name: "Emma Davis", workouts: 16, rank: 5, streak: 5 },
  ];

  const friends = [
    { id: 1, name: "Alex Johnson", status: "Just finished leg day! 💪", time: "2h ago", online: true },
    { id: 2, name: "Sarah Chen", status: "New PR on deadlifts! 🔥", time: "4h ago", online: false },
    { id: 3, name: "Mike Wilson", status: "Rest day recovery 😴", time: "1d ago", online: true },
  ];

  const challenges = [
    { id: 1, title: "December Challenge", description: "25 workouts this month", progress: 18, target: 25, participants: 847 },
    { id: 2, title: "Cardio King", description: "500 minutes cardio", progress: 320, target: 500, participants: 234 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Social
          </h1>
          <p className="text-muted-foreground">Connect with your fitness community</p>
        </div>

        {/* New Social Features */}
        <SocialFeatures />

        {/* Quick Share */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => toast({ title: "Workout Shared!", description: "Your workout has been shared with friends! 🎉" })}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Today's Workout
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-secondary" />
              This Month's Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-colors
                  ${user.name === 'You' 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-border/30 hover:bg-accent/5'
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${user.rank === 1 ? 'bg-secondary text-secondary-foreground' : 
                      user.rank === 2 ? 'bg-accent text-accent-foreground' :
                      user.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }
                  `}>
                    {user.rank}
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.workouts} workouts</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-accent/30 text-accent">
                  {user.streak}🔥
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Friends Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Friends Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {friend.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {friend.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{friend.name}</p>
                    <span className="text-xs text-muted-foreground">{friend.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{friend.status}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toast({ title: "Chat", description: `Opening chat with ${friend.name}! 💬` })}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-3 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{challenge.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {challenge.participants} joined
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{challenge.progress} / {challenge.target}</span>
                    <span className="text-primary font-medium">
                      {Math.round((challenge.progress / challenge.target) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Social;