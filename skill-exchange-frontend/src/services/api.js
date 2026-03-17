// src/services/api.js
// Centralized Axios instance + all API calls

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  search: (skill) => api.get(`/users/search?skill=${skill}`),
  getMatches: () => api.get('/users/matches'),
};

// ─── Skills ────────────────────────────────────────────────────────────────
export const skillAPI = {
  getAll: (params) => api.get('/skills', { params }),
  getMy: () => api.get('/skills/my'),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
};

// ─── Exchange Requests ─────────────────────────────────────────────────────
export const exchangeAPI = {
  send: (data) => api.post('/exchange', data),
  getMy: () => api.get('/exchange'),
  getById: (id) => api.get(`/exchange/${id}`),
  updateStatus: (id, status) => api.put(`/exchange/${id}`, { status }),
};

// ─── Sessions ──────────────────────────────────────────────────────────────
export const sessionAPI = {
  schedule: (data) => api.post('/sessions', data),
  getMy: () => api.get('/sessions'),
  getById: (id) => api.get(`/sessions/${id}`),
  update: (id, data) => api.put(`/sessions/${id}`, data),
};

// ─── Reviews ───────────────────────────────────────────────────────────────
export const reviewAPI = {
  add: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getMy: () => api.get('/reviews/my'),
};

// ─── Chat ──────────────────────────────────────────────────────────────────
export const chatAPI = {
  getMessages: (exchangeId) => api.get(`/chat/${exchangeId}`),
  sendMessage: (exchangeId, content) => api.post(`/chat/${exchangeId}`, { content }),
};

export default api;
