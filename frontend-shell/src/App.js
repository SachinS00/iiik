import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MicrofrontendLoader from './components/MicrofrontendLoader';
import { screensAPI, tokenManager } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screens, setScreens] = useState([]);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Load screens when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserScreens();
    }
  }, [isAuthenticated, user]);

  const checkAuthentication = async () => {
    try {
      const token = tokenManager.getToken();
      const savedUser = tokenManager.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.clear();
    } finally {
      setLoading(false);
    }
  };

  const loadUserScreens = async () => {
    try {
      setError('');
      const response = await screensAPI.getMyScreens();
      setScreens(response.screens || []);
      
      // Auto-select first screen if available
      if (response.screens && response.screens.length > 0) {
        setCurrentScreen(response.screens[0]);
      }
    } catch (error) {
      console.error('Failed to load screens:', error);
      setError('Failed to load available applications');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setError('');
  };

  const handleLogout = () => {
    tokenManager.clear();
    setUser(null);
    setIsAuthenticated(false);
    setScreens([]);
    setCurrentScreen(null);
    setError('');
  };

  const handleScreenSelect = (screen) => {
    setCurrentScreen(screen);
  };

  // Show loading screen on initial load
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading application...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={styles.appContainer}>
      {/* Sidebar Navigation */}
      <Sidebar
        screens={screens}
        currentScreen={currentScreen}
        onScreenSelect={handleScreenSelect}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {error && (
          <div style={styles.errorBanner}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
            <button 
              onClick={() => setError('')}
              style={styles.errorClose}
            >
              ×
            </button>
          </div>
        )}

        {/* Microfrontend Loader */}
        <MicrofrontendLoader 
          screen={currentScreen} 
          user={user}
        />
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f7fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: '#f7fafc',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#718096',
    fontSize: '16px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  errorBanner: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #fbb6ce',
  },
  errorIcon: {
    fontSize: '18px',
  },
  errorText: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    color: '#c53030',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
};

// Add global styles for spinner animation
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #root {
    height: 100vh;
  }
`;
document.head.appendChild(globalStyles);

export default App;