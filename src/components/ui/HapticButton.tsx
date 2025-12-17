import { forwardRef } from "react";
import { Button, ButtonProps } from "./button";
import { useHaptics } from "@/hooks/useHaptics";

export interface HapticButtonProps extends ButtonProps {
  hapticStyle?: "light" | "medium" | "heavy";
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticStyle = "light", onClick, ...props }, ref) => {
    const { lightTap, mediumTap, heavyTap } = useHaptics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback
      switch (hapticStyle) {
        case "medium":
          mediumTap();
          break;
        case "heavy":
          heavyTap();
          break;
        default:
          lightTap();
      }
      
      // Call original onClick handler
      onClick?.(e);
    };

    return <Button ref={ref} onClick={handleClick} {...props} />;
  }
);

HapticButton.displayName = "HapticButton";
