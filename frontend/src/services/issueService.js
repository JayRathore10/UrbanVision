import api from './api';

const issueService = {
  async getIssues(params = {}) {
    const { data } = await api.get('/issues', { params });
    return data;
  },

  async getIssuesMap(params = {}) {
    const { data } = await api.get('/issues/map', { params });
    return data;
  },

  async getIssue(id) {
    const { data } = await api.get(`/issues/${id}`);
    return data;
  },

  async updateIssue(id, updates) {
    const { data } = await api.patch(`/issues/${id}`, updates);
    return data;
  },

  async updateIssueStatus(id, statusData) {
    const { data } = await api.patch(`/issues/${id}/status`, statusData);
    return data;
  },
};

export default issueService;
