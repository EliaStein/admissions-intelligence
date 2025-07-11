import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Admissions Intelligence',
  description: 'Administrative dashboard for managing users, essays, and system settings.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
