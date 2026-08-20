import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  async getSolarData(lat, lon) {
    const { data } = await axios.get(`${API_BASE}/api/solar-data`, { params: { lat, lon } });
    return data;
  },

  async analyzeRoof(file, lat, lon) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lat', lat);
    formData.append('lon', lon);
    const { data } = await axios.post(`${API_BASE}/api/analyze-roof`, formData);
    return data;
  },

  async calculate(params) {
    const { data } = await axios.post(`${API_BASE}/api/calculate`, params);
    return data;
  }
};
