import { lazy, Suspense, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components - use .then() to handle named exports
export const LazyWeeklyInsights = lazy(() => 
  import('@/components/WeeklyInsights').then(m => ({ default: m.WeeklyInsights }))
);
export const LazyVolumeChart = lazy(() => 
  import('@/components/VolumeChart').then(m => ({ default: m.VolumeChart }))
);
export const LazyProgressSummary = lazy(() => 
  import('@/components/ProgressSummary').then(m => ({ default: m.ProgressSummary }))
);
export const LazyAIChatbot = lazy(() => 
  import('@/components/AIChatbot').then(m => ({ default: m.AIChatbot }))
);
export const LazyWorkoutGenerator = lazy(() => 
  import('@/components/WorkoutGenerator').then(m => ({ default: m.WorkoutGenerator }))
);
export const LazyNutritionGenerator = lazy(() => 
  import('@/components/NutritionGenerator').then(m => ({ default: m.NutritionGenerator }))
);
export const LazyMultiWeekWorkoutDisplay = lazy(() => 
  import('@/components/MultiWeekWorkoutDisplay').then(m => ({ default: m.MultiWeekWorkoutDisplay }))
);
export const LazyMultiWeekNutritionDisplay = lazy(() => 
  import('@/components/MultiWeekNutritionDisplay').then(m => ({ default: m.MultiWeekNutritionDisplay }))
);
export const LazyContentLibrary = lazy(() => 
  import('@/components/ContentLibrary').then(m => ({ default: m.ContentLibrary }))
);
export const LazyAdvancedAIFeatures = lazy(() => 
  import('@/components/AdvancedAIFeatures').then(m => ({ default: m.AdvancedAIFeatures }))
);

// Chart loading skeleton
function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

// Card loading skeleton
function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// AI component loading skeleton
function AISkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Generic loading fallback
function LoadingFallback({ type = 'card' }: { type?: 'chart' | 'card' | 'ai' }) {
  switch (type) {
    case 'chart':
      return <ChartSkeleton />;
    case 'ai':
      return <AISkeleton />;
    default:
      return <CardSkeleton />;
  }
}

// Pre-wrapped lazy components for easy use
export function WeeklyInsightsLazy() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyWeeklyInsights />
    </Suspense>
  );
}

export function VolumeChartLazy() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyVolumeChart />
    </Suspense>
  );
}

export function ProgressSummaryLazy() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <LazyProgressSummary />
    </Suspense>
  );
}

export function AIChatbotLazy() {
  return (
    <Suspense fallback={<AISkeleton />}>
      <LazyAIChatbot />
    </Suspense>
  );
}

export function WorkoutGeneratorLazy() {
  return (
    <Suspense fallback={<AISkeleton />}>
      <LazyWorkoutGenerator />
    </Suspense>
  );
}

export function NutritionGeneratorLazy() {
  return (
    <Suspense fallback={<AISkeleton />}>
      <LazyNutritionGenerator />
    </Suspense>
  );
}

export function ContentLibraryLazy() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <LazyContentLibrary />
    </Suspense>
  );
}

// Intersection Observer hook for lazy loading on scroll
import { useEffect, useRef, useState } from 'react';

export function useLazyLoad(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold]);

  return { ref, isVisible };
}

// Component that only renders when scrolled into view
interface LazyOnScrollProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  minHeight?: number;
}

export function LazyOnScroll({ 
  children, 
  fallback, 
  className = '',
  minHeight = 100 
}: LazyOnScrollProps) {
  const { ref, isVisible } = useLazyLoad();

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {isVisible ? children : (fallback || <CardSkeleton />)}
    </div>
  );
}

export default {
  WeeklyInsightsLazy,
  VolumeChartLazy,
  ProgressSummaryLazy,
  AIChatbotLazy,
  WorkoutGeneratorLazy,
  NutritionGeneratorLazy,
  ContentLibraryLazy,
  LazyOnScroll,
  useLazyLoad,
};
