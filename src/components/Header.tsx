'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, GraduationCap, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">(A)dmissions (I)ntelligence</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-primary-600">Features</Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-primary-600">How it Works</Link>
            {user ? (
              <>
                <Link
                  href="/essay-wizard"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Write Essay
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-primary-600 flex items-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-primary-600 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/essay-wizard"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/#features"
                className="block px-3 py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="block px-3 py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
              {user ? (
                <>
                  <Link
                    href="/essay-wizard"
                    className="block px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Write Essay
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-gray-600 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </span>
                  </Link>
                  <button
                    onClick={async () => {
                      await handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600"
                  >
                    <span className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </span>
                  </button>
                </>
              ) : (
                <Link
                  href="/essay-wizard"
                  className="block px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
