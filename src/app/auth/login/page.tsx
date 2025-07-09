'use client';

import React from 'react';
import { AuthForm } from '@/components/AuthForm';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to profile page after successful login
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <GraduationCap className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">(A)dmissions (I)ntelligence</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Login Form */}
      <AuthForm onSuccess={handleSuccess} />
    </div>
  );
}
