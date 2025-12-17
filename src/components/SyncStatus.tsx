import { useOfflineSync } from "@/hooks/useOfflineStorage";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SyncStatus = () => {
  const { isOnline, isSyncing, pendingCount, syncAll } = useOfflineSync();

  if (pendingCount === 0 && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={isOnline ? "secondary" : "destructive"}
            className="gap-2 shadow-lg"
            onClick={isOnline ? syncAll : undefined}
            disabled={isSyncing || !isOnline}
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : isOnline ? (
              <Cloud className="h-4 w-4" />
            ) : (
              <CloudOff className="h-4 w-4" />
            )}
            {pendingCount > 0 && (
              <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
                {pendingCount}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {isSyncing
            ? "Syncing..."
            : isOnline
            ? `${pendingCount} item${pendingCount !== 1 ? "s" : ""} to sync`
            : "Offline - changes saved locally"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
