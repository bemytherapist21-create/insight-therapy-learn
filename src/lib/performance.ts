/**
 * Performance monitoring utility
 * Usage: import { reportWebVitals } from './lib/performance'; reportWebVitals();
 */

export const reportWebVitals = () => {
    if (import.meta.env.DEV) {
        try {
            if ('PerformanceObserver' in window) {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('[Performance] LCP:', lastEntry.startTime);
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

                // First Input Delay
                const fidObserver = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        console.log('[Performance] FID:', entry.startTime);
                    }
                });
                fidObserver.observe({ type: 'first-input', buffered: true });

                // Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!(entry as any).hadRecentInput) {
                            console.log('[Performance] CLS:', (entry as any).value);
                        }
                    }
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            }
        } catch (e) {
            console.warn('[Performance] Observer not supported');
        }
    }
};
