import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const donorAPI = {
  register: (data) => API.post('/donors/register', data),
  getAll: () => API.get('/donors'),
  getById: (id) => API.get(`/donors/${id}`),
  getHistory: (id) => API.get(`/donors/${id}/history`),
};

export const donationAPI = {
  record: (data) => API.post('/donate', data),
  checkEligibility: (donor_id) => API.get(`/donate/check-eligibility/${donor_id}`),
  getAll: () => API.get('/donate/all'),
};

export const inventoryAPI = {
  getAll: () => API.get('/inventory'),
  update: (blood_group, data) => API.put(`/inventory/${blood_group}`, data),
};

export const hospitalAPI = {
  register: (data) => API.post('/hospitals/register', data),
  getAll: () => API.get('/hospitals'),
};

export const requestAPI = {
  create: (data) => API.post('/request', data),
  getAll: () => API.get('/request'),
  approve: (id) => API.put(`/request/${id}/approve`),
  reject: (id) => API.put(`/request/${id}/reject`),
};

export default API;
