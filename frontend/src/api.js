import axios from 'axios';

const api = axios.create({
  // Replace this with your actual Render URL!
  baseURL: 'https://nexusratings.onrender.com/api', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;