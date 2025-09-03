import { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';

interface AppState {
  language: string;
  theme: 'light' | 'dark';
  lastVisitedPage: string;
  eventFilters: {
    year: number;
    status: string;
  };
  userPreferences: {
    eventsPerPage: number;
    autoPlayVideos: boolean;
    notifications: boolean;
  };
}

interface AppContextType extends AppState {
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLastVisitedPage: (page: string) => void;
  updateEventFilters: (filters: Partial<AppState['eventFilters']>) => void;
  updateUserPreferences: (prefs: Partial<AppState['userPreferences']>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction = 
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LAST_VISITED_PAGE'; payload: string }
  | { type: 'UPDATE_EVENT_FILTERS'; payload: Partial<AppState['eventFilters']> }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<AppState['userPreferences']> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LAST_VISITED_PAGE':
      return { ...state, lastVisitedPage: action.payload };
    case 'UPDATE_EVENT_FILTERS':
      return { ...state, eventFilters: { ...state.eventFilters, ...action.payload } };
    case 'UPDATE_USER_PREFERENCES':
      return { ...state, userPreferences: { ...state.userPreferences, ...action.payload } };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const defaultState: AppState = {
  language: 'en',
  theme: 'light',
  lastVisitedPage: '/',
  eventFilters: {
    year: new Date().getFullYear(),
    status: 'all'
  },
  userPreferences: {
    eventsPerPage: 10,
    autoPlayVideos: false,
    notifications: true
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, defaultState);

  useEffect(() => {
    const savedPrefs = Cookies.get('app_preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        dispatch({ type: 'LOAD_STATE', payload: prefs });
      } catch (error) {
        console.warn('Failed to load app preferences from cookies');
      }
    }
  }, []);

  const saveTocookies = (newState: Partial<AppState>) => {
    const currentPrefs = Cookies.get('app_preferences');
    let prefs = {};
    
    if (currentPrefs) {
      try {
        prefs = JSON.parse(currentPrefs);
      } catch (error) {
        prefs = {};
      }
    }
    
    const updatedPrefs = { ...prefs, ...newState };
    Cookies.set('app_preferences', JSON.stringify(updatedPrefs), { 
      expires: 365,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  };

  const setLanguage = (lang: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
    saveTocookies({ language: lang });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
    saveTocookies({ theme });
  };

  const setLastVisitedPage = (page: string) => {
    dispatch({ type: 'SET_LAST_VISITED_PAGE', payload: page });
    saveTocookies({ lastVisitedPage: page });
  };

  const updateEventFilters = (filters: Partial<AppState['eventFilters']>) => {
    dispatch({ type: 'UPDATE_EVENT_FILTERS', payload: filters });
    saveTocookies({ eventFilters: { ...state.eventFilters, ...filters } });
  };

  const updateUserPreferences = (prefs: Partial<AppState['userPreferences']>) => {
    dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: prefs });
    saveTocookies({ userPreferences: { ...state.userPreferences, ...prefs } });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setLanguage,
      setTheme,
      setLastVisitedPage,
      updateEventFilters,
      updateUserPreferences
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};