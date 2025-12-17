import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ProgressRingSkeleton = () => (
  <div className="flex flex-col items-center">
    <Skeleton className="w-20 h-20 rounded-full" />
    <div className="mt-2 text-center space-y-1">
      <Skeleton className="h-4 w-16 mx-auto" />
      <Skeleton className="h-3 w-12 mx-auto" />
    </div>
  </div>
);

export const StatsCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

export const WorkoutCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-32" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </CardContent>
  </Card>
);

export const InsightCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-40" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </CardContent>
  </Card>
);

export const ChartSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-32" />
    </CardHeader>
    <CardContent>
      <div className="h-[200px] flex items-end gap-2 justify-between px-4">
        {[...Array(7)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-8 rounded-t-md" 
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ListItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3 border-b border-border">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-8 w-8 rounded" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>

      {/* Progress Rings Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-6">
          <ProgressRingSkeleton />
          <ProgressRingSkeleton />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>

      {/* Workout Card Skeleton */}
      <div className="mb-6">
        <WorkoutCardSkeleton />
      </div>

      {/* Insights Skeleton */}
      <div className="mb-6">
        <InsightCardSkeleton />
      </div>
    </div>
  </div>
);
