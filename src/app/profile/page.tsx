import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Profile from '@/components/Profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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
