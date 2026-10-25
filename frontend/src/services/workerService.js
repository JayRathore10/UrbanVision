import api from './api';

const workerService = {
  async getMyTasks(params = {}) {
    const { data } = await api.get('/worker/tasks', { params });
    return data;
  },

  async getMyTask(id) {
    const { data } = await api.get(`/worker/tasks/${id}`);
    return data;
  },

  async getHistory(params = {}) {
    const { data } = await api.get('/worker/history', { params });
    return data;
  },

  async getStats() {
    const { data } = await api.get('/worker/stats');
    return data;
  },
};

export default workerService;
