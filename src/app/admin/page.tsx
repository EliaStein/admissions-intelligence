'use client';

import React from 'react';
import Link from 'next/link';
import { Users, FileText, BarChart3 } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AdminDashboard() {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-8 mt-0 mb-40">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage users, essay prompts, and system settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Users Management */}
            <Link
              href="/admin/users"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Users</h3>
                  <p className="text-gray-600">Manage user accounts and permissions</p>
                </div>
              </div>
            </Link>

            {/* Essay Prompts Management */}
            <Link
              href="/admin/essay-prompts"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Essay Prompts</h3>
                  <p className="text-gray-600">Manage schools and essay prompts</p>
                </div>
              </div>
            </Link>

            {/* Essays Management */}
            <Link
              href="/admin/essays"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Essays</h3>
                  <p className="text-gray-600">View submitted essays and analytics</p>
                </div>
              </div>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
