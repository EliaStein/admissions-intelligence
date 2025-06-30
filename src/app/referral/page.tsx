'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { Gift, Users, Star } from 'lucide-react';

export default function ReferralPage() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Get referral code from URL parameters
    const code = searchParams.get('ref') || searchParams.get('referral') || searchParams.get('code');
    if (code) {
      setReferralCode(code);
      // Store in localStorage for signup process
      localStorage.setItem('referralCode', code);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Header />
      
      {/* Referral Banner */}
      {referralCode && (
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white py-4">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Gift className="w-5 h-5" />
              <p className="font-medium">
                🎉 You've been invited by a friend! Sign up now and get bonus credits when you make your first purchase.
              </p>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Special Hero Section for Referrals */}
        {referralCode ? (
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50"></div>
            <div className="relative max-w-6xl mx-auto px-4 text-center">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Users className="w-4 h-4" />
                  <span>Referred by a friend</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Welcome to
                  <span className="text-primary-600"> Admissions Intelligence</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Your friend recommended our AI-powered essay feedback system. Join thousands of students who've improved their college essays and increased their admission chances.
                </p>
              </div>

              {/* Special Benefits for Referred Users */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Special Referral Benefits</h2>
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bonus Credits</h3>
                    <p className="text-gray-600 text-sm">Get extra credits when you make your first purchase</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Trusted Recommendation</h3>
                    <p className="text-gray-600 text-sm">Recommended by someone who's already seen great results</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Premium Support</h3>
                    <p className="text-gray-600 text-sm">Priority access to our essay feedback system</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth?mode=signup"
                  className="inline-flex items-center justify-center bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors font-semibold text-lg"
                >
                  Get Started Free
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors font-semibold text-lg"
                >
                  Learn More
                </a>
              </div>
            </div>
          </section>
        ) : (
          <Hero />
        )}

        <HowItWorks />
        <Features />
        <Testimonials />
      </main>
      
      <Footer />
    </div>
  );
}
