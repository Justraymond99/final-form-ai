import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRateApp } from "@/hooks/useRateApp";
import { Star, Heart, X } from "lucide-react";
import { motion } from "framer-motion";

export const RateAppPrompt = () => {
  const { shouldShowPrompt, completedWorkouts, dismissPrompt, rateNow, rateLater } = useRateApp();

  if (!shouldShowPrompt) return null;

  return (
    <Dialog open={shouldShowPrompt} onOpenChange={(open) => !open && dismissPrompt()}>
      <DialogContent className="sm:max-w-sm">
        <button
          onClick={dismissPrompt}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center space-y-4 py-4">
          {/* Celebration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
          >
            <Star className="h-8 w-8 text-white fill-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold">You're Crushing It!</h2>
            <p className="text-muted-foreground text-sm mt-1">
              You've completed {completedWorkouts} workouts!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">
              Enjoying Final Form? A quick review helps others find us too!
            </p>

            {/* Star rating visual */}
            <div className="flex justify-center gap-1 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + star * 0.1 }}
                >
                  <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-2 pt-2"
          >
            <Button
              onClick={rateNow}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
            >
              <Heart className="h-4 w-4 mr-2" />
              Rate Us 5 Stars
            </Button>
            <Button
              variant="ghost"
              onClick={rateLater}
              className="w-full text-muted-foreground"
            >
              Maybe Later
            </Button>
            <button
              onClick={dismissPrompt}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Don't ask again
            </button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
