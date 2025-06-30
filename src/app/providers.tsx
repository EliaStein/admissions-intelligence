'use client';

import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

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
      {children}
    </AnalyticsProvider>
  );
}
