import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import JaiGurudevLoader from './components/JaiGurudevLoader.tsx';
import Home from './pages/Home.tsx';
import LoginDialog from './components/LoginDialog.tsx';
import Join from './pages/Join.tsx';
import AdminRequests from './pages/AdminRequests.tsx';
import { getUserProfile } from './services/api.ts';
import Profile from './pages/Profile.tsx';
import { PermissionProvider } from './contexts/PermissionContext.tsx';
import EventScrollBanner from './components/EventScrollBanner.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import NetworkError from './components/NetworkError.tsx';

interface UserProfile {
  _id?: string;
  userId?: string;
  mobile: string;
  firstName: string;
  lastName: string;
  email?: string;
  comment?: string;
  isAdmin: boolean;
  isSelected: boolean;
  place?: string;
  gender?: string;
  age?: number;
  preferredLang?: string;
  refSource?: string;
  referrerInfo?: string;
  country?: string;
  profession?: string;
  address?: string;
}

const Courses = lazy(() => import('./pages/Courses.tsx'));
const Progress = lazy(() => import('./pages/Progress.tsx'));

const Events = lazy(() => import('./pages/Events.tsx'));

/**
 * Main application component for Siva Kundalini Sadhana React app.
 * Handles routing, login dialog, and global layout.
 * @returns {JSX.Element}
 */
function App({ navigate }: { navigate: any }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function fetchUserProfileSecure() {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        return;
      }
      try {
        const profile = await getUserProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (err) {
        console.warn('Failed to fetch user profile:', err);
        // Don't clear user data on network errors, only on auth errors
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      setLoadingUser(false);
    }
    setLoadingUser(true);
    fetchUserProfileSecure();
  }, [location.pathname]);

  async function handleLogin(u: any, token: string) {
    if (token) localStorage.setItem('token', token);
    setLoginOpen(false);
    setLoadingUser(true);
    try {
      const profile = await getUserProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to fetch user profile after login:', err);
      // Use the provided user data as fallback
      if (u) {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoadingUser(false);
    if (navigate) navigate('/');
  }

  /**
   * Handles logout and clears user from localStorage.
   */
  function handleLogout() {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setLoginOpen(false);
  }

  /**
   * Opens the login dialog.
   */
  function handleLoginClick() {
    setLoginOpen(true);
  }

  if (loadingUser) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><JaiGurudevLoader size="large" /></div>;
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Navbar onLoginClick={handleLoginClick} user={user} onLogoutClick={handleLogout} />
        <ErrorBoundary>
          <EventScrollBanner />
        </ErrorBoundary>
        <LoginDialog open={loginOpen} onLoginSuccess={handleLogin} onClose={() => setLoginOpen(false)} />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join handleLogin={handleLogin} />} />
        <Route path="/events" element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader />}>
              <Events />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/courses" element={
          user ? (
            <ErrorBoundary>
              <Suspense fallback={<SectionLoader />}>
                <Courses />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <LoginRequiredMessage onLoginClick={handleLoginClick} />
          )
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
          user && user.isAdmin ? (
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
          )
        } />
        <Route path="/profile" element={
          <ErrorBoundary>
            <Profile />
          </ErrorBoundary>
        } />
        </Routes>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

/**
 * Message shown when login is required to access a route.
 * @returns {JSX.Element}
 */
function LoginRequiredMessage({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff7f0', borderRadius: 16, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', margin: '2rem auto', maxWidth: 480, padding: '2.5rem 1.5rem' }}>
      <span style={{ fontSize: 54, color: '#de6b2f', marginBottom: 16 }}>🔒</span>
      <h2 style={{ color: '#de6b2f', fontFamily: 'Lora, serif', fontWeight: 700, marginBottom: 12, fontSize: '2rem', textAlign: 'center' }}>Login Required</h2>
      <p style={{ color: '#1a2341', fontFamily: 'Lora, serif', fontSize: '1.15rem', textAlign: 'center', marginBottom: 0 }}>
        You can only view this page if you are <b>logged in</b>.<br />
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

/**
 * Loader component for section loading states.
 * @returns {JSX.Element}
 */
function SectionLoader() {
  return <JaiGurudevLoader size="medium" />;
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
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
}
