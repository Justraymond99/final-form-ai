import { useEffect } from "react";
import { performanceMonitor } from "@/lib/performanceMonitor";

export const PerformanceInit = () => {
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init();

    // Log report after page fully loads
    const handleLoad = () => {
      setTimeout(() => {
        performanceMonitor.logReport();
      }, 3000);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return null;
};
