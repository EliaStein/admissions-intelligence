import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';


export const metadata: Metadata = {
  title: 'Admissions Intelligence',
  description: 'AI-powered essay feedback and admissions guidance',
  viewport: 'width=device-width, initial-scale=1.0',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
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
      </body>
    </html>
  );
}
