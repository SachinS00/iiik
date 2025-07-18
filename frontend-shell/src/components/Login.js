import React, { useState } from 'react';
import { authAPI, tokenManager } from '../services/api';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [customerId, setCustomerId] = useState('tenant-a');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isRegister) {
        response = await authAPI.register(
          formData.email, 
          formData.password, 
          customerId,
          'User'
        );
      } else {
        response = await authAPI.login(formData.email, formData.password);
      }

      // Store token and user data
      tokenManager.setToken(response.token);
      tokenManager.setUser(response.user);
      
      onLogin(response.user);
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { email: 'admin@tenant-a.com', password: 'password123', tenant: 'tenant-a', role: 'Admin' },
    { email: 'user@tenant-a.com', password: 'password123', tenant: 'tenant-a', role: 'User' },
    { email: 'admin@tenant-b.com', password: 'password123', tenant: 'tenant-b', role: 'Admin' },
    { email: 'user@tenant-b.com', password: 'password123', tenant: 'tenant-b', role: 'User' },
  ];

  const fillDemoUser = (user) => {
    setFormData({ email: user.email, password: user.password });
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={styles.subtitle}>
            Multi-Tenant Microfrontend Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tenant</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={styles.input}
              >
                <option value="tenant-a">Acme Corp (tenant-a)</option>
                <option value="tenant-b">Beta Industries (tenant-b)</option>
                <option value="tenant-c">Gamma Solutions (tenant-c)</option>
              </select>
            </div>
          )}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
          >
            {isLoading ? 'Loading...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={styles.toggleButton}
          >
            {isRegister ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>

        {!isRegister && (
          <div style={styles.demoSection}>
            <h4 style={styles.demoTitle}>Demo Users (Click to fill):</h4>
            <div style={styles.demoGrid}>
              {demoUsers.map((user, index) => (
                <button
                  key={index}
                  onClick={() => fillDemoUser(user)}
                  style={styles.demoButton}
                  type="button"
                >
                  <div style={styles.demoInfo}>
                    <strong>{user.role}</strong><br/>
                    {user.tenant}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#333',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    outline: 'none',
    fontFamily: 'inherit',
  },
  button: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '10px',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    border: '1px solid #fcc',
  },
  toggleContainer: {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  demoSection: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  demoTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    textAlign: 'center',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  demoButton: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '12px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  demoInfo: {
    lineHeight: '1.3',
  },
};

export default Login;