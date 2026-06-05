import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

export const registerUser = (data) => api.post('/api/users/register', data);
export const loginUser = (data) => api.post('/api/users/login', data);
export const getUser = (id) => api.get(`/api/users/${id}`);
export const unlockUser = (id) => api.post(`/api/users/${id}/unlock`);

export const createSession = (data) => api.post('/api/sessions/create', data);
export const getSession = (id) => api.get(`/api/sessions/${id}`);
export const getUserSessions = (userId) => api.get(`/api/sessions/user/${userId}`);
export const terminateSession = (id) => api.post(`/api/sessions/${id}/terminate`);
export const logEvent = (data) => api.post('/api/sessions/event', data);

export const evaluateTrust = (data) => api.post('/api/trust/evaluate', data);
export const getTrustHistory = (userId) => api.get(`/api/trust/history/${userId}`);
export const getLatestTrust = (sessionId) => api.get(`/api/trust/latest/${sessionId}`);

export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
