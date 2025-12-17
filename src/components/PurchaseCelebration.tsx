import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, Dumbbell, Brain, ChefHat, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PurchaseCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="absolute w-3 h-3 rounded-full"
    style={{ backgroundColor: color }}
    initial={{ 
      x: Math.random() * 400 - 200,
      y: -20,
      rotate: 0,
      opacity: 1 
    }}
    animate={{ 
      y: 500,
      x: Math.random() * 400 - 200,
      rotate: Math.random() * 720,
      opacity: 0
    }}
    transition={{ 
      duration: 3,
      delay,
      ease: "easeOut"
    }}
  />
);

export const PurchaseCelebration = ({ isOpen, onClose }: PurchaseCelebrationProps) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "#FFD700", "#FF6B6B", "#4ECDC4"];

  const features = [
    { icon: Brain, label: "AI Workouts" },
    { icon: ChefHat, label: "Meal Plans" },
    { icon: Dumbbell, label: "Premium Templates" },
    { icon: Trophy, label: "Advanced Analytics" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={i * 0.05}
                  color={colors[i % colors.length]}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="text-center space-y-6 py-4 relative z-10">
          {/* Crown icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center"
          >
            <Crown className="h-10 w-10 text-background" />
          </motion.div>

          {/* Welcome text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold">
              Welcome to <span className="text-primary">Pro</span>!
            </h2>
            <p className="text-muted-foreground">
              You now have access to all premium features
            </p>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-2 bg-primary/10 rounded-lg p-3"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            <Button
              onClick={() => {
                onClose();
                navigate("/workouts");
              }}
              className="w-full bg-gradient-primary"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Your First AI Workout
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Explore Later
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
