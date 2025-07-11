import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import EssayWizard from '@/components/EssayWizard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Essay Wizard - Write Your College Essay | Admissions Intelligence',
  description: 'Use our guided essay wizard to write your college personal statement or supplemental essays. Get step-by-step guidance and AI-powered feedback.',
  openGraph: {
    title: 'Essay Wizard - Write Your College Essay | Admissions Intelligence',
    description: 'Use our guided essay wizard to write your college personal statement or supplemental essays. Get step-by-step guidance and AI-powered feedback.',
    url: 'https://admissionsintelligence.ai/essay-wizard',
  },
  twitter: {
    title: 'Essay Wizard - Write Your College Essay | Admissions Intelligence',
    description: 'Use our guided essay wizard to write your college personal statement or supplemental essays. Get step-by-step guidance and AI-powered feedback.',
  },
};

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
