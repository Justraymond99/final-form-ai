// Performance monitoring for Core Web Vitals and custom metrics

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

interface PerformanceReport {
  lcp?: PerformanceMetric;
  fid?: PerformanceMetric;
  cls?: PerformanceMetric;
  fcp?: PerformanceMetric;
  ttfb?: PerformanceMetric;
  customMetrics: Record<string, PerformanceMetric>;
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
};

function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (!threshold) return "good";
  
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

class PerformanceMonitor {
  private report: PerformanceReport = { customMetrics: {} };
  private observers: ((report: PerformanceReport) => void)[] = [];
  private initialized = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // Observe Largest Contentful Paint (LCP)
    this.observeLCP();

    // Observe First Input Delay (FID) / Interaction to Next Paint (INP)
    this.observeFID();

    // Observe Cumulative Layout Shift (CLS)
    this.observeCLS();

    // Observe First Contentful Paint (FCP)
    this.observeFCP();

    // Observe Time to First Byte (TTFB)
    this.observeTTFB();

    console.log("[Performance] Monitoring initialized");
  }

  private observeLCP() {
    if (!("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.report.lcp = {
            name: "LCP",
            value: lastEntry.startTime,
            rating: getRating("lcp", lastEntry.startTime),
            timestamp: Date.now(),
          };
          this.notifyObservers();
        }
      });

      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      console.warn("[Performance] LCP observation not supported");
    }
  }

  private observeFID() {
    if (!("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.report.fid = {
              name: "FID",
              value: fid,
              rating: getRating("fid", fid),
              timestamp: Date.now(),
            };
            this.notifyObservers();
          }
        });
      });

      observer.observe({ type: "first-input", buffered: true });
    } catch (e) {
      console.warn("[Performance] FID observation not supported");
    }
  }

  private observeCLS() {
    if (!("PerformanceObserver" in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (
              sessionValue &&
              entry.startTime - lastSessionEntry?.startTime < 1000 &&
              entry.startTime - firstSessionEntry?.startTime < 5000
            ) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.report.cls = {
                name: "CLS",
                value: clsValue,
                rating: getRating("cls", clsValue),
                timestamp: Date.now(),
              };
              this.notifyObservers();
            }
          }
        }
      });

      observer.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.warn("[Performance] CLS observation not supported");
    }
  }

  private observeFCP() {
    if (!("PerformanceObserver" in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            this.report.fcp = {
              name: "FCP",
              value: entry.startTime,
              rating: getRating("fcp", entry.startTime),
              timestamp: Date.now(),
            };
            this.notifyObservers();
          }
        });
      });

      observer.observe({ type: "paint", buffered: true });
    } catch (e) {
      console.warn("[Performance] FCP observation not supported");
    }
  }

  private observeTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        this.report.ttfb = {
          name: "TTFB",
          value: ttfb,
          rating: getRating("ttfb", ttfb),
          timestamp: Date.now(),
        };
        this.notifyObservers();
      }
    } catch (e) {
      console.warn("[Performance] TTFB measurement not supported");
    }
  }

  // Track custom metrics
  trackMetric(name: string, value: number) {
    this.report.customMetrics[name] = {
      name,
      value,
      rating: "good",
      timestamp: Date.now(),
    };
    this.notifyObservers();
  }

  // Measure time for an operation
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await operation();
    } finally {
      const duration = performance.now() - start;
      this.trackMetric(name, duration);
    }
  }

  // Start a timer
  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.trackMetric(name, duration);
    };
  }

  // Subscribe to performance updates
  subscribe(callback: (report: PerformanceReport) => void) {
    this.observers.push(callback);
    // Send current report immediately
    callback(this.report);
    
    return () => {
      this.observers = this.observers.filter((cb) => cb !== callback);
    };
  }

  private notifyObservers() {
    this.observers.forEach((callback) => callback({ ...this.report }));
  }

  // Get current report
  getReport(): PerformanceReport {
    return { ...this.report };
  }

  // Log report to console
  logReport() {
    console.group("[Performance Report]");
    
    if (this.report.lcp) {
      console.log(`LCP: ${this.report.lcp.value.toFixed(0)}ms (${this.report.lcp.rating})`);
    }
    if (this.report.fid) {
      console.log(`FID: ${this.report.fid.value.toFixed(0)}ms (${this.report.fid.rating})`);
    }
    if (this.report.cls) {
      console.log(`CLS: ${this.report.cls.value.toFixed(3)} (${this.report.cls.rating})`);
    }
    if (this.report.fcp) {
      console.log(`FCP: ${this.report.fcp.value.toFixed(0)}ms (${this.report.fcp.rating})`);
    }
    if (this.report.ttfb) {
      console.log(`TTFB: ${this.report.ttfb.value.toFixed(0)}ms (${this.report.ttfb.rating})`);
    }
    
    const customKeys = Object.keys(this.report.customMetrics);
    if (customKeys.length > 0) {
      console.group("Custom Metrics");
      customKeys.forEach((key) => {
        const metric = this.report.customMetrics[key];
        console.log(`${metric.name}: ${metric.value.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();
export type { PerformanceMetric, PerformanceReport };
