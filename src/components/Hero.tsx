import React from 'react';
import { ShieldCheck, GraduationCap } from 'lucide-react';
import { EssayWizard } from './EssayWizard';
import { useAuth0 } from '@auth0/auth0-react';

export function Hero() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-primary-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Transform Your College Essay
            <br />
            <span className="text-primary-600">with Expert-Trained AI Feedback</span>
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
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : isAuthenticated ? (
              <EssayWizard />
            ) : (
              <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Started with Your Essay
                </h2>
                <p className="text-gray-600 mb-6">
                  Join thousands of students who have improved their college essays with our AI-powered platform.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleSignUp}
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Account
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  <button
                    onClick={() => loginWithRedirect()}
                    className="w-full bg-white text-primary-600 px-6 py-3 rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    Log In to Existing Account
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16">
            <p className="text-sm text-gray-500 mb-8">Trained by Former Admissions Officers From</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
              {['Harvard University', 'Stanford University', 'Yale University', 'MIT', 'Duke University'].map((school) => (
                <div 
                  key={school}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center">{school}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
