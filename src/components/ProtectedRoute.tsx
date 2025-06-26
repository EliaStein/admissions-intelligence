'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { AuthForm } from './AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const loading = authLoading || (adminOnly && adminLoading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  // For admin routes, check if the user has admin access
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
