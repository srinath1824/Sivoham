import { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JaiGurudevLoader from './components/JaiGurudevLoader';
import Home from './pages/Home';
import LoginDialog from './components/LoginDialog';
import Join from './pages/Join';
import AdminRequests from './pages/AdminRequests';
import { getUserProfile } from './services/api';
import Profile from './pages/Profile';
import { PermissionProvider } from './contexts/PermissionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import EventScrollBanner from './components/EventScrollBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { isFeatureEnabled } from './config/features';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components with error boundaries
const Courses = lazy(() => import('./pages/Courses'));
const Events = lazy(() => import('./pages/Events'));



/**
 * Main application component for Siva Kundalini Sadhana React app.
 * Handles routing, login dialog, and global layout.
 * @returns {JSX.Element}
 */
function App({ navigate }: { navigate: any }) {
  const { user, login, logout, loading } = useAuth();
  const { setLastVisitedPage } = useApp();
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Track page visits
    setLastVisitedPage(location.pathname);
  }, [location.pathname, setLastVisitedPage]);

  // Global error handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('MetaMask')) {
        event.preventDefault();
        return;
      }
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  async function handleLogin(u: any, token: string) {
    try {
      const profile = await getUserProfile();
      login(profile as any, token);
    } catch (err) {
      console.warn('Failed to fetch user profile after login:', err);
      if (u) {
        login(u, token);
      }
    }
    setLoginOpen(false);
    if (navigate) navigate('/');
  }

  /**
   * Handles logout and clears user data.
   */
  function handleLogout() {
    logout();
    setLoginOpen(false);
  }

  /**
   * Opens the login dialog.
   */
  function handleLoginClick() {
    if (isFeatureEnabled('login')) {
      setLoginOpen(true);
    }
  }

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><JaiGurudevLoader size="large" /></div>;
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
          <Navbar onLoginClick={handleLoginClick} user={user} onLogoutClick={handleLogout} />
          <ErrorBoundary>
            <EventScrollBanner />
          </ErrorBoundary>
          {isFeatureEnabled('login') && (
            <LoginDialog open={loginOpen} onLoginSuccess={handleLogin} onClose={() => setLoginOpen(false)} />
          )}
          <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/join" element={
          <ProtectedRoute feature="registration" user={user}>
            <Join handleLogin={handleLogin} />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute feature="events" user={user}>
            <ErrorBoundary>
              <Suspense fallback={<SectionLoader />}>
                <Events />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute feature="courses" user={user} requireAuth={true}>
            <ErrorBoundary>
              <Suspense fallback={<SectionLoader />}>
                <Courses />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        {/* <Route path="/progress" element={
          user ? (
            <Suspense fallback={<SectionLoader />}>
              <Progress />
            </Suspense>
          ) : (
            <LoginRequiredMessage onLoginClick={handleLoginClick} />
          )
        } /> */}
        <Route path="/admin" element={
          <ProtectedRoute feature="admin" user={user} requireAuth={true}>
            {user && user.isAdmin ? (
              <ErrorBoundary>
                <PermissionProvider>
                  <AdminRequests />
                </PermissionProvider>
              </ErrorBoundary>
            ) : (
              <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff7f0', borderRadius: 16, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', margin: '2rem auto', maxWidth: 480, padding: '2.5rem 1.5rem' }}>
                <span style={{ fontSize: 54, color: '#de6b2f', marginBottom: 16 }}>⛔</span>
                <h2 style={{ color: '#de6b2f', fontFamily: 'Lora, serif', fontWeight: 700, marginBottom: 12, fontSize: '2rem', textAlign: 'center' }}>Not Authorized</h2>
                <p style={{ color: '#1a2341', fontFamily: 'Lora, serif', fontSize: '1.15rem', textAlign: 'center', marginBottom: 0 }}>
                  You do not have permission to view this page.
                </p>
              </div>
            )}
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute feature="profile" user={user} requireAuth={true}>
            <ErrorBoundary>
              <Profile />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
          </Routes>
          <Footer />
      </div>
    </ErrorBoundary>
  );
}

/**
 * Login required message component.
 */
/*
function LoginRequiredMessage({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff7f0', borderRadius: 16, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', margin: '2rem auto', maxWidth: 480, padding: '2.5rem 1.5rem' }}>
      <span style={{ fontSize: 54, color: '#de6b2f', marginBottom: 16 }}>🔒</span>
      <h2 style={{ color: '#de6b2f', fontFamily: 'Lora, serif', fontWeight: 700, marginBottom: 12, fontSize: '2rem', textAlign: 'center' }}>Login Required</h2>
      <p style={{ color: '#1a2341', fontFamily: 'Lora, serif', fontSize: '1.15rem', textAlign: 'center', marginBottom: 24 }}>
        Please log in to access your courses and progress.
      </p>
      <button
        style={{
          marginTop: 24,
          background: '#de6b2f',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 32px',
          fontFamily: 'Lora, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(222,107,47,0.08)'
        }}
        onClick={onLoginClick}
      >
        Login
      </button>
    </div>
  );
}
*/

/**
 * Loader component for section loading states.
 * @returns {JSX.Element}
 */
function SectionLoader() {
  return (
    <main className="main-content" style={{ 
      minHeight: 'calc(100vh - 200px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff7f0 0%, #ffeee0 100%)'
    }}>
      <JaiGurudevLoader size="medium" />
    </main>
  );
}



/**
 * Home page component (placeholder).
 * @returns {JSX.Element}
 */
// function Home() {
//   return <main className="main-content">Home Page</main>;
// }

function AppWithRouter() {
  const navigate = useNavigate();
  return <App navigate={navigate} />;
}

export default function RootApp() {
  useEffect(() => {
    // Suppress MetaMask extension errors globally
    const handleError = (e: ErrorEvent) => {
      if (e.message?.includes('MetaMask') || e.filename?.includes('chrome-extension')) {
        e.preventDefault();
      }
    };
    
    const handleRejection = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes('MetaMask')) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppWithRouter />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

