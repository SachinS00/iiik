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
const getToken = () => localStorage.getItem('multitenant_auth_token');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
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
      // Token expired or invalid - redirect to main app
      window.parent?.location?.reload();
    }
    return Promise.reject(error);
  }
);

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

export default api;