import React, { Suspense, lazy, useState, useEffect } from 'react';

const MicrofrontendLoader = ({ screen, user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [MicrofrontendComponent, setMicrofrontendComponent] = useState(null);

  useEffect(() => {
    if (!screen || screen.isInternal) {
      setLoading(false);
      return;
    }

    loadMicrofrontend();
  }, [screen]);

  const loadMicrofrontend = async () => {
    try {
      setLoading(true);
      setError(null);

      // Based on the screen configuration, load the appropriate microfrontend
      if (screen.scope === 'supportTicketsApp') {
        // Dynamically import the microfrontend
        const SupportTicketsApp = lazy(() => 
          import('supportTicketsApp/SupportTicketsApp')
            .catch(err => {
              console.error('Failed to load Support Tickets App:', err);
              // Fallback component
              return { 
                default: () => <FallbackComponent 
                  screenName={screen.name} 
                  error="Failed to load microfrontend" 
                />
              };
            })
        );
        
        setMicrofrontendComponent(() => SupportTicketsApp);
      } else {
        // Handle other microfrontends here
        setMicrofrontendComponent(() => () => (
          <ComingSoonComponent screenName={screen.name} />
        ));
      }

    } catch (error) {
      console.error('Error loading microfrontend:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorComponent error={error} onRetry={loadMicrofrontend} />;
  }

  if (!screen) {
    return <WelcomeScreen user={user} />;
  }

  if (screen.isInternal) {
    return <InternalScreen screen={screen} user={user} />;
  }

  if (!MicrofrontendComponent) {
    return <FallbackComponent screenName={screen.name} />;
  }

  return (
    <div style={styles.microfrontendContainer}>
      <div style={styles.header}>
        <h2 style={styles.title}>{screen.name}</h2>
        <div style={styles.meta}>
          <span style={styles.tenant}>Tenant: {user.customerId}</span>
          <span style={styles.separator}>•</span>
          <span style={styles.user}>User: {user.email}</span>
        </div>
      </div>
      
      <div style={styles.content}>
        <Suspense fallback={<LoadingSpinner />}>
          <MicrofrontendComponent user={user} />
        </Suspense>
      </div>
    </div>
  );
};

// Welcome screen component
const WelcomeScreen = ({ user }) => (
  <div style={styles.welcomeContainer}>
    <div style={styles.welcomeContent}>
      <h1 style={styles.welcomeTitle}>
        Welcome, {user?.email?.split('@')[0]}! 👋
      </h1>
      
      <div style={styles.welcomeCard}>
        <h3>Your Tenant Information</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <strong>Tenant ID:</strong> {user.customerId}
          </div>
          <div style={styles.infoItem}>
            <strong>Role:</strong> {user.role}
          </div>
          <div style={styles.infoItem}>
            <strong>Email:</strong> {user.email}
          </div>
        </div>
      </div>

      <div style={styles.welcomeInstructions}>
        <p>Select an application from the sidebar to get started.</p>
        <p>Each application is loaded as a separate microfrontend with Module Federation.</p>
      </div>
    </div>
  </div>
);

// Internal screen handler (for dashboard, etc.)
const InternalScreen = ({ screen, user }) => {
  if (screen.id === 'admin-dashboard') {
    return <AdminDashboard user={user} />;
  }
  
  return <ComingSoonComponent screenName={screen.name} />;
};

// Simple admin dashboard
const AdminDashboard = ({ user }) => (
  <div style={styles.dashboardContainer}>
    <h2 style={styles.dashboardTitle}>Admin Dashboard</h2>
    <div style={styles.dashboardGrid}>
      <div style={styles.dashboardCard}>
        <h4>Quick Stats</h4>
        <p>Tenant: {user.customerId}</p>
        <p>Access Level: {user.role}</p>
      </div>
      <div style={styles.dashboardCard}>
        <h4>Actions</h4>
        <p>• Manage Users</p>
        <p>• View Audit Logs</p>
        <p>• System Settings</p>
      </div>
    </div>
  </div>
);

// Loading spinner component
const LoadingSpinner = () => (
  <div style={styles.loadingContainer}>
    <div style={styles.spinner}></div>
    <p style={styles.loadingText}>Loading application...</p>
  </div>
);

// Error component
const ErrorComponent = ({ error, onRetry }) => (
  <div style={styles.errorContainer}>
    <div style={styles.errorIcon}>⚠️</div>
    <h3 style={styles.errorTitle}>Failed to Load Application</h3>
    <p style={styles.errorMessage}>{error}</p>
    <button onClick={onRetry} style={styles.retryButton}>
      Try Again
    </button>
  </div>
);

// Fallback component
const FallbackComponent = ({ screenName, error }) => (
  <div style={styles.fallbackContainer}>
    <div style={styles.fallbackIcon}>🔧</div>
    <h3 style={styles.fallbackTitle}>{screenName} Unavailable</h3>
    <p style={styles.fallbackMessage}>
      {error || 'This application is currently unavailable.'}
    </p>
  </div>
);

// Coming soon component
const ComingSoonComponent = ({ screenName }) => (
  <div style={styles.comingSoonContainer}>
    <div style={styles.comingSoonIcon}>🚀</div>
    <h3 style={styles.comingSoonTitle}>{screenName}</h3>
    <p style={styles.comingSoonMessage}>Coming soon!</p>
  </div>
);

const styles = {
  microfrontendContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: 'white',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#2d3748',
  },
  meta: {
    fontSize: '14px',
    color: '#718096',
  },
  tenant: {
    fontWeight: '500',
  },
  separator: {
    margin: '0 8px',
  },
  user: {},
  content: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#f7fafc',
  },
  welcomeContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  welcomeContent: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '32px',
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    marginBottom: '24px',
    textAlign: 'left',
  },
  infoGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  infoItem: {
    padding: '8px 0',
    borderBottom: '1px solid #f7fafc',
  },
  welcomeInstructions: {
    color: '#718096',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  loadingContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  spinner: {
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
  errorContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '40px',
  },
  errorIcon: {
    fontSize: '48px',
  },
  errorTitle: {
    color: '#e53e3e',
    fontSize: '24px',
    fontWeight: '600',
  },
  errorMessage: {
    color: '#718096',
    textAlign: 'center',
    maxWidth: '400px',
  },
  retryButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  fallbackContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  fallbackIcon: {
    fontSize: '48px',
  },
  fallbackTitle: {
    color: '#2d3748',
    fontSize: '24px',
    fontWeight: '600',
  },
  fallbackMessage: {
    color: '#718096',
    textAlign: 'center',
  },
  comingSoonContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  comingSoonIcon: {
    fontSize: '48px',
  },
  comingSoonTitle: {
    color: '#2d3748',
    fontSize: '24px',
    fontWeight: '600',
  },
  comingSoonMessage: {
    color: '#718096',
  },
  dashboardContainer: {
    padding: '24px',
  },
  dashboardTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '24px',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default MicrofrontendLoader;