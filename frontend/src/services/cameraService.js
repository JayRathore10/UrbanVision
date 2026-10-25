import api from './api';

const cameraService = {
  async ingestFrame(formData) {
    const { data } = await api.post('/cameras/ingest', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadVideo(formData, onUploadProgress) {
    const { data } = await api.post('/cameras/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return data;
  },

  async getInspectionStatus(inspectionId) {
    const { data } = await api.get(`/cameras/inspection/${inspectionId}`);
    return data;
  },

  async getCameras() {
    const { data } = await api.get('/cameras');
    return data;
  },
};

export default cameraService;
