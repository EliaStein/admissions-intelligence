"use client";

import React, { useEffect, Suspense, memo } from 'react';
import { Header } from '@/components/Header';
import Hero from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { Pricing } from '@/components/Pricing';
import { Footer } from '@/components/Footer';
import { useSearchParams } from 'next/navigation';

function ReferralCodeHandler() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('referralCode');

  useEffect(() => {
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
    }
  }, [referralCode]);

  return null;
}

function HomePage() {
  console.log('HomePage rendered');
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
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

export default memo(HomePage);
