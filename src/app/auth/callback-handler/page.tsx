'use client';

import React from 'react';
import { OAuthCallbackHandler } from '@/components/auth/OAuthCallbackHandler';

export default function CallbackHandlerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
      <OAuthCallbackHandler />
    </div>
  );
}
