import React from 'react';

const Sidebar = ({ screens, currentScreen, onScreenSelect, user, onLogout }) => {
  const handleScreenClick = (screen) => {
    onScreenSelect(screen);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* User Info Header */}
      <div style={styles.userSection}>
        <div style={styles.avatar}>
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userEmail}>{user?.email}</div>
          <div style={styles.userMeta}>
            <span style={styles.role}>{user?.role}</span>
            <span style={styles.tenant}>{user?.customerId}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>
          <h4 style={styles.sectionTitle}>Applications</h4>
          <ul style={styles.navList}>
            {screens.map((screen) => (
              <li key={screen.id} style={styles.navItem}>
                <button
                  onClick={() => handleScreenClick(screen)}
                  style={{
                    ...styles.navButton,
                    ...(currentScreen?.id === screen.id ? styles.navButtonActive : {})
                  }}
                >
                  <span style={styles.navIcon}>📱</span>
                  <span style={styles.navText}>{screen.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Stats - if user has admin role */}
        {user?.role === 'Admin' && (
          <div style={styles.navSection}>
            <h4 style={styles.sectionTitle}>Quick Actions</h4>
            <ul style={styles.navList}>
              <li style={styles.navItem}>
                <button 
                  style={styles.navButton}
                  onClick={() => handleScreenClick({ 
                    id: 'admin-dashboard', 
                    name: 'Dashboard',
                    isInternal: true 
                  })}
                >
                  <span style={styles.navIcon}>📊</span>
                  <span style={styles.navText}>Dashboard</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Footer with Logout */}
      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <span style={styles.navIcon}>🚪</span>
          <span style={styles.navText}>Logout</span>
        </button>
        
        <div style={styles.version}>
          <small>v1.0.0</small>
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    height: '100vh',
    backgroundColor: '#1a202c',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #2d3748',
  },
  userSection: {
    padding: '24px 20px',
    borderBottom: '1px solid #2d3748',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userEmail: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '4px',
    wordBreak: 'break-all',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  role: {
    fontSize: '12px',
    color: '#a0aec0',
    backgroundColor: '#2d3748',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  tenant: {
    fontSize: '11px',
    color: '#718096',
  },
  nav: {
    flex: 1,
    padding: '16px 0',
    overflowY: 'auto',
  },
  navSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 20px 12px',
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navItem: {
    margin: '0 12px 4px',
  },
  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  navButtonActive: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
  navText: {
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #2d3748',
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#fed7d7',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    marginBottom: '12px',
  },
  version: {
    textAlign: 'center',
    color: '#718096',
    fontSize: '11px',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .nav-button:hover {
    background-color: #2d3748 !important;
  }
  
  .nav-button.active:hover {
    background-color: #5a67d8 !important;
  }
  
  .logout-button:hover {
    background-color: #742a2a !important;
  }
`;
document.head.appendChild(styleSheet);

export default Sidebar;