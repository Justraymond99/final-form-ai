import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  Trophy, 
  Share, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Camera,
  TrendingUp,
  Target,
  Award,
  Flame
} from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SocialPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: number;
  };
  type: 'workout' | 'achievement' | 'progress' | 'milestone';
  content: string;
  image?: string;
  stats?: {
    duration?: number;
    calories?: number;
    exercises?: number;
  };
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  workoutsThisWeek: number;
  streak: number;
  rank: number;
}

export const SocialFeatures = () => {
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    // Load sample data (in real app, fetch from API)
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    // Sample social posts
    const samplePosts: SocialPost[] = [
      {
        id: '1',
        user: { name: 'Alex Johnson', avatar: '', level: 12 },
        type: 'workout',
        content: 'Just crushed a 45-minute HIIT session! 💪',
        stats: { duration: 45, calories: 420, exercises: 8 },
        likes: 15,
        comments: 3,
        timestamp: '2 hours ago',
        isLiked: false
      },
      {
        id: '2',
        user: { name: 'Sarah Chen', avatar: '', level: 8 },
        type: 'achievement',
        content: 'Unlocked the "Century Club" achievement - 100 workouts completed! 🎉',
        likes: 28,
        comments: 7,
        timestamp: '4 hours ago',
        isLiked: true
      },
      {
        id: '3',
        user: { name: 'Mike Rodriguez', avatar: '', level: 15 },
        type: 'milestone',
        content: 'Hit my goal weight of 75kg! Thanks to everyone for the motivation! 🎯',
        likes: 42,
        comments: 12,
        timestamp: '1 day ago',
        isLiked: false
      }
    ];

    // Sample leaderboard
    const sampleLeaderboard: LeaderboardUser[] = [
      { id: '1', name: 'Emma Wilson', avatar: '', points: 2450, workoutsThisWeek: 6, streak: 12, rank: 1 },
      { id: '2', name: 'James Park', avatar: '', points: 2380, workoutsThisWeek: 5, streak: 8, rank: 2 },
      { id: '3', name: 'Lisa Zhang', avatar: '', points: 2290, workoutsThisWeek: 4, streak: 15, rank: 3 },
      { id: '4', name: 'You', avatar: '', points: 2150, workoutsThisWeek: 4, streak: 6, rank: 4 },
      { id: '5', name: 'David Kim', avatar: '', points: 2020, workoutsThisWeek: 3, streak: 4, rank: 5 },
    ];

    setPosts(samplePosts);
    setLeaderboard(sampleLeaderboard);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const shareProgress = () => {
    toast({
      title: "Progress Shared! 🎉",
      description: "Your workout has been shared with your friends.",
    });
  };

  const sendFriendRequest = (name: string) => {
    toast({
      title: "Friend Request Sent! 👋",
      description: `Sent a friend request to ${name}.`,
    });
  };

  const renderPost = (post: SocialPost) => {
    const getPostIcon = () => {
      switch (post.type) {
        case 'workout': return <Trophy className="w-4 h-4 text-orange-500" />;
        case 'achievement': return <Award className="w-4 h-4 text-yellow-500" />;
        case 'milestone': return <Target className="w-4 h-4 text-green-500" />;
        default: return <TrendingUp className="w-4 h-4 text-blue-500" />;
      }
    };

    return (
      <Card key={post.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{post.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{post.user.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  Level {post.user.level}
                </Badge>
                {getPostIcon()}
              </div>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="mb-3">{post.content}</p>
          
          {post.stats && (
            <div className="flex gap-4 mb-3 p-3 bg-muted/50 rounded-lg">
              {post.stats.duration && (
                <div className="text-center">
                  <div className="font-semibold text-sm">{post.stats.duration}m</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
              )}
              {post.stats.calories && (
                <div className="text-center">
                  <div className="font-semibold text-sm">{post.stats.calories}</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
              )}
              {post.stats.exercises && (
                <div className="text-center">
                  <div className="font-semibold text-sm">{post.stats.exercises}</div>
                  <div className="text-xs text-muted-foreground">Exercises</div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikePost(post.id)}
              className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500' : ''}`} />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLeaderboard = () => (
    <div className="space-y-3">
      {leaderboard.map((user) => (
        <Card key={user.id} className={user.name === 'You' ? 'ring-2 ring-primary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                'bg-muted text-muted-foreground'
              }`}>
                {user.rank}
              </div>
              <Avatar className="w-10 h-10">
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{user.name}</h4>
                  {user.name === 'You' && <Badge variant="default">You</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.workoutsThisWeek} workouts this week
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">{user.points}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="w-3 h-3" />
                  {user.streak}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Progress</DialogTitle>
                <DialogDescription>
                  Let your friends know about your latest achievement!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="What did you accomplish today?" />
                <Button onClick={shareProgress} className="w-full">
                  Share with Community
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friends
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find Friends</DialogTitle>
                <DialogDescription>
                  Connect with friends to stay motivated together.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Search by name or email..." />
                <div className="space-y-2">
                  {['John Doe', 'Jane Smith', 'Mike Johnson'].map((name) => (
                    <div key={name} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{name}</span>
                      </div>
                      <Button size="sm" onClick={() => sendFriendRequest(name)}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          {posts.length > 0 ? (
            <div>
              {posts.map(renderPost)}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add friends to see their fitness activity and achievements!
                </p>
                <Button>Find Friends</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Challenge</CardTitle>
              <CardDescription>
                Compete with friends in this week's fitness challenge
              </CardDescription>
            </CardHeader>
          </Card>
          {renderLeaderboard()}
        </TabsContent>
      </Tabs>
    </div>
  );
};