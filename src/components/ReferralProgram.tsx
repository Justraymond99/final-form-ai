import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useReferrals } from "@/hooks/useReferrals";
import { useSubscription } from "@/hooks/useSubscription";
import { Gift, Users, Copy, Check, Send, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const ReferralProgram = () => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const { 
    userReferralCode, 
    pendingCount, 
    convertedCount, 
    totalRewardMonths,
    createReferral, 
    isCreating,
    isLoading 
  } = useReferrals();
  const { hasPremiumAccess } = useSubscription();

  const referralLink = userReferralCode 
    ? `${window.location.origin}/auth?ref=${userReferralCode}` 
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    createReferral(email.trim());
    setEmail("");
  };

  if (!hasPremiumAccess) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Gift className="h-8 w-8 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Referral Program</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upgrade to Pro to invite friends and earn free months
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            Pro Feature
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Invite Friends, Earn Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-accent/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-accent">{convertedCount}</p>
            <p className="text-xs text-muted-foreground">Converted</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{totalRewardMonths}</p>
            <p className="text-xs text-muted-foreground">Free Months</p>
          </div>
        </div>

        {/* Reward info */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">How it works</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your link • Friend signs up & subscribes • You both get 1 month free!
          </p>
        </div>

        {/* Share link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your referral link</label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              disabled={!userReferralCode}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Invite by email */}
        <form onSubmit={handleInvite} className="space-y-2">
          <label className="text-sm font-medium">Invite by email</label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={isCreating || !email.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </form>

        {/* Your code */}
        {userReferralCode && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">Your code</p>
            <p className="font-mono font-bold text-lg text-primary">{userReferralCode}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
