import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { EssayDashboard } from './components/EssayDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EssayWizard } from './components/EssayWizard';
import { Profile } from './components/Profile';
import { useAuth } from './hooks/useAuth';
import { useAnalytics } from './hooks/useAnalytics';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  useAnalytics();
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/essay-wizard"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="essay-form-section py-12">
                <EssayWizard />
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Profile />
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/essays"
        element={
          <ProtectedRoute adminOnly>
            <EssayDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
