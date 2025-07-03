'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { OAuthCallbackHandler } from '@/components/auth/OAuthCallbackHandler';

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<{
    error?: string;
    description?: string;
  }>({});

  useEffect(() => {
    const error = searchParams.get('error');
    const description = searchParams.get('description');

    setErrorDetails({
      error: error || undefined,
      description: description || undefined
    });
  }, [searchParams]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem signing you in with Google.
          </p>

          {errorDetails.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800">Error: {errorDetails.error}</p>
              {errorDetails.description && (
                <p className="text-sm text-red-600 mt-1">{errorDetails.description}</p>
              )}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600 text-left">
            <p className="mb-2">This could be due to:</p>
            <ul className="space-y-1">
              <li>• The authentication request was cancelled</li>
              <li>• The authentication code expired</li>
              <li>• A network error occurred</li>
              <li>• Invalid authentication parameters</li>
              <li>• Configuration issues with the OAuth provider</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>

      {/* Include OAuth callback handler to process any tokens in URL fragments */}
      <OAuthCallbackHandler />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCodeErrorContent />
    </Suspense>
  );
}
