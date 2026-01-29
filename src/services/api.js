import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional future auth)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor (IMPORTANT)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage =
      error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export const emailAPI = {
  getEmails: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/emails?${queryString}`);
  },
  
  getStats: () => api.get('/emails/stats'),

  getEmailByTrackingId: (trackingId) => {
    return api.get(`/emails/${trackingId}`);
  },

  uploadEmail: (formData) => {
    return api.post('/webhook/email', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteEmail: (trackingId) => {
    return api.delete(`/emails/${trackingId}`);
  },

  reprocessEmail: (trackingId) => {
    return api.post(`/emails/${trackingId}/reprocess`);
  },

  convertToOrder: (trackingId) => {
    return api.post(`/emails/${trackingId}/convert`);
  },
};

export const orderAPI = {
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders?${queryString}`);
  },
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export default api;
