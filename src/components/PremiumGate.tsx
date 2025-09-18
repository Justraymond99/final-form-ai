import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, Lock } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
}

export const PremiumGate = ({ children, feature, description }: PremiumGateProps) => {
  // Always return children - paywall removed for testing
  return <>{children}</>;
};