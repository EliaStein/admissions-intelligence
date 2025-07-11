import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Admissions Intelligence - AI-Powered College Essay Feedback',
  description: 'Get personalized feedback on your college essays powered by AI trained on insights from former admissions officers. Transform your college application with expert-level guidance within 24 hours.',
  keywords: [
    'college essay feedback',
    'admissions consulting',
    'AI essay review',
    'college application help',
    'personal statement feedback',
    'supplemental essay help',
    'college admissions',
    'essay writing assistance'
  ],
  authors: [{ name: 'Admissions Intelligence' }],
  creator: 'Admissions Intelligence',
  publisher: 'Admissions Intelligence',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  other: {
    'og:image:secure_url': 'https://admissionsintelligence.ai/favicon.png',
    'og:image:type': 'image/png',
    'og:image:alt': 'Admissions Intelligence - AI-Powered College Essay Feedback',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://admissionsintelligence.ai',
  },
  category: 'education',
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
      <head>
        <link rel="preload" href="/favicon.png" as="image" type="image/png" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://admissionsintelligence.ai" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Admissions Intelligence - AI-Powered College Essay Feedback" />
        <meta property="og:description" content="Get personalized feedback on your college essays powered by AI trained on insights from former admissions officers. Transform your college application with expert-level guidance within 24 hours." />
        <meta property="og:image" content="https://admissionsintelligence.ai/favicon.png" />
      </head>
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

        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Admissions Intelligence",
              "description": "AI-powered college essay feedback and admissions guidance",
              "url": "https://admissionsintelligence.ai",
              "logo": "https://admissionsintelligence.ai/favicon.png",
              "sameAs": [
                "https://twitter.com/admissionsintel"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "info@admissionsintelligence.ai"
              },
              "service": {
                "@type": "Service",
                "name": "AI-Powered College Essay Feedback",
                "description": "Get personalized feedback on your college essays powered by AI trained on insights from former admissions officers",
                "provider": {
                  "@type": "Organization",
                  "name": "Admissions Intelligence"
                },
                "areaServed": "Worldwide",
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Essay Feedback Services",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Personal Statement Feedback"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Supplemental Essay Feedback"
                      }
                    }
                  ]
                }
              }
            })
          }}
        />
      </body>
    </html>
  );
}
