import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AuthPortal from './pages/AuthPortal';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PatientDashboard from './pages/PatientDashboard';
import OrgDashboard from './pages/OrgDashboard';
import SplashScreen from './components/SplashScreen';

import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import dashboardLoungeArt from './assets/dashboard_lounge.webp';
import queueLoungeArt from './assets/queue_lounge_art.webp';

// Eager Background Cache: Loads 4K artwork into browser memory immediately on first visit
if (typeof window !== 'undefined') {
  const p1 = new Image();
  p1.src = dashboardLoungeArt;
  const p2 = new Image();
  p2.src = queueLoungeArt;
}

// Guard that locks down dashboard access based on the patient/org role
const RoleGuard = ({ children, allowedRole }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== allowedRole) {
    // If user attempts to enter a page they don't belong to, redirect to their proper dashboard
    const redirectPath = currentUser.role === 'org' ? '/org-dashboard' : '/patient-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Guard for login/register pages (redirects logged-in users straight to their dashboard)
const PublicGuard = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    const redirectPath = currentUser.role === 'org' ? '/org-dashboard' : '/patient-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Smooth page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

const getRouteKey = (pathname) => {
  if (pathname === '/' || pathname === '/login') return 'auth-portal';
  return pathname;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const routeKey = getRouteKey(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey}>
        {/* Unified Continuous Stage for Welcome & Login (Zero black flash, persistent 3D canvas) */}
        <Route path="/" element={<PublicGuard><AuthPortal initialView="welcome" /></PublicGuard>} />
        <Route path="/login" element={<PublicGuard><AuthPortal initialView="login" /></PublicGuard>} />

        <Route path="/register" element={<PublicGuard><PageWrapper><Register /></PageWrapper></PublicGuard>} />
        <Route path="/forgot-password" element={<PublicGuard><PageWrapper><ForgotPassword /></PageWrapper></PublicGuard>} />
        <Route path="/splash" element={<SplashScreen standalone={true} />} />

        {/* Authenticated dashboards */}
        <Route 
          path="/patient-dashboard" 
          element={
            <RoleGuard allowedRole="patient">
              <PageWrapper><PatientDashboard /></PageWrapper>
            </RoleGuard>
          } 
        />
        <Route 
          path="/org-dashboard" 
          element={
            <RoleGuard allowedRole="org">
              <PageWrapper><OrgDashboard /></PageWrapper>
            </RoleGuard>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
