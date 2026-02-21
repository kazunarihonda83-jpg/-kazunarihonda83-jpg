import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getAllUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Shift API
export const shiftAPI = {
  getShifts: (params) => api.get('/shifts', { params }),
  getShiftById: (id) => api.get(`/shifts/\${id}`),
  createShift: (data) => api.post('/shifts', data),
  updateShift: (id, data) => api.put(`/shifts/\${id}`, data),
  deleteShift: (id) => api.delete(`/shifts/\${id}`),
  generateShifts: (data) => api.post('/shifts/generate', data),
  publishShifts: (shiftIds) => api.post('/shifts/publish', { shiftIds }),
  simulateLaborCost: (params) => api.get('/shifts/simulate/labor-cost', { params }),
};

// Attendance API
export const attendanceAPI = {
  clockIn: (data) => api.post('/attendance/clock-in', data),
  clockOut: (data) => api.post('/attendance/clock-out', data),
  getTodayAttendance: () => api.get('/attendance/today'),
  getAttendanceHistory: (params) => api.get('/attendance/history', { params }),
  getAllAttendance: (params) => api.get('/attendance/all', { params }),
  getAttendanceStats: (params) => api.get('/attendance/stats', { params }),
};

// Evaluation API
export const evaluationAPI = {
  getEvaluations: (params) => api.get('/evaluations', { params }),
  getEvaluationById: (id) => api.get(`/evaluations/\${id}`),
  createEvaluation: (data) => api.post('/evaluations', data),
  updateEvaluation: (id, data) => api.put(`/evaluations/\${id}`, data),
  getFeedback: (userId) => api.get(`/evaluations/feedback/user/\${userId}`),
  createFeedback: (data) => api.post('/evaluations/feedback', data),
  getGoals: (userId) => api.get(`/evaluations/goals/user/\${userId}`),
  createGoal: (data) => api.post('/evaluations/goals', data),
  updateGoal: (id, data) => api.put(`/evaluations/goals/\${id}`, data),
  getMotivationStats: (userId) => api.get(`/evaluations/motivation/user/\${userId}`),
};

// Position API
export const positionAPI = {
  getPositions: (params) => api.get('/positions', { params }),
  getPositionById: (id) => api.get(`/positions/\${id}`),
  createPosition: (data) => api.post('/positions', data),
  updatePosition: (id, data) => api.put(`/positions/\${id}`, data),
  deletePosition: (id) => api.delete(`/positions/\${id}`),
};

// Shift Request API
export const shiftRequestAPI = {
  getShiftRequests: (params) => api.get('/shift-requests', { params }),
  getShiftRequestById: (id) => api.get(`/shift-requests/${id}`),
  createShiftRequest: (data) => api.post('/shift-requests', data),
  createBulkShiftRequests: (data) => api.post('/shift-requests/bulk', data),
  updateShiftRequest: (id, data) => api.put(`/shift-requests/${id}`, data),
  submitShiftRequests: (data) => api.post('/shift-requests/submit', data),
  approveShiftRequests: (data) => api.post('/shift-requests/approve', data),
  deleteShiftRequest: (id) => api.delete(`/shift-requests/${id}`),
  getSubmissionStatus: (params) => api.get('/shift-requests/status', { params }),
};

export default api;
