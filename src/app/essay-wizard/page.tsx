import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EssayWizard } from '@/components/EssayWizard';

export default function EssayWizardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="essay-form-section py-12">
        <EssayWizard />
      </div>
      <Footer />
    </div>
  );
}
