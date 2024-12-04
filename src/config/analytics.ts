export const ANALYTICS_CONFIG = {
  GA_TRACKING_ID: 'G-PN8V5HGCQ9',
};

export type AnalyticsEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export type EssaySubmissionEvent = {
  essayType: string;
  school?: string;
  promptType: string;
  submissionMethod: 'text' | 'file';
};

export type NavigationEvent = {
  from: string;
  to: string;
};
