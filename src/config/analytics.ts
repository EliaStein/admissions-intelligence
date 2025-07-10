export const ANALYTICS_CONFIG = {
  GA_TRACKING_ID: 'G-PN8V5HGCQ9',
};

export type AnalyticsEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  date?: string;
};

export type EssaySubmissionEvent = {
  essayType: string;
  school?: string;
  promptType: string;
  submissionMethod: 'text' | 'file';
  userId?: string;
  date: string;
  prompt?: string;
};

export type NavigationEvent = {
  from: string;
  to: string;
};

export type GetStartedClickEvent = {
  date: string;
};

export type AccountCreatedEvent = {
  date: string;
  user: string;
};

export type EssayTypeSelectedEvent = {
  userId?: string;
  date: string;
  essayType: 'personal' | 'supplemental';
};

export type PersonalStatementPromptSelectedEvent = {
  userId?: string;
  date: string;
  prompt: string;
};

export type CreditsPageVisitEvent = {
  userId: string;
  date: string;
};

export type CreditOptionClickEvent = {
  userId: string;
  date: string;
  option: string;
  credits: number;
  price: number;
};

export type CreditPurchaseEvent = {
  userId: string;
  creditAmount: number;
  date: string;
  price: number;
};

export type MyEssaysPageVisitEvent = {
  userId: string;
  date: string;
};
