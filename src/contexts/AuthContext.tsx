import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  mobile: string;
  firstName: string;
  lastName: string;
  email?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  isSelected: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Initialize from cookies on app start
    const token = Cookies.get('auth_token');
    const userData = Cookies.get('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN', payload: { user, token } });
      } catch (error) {
        // Clear invalid cookies
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = (user: User, token: string) => {
    // Store in cookies with security options
    Cookies.set('auth_token', token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set('user_data', JSON.stringify(user), { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    // Clear all storage
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    localStorage.clear();
    sessionStorage.clear();
    
    dispatch({ type: 'LOGOUT' });
    
    // Force page refresh to reset state
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      Cookies.set('user_data', JSON.stringify(updatedUser), { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      dispatch({ type: 'UPDATE_USER', payload: userData });
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

