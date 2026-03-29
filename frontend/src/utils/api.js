import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// This sends token with EVERY request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getRisks = (params) => api.get('/risks', { params });
export const getRisk = (id) => api.get(`/risks/${id}`);
export const createRisk = (data) => api.post('/risks', data);
export const updateRisk = (id, data) => api.put(`/risks/${id}`, data);
export const deleteRisk = (id) => api.delete(`/risks/${id}`);
export const getRiskStats = () => api.get('/risks/stats');

export const CATEGORIES = ['Cybersecurity', 'Compliance', 'Operational', 'Financial', 'Strategic', 'Reputational', 'Technical', 'Data Privacy'];
export const STATUSES = ['Open', 'In Progress', 'Mitigated', 'Closed', 'Accepted'];
export const DEPARTMENTS = ['IT', 'Finance', 'HR', 'Operations', 'Legal', 'Marketing', 'Executive', 'Security'];

export const RISK_LEVEL_COLORS = {
  Critical: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#dc2626' },
  High:     { bg: '#fff7ed', text: '#ea580c', border: '#fdba74', dot: '#ea580c' },
  Medium:   { bg: '#fefce8', text: '#ca8a04', border: '#fde047', dot: '#ca8a04' },
  Low:      { bg: '#f0fdf4', text: '#16a34a', border: '#86efac', dot: '#16a34a' }
};

export const STATUS_COLORS = {
  'Open':        { bg: '#fef2f2', text: '#dc2626' },
  'In Progress': { bg: '#eff6ff', text: '#2563eb' },
  'Mitigated':   { bg: '#f0fdf4', text: '#16a34a' },
  'Closed':      { bg: '#f8fafc', text: '#64748b' },
  'Accepted':    { bg: '#fdf4ff', text: '#9333ea' }
};

export const calcRiskLevel = (score) => {
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6)  return 'Medium';
  return 'Low';
};

export { api };