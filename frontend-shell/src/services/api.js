import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'multitenant_auth_token';
const USER_KEY = 'multitenant_user';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenManager.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email, password, customerId, role = 'User') => {
    const response = await api.post('/api/auth/register', { 
      email, 
      password, 
      customerId, 
      role 
    });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

// Screens API calls
export const screensAPI = {
  getMyScreens: async () => {
    const response = await api.get('/api/me/screens');
    return response.data;
  },
  
  getAllScreens: async () => {
    const response = await api.get('/api/admin/screens');
    return response.data;
  }
};

// Tickets API calls
export const ticketsAPI = {
  getTickets: async (params = {}) => {
    const response = await api.get('/api/tickets', { params });
    return response.data;
  },
  
  getTicket: async (id) => {
    const response = await api.get(`/api/tickets/${id}`);
    return response.data;
  },
  
  createTicket: async (ticketData) => {
    const response = await api.post('/api/tickets', ticketData);
    return response.data;
  },
  
  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/api/tickets/${id}`, ticketData);
    return response.data;
  },
  
  deleteTicket: async (id) => {
    const response = await api.delete(`/api/tickets/${id}`);
    return response.data;
  },
  
  getTicketStats: async () => {
    const response = await api.get('/api/tickets/stats/summary');
    return response.data;
  }
};

// Admin API calls
export const adminAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },
  
  getTickets: async (params = {}) => {
    const response = await api.get('/api/admin/tickets', { params });
    return response.data;
  },
  
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/api/admin/audit-logs', { params });
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },
  
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;