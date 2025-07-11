import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Essay Details | Admissions Intelligence',
  description: 'View your college essay, feedback, and prompt details.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EssayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
