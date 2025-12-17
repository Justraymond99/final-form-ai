import { useServiceWorker } from "@/hooks/useServiceWorker";
import { WifiOff, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const OfflineIndicator = () => {
  const { isOnline, isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  // Show offline banner
  if (!isOnline) {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2"
      >
        <div className="flex items-center justify-center gap-2 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>You're offline. Some features may be limited.</span>
        </div>
      </motion.div>
    );
  }

  // Show update available banner
  if (isUpdateAvailable && !dismissed) {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-2"
      >
        <div className="flex items-center justify-center gap-3 text-sm">
          <span>A new version is available!</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={updateServiceWorker}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Update
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-primary-foreground/20 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
};
