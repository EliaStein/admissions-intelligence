import React, { Suspense } from 'react';
import { Header } from '@/components/Header';
import Hero from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';
import ReferralCodeHandler from '@/components/ReferralCodeHandler';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-primary-50 to-white">
      <Suspense fallback={null}>
        <ReferralCodeHandler />
      </Suspense>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
