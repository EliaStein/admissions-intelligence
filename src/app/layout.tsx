import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Admissions Intelligence',
  description: 'AI-powered essay feedback and admissions guidance',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-PN8V5HGCQ9`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PN8V5HGCQ9', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* Viral Loops Script */}
        <Script
          src="https://app.viral-loops.com/widgetsV2/core/loader.js"
          data-campaign-id={process.env.NEXT_PUBLIC_VIRAL_LOOPS_CAMPAIGN_ID || 'FSHsStRJfckdYQCLN0IvMZrMb4c'}
          id="viral-loops-loader"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
