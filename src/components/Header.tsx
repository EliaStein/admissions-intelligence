import React, { useState } from 'react';
import { Menu, X, GraduationCap, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0();

  const scrollToEssayForm = () => {
    const heroSection = document.querySelector('.essay-form-section');
    heroSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">(A)dmissions (I)ntelligence</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-600">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary-600">How it Works</a>
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <button 
                    onClick={scrollToEssayForm}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Write Essay
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-600 hover:text-primary-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignUp}
                    className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </button>
                  <button
                    onClick={() => loginWithRedirect()}
                    className="flex items-center text-gray-600 hover:text-primary-600"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </button>
                </>
              )
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
              <a
                href="#features"
                className="block px-3 py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </a>
              {!isLoading && (
                isAuthenticated ? (
                  <>
                    <button
                      onClick={scrollToEssayForm}
                      className="w-full text-left px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Write Essay
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-3 py-2 text-gray-600 hover:text-primary-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSignUp}
                      className="w-full text-left flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </button>
                    <button
                      onClick={() => loginWithRedirect()}
                      className="w-full text-left flex items-center px-3 py-2 text-gray-600 hover:text-primary-600"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Log In
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
