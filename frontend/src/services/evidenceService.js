import { getAccessToken } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const evidenceService = {
  /**
   * Get an authenticated URL for evidence files.
   * Since <img> tags can't attach Bearer tokens, we fetch the image
   * as a blob and create an object URL.
   */
  async getEvidenceUrl(subdir, filename) {
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_BASE_URL}/evidence/${subdir}/${filename}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load evidence');
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Evidence load error:', error);
      return null;
    }
  },

  /**
   * Build evidence URL from a full path string like "before/filename.jpg"
   */
  parseEvidencePath(path) {
    if (!path) return { subdir: '', filename: '' };
    const parts = path.split('/');
    const filename = parts.pop();
    const subdir = parts.join('/');
    return { subdir, filename };
  },
};

export default evidenceService;
