import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EssayWizard } from '@/components/EssayWizard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function EssayWizardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="essay-form-section py-12">
          <EssayWizard />
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
