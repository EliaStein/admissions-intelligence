'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UsersList } from '@/components/admin/UsersList';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-8 mt-16">
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">View and manage all registered users</p>
          </div>

          <UsersList />
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
