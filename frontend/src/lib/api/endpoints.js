import api from './client';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (refreshToken) => api.post('/auth/logout', { refresh_token: refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
};

export const incidentsApi = {
  list: (params) => api.get('/incidents', { params }),
  get: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  updateStatus: (id, data) => api.patch(`/incidents/${id}/status`, data),
  getHistory: (id) => api.get(`/incidents/${id}/history`),
  uploadEvidence: (id, formData) =>
    api.post(`/incidents/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  track: (ref) => api.get(`/incidents/track/${ref}`),
};

export const alertsApi = {
  list: (params) => api.get('/alerts', { params }),
  get: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.patch(`/alerts/${id}`, data),
};

export const emergencyApi = {
  listServices: (params) => api.get('/emergency/services', { params }),
  getService: (id) => api.get(`/emergency/services/${id}`),
};

export const sheltersApi = {
  list: (params) => api.get('/shelters', { params }),
  get: (id) => api.get(`/shelters/${id}`),
  updateStatus: (id, data) => api.patch(`/shelters/${id}/status`, data),
};

export const ngosApi = {
  list: (params) => api.get('/ngos', { params }),
  get: (id) => api.get(`/ngos/${id}`),
  register: (data) => api.post('/ngos', data),
};

export const volunteersApi = {
  list: (params) => api.get('/volunteers', { params }),
  register: (data) => api.post('/volunteers/register', data),
  updateStatus: (data) => api.patch('/volunteers/me', data),
};

export const resourcesApi = {
  listCategories: () => api.get('/resources/categories'),
  listInventory: (params) => api.get('/resources/inventory', { params }),
  createInventory: (data) => api.post('/resources/inventory', data),
};

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  trends: (days = 7) => api.get('/analytics/trends', { params: { days } }),
  weather: (lat = 17.3850, lon = 78.4867) => api.get('/analytics/weather', { params: { lat, lon } }),
};

export const adminApi = {
  listUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, null, { params: { new_role: role } }),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
