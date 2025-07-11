import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Purchase Credits - Buy Essay Feedback Credits | Admissions Intelligence',
  description: 'Purchase credits to get AI-powered college essay feedback. Choose from flexible credit packages with discounts for bulk purchases.',
  openGraph: {
    title: 'Purchase Credits - Buy Essay Feedback Credits | Admissions Intelligence',
    description: 'Purchase credits to get AI-powered college essay feedback. Choose from flexible credit packages with discounts for bulk purchases.',
    url: 'https://admissionsintelligence.ai/purchase-credits',
  },
  twitter: {
    title: 'Purchase Credits - Buy Essay Feedback Credits | Admissions Intelligence',
    description: 'Purchase credits to get AI-powered college essay feedback. Choose from flexible credit packages with discounts for bulk purchases.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PurchaseCreditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
