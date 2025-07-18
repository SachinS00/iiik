import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Render standalone if not loaded as microfrontend
if (typeof window !== 'undefined' && window.document && window.document.getElementById('root')) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  // Mock user for standalone development
  const mockUser = {
    id: '1',
    email: 'dev@tenant-a.com',
    customerId: 'tenant-a',
    role: 'Admin'
  };
  
  root.render(<App user={mockUser} />);
}