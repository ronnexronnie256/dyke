import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import LoginForm from './components/Auth/LoginForm';
import ModernAdminDashboard from './components/Admin/ModernAdminDashboard';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import PropertyListings from './components/Properties/PropertyListings';
import PropertySellerForm from './components/Forms/PropertySellerForm';
import BuyerRequestForm from './components/Forms/BuyerRequestForm';
import SiteVisitForm from './components/Forms/SiteVisitForm';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import DebugPage from './pages/DebugPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/properties" element={<PropertyListings />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/sell" element={<PropertySellerForm />} />
            <Route path="/buy" element={<BuyerRequestForm />} />
            <Route path="/book-visit" element={<SiteVisitForm />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <ModernAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Analytics />
          <SpeedInsights />
        </main>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;