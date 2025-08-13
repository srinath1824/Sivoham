/* global window, document, localStorage, fetch, console, Blob, URL, alert */
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import LoginDialog from './components/LoginDialog.tsx';
import Join from './pages/Join.tsx';
import AdminRequests from './pages/AdminRequests.tsx';
import { getUserProfile } from './services/api.ts';

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
function App({ navigate }) {
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
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      setLoadingUser(false);
    }
    setLoadingUser(true);
    fetchUserProfileSecure();
  }, [location.pathname]);

  async function handleLogin(u, token) {
    if (token) localStorage.setItem('token', token);
    setLoginOpen(false);
    setLoadingUser(true);
    try {
      const profile = await getUserProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>Loading...</div>;
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="app-container">
        <Navbar onLoginClick={handleLoginClick} user={user} onLogoutClick={handleLogout} />
        <LoginDialog open={loginOpen} onLoginSuccess={handleLogin} onClose={() => setLoginOpen(false)} />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join handleLogin={handleLogin} />} />
        <Route path="/events" element={
          <Suspense fallback={<SectionLoader />}>
            <Events />
          </Suspense>
        } />
        <Route path="/courses" element={
          user ? (
            <Suspense fallback={<SectionLoader />}>
              <Courses />
            </Suspense>
          ) : (
            <LoginRequiredMessage onLoginClick={handleLoginClick} />
          )
        } />
        <Route path="/progress" element={
          user ? (
            <Suspense fallback={<SectionLoader />}>
              <Progress />
            </Suspense>
          ) : (
            <LoginRequiredMessage onLoginClick={handleLoginClick} />
          )
        } />
        <Route path="/admin" element={
          user && user.isAdmin ? (
            <AdminRequests />
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
function LoginRequiredMessage({ onLoginClick }) {
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
  return (
    <div className="section-loader-wrapper">
      <div className="section-loader"></div>
    </div>
  );
}

/**
 * Error boundary fallback component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />;
    }
    return this.props.children;
  }
}

/**
 * Error fallback component
 */
function ErrorFallback() {
  return (
    <div style={{ 
      minHeight: '60vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#fff7f0', 
      borderRadius: 16, 
      boxShadow: '0 2px 12px rgba(222,107,47,0.07)', 
      margin: '2rem auto', 
      maxWidth: 480, 
      padding: '2.5rem 1.5rem' 
    }}>
      <span style={{ fontSize: 54, color: '#de6b2f', marginBottom: 16 }}>⚠️</span>
      <h2 style={{ color: '#de6b2f', fontFamily: 'Lora, serif', fontWeight: 700, marginBottom: 12, fontSize: '2rem', textAlign: 'center' }}>Something went wrong</h2>
      <p style={{ color: '#1a2341', fontFamily: 'Lora, serif', fontSize: '1.15rem', textAlign: 'center', marginBottom: 24 }}>
        We encountered an unexpected error. Please refresh the page to try again.
      </p>
      <button
        style={{
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
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
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
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
}
