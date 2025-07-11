import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Profile } from '@/components/Profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Manage Your Account | Admissions Intelligence',
  description: 'Manage your Admissions Intelligence account, view your credits, essay history, and account settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Profile />
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
