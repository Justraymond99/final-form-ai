import { usePrefetchOnAuth } from "@/hooks/usePrefetch";

// Component to initialize data prefetching
export const PrefetchInit = () => {
  usePrefetchOnAuth();
  return null;
};
