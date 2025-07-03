'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { EssayWizard } from './EssayWizard';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from './AuthForm';

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative bg-linear-to-b from-white via-primary-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Transform Your College Essay
            <br />
            <span className="text-primary-600">with Expert-Trained Feedback</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Get personalized feedback powered by AI trained on insights from former admissions officers within 24 hours.
          </p>

          <div className="flex items-center justify-center space-x-2 mb-12">
            <ShieldCheck className="w-5 h-5 text-secondary-500" />
            <span className="text-gray-600">
              AI review is permitted in college applications when you implement the feedback yourself
            </span>
          </div>

          <div className="essay-form-section mb-16">
            {user ? <EssayWizard /> : <AuthForm />}
          </div>

          <div className="mt-16">
            <p className="text-sm text-gray-500 mb-8">Trained by Former Admissions Officers From</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
              {[
                { name: 'Harvard University', logo: '/image/universities/Harvard.png' },
                { name: 'Stanford University', logo: '/image/universities/Stanford.webp' },
                { name: 'Yale University', logo: '/image/universities/Yale.jpg' },
                { name: 'MIT', logo: '/image/universities/MIT.png' },
                { name: 'Duke University', logo: '/image/universities/Duke.png' }
              ].map((school) => (
                <div
                  key={school.name}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <img
                      src={school.logo}
                      alt={`${school.name} logo`}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center">{school.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
