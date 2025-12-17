import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PricingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-64 mx-auto rounded-xl" />
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Toggle skeleton */}
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-11 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Plans skeleton */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan skeleton */}
          <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <Skeleton className="mx-auto mb-4 w-12 h-12 rounded-full" />
              <Skeleton className="h-8 w-20 mx-auto" />
              <Skeleton className="h-10 w-16 mx-auto mt-2" />
              <Skeleton className="h-5 w-40 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Pro Plan skeleton */}
          <Card className="relative border-2 border-primary/50 backdrop-blur-sm">
            <Skeleton className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-32 rounded-full" />
            <CardHeader className="text-center pb-8 pt-6">
              <Skeleton className="mx-auto mb-4 w-12 h-12 rounded-full" />
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-5 w-48 mx-auto mt-2" />
              <Skeleton className="h-10 w-28 mx-auto mt-2" />
              <Skeleton className="h-5 w-36 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
