import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    analyticsService.init();
  }, []);

  useEffect(() => {
    analyticsService.trackPageView(location.pathname);
  }, [location]);

  return analyticsService;
}
