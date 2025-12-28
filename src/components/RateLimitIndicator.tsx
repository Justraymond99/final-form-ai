import { AlertCircle, Clock, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

interface RateLimitIndicatorProps {
  remaining: number;
  maxRequests: number;
  resetAt?: Date | null;
  endpoint?: string;
  showAlways?: boolean;
}

export function RateLimitIndicator({
  remaining,
  maxRequests,
  resetAt,
  endpoint,
  showAlways = false,
}: RateLimitIndicatorProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string | null>(null);
  
  const percentage = Math.round((remaining / maxRequests) * 100);
  const isLow = remaining <= 5;
  const isCritical = remaining <= 2;
  const isExhausted = remaining === 0;

  useEffect(() => {
    if (!resetAt) {
      setTimeUntilReset(null);
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const diff = resetAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilReset(null);
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      if (minutes > 0) {
        setTimeUntilReset(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilReset(`${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [resetAt]);

  // Don't show if not low and showAlways is false
  if (!showAlways && !isLow && !isExhausted) {
    return null;
  }

  if (isExhausted) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Rate Limit Reached</AlertTitle>
        <AlertDescription className="flex items-center gap-2">
          <span>AI requests temporarily unavailable.</span>
          {timeUntilReset && (
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              Resets in {timeUntilReset}
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`p-3 rounded-lg border mb-4 ${
      isCritical 
        ? 'border-destructive/50 bg-destructive/10' 
        : isLow 
          ? 'border-yellow-500/50 bg-yellow-500/10' 
          : 'border-border bg-muted/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Zap className={`h-4 w-4 ${
            isCritical ? 'text-destructive' : isLow ? 'text-yellow-500' : 'text-primary'
          }`} />
          <span>AI Requests</span>
        </div>
        <span className={`text-sm font-bold ${
          isCritical ? 'text-destructive' : isLow ? 'text-yellow-500' : 'text-muted-foreground'
        }`}>
          {remaining}/{maxRequests}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${
          isCritical 
            ? '[&>div]:bg-destructive' 
            : isLow 
              ? '[&>div]:bg-yellow-500' 
              : ''
        }`}
      />
      
      {timeUntilReset && isLow && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Resets in {timeUntilReset}
        </p>
      )}
    </div>
  );
}

// Compact version for headers/toolbars
export function RateLimitBadge({
  remaining,
  maxRequests,
}: {
  remaining: number;
  maxRequests: number;
}) {
  const isCritical = remaining <= 2;
  const isLow = remaining <= 5;

  if (!isLow) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isCritical 
        ? 'bg-destructive/20 text-destructive' 
        : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
    }`}>
      <Zap className="h-3 w-3" />
      <span>{remaining} left</span>
    </div>
  );
}
