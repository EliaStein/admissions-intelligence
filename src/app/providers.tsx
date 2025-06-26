'use client';

import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EmailJSInitializer } from '@/components/EmailJSInitializer';

interface ProvidersProps {
  children: React.ReactNode;
}

function AnalyticsProvider({ children }: ProvidersProps) {
  useAnalytics();
  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AnalyticsProvider>
      <EmailJSInitializer />
      {children}
    </AnalyticsProvider>
  );
}
