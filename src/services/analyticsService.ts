import { ANALYTICS_CONFIG } from '../config/analytics';
import type { AnalyticsEvent, EssaySubmissionEvent, NavigationEvent } from '../config/analytics';

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set' | 'js',
      action: string | Date,
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;

    // Add Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_CONFIG.GA_TRACKING_ID, {
      page_path: window.location.pathname,
    });

    this.isInitialized = true;
  }

  trackEvent({ action, category, label, value }: AnalyticsEvent) {
    if (!this.isInitialized) return;

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  trackEssaySubmission(data: EssaySubmissionEvent) {
    this.trackEvent({
      action: 'essay_submission',
      category: 'engagement',
      label: `${data.essayType}${data.school ? ` - ${data.school}` : ''} - ${data.submissionMethod}`,
    });
  }

  trackNavigation(data: NavigationEvent) {
    this.trackEvent({
      action: 'navigation',
      category: 'user_flow',
      label: `${data.from} -> ${data.to}`,
    });
  }

  trackFormStep(step: number, essayType: string) {
    this.trackEvent({
      action: 'form_step',
      category: 'user_flow',
      label: `Step ${step} - ${essayType}`,
      value: step,
    });
  }

  trackError(error: string, context: string) {
    this.trackEvent({
      action: 'error',
      category: 'error',
      label: `${context}: ${error}`,
    });
  }

  trackPageView(path: string) {
    if (!this.isInitialized) return;

    window.gtag('config', ANALYTICS_CONFIG.GA_TRACKING_ID, {
      page_path: path,
    });
  }
}

export const analyticsService = new AnalyticsService();
