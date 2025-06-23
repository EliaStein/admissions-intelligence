import { EssayDashboard } from '@/components/EssayDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminEssaysPage() {
  return (
    <ProtectedRoute adminOnly>
      <EssayDashboard />
    </ProtectedRoute>
  );
}
