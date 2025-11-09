'use client';

import React from 'react';
import { Check, Star } from 'lucide-react';
import { creditPackages } from '../config/products';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';

export function Pricing() {
  const { user } = useAuth();
  const analytics = useAnalytics();

  // Filter to get the specific packages we want: 1, 5, and 10 reviews
  const selectedPackages = creditPackages.filter(pkg => 
    pkg.credits === 1 || pkg.credits === 5 || pkg.credits === 10
  );

  const handlePurchaseClick = (pkg: typeof creditPackages[0]) => {
    if (user) {
      analytics.trackCreditOptionClick({
        userId: user.id,
        date: new Date().toISOString(),
        option: `${pkg.credits} Credits`,
        credits: pkg.credits,
        price: pkg.price,
      });
    }

    // Store purchase data for tracking
    localStorage.setItem('pendingPurchase', JSON.stringify({
      credits: pkg.credits,
      price: pkg.price,
      timestamp: new Date().toISOString(),
    }));

    // Redirect to purchase credits page
    window.location.href = '/purchase-credits';
  };

  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary-500 font-semibold mb-2 inline-block">Pricing</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get expert feedback on your college essays with our AI-powered system. 
            Choose the package that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {selectedPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                pkg.popular 
                  ? 'ring-2 ring-primary-500 transform scale-105' 
                  : 'hover:-translate-y-1'
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary-600 text-white text-center py-2 text-sm font-medium">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`p-6 ${pkg.popular ? 'pt-12' : ''}`}>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>

                  <div className="mb-6">
                    {pkg.discount && pkg.originalPrice ? (
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                            {pkg.discount}% OFF
                          </span>
                        </div>
                        <div className="flex items-baseline justify-center space-x-2 mb-1">
                          <span className="text-4xl font-bold text-gray-900">
                            ${pkg.price}
                          </span>
                          <span className="text-xl text-gray-400 line-through decoration-2">
                            ${pkg.originalPrice}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          for {pkg.credits} review{pkg.credits > 1 ? 's' : ''}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">
                          ${pkg.price}
                        </span>
                        <p className="text-gray-600 text-sm mt-1">
                          for {pkg.credits} review{pkg.credits > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-8 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      {pkg.credits} AI essay review{pkg.credits > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      24-hour turnaround
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      Detailed feedback report
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      Credits never expire
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchaseClick(pkg)}
                    className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-200 ${
                      pkg.popular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
