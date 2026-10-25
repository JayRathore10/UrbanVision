import api from './api';

const dashboardService = {
  async getSummary() {
    const { data } = await api.get('/dashboard/summary');
    return data;
  },

  async getIssuesByType() {
    const { data } = await api.get('/dashboard/issues-by-type');
    return data;
  },

  async getIssuesByStatus() {
    const { data } = await api.get('/dashboard/issues-by-status');
    return data;
  },

  async getIssuesBySeverity() {
    const { data } = await api.get('/dashboard/issues-by-severity');
    return data;
  },

  async getDetectionTrends() {
    const { data } = await api.get('/dashboard/detection-trends');
    return data;
  },

  async getResolutionMetrics() {
    const { data } = await api.get('/dashboard/resolution-metrics');
    return data;
  },

  async getWorkerPerformance() {
    const { data } = await api.get('/dashboard/worker-performance');
    return data;
  },
};

export default dashboardService;
