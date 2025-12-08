import { useState } from "react";
import { Trophy, Users, Plus, Crown, Check, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChallenges } from "@/hooks/useChallenges";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { format, addDays } from "date-fns";

export const ChallengesSection = () => {
  const { user } = useSecureAuth();
  const { challenges, loadingChallenges, joinChallenge, leaveChallenge, createChallenge } = useChallenges();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    challenge_type: "workouts",
    target_value: 10,
    unit: "workouts",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    is_public: true,
  });

  const handleCreateChallenge = () => {
    createChallenge.mutate(newChallenge, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setNewChallenge({
          title: "",
          description: "",
          challenge_type: "workouts",
          target_value: 10,
          unit: "workouts",
          start_date: format(new Date(), "yyyy-MM-dd"),
          end_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
          is_public: true,
        });
      },
    });
  };

  const challengeTypeUnits: Record<string, string> = {
    workouts: "workouts",
    calories: "calories",
    steps: "steps",
    water: "ml",
    custom: "units",
  };

  if (!user) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-8 text-center text-muted-foreground">
          Sign in to join challenges
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-secondary" />
            Active Challenges
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Challenge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                    placeholder="December Workout Challenge"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    placeholder="Complete 20 workouts this month!"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newChallenge.challenge_type}
                      onValueChange={(v) =>
                        setNewChallenge({
                          ...newChallenge,
                          challenge_type: v,
                          unit: challengeTypeUnits[v],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workouts">Workouts</SelectItem>
                        <SelectItem value="calories">Calories</SelectItem>
                        <SelectItem value="steps">Steps</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target</Label>
                    <Input
                      type="number"
                      value={newChallenge.target_value}
                      onChange={(e) =>
                        setNewChallenge({ ...newChallenge, target_value: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newChallenge.start_date}
                      onChange={(e) => setNewChallenge({ ...newChallenge, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newChallenge.end_date}
                      onChange={(e) => setNewChallenge({ ...newChallenge, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateChallenge}
                  disabled={!newChallenge.title || createChallenge.isPending}
                  className="w-full"
                >
                  {createChallenge.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingChallenges ? (
          <div className="text-center py-4 text-muted-foreground">Loading challenges...</div>
        ) : challenges && challenges.length > 0 ? (
          challenges.map((challenge) => {
            const progress = Math.min(
              100,
              Math.round(((challenge.user_progress || 0) / challenge.target_value) * 100)
            );

            return (
              <div
                key={challenge.id}
                className="p-4 rounded-lg border border-border/30 hover:bg-accent/5 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-secondary" />
                    <h3 className="font-medium">{challenge.title}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {challenge.participants_count || 0}
                  </Badge>
                </div>

                {challenge.description && (
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {challenge.user_progress || 0} / {challenge.target_value} {challenge.unit}
                    </span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Ends {format(new Date(challenge.end_date), "MMM d, yyyy")}
                  </span>
                  {challenge.user_joined ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => leaveChallenge.mutate(challenge.id)}
                      disabled={leaveChallenge.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Leave
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => joinChallenge.mutate(challenge.id)}
                      disabled={joinChallenge.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active challenges</p>
            <p className="text-xs mt-1">Create one to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
