import api, { setAccessToken, clearAuth } from './api';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.accessToken || data.token) {
      setAccessToken(data.accessToken || data.token);
    }
    return data;
  },

  async register(userData) {
    const { data } = await api.post('/auth/register', userData);
    if (data.accessToken || data.token) {
      setAccessToken(data.accessToken || data.token);
    }
    return data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Logout should succeed even if API fails
    } finally {
      clearAuth();
    }
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    if (data.accessToken || data.token) {
      setAccessToken(data.accessToken || data.token);
    }
    return data;
  },
};

export default authService;
