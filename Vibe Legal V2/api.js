import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/login', { email, password }),
  register: (email, password) => api.post('/api/register', { email, password }),
};

export const contractAPI = {
  generate: (data, format = 'json') => 
    api.post(`/api/contracts/generate?format=${format}`, data),
  generateLegacy: (data) => 
    api.post('/api/generate-contract', data),
  save: (data) => 
    api.post('/api/save-contract', data),
  getUserContracts: () => 
    api.get('/api/user-contracts'),
  getContract: (id) => 
    api.get(`/api/contracts/${id}`),
};

export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;

