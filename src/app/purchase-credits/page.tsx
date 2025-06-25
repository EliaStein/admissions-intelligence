'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CreditPackage, creditPackages } from '../../config/products';

export default function PurchaseCreditsPage() {
  const { user } = useAuth();
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentCredits = async () => {
      if (user) {
        try {
          // Get the user's session token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('No active session');
          }

          const response = await fetch('/api/credits/balance', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch credit balance');
          }

          const data = await response.json();
          setCurrentCredits(data.credits);
        } catch (error) {
          console.error('Error loading credits:', error);
        }
      }
      setLoading(false);
    };

    loadCurrentCredits();
  }, [user]);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!user) return;

    setPurchasing(pkg.id);
    
    try {
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId: pkg.priceId,
          credits: pkg.credits,
          successUrl: `${window.location.origin}/profile?payment=success`,
          cancelUrl: `${window.location.origin}/purchase-credits?payment=cancelled`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-16">
              <div className="mb-8">
                <Link
                  href="/profile"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Link>
              </div>

              <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-10">
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Purchase Credits
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl mb-6">
                    Get essay feedback with our credit system
                  </p>

                  <div className="inline-block">
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600">Current Balance</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {currentCredits} credits
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 w-full max-w-sm lg:max-w-xs">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Single Review
                  </h3>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      $99
                    </span>
                    <p className="text-gray-600 text-sm mt-1">
                      for 1 credit
                    </p>
                  </div>

                  <button
                    onClick={() => handlePurchase(creditPackages[0])}
                    disabled={purchasing === creditPackages[0].id}
                    className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-200 bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg ${
                      purchasing === creditPackages[0].id
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {purchasing === creditPackages[0].id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Purchase Now'
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {creditPackages.slice(1).map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    pkg.popular ? 'ring-2 ring-primary-500 transform scale-105' : 'hover:-translate-y-1'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-primary-600 text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className={`p-6 ${pkg.popular ? 'pt-12' : ''}`}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>

                    <div className="mb-6">
                      {pkg.discount && pkg.originalPrice ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-4xl font-bold text-gray-900">
                              ${pkg.price}
                            </span>
                            <span className="text-lg text-gray-500 line-through">
                              ${pkg.originalPrice}
                            </span>
                            <span className="bg-secondary-100 text-secondary-800 text-xs font-medium px-2 py-1 rounded-full">
                              {pkg.discount}% OFF
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            for {pkg.credits} credits
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-gray-900">
                            ${pkg.price}
                          </span>
                          <p className="text-gray-600 text-sm mt-1">
                            for {pkg.credits} credit{pkg.credits > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mb-8 space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-5 h-5 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-3 w-3 text-secondary-600" />
                        </div>
                        {pkg.credits} AI essay feedback sessions
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-5 h-5 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-3 w-3 text-secondary-600" />
                        </div>
                        Detailed feedback on 7 key areas
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-5 h-5 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-3 w-3 text-secondary-600" />
                        </div>
                        Credits never expire
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasing === pkg.id}
                      className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-200 ${
                        pkg.popular
                          ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg'
                      } ${
                        purchasing === pkg.id
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {purchasing === pkg.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Purchase Now'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-secondary-500">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-secondary-500">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      How do credits work?
                    </h3>
                    <p className="text-gray-600">
                      Each essay feedback session costs 1 credit. When you submit an essay for AI feedback,
                      1 credit will be deducted from your balance.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      How much does each credit cost?
                    </h3>
                    <p className="text-gray-600">
                      Individual credits cost $99 each. However, you can save money by purchasing packages:
                      3 credits (5% off), 5 credits (10% off), or 10 credits (20% off).
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Do credits expire?
                    </h3>
                    <p className="text-gray-600">
                      No, your credits never expire. You can use them whenever you need essay feedback.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      What payment methods do you accept?
                    </h3>
                    <p className="text-gray-600">
                      We accept all major credit cards and debit cards through our secure Stripe payment processor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
