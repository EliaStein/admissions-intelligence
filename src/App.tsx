import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0ProviderWithHistory } from './auth/Auth0ProviderWithHistory';
import { PrivateRoute } from './auth/PrivateRoute';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { EssayDashboard } from './components/EssayDashboard';
import { AdminLogin } from './components/AdminLogin';
import { useAuth } from './hooks/useAuth';
import { useAnalytics } from './hooks/useAnalytics';
import { EssayWizard } from './components/EssayWizard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <AdminLogin />;
}

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
  useAnalytics(); // Initialize analytics inside Router context
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/admin/essays"
        element={
          <ProtectedRoute>
            <EssayDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/essay-wizard"
        element={<PrivateRoute component={EssayWizard} />}
      />
    </Routes>
  );
}

export function App() {
  return (
    <Router>
      <Auth0ProviderWithHistory>
        <AppRoutes />
      </Auth0ProviderWithHistory>
    </Router>
  );
}
