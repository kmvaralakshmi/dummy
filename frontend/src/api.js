import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Experiments
export const experimentAPI = {
  getAll: (status) => {
    const params = status ? { status } : {};
    return api.get('/experiments', { params });
  },
  getOne: (key) => api.get(`/experiments/${key}`),
  create: (data) => api.post('/experiments', data),
  update: (key, data) => api.put(`/experiments/${key}`, data),
  delete: (key) => api.delete(`/experiments/${key}`),
  start: (key) => api.post(`/experiments/${key}/start`),
  pause: (key) => api.post(`/experiments/${key}/pause`),
  complete: (key) => api.post(`/experiments/${key}/complete`),
};

// Tracking
export const trackingAPI = {
  assign: (experimentKey, userId) => 
    api.post('/tracking/assign', { experimentKey, userId }),
  track: (data) => api.post('/tracking/track', data),
  getUserVariant: (experimentKey, userId) => 
    api.get(`/tracking/${experimentKey}/${userId}`),
};

// Analytics
export const analyticsAPI = {
  getResults: (key) => api.get(`/analytics/${key}/results`),
  getTimeline: (key, params) => 
    api.get(`/analytics/${key}/timeline`, { params }),
  getStatsByDate: (key) => api.get(`/analytics/${key}/stats-by-date`),
  getParticipants: (key) => api.get(`/analytics/${key}/participants`),
};

export default api;
