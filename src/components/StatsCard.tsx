import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

export const StatsCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  gradient = "gradient-primary",
  className,
  onClick
}: StatsCardProps) => {
  return (
    <div 
      className={cn(
        "relative group bg-card border border-card-border rounded-lg p-6 hover-lift cursor-pointer transition-smooth",
        className
      )}
      onClick={onClick}
    >
      {/* Background gradient overlay */}
      <div className={cn("absolute inset-0 opacity-5 rounded-lg", gradient)} />
      
      {/* Icon */}
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", gradient)}>
        <Icon className="w-6 h-6 text-background" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.isPositive ? "text-accent" : "text-destructive"
          )}>
            <span>{trend.isPositive ? "↗" : "↘"}</span>
            <span>{Math.abs(trend.value)}% vs yesterday</span>
          </div>
        )}
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};