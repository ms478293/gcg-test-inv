import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
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
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  // Public endpoints
  getProducts: (params = {}) => api.get('/products', { params }),
  getFeaturedProducts: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductsByCollection: (collection, limit = 50) => 
    api.get(`/products/collection/${collection}`, { params: { limit } }),
  searchProducts: (q, limit = 50) => 
    api.get('/products/search', { params: { q, limit } }),
  
  // Admin endpoints
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Collections API
export const collectionsAPI = {
  getCollections: (params = {}) => api.get('/collections', { params }),
  getActiveCollections: () => api.get('/collections/active'),
  getCollection: (id) => api.get(`/collections/${id}`),
  getCollectionBySlug: (slug) => api.get(`/collections/slug/${slug}`),
  
  // Admin endpoints
  createCollection: (data) => api.post('/collections', data),
  updateCollection: (id, data) => api.put(`/collections/${id}`, data),
  deleteCollection: (id) => api.delete(`/collections/${id}`),
};

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  register: (data) => api.post('/admin/register', data),
  getCurrentAdmin: () => api.get('/admin/me'),
  getAdminProducts: (params = {}) => api.get('/admin/products', { params }),
  updateProductStatus: (id, status) => api.put(`/admin/products/${id}/status`, null, { params: { status } }),
  bulkUpdateProductStatus: (product_ids, status) => 
    api.put('/admin/products/bulk/status', { product_ids, status }),
  getStats: () => api.get('/admin/stats'),
  
  // Upload endpoints
  uploadImage: (file, category = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { category }
    });
  },
  
  uploadMultipleImages: (files, category = 'products') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/admin/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { category }
    });
  }
};

// Auth helpers
export const authHelpers = {
  isAuthenticated: () => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    return !!(token && user);
  },
  
  login: (token, user) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
  
  getUser: () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  }
};

export default api;