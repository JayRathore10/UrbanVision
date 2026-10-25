import api from './api';

const taskService = {
  async assignTask(issueId, workerId, data = {}) {
    const response = await api.post('/assign', { issueId, workerId, ...data });
    return response.data;
  },

  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getTask(id) {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  async reassignTask(id, workerId) {
    const { data } = await api.patch(`/tasks/${id}/reassign`, { workerId });
    return data;
  },

  async cancelTask(id) {
    const { data } = await api.post(`/tasks/${id}/cancel`);
    return data;
  },

  async approveTask(id) {
    const { data } = await api.post(`/tasks/${id}/approve`);
    return data;
  },

  async rejectTask(id, reason) {
    const { data } = await api.post(`/tasks/${id}/reject`, { reason });
    return data;
  },

  async acceptTask(id) {
    const { data } = await api.post(`/tasks/${id}/accept`);
    return data;
  },

  async startTask(id) {
    const { data } = await api.post(`/tasks/${id}/start`);
    return data;
  },

  async resolveTask(id, formData) {
    const { data } = await api.post(`/tasks/${id}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async resubmitTask(id, formData) {
    const { data } = await api.post(`/tasks/${id}/resubmit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default taskService;
