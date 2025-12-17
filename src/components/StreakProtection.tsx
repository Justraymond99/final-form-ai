import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStreakFreeze } from "@/hooks/useStreakFreeze";
import { useSubscription } from "@/hooks/useSubscription";
import { Shield, Snowflake, Crown } from "lucide-react";

export const StreakProtection = () => {
  const { freezesRemaining, canFreeze, todayFrozen, freezeStreak, isFreezing, isLoading } = useStreakFreeze();
  const { hasPremiumAccess } = useSubscription();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="h-16 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!hasPremiumAccess) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Streak Protection</p>
                <p className="text-xs text-muted-foreground">Freeze your streak on rest days</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Crown className="h-3 w-3" />
              Pro
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Streak Protection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  i < freezesRemaining
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Snowflake className="h-4 w-4" />
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {freezesRemaining} left this month
          </span>
        </div>

        {todayFrozen ? (
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-primary">
              <Snowflake className="h-4 w-4 inline mr-1" />
              Today is frozen!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your streak is protected
            </p>
          </div>
        ) : (
          <Button
            onClick={() => freezeStreak(new Date())}
            disabled={!canFreeze || isFreezing}
            variant="outline"
            className="w-full"
          >
            <Snowflake className="h-4 w-4 mr-2" />
            {isFreezing ? "Freezing..." : "Freeze Today"}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Use freezes on rest days to protect your streak
        </p>
      </CardContent>
    </Card>
  );
};
