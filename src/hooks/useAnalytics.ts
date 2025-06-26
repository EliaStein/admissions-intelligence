import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    analyticsService.init();
  }, []);

  useEffect(() => {
    analyticsService.trackPageView(pathname);
  }, [pathname]);

  return analyticsService;
}
