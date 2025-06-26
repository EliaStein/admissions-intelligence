'use client';

import React, { useState, useEffect } from 'react';
import { CSVUploader } from './CSVUploader';
import { SchoolList } from './SchoolList';
import { essayService } from '../services/essayService';
import { School } from '../types/essay';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

export function EssayDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const updateSchoolsList = async () => {
      try {
        const schoolsData = await essayService.getSchools();
        setSchools(schoolsData);
        setLastUpdate(new Date()); // For now, just use current time TODO: add timestamp to schools table
      } catch (error) {
        console.error('Error loading schools:', error);
      }
    };

    updateSchoolsList();
    const interval = setInterval(updateSchoolsList, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Essay Management Dashboard
            </h1>
            <button
              onClick={logout}
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid gap-8">
          <CSVUploader />
          {schools.length > 0 && <SchoolList schools={schools} />}
        </div>
      </main>
    </div>
  );
}
