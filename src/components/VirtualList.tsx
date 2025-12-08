import { useRef, useCallback, useMemo, ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * VirtualList - Renders only visible items for performance with large lists
 * 
 * Usage:
 * <VirtualList
 *   items={exercises}
 *   itemHeight={80}
 *   containerHeight={600}
 *   renderItem={(exercise, index) => <ExerciseCard key={exercise.id} exercise={exercise} />}
 * />
 */
export function VirtualList<T>({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem,
  overscan = 3,
  className = ''
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  const getVisibleRange = useCallback(() => {
    const start = Math.max(0, Math.floor(scrollTop.current / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    return { start, end };
  }, [items.length, itemHeight, visibleCount, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = e.currentTarget.scrollTop;
    // Force re-render on scroll
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateZ(0)';
    }
  }, []);

  const { start, end } = getVisibleRange();
  
  const visibleItems = useMemo(() => {
    return items.slice(start, end).map((item, i) => ({
      item,
      index: start + i,
      offset: (start + i) * itemHeight
    }));
  }, [items, start, end, itemHeight]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, offset }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offset,
              width: '100%',
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * useVirtualScroll hook for more custom implementations
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  const scrollTopRef = useRef(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  const getVisibleRange = useCallback((scrollTop: number) => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    return { start, end };
  }, [items.length, itemHeight, visibleCount, overscan]);

  const getVisibleItems = useCallback((scrollTop: number) => {
    const { start, end } = getVisibleRange(scrollTop);
    return items.slice(start, end).map((item, i) => ({
      item,
      index: start + i,
      offset: (start + i) * itemHeight
    }));
  }, [items, getVisibleRange, itemHeight]);

  const handleScroll = useCallback((scrollTop: number) => {
    scrollTopRef.current = scrollTop;
  }, []);

  return {
    totalHeight,
    visibleCount,
    getVisibleRange,
    getVisibleItems,
    handleScroll,
    scrollTop: scrollTopRef
  };
}

export default VirtualList;
