import { useState, useEffect } from "react";
import { performanceMonitor, PerformanceReport } from "@/lib/performanceMonitor";

export const usePerformance = () => {
  const [report, setReport] = useState<PerformanceReport>({ customMetrics: {} });

  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init();

    // Subscribe to updates
    const unsubscribe = performanceMonitor.subscribe(setReport);

    return unsubscribe;
  }, []);

  return {
    report,
    trackMetric: performanceMonitor.trackMetric.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    startTimer: performanceMonitor.startTimer.bind(performanceMonitor),
    logReport: performanceMonitor.logReport.bind(performanceMonitor),
  };
};
