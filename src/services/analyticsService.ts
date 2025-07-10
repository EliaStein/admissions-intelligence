import { ANALYTICS_CONFIG } from '../config/analytics';
import type {
  AnalyticsEvent,
  EssaySubmissionEvent,
  NavigationEvent,
  GetStartedClickEvent,
  AccountCreatedEvent,
  EssayTypeSelectedEvent,
  PersonalStatementPromptSelectedEvent,
  CreditsPageVisitEvent,
  CreditOptionClickEvent,
  CreditPurchaseEvent,
  MyEssaysPageVisitEvent
} from '../config/analytics';

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

  trackGetStartedClick(data: GetStartedClickEvent) {
    this.trackEvent({
      action: 'get_started_click',
      category: 'engagement',
      label: 'Get Started Button',
      date: data.date,
    });
  }

  trackAccountCreated(data: AccountCreatedEvent) {
    this.trackEvent({
      action: 'account_created',
      category: 'user_lifecycle',
      label: 'New Account',
      userId: data.user,
      date: data.date,
    });
  }

  trackEssayTypeSelected(data: EssayTypeSelectedEvent) {
    this.trackEvent({
      action: 'essay_type_selected',
      category: 'user_flow',
      label: data.essayType === 'personal' ? 'Personal Statement' : 'Supplemental Essay',
      userId: data.userId,
      date: data.date,
    });
  }

  trackPersonalStatementPromptSelected(data: PersonalStatementPromptSelectedEvent) {
    this.trackEvent({
      action: 'personal_statement_prompt_selected',
      category: 'user_flow',
      label: data.prompt,
      userId: data.userId,
      date: data.date,
    });
  }

  trackCreditsPageVisit(data: CreditsPageVisitEvent) {
    this.trackEvent({
      action: 'credits_page_visit',
      category: 'navigation',
      label: 'Purchase Credits Page',
      userId: data.userId,
      date: data.date,
    });
  }

  trackCreditOptionClick(data: CreditOptionClickEvent) {
    this.trackEvent({
      action: 'credit_option_click',
      category: 'engagement',
      label: `${data.credits} Credits - $${data.price}`,
      value: data.price,
      userId: data.userId,
      date: data.date,
    });
  }

  trackCreditPurchase(data: CreditPurchaseEvent) {
    this.trackEvent({
      action: 'credit_purchase',
      category: 'conversion',
      label: `${data.creditAmount} Credits Purchased`,
      value: data.price,
      userId: data.userId,
      date: data.date,
    });
  }

  trackMyEssaysPageVisit(data: MyEssaysPageVisitEvent) {
    this.trackEvent({
      action: 'my_essays_page_visit',
      category: 'navigation',
      label: 'My Essays Section',
      userId: data.userId,
      date: data.date,
    });
  }

  trackEssaySubmissionNew(data: EssaySubmissionEvent) {
    this.trackEvent({
      action: 'essay_submission',
      category: 'engagement',
      label: `${data.essayType}${data.school ? ` - ${data.school}` : ''} - ${data.submissionMethod}`,
      userId: data.userId,
      date: data.date,
    });
  }
}

export const analyticsService = new AnalyticsService();
