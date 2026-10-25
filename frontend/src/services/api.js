import axios from 'axios';

// Base API configuration
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      code: error.response?.data?.error?.code,
      details: error.response?.data?.error?.details,
    };
    return Promise.reject(customError);
  }
);

// Auth Token management helpers
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => localStorage.getItem('token');

// API Services
export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await apiClient.post('/auth/login', { email, password });
      const token = res.data?.data?.token || res.data?.data?.accessToken;
      if (token) {
        setAuthToken(token);
        if (res.data.data.user) {
          localStorage.setItem('currentUser', JSON.stringify(res.data.data.user));
        }
      }
      return res.data;
    },
    register: async (data) => {
      const res = await apiClient.post('/auth/register', data);
      const token = res.data?.data?.token || res.data?.data?.accessToken;
      if (token) {
        setAuthToken(token);
        if (res.data.data.user) {
          localStorage.setItem('currentUser', JSON.stringify(res.data.data.user));
        }
      }
      return res.data;
    },
    getMe: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // Ignore logout network error
      } finally {
        setAuthToken(null);
        localStorage.removeItem('currentUser');
      }
    },
  },

  // Supervisors & Videos
  supervisors: {
    list: async () => {
      const res = await apiClient.get('/supervisor/list');
      return res.data;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/supervisor/${id}/profile`);
      return res.data;
    },
    getVideos: async (id) => {
      const res = await apiClient.get(`/supervisor/${id}/videos`);
      return res.data;
    },
    uploadVideo: async (formData) => {
      const res = await apiClient.post('/supervisor/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    listWorkers: async () => {
      const res = await apiClient.get('/supervisor/workers');
      return res.data;
    },
    getWorkerById: async (id) => {
      const res = await apiClient.get(`/supervisor/workers/${id}`);
      return res.data;
    },
    getWorkerTasks: async (id, params) => {
      const res = await apiClient.get(`/supervisor/workers/${id}/tasks`, { params });
      return res.data;
    },
    getPendingReviews: async (params) => {
      const res = await apiClient.get('/supervisor/reviews', { params });
      return res.data;
    },
    getReviewDetail: async (taskId) => {
      const res = await apiClient.get(`/supervisor/reviews/${taskId}`);
      return res.data;
    },
  },

  // Issues & GIS Map
  issues: {
    list: async (params) => {
      const res = await apiClient.get('/issues', { params });
      return res.data;
    },
    getMap: async (params) => {
      const res = await apiClient.get('/issues/map', { params });
      return res.data;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/issues/${id}`);
      return res.data;
    },
    update: async (id, data) => {
      const res = await apiClient.patch(`/issues/${id}`, data);
      return res.data;
    },
    updateStatus: async (id, status, reason) => {
      const res = await apiClient.patch(`/issues/${id}/status`, { status, reason });
      return res.data;
    },
  },

  // Tasks
  tasks: {
    assign: async (data) => {
      const res = await apiClient.post('/assign', data);
      return res.data;
    },
    list: async (params) => {
      const res = await apiClient.get('/tasks', { params });
      return res.data;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/tasks/${id}`);
      return res.data;
    },
    reassign: async (id, data) => {
      const res = await apiClient.patch(`/tasks/${id}/reassign`, data);
      return res.data;
    },
    cancel: async (id, reason) => {
      const res = await apiClient.post(`/tasks/${id}/cancel`, { reason });
      return res.data;
    },
    approve: async (id, reason) => {
      const res = await apiClient.post(`/tasks/${id}/approve`, { reason });
      return res.data;
    },
    reject: async (id, reason) => {
      const res = await apiClient.post(`/tasks/${id}/reject`, { reason });
      return res.data;
    },
  },

  // Worker Interface
  worker: {
    getMyTasks: async (params) => {
      const res = await apiClient.get('/worker/tasks', { params });
      return res.data;
    },
    getTaskDetail: async (id) => {
      const res = await apiClient.get(`/worker/tasks/${id}`);
      return res.data;
    },
    acceptTask: async (id) => {
      const res = await apiClient.post(`/tasks/${id}/accept`);
      return res.data;
    },
    startTask: async (id) => {
      const res = await apiClient.post(`/tasks/${id}/start`);
      return res.data;
    },
    resolveTask: async (id, formData) => {
      const res = await apiClient.post(`/tasks/${id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    resubmitTask: async (id, formData) => {
      const res = await apiClient.post(`/tasks/${id}/resubmit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    getHistory: async (params) => {
      const res = await apiClient.get('/worker/history', { params });
      return res.data;
    },
    getStats: async () => {
      const res = await apiClient.get('/worker/stats');
      return res.data;
    },
  },

  // Dashboard Aggregations
  dashboard: {
    getSummary: async () => {
      const res = await apiClient.get('/dashboard/summary');
      return res.data;
    },
    getIssuesByType: async () => {
      const res = await apiClient.get('/dashboard/issues-by-type');
      return res.data;
    },
    getIssuesByStatus: async () => {
      const res = await apiClient.get('/dashboard/issues-by-status');
      return res.data;
    },
    getIssuesBySeverity: async () => {
      const res = await apiClient.get('/dashboard/issues-by-severity');
      return res.data;
    },
    getDetectionTrends: async (days = 30) => {
      const res = await apiClient.get('/dashboard/detection-trends', { params: { days } });
      return res.data;
    },
    getResolutionMetrics: async () => {
      const res = await apiClient.get('/dashboard/resolution-metrics');
      return res.data;
    },
    getWorkerPerformance: async () => {
      const res = await apiClient.get('/dashboard/worker-performance');
      return res.data;
    },
  },

  // Cameras & Ingest
  cameras: {
    list: async () => {
      const res = await apiClient.get('/cameras');
      return res.data;
    },
    ingestFrame: async (formData) => {
      const res = await apiClient.post('/cameras/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    ingestVideo: async (formData) => {
      const res = await apiClient.post('/cameras/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    getInspectionStatus: async (inspectionId) => {
      const res = await apiClient.get(`/cameras/inspection/${inspectionId}`);
      return res.data;
    },
  },
};

export default api;
