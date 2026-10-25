import api from './api';

const supervisorService = {
  async getWorkers(params = {}) {
    const { data } = await api.get('/supervisor/workers', { params });
    return data;
  },

  async getWorker(id) {
    const { data } = await api.get(`/supervisor/workers/${id}`);
    return data;
  },

  async getReviews(params = {}) {
    const { data } = await api.get('/supervisor/reviews', { params });
    return data;
  },

  async getReview(taskId) {
    const { data } = await api.get(`/supervisor/reviews/${taskId}`);
    return data;
  },
};

export default supervisorService;
